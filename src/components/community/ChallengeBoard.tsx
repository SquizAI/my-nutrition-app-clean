import React, { useState } from 'react';
import { Award, Users, Calendar } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  participants: number;
  duration: string;
}

const ChallengeBoard: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: '30-Day Workout Streak', description: 'Exercise for at least 30 minutes every day for 30 days', participants: 1542, duration: '30 days' },
    { id: 2, title: 'Veggie Variety', description: 'Try a new vegetable every week for 8 weeks', participants: 876, duration: '8 weeks' },
    { id: 3, title: 'Hydration Nation', description: 'Drink 8 glasses of water daily for 21 days', participants: 2103, duration: '21 days' },
  ]);

  const [joinedChallenges, setJoinedChallenges] = useState<number[]>([]);

  const handleJoinChallenge = (challengeId: number) => {
    if (joinedChallenges.includes(challengeId)) {
      setJoinedChallenges(joinedChallenges.filter(id => id !== challengeId));
    } else {
      setJoinedChallenges([...joinedChallenges, challengeId]);
    }
    // TODO: Update backend when a user joins or leaves a challenge
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Challenge Board</h3>
      <div className="space-y-4">
        {challenges.map(challenge => (
          <div key={challenge.id} className="border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2 flex items-center">
              <Award className="mr-2 text-yellow-500" />
              {challenge.title}
            </h4>
            <p className="text-gray-600 mb-2">{challenge.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="mr-1" size={16} />
                  {challenge.participants} participants
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1" size={16} />
                  {challenge.duration}
                </span>
              </div>
              <button
                onClick={() => handleJoinChallenge(challenge.id)}
                className={`px-4 py-2 rounded-md ${
                  joinedChallenges.includes(challenge.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {joinedChallenges.includes(challenge.id) ? 'Joined' : 'Join Challenge'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeBoard;