import React from 'react';
import { Ruler } from 'lucide-react';

const BodyMeasurements: React.FC = () => {
  const measurements = [
    { name: 'Weight', value: '70 kg' },
    { name: 'Body Fat', value: '18%' },
    { name: 'Muscle Mass', value: '32%' },
    { name: 'Waist', value: '80 cm' },
    { name: 'Chest', value: '95 cm' },
    { name: 'Hips', value: '90 cm' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Ruler className="mr-2" /> Body Measurements
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {measurements.map((measurement) => (
          <div key={measurement.name} className="flex justify-between">
            <span className="text-gray-600">{measurement.name}</span>
            <span className="font-semibold">{measurement.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodyMeasurements;