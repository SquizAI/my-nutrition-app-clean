import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In a production app, you'd want to use a backend to make these calls
});

export async function getNutritionAdvice(prompt: string, outputSchema: any): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an advanced nutrition AI assistant. Your role is to provide accurate, helpful, and personalized nutrition advice. 
          Use your knowledge of nutrition science, dietary guidelines, and health research to offer insights and recommendations.
          Always respond with valid JSON that matches the provided schema. Do not include any additional text or formatting.`
        },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "nutrition_output",
          description: "Output structured nutrition data",
          parameters: outputSchema
        }
      ],
      function_call: { name: "nutrition_output" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      let jsonString = functionCall.arguments;

      // Clean the JSON string
      jsonString = jsonString.replace(/\n/g, "")
                              .replace(/\r/g, "")
                              .replace(/\t/g, "")
                              .replace(/\\"/g, '"')
                              .replace(/\\/g, "\\\\")
                              .replace(/\\'/g, "'")
                              .replace(/[\u0000-\u001F]+/g, "");

      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.log('Problematic JSON string:', jsonString);
        
        // Attempt to salvage partial data
        const salvaged = salvagePartialJSON(jsonString);
        if (Object.keys(salvaged).length > 0) {
          return salvaged;
        }
        
        throw new Error("Failed to parse the AI response as JSON.");
      }
    } else {
      throw new Error("Unexpected response format from OpenAI");
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

function salvagePartialJSON(jsonString: string): Record<string, any> {
  const result: Record<string, any> = {};

  // Try to extract mealPlan data
  if (jsonString.includes('"mealPlan"')) {
    const mealPlan: Record<string, any> = {};
    const dayRegex = /"(\w+)":\s*(\{[^}]*\})/g;
    let match;
    
    while ((match = dayRegex.exec(jsonString)) !== null) {
      const day = match[1];
      let dayPlan = match[2];
      
      // Ensure the day plan ends with a closing brace
      if (!dayPlan.endsWith('}')) {
        dayPlan += '}';
      }
      
      try {
        mealPlan[day] = JSON.parse(dayPlan);
      } catch (e) {
        console.error(`Error parsing day plan for ${day}:`, e);
        mealPlan[day] = salvageMeals(dayPlan);
      }
    }
    
    if (Object.keys(mealPlan).length > 0) {
      result.mealPlan = mealPlan;
    }
  }

  // Add more salvaging logic for other data types as needed

  return result;
}

function salvageMeals(dayPlan: string): Record<string, any> {
  const meals: Record<string, any> = {};
  const mealRegex = /"(\w+)":\s*(\{[^}]*\})/g;
  let mealMatch;

  while ((mealMatch = mealRegex.exec(dayPlan)) !== null) {
    const mealType = mealMatch[1];
    let meal = mealMatch[2];
    if (!meal.endsWith('}')) {
      meal += '}';
    }
    try {
      meals[mealType] = JSON.parse(meal);
    } catch (mealError) {
      console.error(`Error parsing meal ${mealType}:`, mealError);
      meals[mealType] = salvageProperties(meal);
    }
  }

  return meals;
}

function salvageProperties(str: string): Record<string, any> {
  const properties: Record<string, any> = {};
  const propertyRegex = /"(\w+)":\s*("[^"]*"|\d+)/g;
  let propertyMatch;

  while ((propertyMatch = propertyRegex.exec(str)) !== null) {
    const [, key, value] = propertyMatch;
    try {
      properties[key] = JSON.parse(value);
    } catch (e) {
      properties[key] = value.replace(/^"|"$/g, '');
    }
  }

  return properties;
}

export async function generateMealPlan(preferences: string): Promise<any> {
  const schema = {
    type: "object",
    properties: {
      mealPlan: {
        type: "object",
        properties: {
          Monday: {
            type: "object",
            properties: {
              Breakfast: { type: "string" },
              Lunch: { type: "string" },
              Dinner: { type: "string" },
              Snacks: { type: "string" }
            },
            required: ["Breakfast", "Lunch", "Dinner", "Snacks"]
          },
          Tuesday: { /* same as Monday */ },
          Wednesday: { /* same as Monday */ },
          Thursday: { /* same as Monday */ },
          Friday: { /* same as Monday */ },
          Saturday: { /* same as Monday */ },
          Sunday: { /* same as Monday */ }
        },
        required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      }
    },
    required: ["mealPlan"]
  };

  return getNutritionAdvice(`Create a meal plan for the week based on these preferences: ${preferences}.`, schema);
}

export async function analyzeHealthTrends(data: any): Promise<any> {
  const schema = {
    type: "object",
    properties: {
      trends: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metric: { type: "string" },
            observation: { type: "string" },
            recommendation: { type: "string" }
          },
          required: ["metric", "observation", "recommendation"]
        }
      }
    },
    required: ["trends"]
  };

  return getNutritionAdvice(`Analyze these health trends and provide insights: ${JSON.stringify(data)}`, schema);
}