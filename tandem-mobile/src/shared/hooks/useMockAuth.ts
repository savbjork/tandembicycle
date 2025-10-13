import { useAuthStore } from '@store';
import { getMockCurrentUser } from '@shared/constants/mockData';

/**
 * Mock authentication hook for front-end development
 * Simulates authentication without Firebase
 * 
 * In production, this would:
 * 1. Check for stored JWT tokens on app startup
 * 2. Validate tokens with backend API
 * 3. Refresh tokens if needed
 * 4. Set user state if valid tokens exist
 */
export const useMockAuth = () => {
  const { setUser, setLoading, user, isAuthenticated } = useAuthStore();

  console.log('🔍 useMockAuth - Hook called:', { 
    isAuthenticated, 
    user: user ? `${user.name} (${user.email})` : null 
  });

  const mockSignIn = async (email: string, _password: string) => {
    console.log('🔍 useMockAuth - mockSignIn called with:', email);
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser = getMockCurrentUser();
    console.log('🔍 useMockAuth - Setting user after sign in:', mockUser);
    setUser(mockUser);
    setLoading(false);
  };

  const mockSignUp = async (name: string, email: string, _password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser = { ...getMockCurrentUser(), name, email };
    setUser(mockUser);
    setLoading(false);
  };

  const mockSignOut = async () => {
    console.log('🔴 useMockAuth - mockSignOut called');
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser(null);
    setLoading(false);
    console.log('🔴 useMockAuth - Sign out complete - user should be null');
  };

  return {
    user,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    isLoading: false,
  };
};

