import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import { ErrorDetails } from '@/components/ui/ErrorDetailsModal';

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleError = useCallback((
    error: any,
    userAction: string,
    showToastNotification: boolean = true
  ) => {
    // Create error details
    const errorDetails: ErrorDetails = {
      title: 'An error occurred',
      message: 'Something went wrong. Please try again.',
      technicalDetails: error?.message || error?.detail || JSON.stringify(error),
      timestamp: new Date().toISOString(),
      userAction,
      url: window.location.href,
    };

    // Show toast notification if requested
    if (showToastNotification) {
      showToast({
        type: 'error',
        title: errorDetails.title,
        message: errorDetails.message,
        duration: 8000, // Longer duration for errors
      });
    }

    // Store error details for modal
    setErrorDetails(errorDetails);
    setShowErrorModal(true);

    // Log to console for developers
    console.error('Error occurred:', {
      error,
      userAction,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }, [showToast]);

  const hideErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorDetails(null);
  }, []);

  return {
    handleError,
    errorDetails,
    showErrorModal,
    hideErrorModal,
  };
}; 