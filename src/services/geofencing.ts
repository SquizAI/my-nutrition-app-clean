import { create } from 'zustand';
import { useUserPreferences } from './userPreferences';
import { useAIAgents } from './aiAgents';

interface Location {
  id: string;
  name: string;
  type: 'grocery' | 'restaurant' | 'gym';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
}

interface GeofenceEvent {
  locationId: string;
  timestamp: string;
  type: 'enter' | 'exit';
}

interface GeofencingStore {
  trackedLocations: Location[];
  events: GeofenceEvent[];
  isTracking: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  addLocation: (location: Omit<Location, 'id'>) => void;
  removeLocation: (id: string) => void;
  startTracking: () => void;
  stopTracking: () => void;
  checkProximity: () => void;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useGeofencing = create<GeofencingStore>()((set, get) => {
  let watchId: number | null = null;

  const handleLocationUpdate = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    set({ currentLocation: { latitude, longitude } });
    get().checkProximity();
  };

  return {
    trackedLocations: [],
    events: [],
    isTracking: false,
    currentLocation: null,

    addLocation: (location) => {
      const newLocation: Location = {
        ...location,
        id: Date.now().toString(),
      };

      set((state) => ({
        trackedLocations: [...state.trackedLocations, newLocation],
      }));
    },

    removeLocation: (id) => {
      set((state) => ({
        trackedLocations: state.trackedLocations.filter((loc) => loc.id !== id),
      }));
    },

    startTracking: () => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        return;
      }

      const handleError = (error: GeolocationPositionError) => {
        let errorMessage = 'Error getting location: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Retrying...';
            // Retry with increased timeout
            startLocationWatch();
            break;
          default:
            errorMessage += error.message;
        }
        console.error(errorMessage);
      };

      const startLocationWatch = () => {
        watchId = navigator.geolocation.watchPosition(
          handleLocationUpdate,
          handleError,
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 10000, // Allow cached positions up to 10 seconds old
          }
        );
      };

      startLocationWatch();
      set({ isTracking: true });
    },

    stopTracking: () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      set({ isTracking: false });
    },

    checkProximity: () => {
      const state = get();
      const { currentLocation, trackedLocations } = state;
      const { notifications } = useUserPreferences.getState();
      const { learningAgent } = useAIAgents.getState();

      if (!currentLocation) return;

      trackedLocations.forEach((location) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          location.coordinates.latitude,
          location.coordinates.longitude
        );

        if (distance <= location.radius) {
          // Check if we're in quiet hours
          const now = new Date();
          const currentHour = now.getHours();
          const quietStart = parseInt(notifications.quietHours.start.split(':')[0]);
          const quietEnd = parseInt(notifications.quietHours.end.split(':')[0]);

          const isQuietHours =
            (quietStart > quietEnd &&
              (currentHour >= quietStart || currentHour < quietEnd)) ||
            (quietStart < quietEnd &&
              currentHour >= quietStart &&
              currentHour < quietEnd);

          if (!isQuietHours && notifications.geofencing) {
            // Generate contextual notification based on location type and user behavior
            const event: GeofenceEvent = {
              locationId: location.id,
              timestamp: new Date().toISOString(),
              type: 'enter',
            };

            set((state) => ({
              events: [...state.events, event],
            }));

            // Update learning agent with location data
            const locationTypeMap = {
              grocery: 'groceryStores',
              restaurant: 'restaurants',
              gym: 'gyms'
            } as const;

            const locationType = locationTypeMap[location.type];
            const updatedLocations = {
              groceryStores: [...learningAgent.behavior.frequentLocations.groceryStores],
              restaurants: [...learningAgent.behavior.frequentLocations.restaurants],
              gyms: [...learningAgent.behavior.frequentLocations.gyms]
            };
            updatedLocations[locationType].push(location.name);

            learningAgent.updateBehavior({
              frequentLocations: updatedLocations
            });

            // Show notification based on location type
            switch (location.type) {
              case 'grocery':
                // Check if we have any items in shopping list
                // TODO: Integrate with shopping list
                new Notification('Nearby Grocery Store', {
                  body: 'Don\'t forget to pick up items from your shopping list!',
                });
                break;

              case 'restaurant':
                // Check meal time and preferences
                const hour = now.getHours();
                if (hour >= 11 && hour <= 14) {
                  new Notification('Lunchtime!', {
                    body: `${location.name} is nearby. Would you like to log your lunch?`,
                  });
                }
                break;

              case 'gym':
                // Check if it's user's typical workout time
                if (learningAgent.behavior.activityPatterns.workoutTimes.includes(
                  `${currentHour}:00`
                )) {
                  new Notification('Time for a Workout?', {
                    body: 'You\'re near your gym during your usual workout time!',
                  });
                }
                break;
            }
          }
        }
      });
    },
  };
}); 