import React from 'react';
import { Star } from 'lucide-react';

const SuccessStories: React.FC = () => {
  const stories = [
    { name: 'John D.', achievement: 'Lost 30 lbs in 3 months' },
    { name: 'Sarah M.', achievement: 'Completed first marathon' },
    { name: 'Mike R.', achievement: 'Gained 10 lbs of muscle' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Star className="mr-2" /> Success Stories
      </h3>
      <div className="space-y-4">
        {stories.map((story, index) => (
          <div key={index} className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <Star className="text-yellow-500" size={20} />
            </div>
            <div>
              <h4 className="font-medium">{story.name}</h4>
              <p className="text-sm text-gray-600">{story.achievement}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuccessStories;