import React, { useState } from 'react';

interface ImportDataStepProps {
  onNext: (data: { importMethod: string }) => void;
}

const ImportDataStep: React.FC<ImportDataStepProps> = ({ onNext }) => {
  const [importMethod, setImportMethod] = useState('');

  const handleNext = () => {
    onNext({ importMethod });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportMethod('CSV Upload');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Bring Your Data</h2>
      <p>
        Are you currently using any tools to track your food, exercise, or health metrics?
      </p>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setImportMethod('API Connection')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: importMethod === 'API Connection' ? '#2196F3' : '#e0e0e0',
            color: importMethod === 'API Connection' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          API Connection
        </button>
        <button onClick={() => setImportMethod('Direct Integration')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: importMethod === 'Direct Integration' ? '#2196F3' : '#e0e0e0',
            color: importMethod === 'Direct Integration' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          Direct Integration
        </button>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <p>Or, upload a CSV file:</p>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
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

export default ImportDataStep; 