import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '../services/userPreferences';
import { useAIAgents } from '../services/aiAgents';

const QuickLogContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const QuickLogButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(49, 229, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: rotate(45deg);
    transition: 0.3s;
  }

  &:hover::after {
    animation: shine 1s;
  }

  @keyframes shine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
`;

const QuickLogPanel = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 16px;
  padding: 20px;
  width: 300px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(49, 229, 255, 0.2);
`;

const QuickLogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
`;

const QuickLogItem = styled(motion.button)`
  padding: 12px;
  border-radius: 12px;
  background: rgba(49, 229, 255, 0.1);
  border: 1px solid rgba(49, 229, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.2);
    transform: translateY(-2px);
  }

  svg {
    font-size: 20px;
  }
`;

const QuickLogTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const QuickLogInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(49, 229, 255, 0.2);
  color: white;
  margin-bottom: 15px;
  font-size: 14px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

interface QuickLogProps {
  onLog: (data: any) => void;
}

const QuickLog: React.FC<QuickLogProps> = ({ onLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { quickLogPreferences } = useUserPreferences();
  const { learningAgent } = useAIAgents();

  const quickActions = [
    { id: 'meal', icon: '🍽️', label: 'Quick Meal' },
    { id: 'water', icon: '💧', label: 'Water' },
    { id: 'workout', icon: '💪', label: 'Workout' },
    { id: 'snack', icon: '🍎', label: 'Snack' },
    ...quickLogPreferences.customShortcuts.map(shortcut => ({
      id: shortcut.name,
      icon: '⭐',
      label: shortcut.name,
      action: shortcut.action
    }))
  ];

  const handleQuickLog = (actionId: string) => {
    const timestamp = new Date().toISOString();
    
    // Update learning agent with new behavior data
    learningAgent.updateBehavior({
      mealTimes: {
        [actionId]: [...learningAgent.behavior.mealTimes[actionId] || [], timestamp]
      }
    });

    onLog({
      type: actionId,
      timestamp,
      data: {} // Add relevant data based on action type
    });

    setIsOpen(false);
  };

  const panelVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <QuickLogContainer>
      <QuickLogButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        +
      </QuickLogButton>

      <AnimatePresence>
        {isOpen && (
          <QuickLogPanel
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
          >
            <QuickLogTitle>
              Quick Log
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ✕
              </motion.button>
            </QuickLogTitle>

            <QuickLogInput
              type="text"
              placeholder="Search quick actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <QuickLogGrid>
              {quickActions
                .filter(action => 
                  action.label.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(action => (
                  <QuickLogItem
                    key={action.id}
                    onClick={() => handleQuickLog(action.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </QuickLogItem>
                ))
              }
            </QuickLogGrid>
          </QuickLogPanel>
        )}
      </AnimatePresence>
    </QuickLogContainer>
  );
};

export default QuickLog; 