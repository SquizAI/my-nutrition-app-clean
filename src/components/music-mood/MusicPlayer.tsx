import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface MusicPlayerProps {
  service: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ service }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Now Playing on {service}</h3>
      <div className="flex items-center justify-between">
        <button className="p-2 rounded-full bg-gray-200"><SkipBack size={20} /></button>
        <button className="p-4 rounded-full bg-indigo-600 text-white"><Play size={24} /></button>
        <button className="p-2 rounded-full bg-gray-200"><SkipForward size={20} /></button>
      </div>
    </div>
  );
};

export default MusicPlayer;