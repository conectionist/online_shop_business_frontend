import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/ToastContainer';
import { ErrorDetails } from '@/components/ui/ErrorDetailsModal';
import { handleApiError } from '@/services/api';

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleError = useCallback((
    error: any,
    userAction: string,
    showToastNotification: boolean = true
  ) => {
    // Process error through API error handler to get user-friendly message
    const apiError = handleApiError(error);
    
    // Check if this is a "friendly" error that doesn't need the scary modal
    const isFriendlyError = error?.response?.status === 409; // Conflict (duplicate name)
    
    // Create error details
    const errorDetails: ErrorDetails = {
      title: 'An error occurred',
      message: typeof apiError.detail === 'string' ? apiError.detail : 'Something went wrong. Please try again.',
      technicalDetails: error?.message || error?.detail || JSON.stringify(error),
      timestamp: new Date().toISOString(),
      userAction,
      url: window.location.href,
    };

    // Show toast notification if requested (but not for friendly errors)
    if (showToastNotification && !isFriendlyError) {
      showToast({
        type: 'error',
        title: errorDetails.title,
        message: errorDetails.message,
        duration: 8000, // Longer duration for errors
      });
    }

    // Only show the scary modal for non-friendly errors
    if (!isFriendlyError) {
      setErrorDetails(errorDetails);
      setShowErrorModal(true);
    }

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