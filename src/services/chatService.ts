import { create } from 'zustand';
import OpenAI from 'openai';
import { z } from 'zod';
import { useUserPreferences } from './userPreferences';
import { useMacroCalculator, UserStats } from './macroCalculator';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only use this in development
});

// Define response schemas
const ResponseSchema = z.object({
  response: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  topics: z.array(z.string()),
  suggestions: z.array(z.object({
    type: z.enum(['meal', 'exercise', 'lifestyle']),
    content: z.string(),
    priority: z.number().min(1).max(5),
  })),
  followUpQuestions: z.array(z.string()),
});

type AIResponse = z.infer<typeof ResponseSchema>;
type Suggestion = AIResponse['suggestions'][number];

interface VoiceMessageMetadata {
  duration: number;
  waveform: number[];
  language: string;
  confidence: number;
  emotions?: {
    type: string;
    confidence: number;
  }[];
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'voice';
  timestamp: Date;
  audioUrl?: string;
  metadata?: Partial<AIResponse> & {
    voice?: VoiceMessageMetadata;
  };
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (content: string, type: Message['type'], audioBlob?: Blob) => Promise<void>;
  clearMessages: () => void;
}

interface UserInfoState {
  isCollectingInfo: boolean;
  currentQuestion: string;
  collectedInfo: Partial<UserStats>;
  currentQuestionIndex: number;
  handleAnswer: (answer: string) => void;
}

const userInfoQuestions = [
  {
    key: 'age',
    question: "What's your age?",
    validate: (value: string) => {
      const age = parseInt(value);
      return age >= 13 && age <= 100;
    }
  },
  {
    key: 'gender',
    question: "What's your gender? (male/female)",
    validate: (value: string) => ['male', 'female'].includes(value.toLowerCase())
  },
  {
    key: 'weight',
    question: "What's your weight in pounds?",
    validate: (value: string) => {
      const weight = parseInt(value);
      return weight >= 80 && weight <= 400;
    }
  },
  {
    key: 'height',
    question: "What's your height in inches?",
    validate: (value: string) => {
      const height = parseInt(value);
      return height >= 48 && height <= 96;
    }
  },
  {
    key: 'bodyFatPercentage',
    question: "If you know your body fat percentage, what is it? (Skip if unknown)",
    validate: (value: string) => {
      if (value.toLowerCase() === 'skip') return true;
      const bf = parseInt(value);
      return bf >= 5 && bf <= 50;
    }
  },
  {
    key: 'activityLevel',
    question: `What's your activity level?
1. Sedentary (No workouts, <5k steps)
2. Lightly Active (1-3 workouts/week)
3. Moderately Active (3-5 workouts/week)
4. Active (6+ workouts/week)
5. Very Active (Intense training/physical job)
Please enter the number (1-5):`,
    validate: (value: string) => {
      const level = parseInt(value);
      return level >= 1 && level <= 5;
    },
    transform: (value: string) => {
      const levels = ['sedentary', 'lightlyActive', 'moderatelyActive', 'active', 'veryActive'];
      return levels[parseInt(value) - 1];
    }
  },
  {
    key: 'goal',
    question: `What's your goal?
1. Weight Loss
2. Maintenance
3. Weight Gain
Please enter the number (1-3):`,
    validate: (value: string) => {
      const goal = parseInt(value);
      return goal >= 1 && goal <= 3;
    },
    transform: (value: string) => {
      const goals = ['lose', 'maintain', 'gain'];
      return goals[parseInt(value) - 1];
    }
  },
  {
    key: 'stepsPerDay',
    question: "How many steps do you typically walk per day?",
    validate: (value: string) => {
      const steps = parseInt(value);
      return steps >= 1000 && steps <= 30000;
    }
  },
  {
    key: 'workoutsPerWeek',
    question: "How many times do you work out per week?",
    validate: (value: string) => {
      const workouts = parseInt(value);
      return workouts >= 0 && workouts <= 14;
    }
  }
];

export const useChatStore = create<ChatStore & UserInfoState>((set, get) => ({
  messages: [],
  isLoading: false,
  isCollectingInfo: false,
  currentQuestion: '',
  currentQuestionIndex: -1,
  collectedInfo: {},

  addMessage: async (content: string, type: Message['type'], audioBlob?: Blob) => {
    set({ isLoading: true });
    
    try {
      let finalContent = content;
      let audioUrl: string | undefined;
      let metadata: any = {};

      // Handle voice messages
      if (audioBlob) {
        audioUrl = URL.createObjectURL(audioBlob);

        // Get audio duration and generate waveform
        const audioContext = new AudioContext();
        const audioBuffer = await audioBlob.arrayBuffer();
        const decodedData = await audioContext.decodeAudioData(audioBuffer);
        
        // Generate waveform data
        const channelData = decodedData.getChannelData(0);
        const waveform = generateWaveformData(channelData);

        const audioFile = new File([audioBlob], 'audio.wav', {
          type: 'audio/wav'
        });
        
        try {
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
            response_format: 'text',
          });

          finalContent = transcription.toString();
          
          // Create voice metadata
          const voiceMetadata: VoiceMessageMetadata = {
            duration: decodedData.duration,
            waveform,
            language: 'en',
            confidence: 0.95,
            emotions: await detectEmotions(audioBlob)
          };

          // Update message metadata
          metadata = { voice: voiceMetadata };
        } catch (error) {
          console.error('Error transcribing audio:', error);
          throw new Error('Failed to transcribe audio message');
        }
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: finalContent,
        type,
        timestamp: new Date(),
        audioUrl,
        metadata,
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // If we're collecting user info, handle the answer
      if (get().isCollectingInfo) {
        get().handleAnswer(finalContent);
        return;
      }

      // Check if we need to start collecting user info
      const macros = useMacroCalculator.getState().macros;
      const userStats = useMacroCalculator.getState().userStats;
      
      if (!userStats) {
        set({
          isCollectingInfo: true,
          currentQuestionIndex: 0,
          currentQuestion: userInfoQuestions[0].question,
        });

        const aiMessage: Message = {
          id: Date.now().toString(),
          content: "I notice you haven't provided your information yet. Let me help you calculate your optimal nutrition plan. " + userInfoQuestions[0].question,
          type: 'ai',
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, aiMessage],
        }));

        return;
      }

      // Generate AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a helpful nutrition and wellness assistant. 
            Provide responses in JSON format with the following structure:
            {
              "response": "Your main response message",
              "sentiment": "positive|neutral|negative",
              "topics": ["array of relevant topics"],
              "suggestions": [
                {
                  "type": "meal|exercise|lifestyle",
                  "content": "suggestion details",
                  "priority": 1-5
                }
              ],
              "followUpQuestions": ["array of relevant follow-up questions"]
            }`
          },
          {
            role: "user",
            content: finalContent,
          }
        ],
      });

      const aiResponseRaw = completion.choices[0]?.message?.content;

      if (aiResponseRaw) {
        try {
          const parsedResponse = ResponseSchema.parse(JSON.parse(aiResponseRaw));
          
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: parsedResponse.response,
            type: 'ai',
            timestamp: new Date(),
            metadata: parsedResponse,
          };

          set((state) => ({
            messages: [...state.messages, aiMessage],
          }));

          // If there are high-priority suggestions, show them as separate messages
          const highPrioritySuggestions = parsedResponse.suggestions
            .filter((s: Suggestion) => s.priority >= 4)
            .map((s: Suggestion) => ({
              id: Date.now().toString() + s.type,
              content: `💡 Suggestion: ${s.content}`,
              type: 'ai' as const,
              timestamp: new Date(),
            }));

          if (highPrioritySuggestions.length > 0) {
            set((state) => ({
              messages: [...state.messages, ...highPrioritySuggestions],
            }));
          }
        } catch (error) {
          console.error('Error parsing AI response:', error);
          throw new Error('Invalid response format from AI');
        }
      }
    } catch (error) {
      console.error('Error in chat service:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, there was an error processing your message.',
        type: 'ai',
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  handleAnswer: (answer: string) => {
    const state = get();
    const currentQ = userInfoQuestions[state.currentQuestionIndex];
    
    if (!currentQ.validate(answer)) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, that doesn't seem to be a valid answer. " + currentQ.question,
        type: 'ai',
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
      }));
      return;
    }

    // Transform answer if needed
    const value = currentQ.transform ? currentQ.transform(answer) : answer;

    // Update collected info
    const updatedInfo = {
      ...state.collectedInfo,
      [currentQ.key]: value
    };

    // Move to next question or finish
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex < userInfoQuestions.length) {
      const nextQuestion = userInfoQuestions[nextIndex];
      set({
        currentQuestionIndex: nextIndex,
        currentQuestion: nextQuestion.question,
        collectedInfo: updatedInfo
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: nextQuestion.question,
        type: 'ai',
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
      }));
    } else {
      // Finish collecting info
      set({
        isCollectingInfo: false,
        currentQuestionIndex: -1,
        currentQuestion: '',
      });

      // Set user stats
      useMacroCalculator.getState().setUserStats({
        ...updatedInfo,
        unitSystem: 'imperial'
      } as UserStats);

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: "Great! I've calculated your optimal nutrition plan. You can now use the TDEE Calculator and Meal Planner to generate personalized meal plans that match your goals.",
        type: 'ai',
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
      }));
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));

function generateWaveformData(channelData: Float32Array): number[] {
  const samples = 50; // Number of points in the waveform
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;

    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }

    waveform.push(sum / blockSize);
  }

  // Normalize values between 0 and 1
  const max = Math.max(...waveform);
  return waveform.map(w => w / max);
}

async function detectEmotions(audioBlob: Blob) {
  // This would typically use a separate API for emotion detection
  // For now, we'll return mock data
  return [
    { type: 'neutral', confidence: 0.7 },
    { type: 'happy', confidence: 0.2 },
    { type: 'serious', confidence: 0.1 }
  ];
} 