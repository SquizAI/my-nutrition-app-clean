import React, { useState } from 'react';

interface BackgroundStepProps {
  onNext: (data: {
    dietaryPreferences: string;
    favoriteFoods: string;
    cookingSkill: string;
    healthHistory: string;
  }) => void;
}

const BackgroundStep: React.FC<BackgroundStepProps> = ({ onNext }) => {
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [favoriteFoods, setFavoriteFoods] = useState('');
  const [cookingSkill, setCookingSkill] = useState('');
  const [healthHistory, setHealthHistory] = useState('');

  const handleNext = () => {
    onNext({ dietaryPreferences, favoriteFoods, cookingSkill, healthHistory });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Tell us a bit about yourself</h2>
      <p>You can skip any of these questions and update them later if you prefer.</p>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Dietary Restrictions/Preferences:
          <input 
            type="text" 
            value={dietaryPreferences}
            onChange={(e) => setDietaryPreferences(e.target.value)}
            placeholder="e.g., Vegetarian, Gluten-Free"
            style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Favorite Foods:
          <input 
            type="text" 
            value={favoriteFoods}
            onChange={(e) => setFavoriteFoods(e.target.value)}
            placeholder="e.g., Pasta, Salad"
            style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Cooking Skills:
          <select 
            value={cookingSkill} 
            onChange={(e) => setCookingSkill(e.target.value)}
            style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px' }}
          >
            <option value="">Select</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Health History:
          <textarea 
            value={healthHistory} 
            onChange={(e) => setHealthHistory(e.target.value)}
            placeholder="Any relevant health history"
            style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', verticalAlign: 'top' }}
          />
        </label>
      </div>
      <div>
        <button onClick={handleNext} 
          style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#4CAF50', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          Next
        </button>
        <button onClick={handleNext} 
          style={{ padding: '10px 20px', backgroundColor: '#9E9E9E', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </div>
  );
};

export default BackgroundStep; 