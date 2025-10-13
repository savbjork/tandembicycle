import { create } from 'zustand';
import { User } from '@core/models/User';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

/**
 * Authentication store
 * Manages user authentication state globally
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => {
    console.log('🟢 AuthStore - setUser called with:', user ? `${user.name} (${user.email})` : 'null');
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    });
    console.log('🟢 AuthStore - Auth state updated:', { 
      isAuthenticated: !!user, 
      hasUser: !!user 
    });
  },

  setLoading: (isLoading) => {
    console.log('🟡 AuthStore - setLoading called with:', isLoading);
    set({
      isLoading,
    });
  },

  setError: (error) =>
    set({
      error,
    }),

  clearAuth: () => {
    console.log('🔴 AuthStore - clearAuth called');
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    console.log('🔴 AuthStore - Auth cleared');
  },
}));

