import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import { useNavigate } from 'react-router-dom';
import { NameSection } from '../components/onboarding/sections/NameSection';
import toast from 'react-hot-toast';

const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.xl};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  background: ${theme.gradients.text.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileUpdate = (name: string) => {
    // Here you would typically update the user's profile in your backend
    // For now, we'll just show a success message
    toast.success('Profile updated successfully!');
    
    // Navigate to the lifestyle section or wherever you want
    navigate('/profile/lifestyle');
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Title>Your Profile</Title>
      <NameSection 
        onComplete={handleProfileUpdate}
        initialName="John Doe" // Replace with actual user data
      />
    </Container>
  );
};

export default Profile; 