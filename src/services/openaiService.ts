/* openaiService.ts */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In a production app, you'd want to use a backend to make these calls
});

/**
 * Gets AI-powered writing suggestions for the given text and context.
 * @param text - The text to get suggestions for
 * @param context - The context in which the text appears (e.g., question being answered)
 * @returns An array of improved text suggestions
 */
export async function getAIWritingSuggestions(text: string, context: string): Promise<string[]> {
  try {
    const outputSchema = {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "string",
            description: "An improved version of the original text"
          },
          minItems: 3,
          maxItems: 3
        }
      },
      required: ["suggestions"]
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are a professional medical scribe and health information assistant. Your goal is to help users express their health-related information clearly and accurately.
          Provide exactly 3 alternative ways to express the user's text, focusing on:
          1. Medical accuracy and terminology
          2. Completeness of information
          3. Natural, conversational tone
          Keep each suggestion concise but comprehensive.` 
        },
        {
          role: "user",
          content: `Improve this health-related response: "${text}"\nContext: ${context}`
        }
      ],
      functions: [
        {
          name: "writing_suggestions",
          description: "Output structured writing suggestions",
          parameters: outputSchema
        }
      ],
      function_call: { name: "writing_suggestions" },
      temperature: 0.7,
      max_tokens: 500
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      try {
        const result = JSON.parse(functionCall.arguments);
        return result.suggestions;
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        return [text];
      }
    }

    return [text];
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [text];
  }
}

/**
 * Parses a health history response using OpenAI's API.
 * @param text - The transcribed text from voice input
 * @param context - The context of the health history section
 * @returns A promise resolving to a parsed response
 */
export async function parseOnboardingResponse(text: string, context: string): Promise<string> {
  try {
    const outputSchema = {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: [
            "provide_condition",
            "provide_condition_details",
            "provide_health_history",
            "unknown"
          ],
          description: "The user's intent in providing this information"
        },
        entities: {
          type: "object",
          properties: {
            conditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  details: {
                    type: "object",
                    properties: {
                      diagnosis_date: { type: "string" },
                      medications: { type: "array", items: { type: "string" } },
                      symptoms: { type: "array", items: { type: "string" } },
                      severity: { type: "string" },
                      frequency: { type: "string" },
                      triggers: { type: "array", items: { type: "string" } },
                      readings: { type: "object", additionalProperties: true },
                      type: { type: "string" }
                    },
                    additionalProperties: true
                  }
                },
                required: ["name"]
              }
            },
            dates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  dosage: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            }
          }
        },
        details: {
          type: "object",
          additionalProperties: true,
          description: "Extracted details from the text"
        }
      },
      required: ["intent", "entities"]
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical scribe AI that helps parse and structure health-related information from natural language input.
          Your goal is to:
          1. Identify medical conditions and their details
          2. Extract dates, measurements, and medications
          3. Structure the information appropriately
          4. Maintain medical accuracy
          5. Handle both direct statements and conversational language`
        },
        {
          role: "user",
          content: `Parse this health-related response for ${context}: "${text}"`
        }
      ],
      functions: [
        {
          name: "parse_health_info",
          description: "Parse and structure health information",
          parameters: outputSchema
        }
      ],
      function_call: { name: "parse_health_info" },
      temperature: 0.3
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.arguments) {
      try {
        return functionCall.arguments;
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        return text;
      }
    }

    return text;
  } catch (error) {
    console.error('Error parsing response:', error);
    return text;
  }
}