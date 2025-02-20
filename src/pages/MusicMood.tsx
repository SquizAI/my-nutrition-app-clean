import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Music, Radio, Cloud, Headphones } from 'lucide-react';
import MoodSelector from '../components/music-mood/MoodSelector';
import MusicPlayer from '../components/music-mood/MusicPlayer';
import MoodMusicCorrelation from '../components/music-mood/MoodMusicCorrelation';
import MusicRecommendation from '../components/music-mood/MusicRecommendation';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  background: ${({ theme }) => theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

interface ServiceButtonProps {
  isActive: boolean;
}

const ServiceButton = styled(motion.button)<ServiceButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme, isActive }) => 
    isActive ? theme.gradients.primary : theme.colors.background.card};
  border: 1px solid ${({ theme, isActive }) => 
    isActive ? 'transparent' : theme.colors.border.default};
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, isActive }) => 
      isActive ? theme.gradients.primary : theme.colors.button.hover};
    border-color: ${({ theme, isActive }) => 
      isActive ? 'transparent' : theme.colors.border.hover};
  }
`;

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
    <Container>
      <Title>Music & Mood Tracker</Title>
      
      <ServiceGrid>
        {musicServices.map((service) => {
          const Icon = service.icon;
          return (
            <ServiceButton
              key={service.name}
              isActive={selectedService === service.name}
              onClick={() => setSelectedService(service.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={24} />
              {service.name}
            </ServiceButton>
          );
        })}
      </ServiceGrid>
      
      <MoodSelector onMoodSelect={setCurrentMood} />
      <MusicPlayer service={selectedService} />
      <MoodMusicCorrelation />
      <MusicRecommendation currentMood={currentMood} />
    </Container>
  );
};

export default MusicMood;