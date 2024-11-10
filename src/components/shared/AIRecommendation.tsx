import React, { useState } from 'react';
import { Brain, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';

interface AIRecommendationProps {
  title: string;
  recommendation: string;
  explanation?: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ title, recommendation, explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    // TODO: Send feedback to backend
    console.log(`User ${type}d the recommendation`);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Brain className="mr-2" size={24} />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="mb-4">{recommendation}</p>
      {explanation && (
        <>
          <button
            className="flex items-center text-sm mb-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide explanation' : 'Show explanation'}
            {isExpanded ? <ChevronUp className="ml-1" size={16} /> : <ChevronDown className="ml-1" size={16} />}
          </button>
          {isExpanded && <p className="text-sm mb-4">{explanation}</p>}
        </>
      )}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            className={`p-2 rounded-full ${feedback === 'like' ? 'bg-green-500' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
            onClick={() => handleFeedback('like')}
          >
            <ThumbsUp size={16} />
          </button>
          <button
            className={`p-2 rounded-full ${feedback === 'dislike' ? 'bg-red-500' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
            onClick={() => handleFeedback('dislike')}
          >
            <ThumbsDown size={16} />
          </button>
        </div>
        <span className="text-sm">Was this recommendation helpful?</span>
      </div>
    </div>
  );
};

export default AIRecommendation;