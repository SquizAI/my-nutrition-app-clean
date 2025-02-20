import { z } from 'zod';
import { InteractionEvent } from '../components/onboarding/types';

export interface AnalyticsEvent {
  category: 'onboarding' | 'interaction' | 'ai' | 'voice';
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface SectionAnalytics {
  sectionId: string;
  timeSpent: number;
  startTime: number;
  completionTime?: number;
  interactions: AnalyticsEvent[];
  aiInteractions: number;
  voiceInteractions: number;
  questionsAnswered: number;
  retries: number;
}

const analyticsQueue: AnalyticsEvent[] = [];
const sectionAnalytics: Record<string, SectionAnalytics> = {};

export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp'>) => {
  const fullEvent = {
    ...event,
    timestamp: Date.now()
  };
  
  analyticsQueue.push(fullEvent);
  processAnalyticsQueue();
};

export const startSectionTracking = (sectionId: string) => {
  sectionAnalytics[sectionId] = {
    sectionId,
    timeSpent: 0,
    startTime: Date.now(),
    interactions: [],
    aiInteractions: 0,
    voiceInteractions: 0,
    questionsAnswered: 0,
    retries: 0
  };
};

export const endSectionTracking = (sectionId: string) => {
  if (sectionAnalytics[sectionId]) {
    sectionAnalytics[sectionId].completionTime = Date.now();
    sectionAnalytics[sectionId].timeSpent = 
      sectionAnalytics[sectionId].completionTime - sectionAnalytics[sectionId].startTime;
    
    // Track completion event
    trackEvent({
      category: 'onboarding',
      action: 'section_complete',
      label: sectionId,
      metadata: {
        timeSpent: sectionAnalytics[sectionId].timeSpent,
        aiInteractions: sectionAnalytics[sectionId].aiInteractions,
        voiceInteractions: sectionAnalytics[sectionId].voiceInteractions,
        questionsAnswered: sectionAnalytics[sectionId].questionsAnswered
      }
    });
  }
};

export const trackInteraction = (
  sectionId: string, 
  type: InteractionEvent['type'],
  details?: Record<string, any>
) => {
  if (sectionAnalytics[sectionId]) {
    switch (type) {
      case 'ai':
        sectionAnalytics[sectionId].aiInteractions++;
        break;
      case 'voice':
        sectionAnalytics[sectionId].voiceInteractions++;
        break;
      case 'question':
      case 'form_input':
      case 'selection':
        sectionAnalytics[sectionId].questionsAnswered++;
        break;
      case 'retry':
        sectionAnalytics[sectionId].retries++;
        break;
    }

    sectionAnalytics[sectionId].interactions.push({
      category: 'interaction',
      action: type,
      label: sectionId,
      metadata: details,
      timestamp: Date.now()
    });
  }
};

const processAnalyticsQueue = async () => {
  if (analyticsQueue.length === 0) return;

  try {
    // In production, send to your analytics service
    // For now, just log to console
    console.log('Analytics events:', analyticsQueue);
    
    // Clear the queue after successful processing
    analyticsQueue.length = 0;
  } catch (error) {
    console.error('Failed to process analytics:', error);
  }
};

export const getAnalyticsSummary = (sectionId: string) => {
  return sectionAnalytics[sectionId];
};

export const getAllAnalytics = () => {
  return Object.values(sectionAnalytics);
}; 