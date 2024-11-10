import React from 'react';
import ChallengeBoard from '../components/community/ChallengeBoard';
import ForumDiscussions from '../components/community/ForumDiscussions';
import SuccessStories from '../components/community/SuccessStories';
import LiveEvents from '../components/community/LiveEvents';
import AIRecommendation from '../components/shared/AIRecommendation';

const Community: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Community</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChallengeBoard />
        <ForumDiscussions />
      </div>
      
      <SuccessStories />
      
      <LiveEvents />
      
      <AIRecommendation 
        title="Community Engagement"
        recommendation="Based on your goals, we think you'd enjoy the '30-Day Mindful Eating Challenge' starting next week. It aligns well with your current nutritional focus!"
      />
    </div>
  );
};

export default Community;