import { OnboardingStep } from '../types';

export const advancedOnboardingConfig: OnboardingStep[] = [
  {
    id: 'name',
    title: 'Welcome to JME AI',
    description: 'Before we begin, please tell us your name.',
    voicePrompt: "Hi! I'm your AI nutrition assistant. What's your preferred name?",
    type: 'intro',
    questions: [
      {
        id: 'name',
        text: 'Please tell me your preferred name.',
        voicePrompt: 'You can either type your name or click the microphone button and say it.',
        type: 'text',
        required: true,
        additionalInfo: 'This helps me personalize our conversations.'
      }
    ]
  },
  {
    id: 'legal',
    title: 'Terms & Legal Agreements',
    description: 'Before we get started, please review and accept our terms.',
    voicePrompt: "Let's quickly go through some important agreements. You can respond with 'yes' or 'no' for each one.",
    type: 'legal',
    questions: [
      {
        id: 'terms',
        text: 'We provide AI-generated nutritional guidance; this does not replace medical treatment. Do you accept?',
        voicePrompt: 'Do you accept that our AI guidance does not replace medical treatment? Say yes or no.',
        type: 'boolean',
        required: true,
        additionalInfo: 'This is important: Our AI provides general guidance based on your inputs, but it\'s not a substitute for professional medical advice.'
      },
      {
        id: 'privacy',
        text: 'Would you like to read or listen to our Privacy Policy?',
        voicePrompt: 'Would you like to read or listen to our Privacy Policy? It explains how we protect and store your data.',
        type: 'select',
        required: true,
        options: ['Accept', 'Decline', 'Read Policy', 'Listen to Policy']
      },
      {
        id: 'medical',
        text: 'This advice is general and not a substitute for professional medical guidance. Do you accept?',
        voicePrompt: 'This advice is general and not a substitute for professional medical guidance. Do you accept?',
        type: 'boolean',
        required: true
      }
    ]
  },
  {
    id: 'metrics',
    title: 'Baseline Metrics',
    description: 'Let\'s gather some basic information about you.',
    voicePrompt: 'Now I\'ll ask about your basic measurements. You can speak naturally, like "I\'m 5 feet 10 inches tall" or use the input fields.',
    type: 'metrics',
    questions: [
      {
        id: 'dob',
        text: 'What is your date of birth?',
        voicePrompt: 'What is your date of birth? For example, you can say "I was born on July 10, 1989."',
        type: 'date',
        required: true
      },
      {
        id: 'gender',
        text: 'What gender do you identify with?',
        voicePrompt: 'What gender do you identify with? If you prefer not to specify or identify as non-binary/custom, we can capture extra details to ensure accurate health recommendations.',
        type: 'select',
        required: true,
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Custom'],
        conditionalQuestions: [
          {
            condition: 'Non-binary',
            question: 'Are you on hormone therapy or have other health considerations you\'d like us to factor in?',
            type: 'text'
          },
          {
            condition: 'Custom',
            question: 'Are you on hormone therapy or have other health considerations you\'d like us to factor in?',
            type: 'text'
          }
        ]
      },
      {
        id: 'height',
        text: 'What is your height?',
        voicePrompt: 'What\'s your height? You can say something like "5 feet 10 inches" or use the number inputs.',
        type: 'number',
        required: true,
        additionalInfo: 'This helps calculate your nutritional needs accurately.'
      },
      {
        id: 'weight',
        text: 'What is your weight in pounds?',
        voicePrompt: 'What\'s your current weight in pounds? You can say it or type it in.',
        type: 'number',
        required: true,
        additionalInfo: 'This helps determine your daily caloric needs.'
      }
    ]
  },
  {
    id: 'health',
    title: 'Health History & Medical Information',
    description: 'Tell us about your health history so we can tailor recommendations.',
    voicePrompt: 'Tell us about your health history so we can tailor recommendations.',
    type: 'health',
    questions: [
      {
        id: 'conditions',
        text: 'Do you have any conditions or take any medications we should know about?',
        voicePrompt: 'Do you have any conditions or take any medications we should know about?',
        type: 'multiselect',
        required: true,
        options: [
          'Hypertension/High Blood Pressure',
          'High Cholesterol',
          'Diabetes',
          'Heart Disease',
          'PCOS',
          'Hypothyroidism',
          'None'
        ],
        additionalInfo: 'Select all that apply. This helps us provide safer and more appropriate recommendations.'
      },
      {
        id: 'injuries',
        text: 'Do you have any current or past injuries, surgeries, or movement restrictions?',
        voicePrompt: 'Do you have any current or past injuries, surgeries, or movement restrictions we should consider for exercise recommendations?',
        type: 'boolean',
        required: true,
        conditionalQuestions: [
          {
            condition: 'true',
            question: 'Which activities or movements are most challenging?',
            type: 'multiselect',
            options: ['Lower Body Movements', 'Upper Body Movements', 'Cardiovascular', 'Balance', 'Other']
          },
          {
            condition: 'true',
            question: 'Have you been cleared by a medical professional for exercise?',
            type: 'select',
            options: ['Yes', 'No', 'Not Sure']
          }
        ]
      },
      {
        id: 'menstrual',
        text: 'Do you experience PMS, irregular cycles, or other hormonal imbalances?',
        voicePrompt: 'Do you experience PMS, irregular cycles, or other hormonal imbalances?',
        type: 'select',
        options: ['Yes', 'No', 'Skip'],
        conditionalQuestions: [
          {
            condition: 'Yes',
            question: 'Would you like your plan to adapt based on your menstrual cycle?',
            type: 'select',
            options: ['Yes', 'No', 'Learn More']
          }
        ],
        additionalInfo: 'By adapting your plan to each phase of the menstrual cycle, we can better address changes in energy levels, appetite, and nutrient needs.'
      },
      {
        id: 'digestive',
        text: 'Do you have digestive issues, like bloating or reflux?',
        voicePrompt: 'Do you have digestive issues, like bloating or reflux?',
        type: 'multiselect',
        options: ['Bloating', 'Gas', 'Constipation', 'Diarrhea', 'Reflux', 'None'],
        conditionalQuestions: [
          {
            condition: 'true',
            question: 'How often do you have a bowel movement?',
            type: 'select',
            options: ['Multiple Times Daily', 'Once a Day', 'Every Other Day', 'Inconsistent']
          }
        ]
      },
      {
        id: 'foodSensitivities',
        text: 'Any foods that upset your stomach?',
        voicePrompt: 'Any foods that upset your stomach?',
        type: 'text'
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle, Energy & Mental Health',
    description: 'Now let\'s talk about your daily lifestyle and energy levels.',
    voicePrompt: 'Now let\'s talk about your daily lifestyle and energy levels.',
    type: 'lifestyle',
    questions: [
      {
        id: 'energyLevels',
        text: 'How are your energy levels throughout the day?',
        voicePrompt: 'How are your energy levels throughout the day? For example, high all day or afternoon slumps.',
        type: 'select',
        required: true,
        options: ['Consistently High', 'Afternoon Slumps', 'Tired All Day', 'Up-and-Down']
      },
      {
        id: 'mealFatigue',
        text: 'Do you ever feel fatigue, dizziness, or energy crashes after meals?',
        voicePrompt: 'Would you say yes, no, or sometimes? If yes or sometimes, can you tell me more about when and how often?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Sometimes'],
        conditionalQuestions: [
          {
            condition: 'Yes',
            question: 'Can you tell me more about when and how often this happens?',
            type: 'text'
          },
          {
            condition: 'Sometimes',
            question: 'Can you tell me more about when and how often this happens?',
            type: 'text'
          }
        ]
      },
      {
        id: 'stressLevel',
        text: 'How would you rate your current stress level?',
        voicePrompt: 'How would you rate your current stress level?',
        type: 'select',
        required: true,
        options: ['Low', 'Moderate', 'High', 'Overwhelming']
      },
      {
        id: 'emotionalEating',
        text: 'Do you experience emotional eating or stress-related cravings?',
        voicePrompt: 'Do you experience emotional eating or stress-related cravings?',
        type: 'select',
        required: true,
        options: ['Yes – Frequently', 'Occasionally', 'Rarely', 'Never']
      }
    ]
  },
  {
    id: 'fitness',
    title: 'Current Fitness & Movement',
    description: 'We\'d like to learn about your physical activity.',
    voicePrompt: 'We\'d like to learn about your physical activity.',
    type: 'fitness',
    questions: [
      {
        id: 'occupation',
        text: 'What do you do for a living, and how would you describe your typical day in terms of movement?',
        voicePrompt: 'What do you do for a living, and how would you describe your typical day in terms of movement?',
        type: 'text',
        required: true,
        additionalInfo: 'This helps us understand your daily activity level and energy expenditure.'
      },
      {
        id: 'dailyPosture',
        text: 'How would you describe your daily posture?',
        voicePrompt: 'How would you describe your daily posture?',
        type: 'select',
        required: true,
        options: ['Mostly Seated', 'Mix of Standing/Walking', 'Physically Demanding']
      },
      {
        id: 'stepTracking',
        text: 'Do you use a smart device to track steps?',
        voicePrompt: 'Do you use a smart device to track steps?',
        type: 'boolean',
        required: true,
        conditionalQuestions: [
          {
            condition: 'true',
            question: 'What is your average daily step count?',
            type: 'number'
          }
        ]
      },
      {
        id: 'exerciseFrequency',
        text: 'On average, how many days a week do you engage in intentional exercise?',
        voicePrompt: 'On average, how many days a week do you engage in intentional exercise? For example, going to the gym, jogging, or yoga?',
        type: 'select',
        required: true,
        options: ['0 Days', '1–2 Days', '3–4 Days', '5+ Days']
      },
      {
        id: 'exerciseIntensity',
        text: 'How would you characterize the intensity of your typical workouts?',
        voicePrompt: 'How would you characterize the intensity of your typical workouts?',
        type: 'select',
        required: true,
        options: ['Light', 'Moderate', 'Intense']
      },
      {
        id: 'exerciseType',
        text: 'Do you have a preferred type of exercise or physical activity?',
        voicePrompt: 'Do you have a preferred type of exercise or physical activity? For example, strength training, cardio, or sports?',
        type: 'multiselect',
        options: ['Strength Training', 'Cardio', 'Sports', 'Yoga', 'Other']
      },
      {
        id: 'fitnessGoals',
        text: 'Are there any upcoming events or specific fitness goals?',
        voicePrompt: 'Are there any upcoming events or specific fitness goals, like running a marathon or improving overall endurance?',
        type: 'boolean',
        conditionalQuestions: [
          {
            condition: 'true',
            question: 'Please tell us more about your fitness goals:',
            type: 'text'
          }
        ]
      }
    ]
  },
  {
    id: 'eating',
    title: 'Current Eating & Food Relationships',
    description: 'Let\'s explore your eating habits and relationship with food.',
    voicePrompt: 'Let\'s explore your eating habits and relationship with food.',
    type: 'nutrition',
    questions: [
      {
        id: 'mealTiming',
        text: 'How do you usually handle breakfast, lunch, and dinner?',
        voicePrompt: 'How do you usually handle breakfast, lunch, and dinner?',
        type: 'select',
        required: true,
        options: ['Big Meal', 'Grab-and-Go', 'Cook Fresh', 'Prepped Ahead']
      },
      {
        id: 'fasting',
        text: 'Do you follow any fasting protocols?',
        voicePrompt: 'Do you follow any fasting protocols like 16:8 or OMAD?',
        type: 'select',
        required: true,
        options: ['16:8', 'OMAD', 'No Preference']
      },
      {
        id: 'mealFrequency',
        text: 'Do you prefer more frequent small meals or fewer large meals?',
        voicePrompt: 'Do you prefer more frequent small meals or fewer large meals?',
        type: 'select',
        required: true,
        options: ['3 Large Meals', '4–5 Smaller Meals', 'Flexible']
      },
      {
        id: 'tracking',
        text: 'Are you currently tracking your food intake or macros?',
        voicePrompt: 'Are you currently tracking your food intake or macros? If so, how?',
        type: 'select',
        required: true,
        options: ['Yes – App', 'Yes – Paper Log', 'No Tracking', 'Other'],
        conditionalQuestions: [
          {
            condition: 'Yes – App',
            question: 'Which apps have you tried and how did they work for you?',
            type: 'text'
          }
        ]
      },
      {
        id: 'disorderedEating',
        text: 'Have you struggled with disordered eating in the past?',
        voicePrompt: 'Have you struggled with disordered eating in the past?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Prefer not to say']
      },
      {
        id: 'foodGuilt',
        text: 'Do you experience guilt after certain foods?',
        voicePrompt: 'Do you experience guilt after certain foods?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Sometimes']
      },
      {
        id: 'dietHistory',
        text: 'Have you tried any diets or meal plans in the past that you found successful or challenging?',
        voicePrompt: 'Have you tried any diets or meal plans in the past that you found successful or challenging?',
        type: 'multiselect',
        options: ['Keto', 'Paleo', 'Vegan', 'Weight Watchers', 'Other'],
        conditionalQuestions: [
          {
            condition: 'Other',
            question: 'What aspects of those approaches did you find easy or difficult?',
            type: 'text'
          }
        ]
      }
    ]
  },
  {
    id: 'cooking',
    title: 'Cooking Preferences & Equipment',
    description: 'Let\'s see how you like to cook.',
    voicePrompt: 'Let\'s see how you like to cook.',
    type: 'cooking',
    questions: [
      {
        id: 'cookingSkill',
        text: 'How comfortable are you cooking, and how much time do you have?',
        voicePrompt: 'How comfortable are you cooking, and how much time do you have?',
        type: 'select',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced']
      },
      {
        id: 'cookingTime',
        text: 'How much time can you typically spend on meal preparation?',
        voicePrompt: 'How much time can you typically spend on meal preparation?',
        type: 'select',
        required: true,
        options: ['10-15 mins', '30 mins', '1 hour']
      },
      {
        id: 'equipment',
        text: 'Which appliances do you regularly use?',
        voicePrompt: 'Which appliances do you regularly use? You can say Oven, Microwave, Air Fryer, etc.',
        type: 'multiselect',
        required: true,
        options: ['Oven', 'Microwave', 'Air Fryer', 'Slow Cooker', 'Instant Pot', 'Blender', 'Food Processor']
      },
      {
        id: 'cookingStyle',
        text: 'Which cooking style do you prefer?',
        voicePrompt: 'Which cooking style do you prefer—simple and fast, gourmet and complex, or somewhere in between?',
        type: 'select',
        required: true,
        options: ['Simple & Fast', 'Balanced', 'Gourmet & Complex']
      }
    ]
  },
  {
    id: 'grocery',
    title: 'Grocery & Budget Preferences',
    description: 'Share your grocery habits to help us with meal planning.',
    voicePrompt: 'Share your grocery habits to help us with meal planning.',
    type: 'grocery',
    questions: [
      {
        id: 'shoppingFrequency',
        text: 'How often do you shop?',
        voicePrompt: 'How often do you shop?',
        type: 'select',
        required: true,
        options: ['Weekly', 'Every Few Days', 'Daily']
      },
      {
        id: 'shoppingMethod',
        text: 'Do you prefer in-store, delivery, or pickup?',
        voicePrompt: 'Do you prefer in-store, delivery, or pickup?',
        type: 'select',
        required: true,
        options: ['In-store', 'Delivery', 'Pickup']
      },
      {
        id: 'stores',
        text: 'Which stores do you primarily shop at?',
        voicePrompt: 'Which stores do you primarily shop at? For example, Walmart, Kroger, Whole Foods, or local markets?',
        type: 'multiselect',
        required: true,
        options: ['Walmart', 'Kroger', 'Whole Foods', 'Local Markets', 'Other']
      },
      {
        id: 'onlineOrdering',
        text: 'Would you like us to check if these stores offer online ordering or delivery through services like Instacart?',
        voicePrompt: 'Would you like us to check if these stores offer online ordering or delivery through services like Instacart?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Not Sure']
      },
      {
        id: 'budget',
        text: 'Do you want to set a maximum weekly grocery budget?',
        voicePrompt: 'Do you want to set a maximum weekly grocery budget?',
        type: 'text'
      },
      {
        id: 'savingPreference',
        text: 'Are you interested in money-saving meal suggestions?',
        voicePrompt: 'Are you interested in money-saving meal suggestions?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Sometimes']
      },
      {
        id: 'sourcing',
        text: 'Do you prefer organic, seasonal, or local foods?',
        voicePrompt: 'Do you prefer organic, seasonal, or local foods?',
        type: 'multiselect',
        options: ['Organic', 'Seasonal', 'Local']
      }
    ]
  },
  {
    id: 'cuisine',
    title: 'Food & Cuisine Preferences',
    description: 'We\'ll personalize your meal plans based on taste and cuisine preferences.',
    voicePrompt: 'We\'ll personalize your meal plans based on taste and cuisine preferences.',
    type: 'preferences',
    questions: [
      {
        id: 'cuisinePreferences',
        text: 'Which cuisines do you enjoy?',
        voicePrompt: 'Which cuisines do you enjoy—Italian, Mexican, grilled foods, or others?',
        type: 'multiselect',
        required: true,
        options: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'Other']
      },
      {
        id: 'cuisineAvoid',
        text: 'Any cuisines you want to avoid?',
        voicePrompt: 'Any cuisines you want to avoid?',
        type: 'text'
      },
      {
        id: 'spiceTolerance',
        text: 'What is your spice tolerance?',
        voicePrompt: 'How about spice tolerance or texture dislikes?',
        type: 'select',
        required: true,
        options: ['Mild', 'Medium', 'Hot']
      },
      {
        id: 'stapleMeals',
        text: 'Any staple meals or dishes you want regularly?',
        voicePrompt: 'Any staple meals or dishes you want regularly?',
        type: 'text'
      },
      {
        id: 'varietyPreference',
        text: 'Are you open to trying new cuisines?',
        voicePrompt: 'Are you open to trying new cuisines?',
        type: 'select',
        required: true,
        options: ['Yes, love variety', 'Sometimes', 'No, prefer familiar']
      }
    ]
  },
  {
    id: 'hydration',
    title: 'Hydration & Sleep',
    description: 'Let\'s capture some hydration and sleep details.',
    voicePrompt: 'Let\'s capture some hydration and sleep details.',
    type: 'preferences',
    questions: [
      {
        id: 'waterIntake',
        text: 'How much water do you drink in a day?',
        voicePrompt: 'How much water do you drink in a day?',
        type: 'text',
        required: true
      },
      {
        id: 'sleep',
        text: 'How many hours do you sleep at night, and do you have trouble sleeping?',
        voicePrompt: 'How many hours do you sleep at night, and do you have trouble sleeping?',
        type: 'select',
        required: true,
        options: ['Enter # Hours', 'Yes, difficulty sleeping', 'No']
      }
    ]
  },
  {
    id: 'tracking',
    title: 'Tracking & Macro Preferences',
    description: 'Now let\'s talk about how you\'d like to handle macros going forward.',
    voicePrompt: 'Now let\'s talk about how you\'d like to handle macros going forward, building on your current or past tracking methods from earlier.',
    type: 'tracking',
    questions: [
      {
        id: 'macroControl',
        text: 'Would you like daily macro adjustments, or do you prefer manual control?',
        voicePrompt: 'Would you like daily macro adjustments, or do you prefer manual control?',
        type: 'select',
        required: true,
        options: ['Auto', 'Manual', 'Both']
      },
      {
        id: 'snackSuggestions',
        text: 'Would you like snack suggestions to help meet your macro targets?',
        voicePrompt: 'Would you like snack suggestions to help meet your macro targets?',
        type: 'select',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'primaryGoal',
        text: 'What is your primary goal?',
        voicePrompt: 'What is your primary goal—losing weight, gaining muscle, improving energy, better digestion, hormonal balance, or general health?',
        type: 'multiselect',
        required: true,
        options: ['Losing Weight', 'Gaining Muscle', 'Improving Energy', 'Better Digestion', 'Hormonal Balance', 'General Health']
      },
      {
        id: 'timeline',
        text: 'How quickly do you want to see results?',
        voicePrompt: 'How quickly do you want to see results?',
        type: 'select',
        required: true,
        options: ['ASAP', '1 Month', '3 Months', 'Long-Term']
      },
      {
        id: 'macroComfort',
        text: 'On a scale of 1 to 10, how comfortable are you with setting or adjusting macros?',
        voicePrompt: 'On a scale of 1 to 10, how comfortable are you with setting or adjusting macros?',
        type: 'number',
        required: true
      }
    ]
  },
  {
    id: 'final',
    title: 'Personalization & Final Details',
    description: 'Almost done! Let\'s finalize your preferences.',
    voicePrompt: 'Almost done! Let\'s finalize your preferences.',
    type: 'personalization',
    questions: [
      {
        id: 'mealPrep',
        text: 'Do you want help with meal prep strategies?',
        voicePrompt: 'Do you want help with meal prep strategies?',
        type: 'select',
        required: true,
        options: ['Yes', 'No', 'Maybe Later']
      },
      {
        id: 'additionalInfo',
        text: 'Any final details you\'d like to share?',
        voicePrompt: 'Any final details you\'d like to share?',
        type: 'text'
      },
      {
        id: 'preview',
        text: 'Shall we show you a quick preview of your personalized plan?',
        voicePrompt: 'Great! We\'ll create a personalized nutrition plan and sample meal suggestions. Shall we show you a quick preview?',
        type: 'select',
        required: true,
        options: ['Preview', 'Skip', 'Finish']
      }
    ]
  }
]; 