import React from 'react';
import { Camera, Zap, Utensils, Users } from 'lucide-react';

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, label, color }) => (
  <button className={`flex flex-col items-center justify-center p-4 ${color} rounded-xl transition-transform hover:scale-105`}>
    <Icon size={28} className="mb-2" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction icon={Camera} label="Log Meal" color="bg-purple-100 text-purple-600" />
        <QuickAction icon={Zap} label="Log Exercise" color="bg-green-100 text-green-600" />
        <QuickAction icon={Utensils} label="Meal Plan" color="bg-yellow-100 text-yellow-600" />
        <QuickAction icon={Users} label="Community" color="bg-blue-100 text-blue-600" />
      </div>
    </div>
  );
};

export default QuickActions;