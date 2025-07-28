import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  className = ''
}) => {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      dismiss: 'text-green-400 hover:text-green-600'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      dismiss: 'text-red-400 hover:text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      dismiss: 'text-yellow-400 hover:text-yellow-600'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      dismiss: 'text-blue-400 hover:text-blue-600'
    }
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = icons[type];
  const styles = alertStyles[type];

  return (
    <div className={`border rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.message}`}>
            {message}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${styles.dismiss} transition-colors`}
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 