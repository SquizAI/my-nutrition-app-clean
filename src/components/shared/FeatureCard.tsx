import React from 'react';
import { TrendingDown, Book, Globe, Users } from 'lucide-react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const iconMap = {
  TrendingDown,
  Book,
  Globe,
  Users,
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || TrendingDown;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center mb-4">
        <IconComponent size={24} className="text-indigo-500 mr-2" />
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;