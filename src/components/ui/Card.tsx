import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const borderClass = border ? 'border border-gray-200' : '';

  return (
    <div 
      className={`
        bg-white rounded-lg
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${borderClass}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

export default Card; 