import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const Button = styled.button`
  margin-right: 10px;
  padding: 8px 16px;
  font-size: 16px;
`;

interface HouseholdMember {
  id: number;
  name: string;
  age?: string;
  profileType: 'Macro-Focused' | 'Flexible';
  allergies: string;
  foodsToAvoid: string;
}

const HouseholdSetupLegal: React.FC = () => {
  const [step, setStep] = useState(0);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<HouseholdMember>>({});

  const legalText = "Legal Agreement: By using this App, you agree to our Terms, Privacy Policy, and Medical Disclaimer. Please review the details carefully.";
  
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleLegalAccept = () => {
    setStep(1);
  };

  const handleAddMember = () => {
    if (currentMember.name && currentMember.profileType) {
      const newMember: HouseholdMember = {
        id: Date.now(),
        name: currentMember.name,
        age: currentMember.age || '',
        profileType: currentMember.profileType,
        allergies: currentMember.allergies || '',
        foodsToAvoid: currentMember.foodsToAvoid || '',
      };
      setHouseholdMembers([...householdMembers, newMember]);
      setCurrentMember({});
    } else {
      alert('Please provide at least a name and profile type for the household member.');
    }
  };

  return (
    <Container>
      {step === 0 && (
        <Section>
          <h2>Legal Agreements</h2>
          <p>{legalText}</p>
          <Button onClick={() => speakText(legalText)}>Speak More Details</Button>
          <div style={{ marginTop: '10px' }}>
            <Button onClick={handleLegalAccept}>Accept</Button>
            <Button onClick={() => alert("You must accept the legal agreements to continue.")}>Decline</Button>
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section>
          <h2>Household Setup</h2>
          <p>Please enter the details for each household member:</p>
          <div style={{ marginBottom: '10px' }}>
            <label>Name: </label>
            <input
              type="text"
              value={currentMember.name || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Age (optional): </label>
            <input
              type="text"
              value={currentMember.age || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, age: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Profile Type: </label>
            <select
              value={currentMember.profileType || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, profileType: e.target.value as 'Macro-Focused' | 'Flexible' })}
            >
              <option value="">Select</option>
              <option value="Macro-Focused">Macro-Focused</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Allergies/Dietary Restrictions: </label>
            <input
              type="text"
              value={currentMember.allergies || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, allergies: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Foods to Avoid: </label>
            <input
              type="text"
              value={currentMember.foodsToAvoid || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, foodsToAvoid: e.target.value })}
            />
          </div>
          <Button onClick={handleAddMember}>Add Member</Button>
          <div style={{ marginTop: '20px' }}>
            <h3>Current Members:</h3>
            <ul>
              {householdMembers.map((member) => (
                <li key={member.id}>
                  {member.name} - {member.profileType} {member.age && `, Age: ${member.age}`}
                </li>
              ))}
            </ul>
          </div>
          <Button onClick={() => alert("Household Setup complete! Proceed to the next step.")}>Continue</Button>
        </Section>
      )}
    </Container>
  );
};

export default HouseholdSetupLegal; 