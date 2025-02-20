import React, { useState } from 'react';

interface LifestyleStepProps {
  onNext: (data: {
    groceryFrequency: string;
    favoritePlaces: string;
    locationPermissionGranted: boolean;
  }) => void;
}

const LifestyleStep: React.FC<LifestyleStepProps> = ({ onNext }) => {
  const [groceryFrequency, setGroceryFrequency] = useState('');
  const [favoritePlaces, setFavoritePlaces] = useState('');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocationPermissionGranted(true);
      }, () => {
        alert('Location access denied.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleNext = () => {
    onNext({ groceryFrequency, favoritePlaces, locationPermissionGranted });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Tell us about your lifestyle</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>
          How often do you go grocery shopping?{' '}
          <select
            value={groceryFrequency}
            onChange={(e) => setGroceryFrequency(e.target.value)}
            style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select</option>
            <option value="Weekly">Weekly</option>
            <option value="Biweekly">Biweekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Rarely">Rarely</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Favorite grocery stores or restaurants:{' '}
          <input
            type="text"
            value={favoritePlaces}
            onChange={(e) => setFavoritePlaces(e.target.value)}
            placeholder="e.g., Whole Foods, Trader Joe's"
            style={{ marginLeft: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleLocationRequest}
          style={{
            padding: '10px 20px',
            backgroundColor: locationPermissionGranted ? '#4CAF50' : '#2196F3',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {locationPermissionGranted ? 'Location Access Granted' : 'Grant Location Access'}
        </button>
      </div>
      <button
        onClick={handleNext}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Next
      </button>
    </div>
  );
};

export default LifestyleStep; 