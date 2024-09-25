// src/components/ManagementCard.tsx
import React from "react";

interface ManagementCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-gradient-to-br from-primary-700 to-primary-600 rounded-lg p-6 shadow-lg ${className}`}>
      <h2 className="text-2xl font-semibold mb-4 text-white">{title}</h2>
      {children}
    </div>
  );
};

export default ManagementCard;
