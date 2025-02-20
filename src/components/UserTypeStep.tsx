import React, { useState } from 'react';

interface UserTypeStepProps {
  onNext: (data: { userType: string; name: string }) => void;
}

const UserTypeStep: React.FC<UserTypeStepProps> = ({ onNext }) => {
  const [userType, setUserType] = useState('');
  const [name, setName] = useState('');

  const handleNext = () => {
    if (!userType) {
      alert('Please select a user type to continue.');
      return;
    }
    onNext({ userType, name });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to JME AI Onboarding!</h1>
      <p>To get started, could you please tell us which service best describes you?</p>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setUserType('Personal Tracker')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: userType === 'Personal Tracker' ? '#2196F3' : '#e0e0e0',
            color: userType === 'Personal Tracker' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Personal Tracker
        </button>
        <button onClick={() => setUserType('Professional/Clinician')}
          style={{
            padding: '10px 20px',
            backgroundColor: userType === 'Professional/Clinician' ? '#2196F3' : '#e0e0e0',
            color: userType === 'Professional/Clinician' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Professional/Clinician
        </button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Your Name (optional):{' '}
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name" 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </label>
      </div>
      <button onClick={handleNext} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer'
        }}>
        Next
      </button>
    </div>
  );
};

export default UserTypeStep; 