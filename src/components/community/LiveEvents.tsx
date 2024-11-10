import React from 'react';
import { Calendar } from 'lucide-react';

const LiveEvents: React.FC = () => {
  const events = [
    { name: 'Group Yoga Session', date: '2023-06-15', time: '18:00' },
    { name: 'Nutrition Q&A', date: '2023-06-18', time: '19:30' },
    { name: 'HIIT Workout Class', date: '2023-06-20', time: '07:00' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar className="mr-2" /> Upcoming Live Events
      </h3>
      <ul className="space-y-4">
        {events.map((event, index) => (
          <li key={index} className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{event.name}</h4>
              <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
            </div>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveEvents;