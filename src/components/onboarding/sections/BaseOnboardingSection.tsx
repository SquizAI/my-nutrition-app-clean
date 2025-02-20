import React, { useState, useCallback } from 'react';
import { useVoiceInteraction } from '../../../hooks/useVoiceInteraction';
import { FormLayout } from '../layout/FormLayout';
import { SelectionLayout } from '../layout/SelectionLayout';
import { VoiceLayout } from '../layout/VoiceLayout';
import { QuestionLayout } from '../layout/QuestionLayout';
import { 
  FormField, 
  Question, 
  FormQuestion, 
  SelectQuestion,
  InteractionEvent
} from '../types';
import { trackInteraction } from '../../../services/analyticsService';
import { getAIWritingSuggestions } from '../../../services/openaiService';
import toast from 'react-hot-toast';

// Type guards
function isFormQuestion(question: Question): question is FormQuestion {
  return question.type === 'form';
}

function isSelectQuestion(question: Question): question is SelectQuestion {
  return question.type === 'select' || question.type === 'multiSelect';
}

interface BaseOnboardingSectionProps<T extends Record<string, any>> {
  title: string;
  sectionId: string;
  questions: Question[];
  currentQuestion: number;
  responses: Partial<T>;
  onComplete: (responses: T) => void;
  onPrevious: () => void;
  initialResponses?: Partial<T>;
  customComponents?: {
    beforeQuestion?: React.ReactNode;
    afterQuestion?: React.ReactNode;
  };
}

export function BaseOnboardingSection<T extends Record<string, any>>({
  title,
  sectionId,
  questions,
  currentQuestion,
  responses,
  onComplete,
  onPrevious,
  initialResponses = {},
  customComponents
}: BaseOnboardingSectionProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(initialResponses);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const {
    isRecording,
    isProcessing,
    transcript,
    audioStream,
    startRecording,
    stopRecording,
    speak,
    hasPermission,
  } = useVoiceInteraction({
    onTranscriptionComplete: (text) => {
      handleVoiceResponse(text);
      toast.success('Response recorded successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleVoiceResponse = useCallback(async (text: string) => {
    const currentQ = questions[currentQuestion];
    
    try {
      // Get AI suggestions for improving the response
      const suggestions = await getAIWritingSuggestions(text, currentQ.text);
      
      if (suggestions.length > 0) {
        // Use the first suggestion as it's typically the best
        if (isFormQuestion(currentQ)) {
          setFormData(prev => ({
            ...prev,
            [currentQ.fields[0].id]: suggestions[0]
          }));
        } else if (isSelectQuestion(currentQ)) {
          // Try to match the response with an option
          const matchedOption = currentQ.options.find(opt => 
            suggestions[0].toLowerCase().includes(opt.label.toLowerCase())
          );
          if (matchedOption) {
            handleSelectionChange(matchedOption.value);
          }
        }
      }

      const event: InteractionEvent = {
        type: 'voice',
        data: { text, suggestions },
        timestamp: Date.now()
      };
      trackInteraction(sectionId, event.type, event.data);
    } catch (error) {
      console.error('Error processing voice response:', error);
      toast.error('Failed to process voice response');
    }
  }, [currentQuestion, questions, sectionId]);

  const handleFormChange = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    const currentQ = questions[currentQuestion];
    if (isFormQuestion(currentQ)) {
      const field = currentQ.fields.find(f => f.id === fieldId);
      if (field?.validation) {
        const validationResult = field.validation(value);
        if (validationResult !== true) {
          setFormErrors(prev => ({
            ...prev,
            [fieldId]: validationResult
          }));
        } else {
          setFormErrors(prev => {
            const { [fieldId]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    }

    const event: InteractionEvent = {
      type: 'form_input',
      data: { fieldId, value },
      timestamp: Date.now()
    };
    trackInteraction(sectionId, 'question', event.data);
  }, [currentQuestion, questions, sectionId]);

  const handleSelectionChange = useCallback((value: string) => {
    const currentQ = questions[currentQuestion];
    if (isSelectQuestion(currentQ)) {
      if (currentQ.type === 'multiSelect') {
        setSelectedValues(prev => {
          const newValues = prev.includes(value) 
            ? prev.filter(v => v !== value)
            : [...prev, value];
          
          setFormData(prev => ({
            ...prev,
            [currentQ.id]: newValues
          }));
          
          return newValues;
        });
      } else {
        setSelectedValues([value]);
        setFormData(prev => ({
          ...prev,
          [currentQ.id]: value
        }));
      }
    }

    const event: InteractionEvent = {
      type: 'selection',
      data: { value },
      timestamp: Date.now()
    };
    trackInteraction(sectionId, 'question', event.data);
  }, [currentQuestion, questions, sectionId]);

  const handleNext = useCallback(() => {
    const currentQ = questions[currentQuestion];
    
    if (isFormQuestion(currentQ)) {
      // Validate all required fields
      let hasErrors = false;
      const newErrors: Record<string, string> = {};

      currentQ.fields.forEach(field => {
        if (field.required && !formData[field.id]) {
          hasErrors = true;
          newErrors[field.id] = `${field.label} is required`;
        } else if (field.validation && formData[field.id]) {
          const validationResult = field.validation(String(formData[field.id]));
          if (validationResult !== true) {
            hasErrors = true;
            newErrors[field.id] = validationResult;
          }
        }
      });

      if (hasErrors) {
        setFormErrors(newErrors);
        return;
      }
    }

    onComplete(formData as T);
  }, [currentQuestion, questions, formData, onComplete]);

  const currentQ = questions[currentQuestion];

  return (
    <QuestionLayout
      title={title}
      description={currentQ.description}
      onNext={handleNext}
      onPrevious={onPrevious}
      nextButtonDisabled={isProcessing}
      nextButtonText="Continue"
    >
      {customComponents?.beforeQuestion}

      {isFormQuestion(currentQ) && (
        <FormLayout
          fields={currentQ.fields}
          values={formData}
          errors={formErrors}
          onChange={handleFormChange}
        />
      )}

      {isSelectQuestion(currentQ) && (
        <SelectionLayout
          options={currentQ.options.map(opt => ({
            ...opt,
            icon: opt.icon,
            description: opt.description || opt.label
          }))}
          selectedValues={selectedValues}
          onChange={handleSelectionChange}
          multiSelect={currentQ.type === 'multiSelect'}
        />
      )}

      <VoiceLayout
        isRecording={isRecording}
        isProcessing={isProcessing}
        transcript={transcript}
        audioStream={audioStream}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onInfoClick={() => speak(currentQ.voicePrompt)}
        infoText={currentQ.voicePrompt}
      />

      {customComponents?.afterQuestion}
    </QuestionLayout>
  );
} 