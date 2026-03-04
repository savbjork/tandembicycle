import { useAuthStore, type User } from '@store';

/** Baseline mock user for development / demo mode. */
const BASE_MOCK_USER: User = {
  id: 'user-1',
  email: 'savannah@tandem.app',
  name: 'Savannah',
};

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
  const { setUser, setLoading, user } = useAuthStore();

  const mockSignIn = async (_email: string, _password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser(BASE_MOCK_USER);
    setLoading(false);
  };

  const mockSignUp = async (name: string, email: string, _password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser({ ...BASE_MOCK_USER, name, email });
    setLoading(false);
  };

  const mockSignOut = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    isLoading: false,
  };
};

