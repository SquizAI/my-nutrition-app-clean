import OpenAI from "openai";

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should make these calls from your backend
});

// Structured output schema for measurements
export const measurementsSchema = {
  type: "object",
  properties: {
    height: {
      type: "object",
      properties: {
        value: { type: "number" },
        unit: { type: "string", enum: ["in", "cm"] },
        original_text: { type: "string" }
      },
      required: ["value", "unit"]
    },
    weight: {
      type: "object",
      properties: {
        value: { type: "number" },
        unit: { type: "string", enum: ["lbs", "kg"] },
        original_text: { type: "string" }
      },
      required: ["value", "unit"]
    },
    confidence: { type: "number" }
  },
  required: ["height", "weight", "confidence"]
} as const;

// Helper function to parse measurements using OpenAI
export async function parseMeasurements(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You are a precise measurement parser. Extract height and weight measurements from user input, converting all values to standard units (inches and pounds)."
        },
        {
          role: "user",
          content: text
        }
      ],
      functions: [
        {
          name: "parse_measurements",
          description: "Parse height and weight measurements from text",
          parameters: measurementsSchema
        }
      ],
      function_call: { name: "parse_measurements" }
    });

    const result = JSON.parse(completion.choices[0].message.function_call?.arguments || "{}");
    return result;
  } catch (error) {
    console.error('Error parsing measurements:', error);
    throw error;
  }
} 