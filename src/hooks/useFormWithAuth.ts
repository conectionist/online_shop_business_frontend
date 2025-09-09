import { useCallback } from 'react';
import { useAuthValidation } from './useAuthValidation';

/**
 * Hook for forms that need authentication validation before submission
 * This prevents the frustrating experience of losing work due to expired tokens
 */
export const useFormWithAuth = () => {
  const { validateBeforeAction } = useAuthValidation();

  const submitWithAuth = useCallback(
    async <T extends any[]>(
      submitFn: (...args: T) => Promise<any>,
      actionName: string = 'form submission'
    ) => {
      // Validate authentication before submitting
      await validateBeforeAction(actionName);
      
      // If validation passes, proceed with submission
      return submitFn;
    },
    [validateBeforeAction]
  );

  const handleSubmitWithAuth = useCallback(
    async <T extends any[]>(
      submitFn: (...args: T) => Promise<any>,
      ...args: T
    ) => {
      try {
        // Validate authentication before submitting
        await validateBeforeAction('form submission');
        
        // If validation passes, proceed with submission
        return await submitFn(...args);
      } catch (error: any) {
        if (error.message?.includes('Authentication expired')) {
          // Show user-friendly error message
          throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou și să încercați din nou.');
        }
        throw error;
      }
    },
    [validateBeforeAction]
  );

  return {
    submitWithAuth,
    handleSubmitWithAuth,
    validateBeforeAction,
  };
};
