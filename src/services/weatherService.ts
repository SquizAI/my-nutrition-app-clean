import { create } from 'zustand';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  isOutdoorFriendly: boolean;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  airQuality: {
    level: number;
    description: string;
  };
  forecast: {
    nextHour: string;
    nextDay: string;
  };
}

interface WeatherSuggestion {
  type: 'activity' | 'meal' | 'wellness' | 'safety';
  content: string;
  icon: string;
  confidence: number;
  priority: number;
  context: {
    condition: string;
    temperature: number;
    time: string;
  };
}

interface WeatherStore {
  currentWeather: WeatherData | null;
  lastUpdate: string;
  isLoading: boolean;
  error: string | null;
  suggestions: WeatherSuggestion[];
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  generateSuggestions: () => WeatherSuggestion[];
}

export const useWeather = create<WeatherStore>((set, get) => ({
  currentWeather: null,
  lastUpdate: '',
  isLoading: false,
  error: null,
  suggestions: [],
  
  fetchWeather: async (lat: number, lon: number) => {
    set({ isLoading: true });
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      const weatherData: WeatherData = {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        isOutdoorFriendly: isWeatherSuitableForOutdoor(data.weather[0].main, data.main.temp),
        windSpeed: data.wind.speed,
        uvIndex: data.uvi || 0,
        precipitation: data.rain?.['1h'] || 0,
        airQuality: {
          level: 1, // This would need a separate API call in production
          description: 'Good'
        },
        forecast: {
          nextHour: data.weather[0].description,
          nextDay: 'Similar conditions expected' // This would need a forecast API call
        }
      };
      
      set((state) => {
        const suggestions = generateWeatherSuggestions(weatherData);
        return {
          currentWeather: weatherData,
          lastUpdate: new Date().toISOString(),
          isLoading: false,
          error: null,
          suggestions
        };
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch weather data'
      });
    }
  },

  generateSuggestions: () => {
    const { currentWeather } = get();
    if (!currentWeather) return [];
    return generateWeatherSuggestions(currentWeather);
  }
}));

function generateWeatherSuggestions(weather: WeatherData): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];
  const hour = new Date().getHours();

  // Activity suggestions
  if (weather.isOutdoorFriendly) {
    if (weather.temperature >= 15 && weather.temperature <= 25) {
      suggestions.push({
        type: 'activity',
        content: 'Perfect temperature for outdoor exercise!',
        icon: '🏃',
        confidence: 0.9,
        priority: 4,
        context: {
          condition: weather.condition,
          temperature: weather.temperature,
          time: new Date().toISOString()
        }
      });
    }
  }

  // Weather-specific meal suggestions
  if (weather.temperature < 15) {
    suggestions.push({
      type: 'meal',
      content: 'Cold weather - perfect for a warming soup or stew',
      icon: '🍲',
      confidence: 0.85,
      priority: 3,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  } else if (weather.temperature > 25) {
    suggestions.push({
      type: 'meal',
      content: 'Hot weather - try a refreshing salad or cold dish',
      icon: '🥗',
      confidence: 0.85,
      priority: 3,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  }

  // Wellness suggestions based on conditions
  if (weather.humidity > 70) {
    suggestions.push({
      type: 'wellness',
      content: 'High humidity - stay hydrated and cool',
      icon: '💧',
      confidence: 0.9,
      priority: 4,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  }

  if (weather.uvIndex > 5) {
    suggestions.push({
      type: 'safety',
      content: 'High UV index - don\'t forget sunscreen!',
      icon: '🧴',
      confidence: 0.95,
      priority: 5,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  }

  // Air quality suggestions
  if (weather.airQuality.level > 2) {
    suggestions.push({
      type: 'safety',
      content: 'Consider indoor activities due to air quality',
      icon: '🏠',
      confidence: 0.9,
      priority: 4,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  }

  // Time-based weather suggestions
  if (hour >= 6 && hour <= 9 && weather.isOutdoorFriendly) {
    suggestions.push({
      type: 'activity',
      content: 'Great morning for a jog!',
      icon: '🌅',
      confidence: 0.8,
      priority: 3,
      context: {
        condition: weather.condition,
        temperature: weather.temperature,
        time: new Date().toISOString()
      }
    });
  }

  return suggestions;
}

function isWeatherSuitableForOutdoor(condition: string, temperature: number): boolean {
  const unsuitable = [
    'Thunderstorm',
    'Rain',
    'Snow',
    'Sleet',
    'Hurricane',
    'Tornado'
  ];
  
  return !unsuitable.includes(condition) && temperature >= 10 && temperature <= 35;
} 