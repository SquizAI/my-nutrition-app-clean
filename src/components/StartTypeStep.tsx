import React, { useState } from 'react';

interface StartTypeStepProps {
  onFinish: (data: { startType: string }) => void;
}

const StartTypeStep: React.FC<StartTypeStepProps> = ({ onFinish }) => {
  const [startType, setStartType] = useState('');

  const handleFinish = () => {
    if (!startType) {
      alert('Please select an option to continue.');
      return;
    }
    onFinish({ startType });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Setup Preferences</h2>
      <p>Would you prefer a Quick Start for a basic setup, or a Deep Dive for a more detailed onboarding?</p>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setStartType('Quick Start')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: startType === 'Quick Start' ? '#2196F3' : '#e0e0e0',
            color: startType === 'Quick Start' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Quick Start
        </button>
        <button onClick={() => setStartType('Deep Dive')}
          style={{
            padding: '10px 20px',
            backgroundColor: startType === 'Deep Dive' ? '#2196F3' : '#e0e0e0',
            color: startType === 'Deep Dive' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Deep Dive
        </button>
      </div>
      <button onClick={handleFinish}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer'
        }}>
        Finish
      </button>
    </div>
  );
};

export default StartTypeStep; 