import { ComponentType } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

/**
 * Higher-order component that checks authentication before rendering
 * (Cookie-based auth - no client-side validation needed)
 */
export function withAuthValidation<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    requireAuth?: boolean;
  } = {}
) {
  const {
    requireAuth = true,
  } = options;

  return function AuthValidatedComponent(props: P) {
    const { isAuthenticated } = useAuthStore();

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}
