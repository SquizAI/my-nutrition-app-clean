export type HeightUnits = 'cm' | 'in';
export type WeightUnits = 'kg' | 'lbs';

export interface Height {
  value: number;
  unit: HeightUnits;
}

export interface Weight {
  value: number;
  unit: WeightUnits;
}

// Improved regex patterns for more natural language
const heightPatterns = [
  // Feet and inches (e.g., "5 feet 10 inches", "5 ft 10 in", "5'10\"")
  /(\d+)(?:\s*(?:feet|foot|ft|')\s*)(?:and\s*)?(\d+)(?:\s*(?:inches|inch|in|"|″))?/i,
  // Just feet (e.g., "5 feet", "5 ft", "5'")
  /(\d+)(?:\s*(?:feet|foot|ft|'))/i,
  // Just inches (e.g., "70 inches", "70 in", "70\"")
  /(\d+)(?:\s*(?:inches|inch|in|"|″))/i,
  // Centimeters (e.g., "170 cm", "170 centimeters")
  /(\d+)(?:\s*(?:centimeters|centimeter|cm))/i,
];

const weightPatterns = [
  // Pounds (e.g., "150 pounds", "150 lbs", "150 lb")
  /(\d+(?:\.\d+)?)(?:\s*(?:pounds|pound|lbs|lb))/i,
  // Kilograms (e.g., "70 kilograms", "70 kg", "70 kgs")
  /(\d+(?:\.\d+)?)(?:\s*(?:kilograms|kilogram|kgs|kg))/i,
];

export function textToHeight(text: string): Height | null {
  const lowerText = text.toLowerCase();

  // Try each pattern
  for (const pattern of heightPatterns) {
    const match = lowerText.match(pattern);
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
      
      // Handle single number formats
      const value = parseInt(match[1]);
      
      // Determine unit based on the matched text
      if (lowerText.includes('cm') || lowerText.includes('centimeter')) {
        return { value, unit: 'cm' };
      } else {
        // Default to inches for all other matches
        return { value, unit: 'in' };
      }
    }
  }

  return null;
}

export function textToWeight(text: string): Weight | null {
  const lowerText = text.toLowerCase();

  // Try each pattern
  for (const pattern of weightPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      
      // Determine unit based on the matched text
      if (lowerText.includes('kg') || lowerText.includes('kilogram')) {
        return { value, unit: 'kg' };
      } else {
        // Default to pounds for all other matches
        return { value, unit: 'lbs' };
      }
    }
  }

  return null;
}

export function convertHeight(height: Height, toUnit: HeightUnits): Height {
  if (height.unit === toUnit) return height;

  let value: number;
  if (height.unit === 'cm' && toUnit === 'in') {
    value = height.value / 2.54;
  } else if (height.unit === 'in' && toUnit === 'cm') {
    value = height.value * 2.54;
  } else {
    throw new Error(`Invalid conversion from ${height.unit} to ${toUnit}`);
  }

  return {
    value: Math.round(value * 10) / 10, // Round to 1 decimal place
    unit: toUnit
  };
}

export function convertWeight(weight: Weight, toUnit: WeightUnits): Weight {
  if (weight.unit === toUnit) return weight;

  let value: number;
  if (weight.unit === 'kg' && toUnit === 'lbs') {
    value = weight.value * 2.20462;
  } else if (weight.unit === 'lbs' && toUnit === 'kg') {
    value = weight.value / 2.20462;
  } else {
    throw new Error(`Invalid conversion from ${weight.unit} to ${toUnit}`);
  }

  return {
    value: Math.round(value * 10) / 10, // Round to 1 decimal place
    unit: toUnit
  };
}

export function formatHeight(height: Height): string {
  if (height.unit === 'cm') {
    return `${height.value} cm`;
  } else {
    const feet = Math.floor(height.value / 12);
    const inches = height.value % 12;
    return inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
  }
}

export function formatWeight(weight: Weight): string {
  return `${weight.value} ${weight.unit}`;
} 