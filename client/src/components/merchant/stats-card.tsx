import React from 'react';
import { ArrowUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-500 text-sm">{title}</h3>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <div style={{ color: iconColor }}>
            {icon}
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-sm flex items-center text-green-brand mt-1">
        <ArrowUp className="h-4 w-4 mr-1" />
        <span>{change}</span>
      </p>
    </div>
  );
};

export default StatsCard;
