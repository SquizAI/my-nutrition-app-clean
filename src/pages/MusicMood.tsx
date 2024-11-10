import React, { useState } from 'react';
import { Music, Radio, Cloud, Headphones } from 'lucide-react';
import MoodSelector from '../components/music-mood/MoodSelector';
import MusicPlayer from '../components/music-mood/MusicPlayer';
import MoodMusicCorrelation from '../components/music-mood/MoodMusicCorrelation';
import MusicRecommendation from '../components/music-mood/MusicRecommendation';

const MusicServiceButton: React.FC<{ icon: React.ElementType; name: string; isActive: boolean; onClick: () => void }> = ({ icon: Icon, name, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2 rounded-md ${
      isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
  >
    <Icon size={24} className="mr-2" />
    {name}
  </button>
);

const MusicMood: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('Spotify');
  const [currentMood, setCurrentMood] = useState<string>('');

  const musicServices = [
    { icon: Music, name: 'Spotify' },
    { icon: Radio, name: 'Pandora' },
    { icon: Cloud, name: 'SoundCloud' },
    { icon: Headphones, name: 'Apple Music' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Music & Mood Tracker</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {musicServices.map((service) => (
          <MusicServiceButton
            key={service.name}
            icon={service.icon}
            name={service.name}
            isActive={selectedService === service.name}
            onClick={() => setSelectedService(service.name)}
          />
        ))}
      </div>
      
      <MoodSelector onMoodSelect={setCurrentMood} />
      <MusicPlayer service={selectedService} />
      <MoodMusicCorrelation />
      <MusicRecommendation currentMood={currentMood} />
    </div>
  );
};

export default MusicMood;