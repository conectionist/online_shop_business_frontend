import React, { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { Button } from './Button';
import { useToast } from './ToastContainer';

export interface ErrorDetails {
  title: string;
  message: string;
  technicalDetails?: string;
  timestamp: string;
  userAction: string;
  url: string;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails;
}

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  isOpen,
  onClose,
  error
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const errorReport = `Error Report
================

Title: ${error.title}
Message: ${error.message}
Timestamp: ${error.timestamp}
User Action: ${error.userAction}
URL: ${error.url}
${error.technicalDetails ? `Technical Details: ${error.technicalDetails}` : ''}

Please include this information when reporting the issue.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorReport);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Copied!',
        message: 'Error report copied to clipboard',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = errorReport;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Copied!',
        message: 'Error report copied to clipboard',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Error Details"
      size="lg"
    >
      <div className="space-y-4">
        {/* Error Summary */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>

        {/* Technical Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Error Report for Developers</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {errorReport}
            </pre>
          </div>
        </div>

        {/* Copy Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Copy this information to send to the development team
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
            iconPosition="left"
          >
            {copied ? 'Copied!' : 'Copy Error Report'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorDetailsModal; 