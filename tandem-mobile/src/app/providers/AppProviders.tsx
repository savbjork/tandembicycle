import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthInitializer } from './AuthInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * App providers wrapper
 * Wraps the app with all necessary providers
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  );
};

