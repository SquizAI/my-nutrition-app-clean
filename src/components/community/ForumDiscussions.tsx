import React from 'react';
import { MessageSquare } from 'lucide-react';

const ForumDiscussions: React.FC = () => {
  const discussions = [
    { title: 'Best pre-workout meals', replies: 23, views: 156 },
    { title: 'How to stay motivated', replies: 45, views: 302 },
    { title: 'Balancing macros for weight loss', replies: 18, views: 127 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MessageSquare className="mr-2" /> Forum Discussions
      </h3>
      <ul className="space-y-4">
        {discussions.map((discussion, index) => (
          <li key={index} className="border-b pb-2">
            <h4 className="font-medium">{discussion.title}</h4>
            <div className="text-sm text-gray-600">
              {discussion.replies} replies · {discussion.views} views
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ForumDiscussions;