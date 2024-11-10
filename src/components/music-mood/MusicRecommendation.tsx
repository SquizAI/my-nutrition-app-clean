import React from 'react';
import { Music } from 'lucide-react';

interface MusicRecommendationProps {
  currentMood: string;
}

const MusicRecommendation: React.FC<MusicRecommendationProps> = ({ currentMood }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Recommended for {currentMood} Mood</h3>
      <ul className="space-y-2">
        <li className="flex items-center">
          <Music size={20} className="mr-2 text-indigo-600" />
          <span>Song 1 - Artist 1</span>
        </li>
        <li className="flex items-center">
          <Music size={20} className="mr-2 text-indigo-600" />
          <span>Song 2 - Artist 2</span>
        </li>
        <li className="flex items-center">
          <Music size={20} className="mr-2 text-indigo-600" />
          <span>Song 3 - Artist 3</span>
        </li>
      </ul>
    </div>
  );
};

export default MusicRecommendation;