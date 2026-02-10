import { useCallback } from 'react';

/**
 * Hook for forms with cookie-based authentication
 * The 401 interceptor handles expired cookies automatically, so no pre-validation needed
 */
export const useFormWithAuth = () => {
  const submitWithAuth = useCallback(
    async <T extends any[]>(
      submitFn: (...args: T) => Promise<any>,
      _actionName: string = 'form submission'
    ) => {
      // With cookie-based auth, just return the function (401 interceptor handles expiry)
      return submitFn;
    },
    []
  );

  const handleSubmitWithAuth = useCallback(
    async <T extends any[]>(
      submitFn: (...args: T) => Promise<any>,
      ...args: T
    ) => {
      // Just call the function (401 interceptor handles cookie expiry)
      return await submitFn(...args);
    },
    []
  );

  return {
    submitWithAuth,
    handleSubmitWithAuth,
  };
};
