import React from 'react';
import { getDisplayVersion } from '@/utils/version';

interface VersionDisplayProps {
  className?: string;
  showEnvironment?: boolean;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  className = '', 
  showEnvironment = true 
}) => {
  const version = getDisplayVersion();
  
  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      {version}
    </div>
  );
};

export default VersionDisplay; 