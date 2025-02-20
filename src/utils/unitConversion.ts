export type Unit = 'in' | 'cm' | 'lbs' | 'kg';
export type Measurement = {
  value: number;
  unit: Unit;
};

export const UNIT_PATTERNS = {
  FEET: /(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)/i,
  INCHES: /(\d+(?:\.\d+)?)\s*(?:inches|inch|in)/i,
  CM: /(\d+(?:\.\d+)?)\s*(?:centimeters|centimeter|cm)/i,
  METERS: /(\d+(?:\.\d+)?)\s*(?:meters|meter|m)/i,
  KG: /(\d+(?:\.\d+)?)\s*(?:kilograms|kilogram|kg)/i,
  LBS: /(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)/i,
  STONE: /(\d+(?:\.\d+)?)\s*(?:stone|st)/i,
};

export const COMMON_PHRASES = [
  "i am",
  "i'm",
  "my height is",
  "i stand",
  "i measure",
  "i weigh",
  "my weight is",
  "about",
  "approximately",
  "around",
  "almost",
];

export const convertMeasurement = (measurement: Measurement, targetUnit: Unit): Measurement => {
  if (measurement.unit === targetUnit) {
    return measurement;
  }

  let value = measurement.value;

  // Height conversions
  if (measurement.unit === 'in' && targetUnit === 'cm') {
    value = value * 2.54;
  } else if (measurement.unit === 'cm' && targetUnit === 'in') {
    value = value / 2.54;
  }
  // Weight conversions
  else if (measurement.unit === 'lbs' && targetUnit === 'kg') {
    value = value * 0.45359237;
  } else if (measurement.unit === 'kg' && targetUnit === 'lbs') {
    value = value / 0.45359237;
  }

  return {
    value: Math.round(value * 100) / 100, // Round to 2 decimal places
    unit: targetUnit,
  };
};

export const parseHeight = (text: string): Measurement | null => {
  // Remove common phrases
  const cleanText = COMMON_PHRASES.reduce(
    (acc, phrase) => acc.replace(new RegExp(phrase, 'i'), ''),
    text.toLowerCase()
  );

  // Try to match feet and inches
  const feetMatch = cleanText.match(UNIT_PATTERNS.FEET);
  const inchesMatch = cleanText.match(UNIT_PATTERNS.INCHES);
  if (feetMatch) {
    const feet = parseFloat(feetMatch[1]);
    const inches = inchesMatch ? parseFloat(inchesMatch[1]) : 0;
    return {
      value: feet * 12 + inches,
      unit: 'in',
    };
  }

  // Try to match centimeters
  const cmMatch = cleanText.match(UNIT_PATTERNS.CM);
  if (cmMatch) {
    return {
      value: parseFloat(cmMatch[1]),
      unit: 'cm',
    };
  }

  // Try to match meters and convert to cm
  const mMatch = cleanText.match(UNIT_PATTERNS.METERS);
  if (mMatch) {
    return {
      value: parseFloat(mMatch[1]) * 100,
      unit: 'cm',
    };
  }

  return null;
};

export const parseWeight = (text: string): Measurement | null => {
  // Remove common phrases
  const cleanText = COMMON_PHRASES.reduce(
    (acc, phrase) => acc.replace(new RegExp(phrase, 'i'), ''),
    text.toLowerCase()
  );

  // Try to match kilograms
  const kgMatch = cleanText.match(UNIT_PATTERNS.KG);
  if (kgMatch) {
    return {
      value: parseFloat(kgMatch[1]),
      unit: 'kg',
    };
  }

  // Try to match pounds
  const lbsMatch = cleanText.match(UNIT_PATTERNS.LBS);
  if (lbsMatch) {
    return {
      value: parseFloat(lbsMatch[1]),
      unit: 'lbs',
    };
  }

  // Try to match stone and convert to pounds
  const stoneMatch = cleanText.match(UNIT_PATTERNS.STONE);
  if (stoneMatch) {
    return {
      value: parseFloat(stoneMatch[1]) * 14,
      unit: 'lbs',
    };
  }

  return null;
};

export const formatMeasurement = (measurement: Measurement): string => {
  const { value, unit } = measurement;
  
  switch (unit) {
    case 'in':
      const feet = Math.floor(value / 12);
      const inches = Math.round(value % 12);
      return `${feet}'${inches}"`;
    case 'cm':
      return `${value}cm`;
    case 'kg':
      return `${value}kg`;
    case 'lbs':
      return `${value}lbs`;
    default:
      return `${value}${unit}`;
  }
};

// Helper function to detect preferred unit system based on locale
export const getPreferredUnitSystem = (): 'imperial' | 'metric' => {
  const imperialCountries = ['US', 'LR', 'MM']; // USA, Liberia, Myanmar
  
  try {
    const locale = navigator.language;
    const country = new Intl.Locale(locale).maximize().region;
    return imperialCountries.includes(country) ? 'imperial' : 'metric';
  } catch {
    return 'metric'; // Default to metric if detection fails
  }
};

interface HeightUnits {
  feet: number;
  inches: number;
  centimeters: number;
}

interface WeightUnits {
  kilograms: number;
  pounds: number;
}

export const textToHeight = (text: string): Measurement | null => {
  // Clean text by removing common phrases
  let cleanText = text.toLowerCase();
  COMMON_PHRASES.forEach(phrase => {
    cleanText = cleanText.replace(new RegExp(phrase, 'gi'), '');
  });

  // Improved regex patterns for more natural language
  const heightPatterns = [
    // Feet and inches (e.g., "5 feet 10 inches", "5 ft 10 in", "5'10\"")
    /(\d+)(?:\s*(?:feet|foot|ft|')\s*)(?:and\s*)?(\d+)?(?:\s*(?:inches|inch|in|"|″))?/i,
    // Just feet (e.g., "5 feet", "5 ft", "5'")
    /(\d+)(?:\s*(?:feet|foot|ft|'))/i,
    // Just inches (e.g., "70 inches", "70 in", "70\"")
    /(\d+)(?:\s*(?:inches|inch|in|"|″))/i,
    // Centimeters (e.g., "170 cm", "170 centimeters")
    /(\d+)(?:\s*(?:centimeters|centimeter|cm))/i,
    // Meters (e.g., "1.7 m", "1.7 meters")
    /(\d+(?:\.\d+)?)(?:\s*(?:meters|meter|m))/i,
  ];

  // Try each pattern
  for (const pattern of heightPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      // Handle feet and inches format
      if (match[2]) {
        const feet = parseInt(match[1]);
        const inches = parseInt(match[2]);
        return {
          value: feet * 12 + inches,
          unit: 'in'
        };
      }
      
      // Handle meters to cm conversion
      if (cleanText.includes('meter')) {
        const meters = parseFloat(match[1]);
        return {
          value: Math.round(meters * 100),
          unit: 'cm'
        };
      }
      
      // Handle single number formats
      const value = parseInt(match[1]);
      
      // Determine unit based on the matched text
      if (cleanText.includes('cm') || cleanText.includes('centimeter')) {
        return { value, unit: 'cm' };
      } else {
        // Default to inches for all other matches
        return { value, unit: 'in' };
      }
    }
  }

  return null;
};

export const textToWeight = (text: string): Measurement | null => {
  // Clean text by removing common phrases
  let cleanText = text.toLowerCase();
  COMMON_PHRASES.forEach(phrase => {
    cleanText = cleanText.replace(new RegExp(phrase, 'gi'), '');
  });

  // Improved regex patterns for more natural language
  const weightPatterns = [
    // Pounds (e.g., "150 pounds", "150 lbs", "150 lb")
    /(\d+(?:\.\d+)?)(?:\s*(?:pounds|pound|lbs|lb))/i,
    // Kilograms (e.g., "70 kilograms", "70 kg", "70 kgs")
    /(\d+(?:\.\d+)?)(?:\s*(?:kilograms|kilogram|kgs|kg))/i,
    // Stone (e.g., "11 stone", "11 st")
    /(\d+(?:\.\d+)?)(?:\s*(?:stone|st))(?:\s*(\d+)?(?:\s*(?:pounds|pound|lbs|lb))?)?/i,
  ];

  // Try each pattern
  for (const pattern of weightPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      // Handle stone and pounds
      if (cleanText.includes('stone') || cleanText.includes('st')) {
        const stone = parseFloat(match[1]);
        const pounds = match[2] ? parseFloat(match[2]) : 0;
        return {
          value: (stone * 14) + pounds,
          unit: 'lbs'
        };
      }

      const value = parseFloat(match[1]);
      
      // Determine unit based on the matched text
      if (cleanText.includes('kg') || cleanText.includes('kilogram')) {
        return { value, unit: 'kg' };
      } else {
        // Default to pounds for all other matches
        return { value, unit: 'lbs' };
      }
    }
  }

  return null;
};

// Utility functions for unit conversion
export const convertHeight = (value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number => {
  if (from === to) return value;
  return from === 'cm' ? Math.round(value / 2.54) : Math.round(value * 2.54);
};

export const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return value;
  return from === 'kg' ? Math.round(value * 2.20462) : Math.round(value * 0.453592);
}; 