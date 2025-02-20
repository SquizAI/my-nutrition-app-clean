import { parse, isValid } from 'date-fns';

// Map of word numbers to digits
const wordToNumber: { [key: string]: number } = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, million: 1000000
};

// Map of month names to numbers
const monthToNumber: { [key: string]: number } = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12
};

/**
 * Converts words to numbers (e.g., "twenty five" to 25)
 */
export function wordsToNumber(text: string): number | null {
  const words = text.toLowerCase().trim().split(/\s+/);
  let result = 0;
  let currentNumber = 0;

  for (const word of words) {
    // Skip common joining words
    if (['and', 'the', '&'].includes(word)) continue;

    // Try to parse as a direct number first
    const directNumber = parseFloat(word);
    if (!isNaN(directNumber)) {
      if (currentNumber === 0) {
        currentNumber = directNumber;
      } else {
        currentNumber += directNumber;
      }
      continue;
    }

    // Check if it's a word number
    if (word in wordToNumber) {
      const value = wordToNumber[word];
      if (value === 100) {
        currentNumber = currentNumber * value;
      } else if (value === 1000 || value === 1000000) {
        currentNumber = (currentNumber || 1) * value;
        result += currentNumber;
        currentNumber = 0;
      } else {
        currentNumber += value;
      }
    }
  }

  result += currentNumber;
  return result || null;
}

/**
 * Parses a year from words like "nineteen eighty"
 */
function parseYearWords(words: string[]): number | null {
  // Handle "nineteen eighty" format
  if (words.length >= 2) {
    const firstWord = wordsToNumber(words[0]);
    const secondWord = wordsToNumber(words[1]);
    
    if (firstWord === 19 || firstWord === 20) {
      if (secondWord !== null && secondWord >= 0 && secondWord <= 99) {
        return (firstWord * 100) + secondWord;
      }
    }
  }
  return null;
}

/**
 * Converts text to a date (e.g., "december fifteen nineteen eighty" to Date object)
 */
export function textToDate(text: string): Date | null {
  // Try direct date parsing first
  const directDate = new Date(text);
  if (isValid(directDate)) {
    return directDate;
  }

  // Clean and normalize the text
  const cleanText = text.toLowerCase().trim()
    .replace(/(\d+)(st|nd|rd|th)/g, '$1') // Remove ordinal suffixes
    .replace(/,/g, ''); // Remove commas

  // Split into words and remove empty strings
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  
  let month: number | null = null;
  let day: number | null = null;
  let year: number | null = null;

  // First pass: look for month names
  for (let i = 0; i < words.length; i++) {
    if (monthToNumber[words[i]]) {
      month = monthToNumber[words[i]];
      // Look for day and year around the month
      const beforeWord = words[i - 1];
      const afterWord = words[i + 1];
      
      if (beforeWord) {
        const beforeNum = wordsToNumber(beforeWord);
        if (beforeNum && beforeNum >= 1 && beforeNum <= 31) {
          day = beforeNum;
        }
      }
      if (afterWord) {
        const afterNum = wordsToNumber(afterWord);
        if (afterNum && afterNum >= 1 && afterNum <= 31 && !day) {
          day = afterNum;
        }
      }
      break;
    }
  }

  // Second pass: look for year
  for (let i = 0; i < words.length; i++) {
    if (year === null) {
      // Try "nineteen eighty" format
      if (i < words.length - 1) {
        const yearFromWords = parseYearWords(words.slice(i));
        if (yearFromWords !== null) {
          year = yearFromWords;
          i++; // Skip next word as it's part of the year
          continue;
        }
      }

      // Try direct number
      const wordNum = wordsToNumber(words[i]);
      if (wordNum !== null) {
        if (wordNum >= 1900 && wordNum <= 2099) {
          year = wordNum;
        } else if (!day && wordNum >= 1 && wordNum <= 31) {
          day = wordNum;
        }
      }
    }
  }

  // If we still don't have a day, look for remaining numbers
  if (!day) {
    for (const word of words) {
      const wordNum = wordsToNumber(word);
      if (wordNum !== null && wordNum >= 1 && wordNum <= 31) {
        day = wordNum;
        break;
      }
    }
  }

  // Validate and create date if we have all components
  if (month && day && year) {
    const date = new Date(year, month - 1, day);
    if (isValid(date) && date.getMonth() === month - 1) {
      return date;
    }
  }

  // Fallback: try to match different date formats with regular expressions
  const patterns = [
    // Month DD YYYY
    /(\w+)\s+(\d+|\w+)(?:st|nd|rd|th)?\s+(\d+|\w+)/,
    // DD Month YYYY
    /(\d+|\w+)(?:st|nd|rd|th)?\s+(\w+)\s+(\d+|\w+)/,
    // YYYY Month DD
    /(\d+|\w+)\s+(\w+)\s+(\d+|\w+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let [_, part1, part2, part3] = match;
      let monthPart: string, dayPart: string, yearPart: string;

      // Try to identify parts based on month name
      if (monthToNumber[part1]) {
        monthPart = part1;
        dayPart = part2;
        yearPart = part3;
      } else if (monthToNumber[part2]) {
        monthPart = part2;
        dayPart = part1;
        yearPart = part3;
      } else {
        // Try year first format
        const yearFromWords = parseYearWords(part1.split(/\s+/));
        if (yearFromWords) {
          yearPart = String(yearFromWords);
          monthPart = part2;
          dayPart = part3;
        } else {
          continue;
        }
      }

      // Convert parts to numbers
      month = monthToNumber[monthPart];
      day = wordsToNumber(dayPart);
      
      // Try to parse year
      const yearFromWords = parseYearWords(yearPart.split(/\s+/));
      year = yearFromWords || wordsToNumber(yearPart);

      if (month && day && year) {
        const date = new Date(year, month - 1, day);
        if (isValid(date) && date.getMonth() === month - 1) {
          return date;
        }
      }
    }
  }

  return null;
}

/**
 * Converts height text to inches (e.g., "five feet ten inches" to 70)
 */
export function textToHeight(text: string): number | null {
  const cleanText = text.toLowerCase().trim();

  // Try to match different height formats
  const patterns = [
    // X feet Y inches
    /(\d+|\w+)\s*(?:feet|foot|ft)(?:\s+(\d+|\w+)\s*(?:inches|inch|in))?/i,
    // X'Y" or X' Y"
    /(\d+|\w+)\s*['′]\s*(?:(\d+|\w+)\s*["″])?/i,
    // X cm or X centimeters
    /(\d+|\w+)\s*(?:cm|centimeters|centimeter)/i,
    // Just inches
    /(\d+|\w+)\s*(?:inches|inch|in)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let feet = 0, inches = 0;

      // Convert first number (feet or cm)
      const firstNum = isNaN(Number(match[1])) ? wordsToNumber(match[1]) : Number(match[1]);
      if (firstNum === null) continue;

      if (cleanText.includes('cm') || cleanText.includes('centimeter')) {
        // Convert cm to inches
        return Math.round(firstNum / 2.54);
      } else if (cleanText.includes('inch') && !cleanText.includes('feet')) {
        // Just inches
        return firstNum;
      } else {
        // Feet and inches
        feet = firstNum;
        if (match[2]) {
          const secondNum = isNaN(Number(match[2])) ? wordsToNumber(match[2]) : Number(match[2]);
          if (secondNum !== null) {
            inches = secondNum;
          }
        }
        return (feet * 12) + inches;
      }
    }
  }

  // If no pattern matches, try to convert direct number (assuming inches)
  const directNumber = wordsToNumber(cleanText);
  return directNumber;
}

/**
 * Converts weight text to pounds (e.g., "one hundred and fifty pounds" to 150)
 */
export function textToWeight(text: string): number | null {
  const cleanText = text.toLowerCase().trim();

  // Try to match different weight formats
  const patterns = [
    // X pounds/lbs
    /(\d+|\w+)\s*(?:pounds|pound|lbs|lb)/i,
    // X kg or X kilograms
    /(\d+|\w+)\s*(?:kg|kilograms|kilogram)/i,
    // X stone Y pounds
    /(\d+|\w+)\s*(?:stone|st)(?:\s+(\d+|\w+)\s*(?:pounds|pound|lbs|lb))?/i,
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      // Convert first number
      const firstNum = isNaN(Number(match[1])) ? wordsToNumber(match[1]) : Number(match[1]);
      if (firstNum === null) continue;

      if (cleanText.includes('kg') || cleanText.includes('kilogram')) {
        // Convert kg to pounds
        return Math.round(firstNum * 2.20462);
      } else if (cleanText.includes('stone') || cleanText.includes('st')) {
        // Convert stone to pounds
        let pounds = firstNum * 14;
        if (match[2]) {
          const additionalPounds = isNaN(Number(match[2])) ? wordsToNumber(match[2]) : Number(match[2]);
          if (additionalPounds !== null) {
            pounds += additionalPounds;
          }
        }
        return pounds;
      } else {
        // Already in pounds
        return firstNum;
      }
    }
  }

  // If no pattern matches, try to convert direct number (assuming pounds)
  const directNumber = wordsToNumber(cleanText);
  return directNumber;
}

/**
 * Converts age text to number (e.g., "twenty five years old" to 25)
 */
export function textToAge(text: string): number | null {
  const cleanText = text.toLowerCase().trim()
    .replace(/years?\s+old/, '')
    .replace(/i'?m/, '')
    .replace(/age/, '')
    .trim();

  return wordsToNumber(cleanText);
} 