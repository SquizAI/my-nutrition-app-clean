import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat } from './Chat';
import { useChatStore } from '../../services/chatService';

const QuickChatButton = styled(motion.button)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => `0 8px 20px rgba(49, 229, 255, 0.4)`};
  }
`;

const ChatModal = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  width: 400px;
  height: 600px;
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.card};
  z-index: ${({ theme }) => theme.zIndex.modal};
  overflow: hidden;
  transform-origin: bottom right;
`;

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export const QuickChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, addMessage } = useChatStore();

  const handleSendMessage = async (message: string, audioBlob?: Blob) => {
    await addMessage(message, audioBlob ? 'voice' : 'user', audioBlob);
  };

  return (
    <>
      <QuickChatButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? '✕' : '💬'}
      </QuickChatButton>

      <AnimatePresence>
        {isOpen && (
          <ChatModal
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask me anything..."
            />
          </ChatModal>
        )}
      </AnimatePresence>
    </>
  );
}; 