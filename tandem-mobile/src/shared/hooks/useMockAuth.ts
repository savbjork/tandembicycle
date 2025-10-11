import { useState, useEffect } from 'react';
import { useAuthStore } from '@store';
import { getMockCurrentUser } from '@shared/constants/mockData';

/**
 * Mock authentication hook for front-end development
 * Simulates authentication without Firebase
 */
export const useMockAuth = () => {
  const { setUser, setLoading, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate checking for existing session
    if (!isInitialized) {
      setLoading(true);
      setTimeout(() => {
        // Auto-login with mock user for development
        const mockUser = getMockCurrentUser();
        setUser(mockUser);
        setLoading(false);
        setIsInitialized(true);
      }, 500);
    }
  }, [isInitialized, setUser, setLoading]);

  const mockSignIn = async (email: string, _password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser = getMockCurrentUser();
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
    isLoading: !isInitialized,
  };
};

