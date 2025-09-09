import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that validates authentication tokens on app startup
 * This prevents users from being logged out mid-work due to expired tokens
 */
const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, validateTokenOnInit } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If user appears to be authenticated, validate the token
        if (isAuthenticated) {
          console.log('Validating authentication on app startup...');
          await validateTokenOnInit();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Token validation failed, user will be logged out automatically
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [isAuthenticated, validateTokenOnInit]);

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">Se inițializează aplicația...</p>
          <p className="mt-2 text-sm text-gray-600">Se verifică autentificarea</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
