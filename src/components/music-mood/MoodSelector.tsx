import React, { useState } from 'react';
import { Smile, Meh, Frown, Sun, Cloud, CloudRain, Wind } from 'lucide-react';

interface Mood {
  icon: React.ElementType;
  label: string;
  value: string;
}

const moods: Mood[] = [
  { icon: Smile, label: 'Happy', value: 'happy' },
  { icon: Meh, label: 'Neutral', value: 'neutral' },
  { icon: Frown, label: 'Sad', value: 'sad' },
  { icon: Sun, label: 'Energetic', value: 'energetic' },
  { icon: Cloud, label: 'Calm', value: 'calm' },
  { icon: CloudRain, label: 'Stressed', value: 'stressed' },
  { icon: Wind, label: 'Relaxed', value: 'relaxed' },
];

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">How are you feeling today?</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
              selectedMood === mood.value
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <mood.icon size={32} className="mb-2" />
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;