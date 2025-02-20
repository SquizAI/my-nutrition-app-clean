import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={index} style={{ textAlign: 'center', margin: '0 10px' }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#4CAF50' : isActive ? '#2196F3' : '#bbb',
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto'
              }}
            >
              {index + 1}
            </div>
            <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper; 