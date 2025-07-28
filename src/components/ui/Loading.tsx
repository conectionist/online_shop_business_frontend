import React from 'react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '0ms' }} />
      <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '150ms' }} />
      <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-blue-600 rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderVariant()}
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default Loading; 