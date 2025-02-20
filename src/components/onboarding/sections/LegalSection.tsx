import React, { useState } from 'react';
import { BaseOnboardingSection } from './BaseOnboardingSection';
import { z } from 'zod';
import { 
  FaFileContract, 
  FaUserShield, 
  FaHandshake, 
  FaClipboardCheck,
  FaInfoCircle,
  FaFileAlt,
  FaEye,
  FaDownload,
  FaPrint,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { theme } from '../../../styles/theme';
import { LEGAL_DOCUMENTS } from '../../../data/legalDocuments';
import { toast } from 'react-hot-toast';
import { TermsLayout } from '../layout/TermsLayout';

export interface LegalResponses {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  medicalDisclaimerAccepted: boolean;
  completedAt?: string;
  termsRead?: boolean;
  privacyRead?: boolean;
  medicalRead?: boolean;
}

export interface LegalSectionProps {
  onComplete: (responses: LegalResponses) => void;
  onPrevious?: () => void;
  onContinue: () => void;
  initialResponses?: Partial<LegalResponses>;
}

const documents = [
  {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Review our terms and conditions',
    icon: FaFileContract,
    content: LEGAL_DOCUMENTS.terms
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Learn how we protect your data',
    icon: FaUserShield,
    content: LEGAL_DOCUMENTS.privacy
  },
  {
    id: 'medical',
    title: 'Medical Disclaimer',
    subtitle: 'Important health information',
    icon: FaClipboardCheck,
    content: LEGAL_DOCUMENTS.medical
  }
];

export const LegalSection: React.FC<LegalSectionProps> = ({
  onComplete,
  onPrevious,
  onContinue,
  initialResponses = {}
}) => {
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);
  const [responses, setResponses] = useState<Partial<LegalResponses>>(initialResponses);

  const handleDocumentView = (documentType: string) => {
    setCurrentDocument(documentType);
    const readKey = `${documentType}Read` as keyof LegalResponses;
    setResponses(prev => ({
      ...prev,
      [readKey]: true
    }));
  };

  const handleAcceptance = (documentType: string) => {
    const readKey = `${documentType}Read` as keyof LegalResponses;
    const acceptKey = `${documentType}Accepted` as keyof LegalResponses;
    
    if (!responses[readKey]) {
      toast.error('Please read the document before accepting');
      return;
    }
    
    setResponses(prev => ({
      ...prev,
      [acceptKey]: true
    }));

    // Check if all documents are accepted
    const updatedResponses = {
      ...responses,
      [acceptKey]: true
    };

    if (
      updatedResponses.termsAccepted &&
      updatedResponses.privacyAccepted &&
      updatedResponses.medicalDisclaimerAccepted
    ) {
      onComplete(updatedResponses as LegalResponses);
    }
  };

  const handleDownload = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;

    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <TermsLayout
      documents={documents}
      activeDocument={currentDocument}
      acceptedDocuments={
        Object.entries(responses)
          .filter(([key, value]) => key.endsWith('Accepted') && value)
          .map(([key]) => key.replace('Accepted', ''))
      }
      onDocumentSelect={handleDocumentView}
      onAccept={handleAcceptance}
      onDownload={handleDownload}
      onPrint={handlePrint}
      onContinue={onContinue}
    />
  );
}; 