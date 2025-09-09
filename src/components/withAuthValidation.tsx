import React, { ComponentType } from 'react';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

/**
 * Higher-order component that validates authentication before rendering
 * and provides auth validation utilities to the wrapped component
 */
export function withAuthValidation<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    requireAuth?: boolean;
    validateBeforeRender?: boolean;
  } = {}
) {
  const {
    requireAuth = true,
    validateBeforeRender = true,
  } = options;

  return function AuthValidatedComponent(props: P) {
    const { isAuthenticated } = useAuthStore();
    const { validateBeforeAction } = useAuthValidation();

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Validate token before rendering if requested
    React.useEffect(() => {
      if (validateBeforeRender && isAuthenticated) {
        validateBeforeAction('page load').catch((error) => {
          console.error('Authentication validation failed on page load:', error);
        });
      }
    }, [isAuthenticated, validateBeforeRender, validateBeforeAction]);

    // Pass validation function to the wrapped component
    const enhancedProps = {
      ...props,
      validateBeforeAction,
    } as P & { validateBeforeAction: (actionName?: string) => Promise<boolean> };

    return <WrappedComponent {...enhancedProps} />;
  };
}
