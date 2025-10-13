import { useEffect } from 'react';
import { useAuthStore } from '@store';

/**
 * Auth Initializer Component
 * Initializes auth state on app startup
 * In production, this would check for stored JWT tokens
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    console.log('🔍 AuthInitializer - Starting auth state check...');
    
    // Simulate checking for stored auth state (JWT tokens, refresh tokens, etc.)
    const initializeAuth = async () => {
      setLoading(true);
      
      // Simulate async auth check (e.g., validating stored tokens with backend)
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In production: Check for stored JWT tokens, validate with backend
      // For now: No stored auth state - user must sign in manually
      console.log('🔍 AuthInitializer - Auth state check complete - no stored auth');
      setLoading(false);
    };

    initializeAuth();
  }, [setLoading]);

  return <>{children}</>;
};

