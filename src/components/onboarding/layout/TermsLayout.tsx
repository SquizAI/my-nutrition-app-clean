import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../../styles/theme';
import { 
  FaFileAlt, 
  FaCheck, 
  FaTimes, 
  FaDownload, 
  FaPrint,
  FaChevronRight,
  FaShieldAlt,
  FaMedkit,
  FaScroll,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaCheckDouble
} from 'react-icons/fa';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSizes.xxl};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.lg};
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.large};
  backdrop-filter: blur(10px);
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${props => props.$completed ? 
    theme.colors.success : 
    props.$active ? 
      theme.colors.primary : 
      theme.colors.text.secondary
  };
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -50px;
    top: 50%;
    width: 40px;
    height: 2px;
    background: ${props => props.$completed ?
      theme.colors.success :
      theme.colors.border.default
    };
  }
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$completed ?
    '#31E5FF' : // Cyan
    props.$active ?
      '#9747FF' : // Purple
      'transparent'
  };
  border: 2px solid ${props => props.$completed ?
    '#31E5FF' : // Cyan
    props.$active ?
      '#9747FF' : // Purple
      'rgba(255, 255, 255, 0.2)'
  };
  color: ${props => props.$completed || props.$active ?
    '#000000' :
    '#FFFFFF'
  };
  font-weight: ${theme.typography.fontWeights.bold};
`;

const StepLabel = styled.span`
  font-size: ${theme.typography.fontSizes.md};
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

const DocumentCard = styled(motion.button)<{ $active?: boolean; $accepted?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.xl};
  background: ${props => props.$active ? 
    'rgba(49, 229, 255, 0.1)' : 
    'rgba(0, 0, 0, 0.3)'
  };
  border: 2px solid ${props => props.$accepted ?
    theme.colors.success :
    props.$active ? 
      theme.colors.primary : 
      'transparent'
  };
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
  cursor: pointer;
  text-align: center;
  min-height: 250px;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$accepted ?
      'linear-gradient(135deg, rgba(107, 255, 142, 0.1) 0%, transparent 100%)' :
      'linear-gradient(135deg, rgba(49, 229, 255, 0.1) 0%, transparent 100%)'
    };
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const IconWrapper = styled(motion.div)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.lg};

  svg {
    font-size: 30px;
    color: ${theme.colors.primary};
  }
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const CardSubtitle = styled.p`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
`;

const StatusBadge = styled(motion.div)<{ $accepted: boolean }>`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => props.$accepted ?
    'rgba(107, 255, 142, 0.2)' :
    'rgba(255, 77, 77, 0.2)'
  };
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${props => props.$accepted ?
    theme.colors.success :
    theme.colors.error
  };
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const DocumentViewer = styled(motion.div)`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${theme.spacing.xl};
  min-height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.large};
  backdrop-filter: blur(10px);
  overflow: hidden;
  border: 1px solid ${theme.colors.border.default};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SidebarItem = styled.button<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${props => props.$active ?
    'rgba(49, 229, 255, 0.1)' :
    'transparent'
  };
  border: 1px solid ${props => props.$completed ?
    theme.colors.success :
    props.$active ?
      theme.colors.primary :
      'transparent'
  };
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(49, 229, 255, 0.05);
  }

  svg {
    color: ${props => props.$completed ?
      theme.colors.success :
      props.$active ?
        theme.colors.primary :
        theme.colors.text.secondary
    };
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 600px;
`;

const ViewerHeader = styled.div`
  padding: ${theme.spacing.lg};
  background: rgba(49, 229, 255, 0.05);
  border-bottom: 1px solid rgba(49, 229, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReadingProgress = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #31E5FF 0%, #9747FF 100%);
  transform-origin: 0%;
`;

const ViewerContent = styled.div`
  flex: 1;
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  font-size: ${theme.typography.fontSizes.md};
  line-height: 1.8;
  position: relative;

  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  pre {
    white-space: pre-wrap;
    font-family: inherit;
  }
`;

const ViewerActions = styled.div`
  padding: ${theme.spacing.xl};
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid ${theme.colors.border.default};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xl};
`;

const AcceptanceStatus = styled.div<{ $accepted: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.$accepted ?
    'rgba(49, 229, 255, 0.15)' : // Cyan with transparency
    'rgba(151, 71, 255, 0.15)' // Purple with transparency
  };
  border: 1px solid ${props => props.$accepted ?
    '#31E5FF' : // Cyan
    '#9747FF' // Purple
  };
  border-radius: ${theme.borderRadius.medium};
  color: ${props => props.$accepted ?
    '#31E5FF' : // Cyan
    '#FFFFFF'
  };
  font-weight: ${theme.typography.fontWeights.medium};
  min-width: 180px;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  min-width: 160px;
  background: ${props => {
    switch (props.$variant) {
      case 'primary':
        return '#31E5FF'; // Cyan
      case 'secondary':
        return '#9747FF'; // Purple
      case 'outline':
        return 'transparent';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.$variant) {
      case 'primary':
        return '#31E5FF'; // Cyan
      case 'secondary':
        return '#9747FF'; // Purple
      case 'outline':
        return 'rgba(255, 255, 255, 0.2)';
      default:
        return 'transparent';
    }
  }};
  border-radius: ${theme.borderRadius.medium};
  color: ${props => props.$variant === 'outline' ? '#FFFFFF' : '#000000'};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-shadow: none;
  box-shadow: ${props => props.$variant !== 'outline' ? '0 2px 10px rgba(49, 229, 255, 0.3)' : 'none'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.$variant !== 'outline' ? '0 4px 20px rgba(49, 229, 255, 0.4)' : 'none'};
    background: ${props => {
      switch (props.$variant) {
        case 'primary':
          return '#4DEBFF'; // Lighter cyan
        case 'secondary':
          return '#A75FFF'; // Lighter purple
        case 'outline':
          return 'rgba(49, 229, 255, 0.1)';
        default:
          return 'rgba(255, 255, 255, 0.15)';
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    font-size: 18px;
  }
`;

const ContinueContainer = styled(motion.div)`
  position: fixed;
  bottom: ${theme.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  z-index: 1000;
`;

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  min-width: 200px;
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  border: none;
  border-radius: ${theme.borderRadius.large};
  color: #000000;
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.bold};
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(49, 229, 255, 0.4);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(49, 229, 255, 0.6);
  }

  svg {
    font-size: 24px;
  }
`;

const CompletionMessage = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: rgba(0, 0, 0, 0.8);
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  backdrop-filter: blur(10px);
  text-align: center;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

interface Document {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FaFileAlt;
  content: string;
}

interface TermsLayoutProps {
  documents: Document[];
  activeDocument: string | null;
  acceptedDocuments: string[];
  onDocumentSelect: (id: string) => void;
  onAccept: (id: string) => void;
  onDownload: (id: string) => void;
  onPrint: (id: string) => void;
  onContinue: () => void;
}

export const TermsLayout: React.FC<TermsLayoutProps> = ({
  documents,
  activeDocument,
  acceptedDocuments,
  onDocumentSelect,
  onAccept,
  onDownload,
  onPrint,
  onContinue,
}) => {
  const activeDoc = documents.find(doc => doc.id === activeDocument);
  const activeIndex = documents.findIndex(doc => doc.id === activeDocument);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
    setScrollProgress(progress);
    
    const isAtBottom = Math.abs(progress - 1) < 0.05;
    if (isAtBottom && !hasReachedBottom) {
      setHasReachedBottom(true);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const allDocumentsAccepted = documents.every(doc => 
    acceptedDocuments.includes(doc.id)
  );

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Header>
        <Title>Legal Documents Review</Title>
        <Subtitle>Please review and accept each document to continue</Subtitle>
      </Header>

      <StepsContainer>
        {documents.map((doc, index) => (
          <Step 
            key={doc.id}
            $active={doc.id === activeDocument}
            $completed={acceptedDocuments.includes(doc.id)}
          >
            <StepNumber
              $active={doc.id === activeDocument}
              $completed={acceptedDocuments.includes(doc.id)}
            >
              {acceptedDocuments.includes(doc.id) ? <FaCheckCircle /> : index + 1}
            </StepNumber>
            <StepLabel>{doc.title}</StepLabel>
          </Step>
        ))}
      </StepsContainer>

      <DocumentViewer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Sidebar>
          {documents.map(doc => (
            <SidebarItem
              key={doc.id}
              $active={doc.id === activeDocument}
              $completed={acceptedDocuments.includes(doc.id)}
              onClick={() => onDocumentSelect(doc.id)}
            >
              {acceptedDocuments.includes(doc.id) ? (
                <FaCheckCircle />
              ) : doc.id === activeDocument ? (
                <FaEye />
              ) : (
                <FaEyeSlash />
              )}
              <div>
                <div>{doc.title}</div>
                <small style={{ color: theme.colors.text.secondary }}>
                  {acceptedDocuments.includes(doc.id) ? 
                    'Completed' : 
                    `${getReadingTime(doc.content)} min read`
                  }
                </small>
              </div>
            </SidebarItem>
          ))}
        </Sidebar>

        <MainContent>
          {activeDoc ? (
            <>
              <ViewerHeader>
                <div>
                  <h2>{activeDoc.title}</h2>
                  <small style={{ color: theme.colors.text.secondary }}>
                    {getReadingTime(activeDoc.content)} minute read
                  </small>
                </div>
                <ReadingProgress>
                  <span>{Math.round(scrollProgress * 100)}% read</span>
                  <ProgressBar>
                    <ProgressFill 
                      style={{ scaleX: scrollProgress }}
                      transition={{ type: "spring", stiffness: 100 }}
                    />
                  </ProgressBar>
                </ReadingProgress>
              </ViewerHeader>

              <ViewerContent
                ref={contentRef}
                onScroll={handleScroll}
              >
                <pre>{activeDoc.content}</pre>
              </ViewerContent>

              <ViewerActions>
                <ActionButtons>
                  <Button $variant="outline" onClick={() => onDownload(activeDoc.id)}>
                    <FaDownload /> Download PDF
                  </Button>
                  <Button $variant="outline" onClick={() => onPrint(activeDoc.id)}>
                    <FaPrint /> Print
                  </Button>
                </ActionButtons>

                <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                  <AcceptanceStatus $accepted={acceptedDocuments.includes(activeDoc.id)}>
                    {acceptedDocuments.includes(activeDoc.id) ? (
                      <><FaCheckCircle /> Document Accepted</>
                    ) : hasReachedBottom ? (
                      <><FaUnlock /> Ready to Accept</>
                    ) : (
                      <><FaLock /> Please Read to Accept</>
                    )}
                  </AcceptanceStatus>

                  <Button
                    $variant={hasReachedBottom ? "primary" : "outline"}
                    onClick={() => onAccept(activeDoc.id)}
                    disabled={!hasReachedBottom || acceptedDocuments.includes(activeDoc.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {acceptedDocuments.includes(activeDoc.id) ? (
                      <><FaCheckCircle /> Accepted</>
                    ) : hasReachedBottom ? (
                      <><FaCheck /> Accept Document</>
                    ) : (
                      <><FaLock /> Read to Accept</>
                    )}
                  </Button>
                </div>
              </ViewerActions>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: theme.colors.text.secondary 
            }}>
              <div style={{ textAlign: 'center' }}>
                <FaFileAlt style={{ fontSize: '48px', marginBottom: theme.spacing.md }} />
                <h3>Select a document to review</h3>
                <p>Click on any document from the sidebar to begin</p>
              </div>
            </div>
          )}
        </MainContent>
      </DocumentViewer>

      <AnimatePresence>
        {allDocumentsAccepted && (
          <ContinueContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <CompletionMessage>
              <FaCheckDouble /> All documents have been reviewed and accepted
            </CompletionMessage>
            <ContinueButton
              onClick={onContinue}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Next Step <FaArrowRight />
            </ContinueButton>
          </ContinueContainer>
        )}
      </AnimatePresence>
    </Container>
  );
}; 