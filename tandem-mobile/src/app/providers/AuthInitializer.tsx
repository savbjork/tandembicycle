import React, { useEffect } from 'react';
import { useAuthStore } from '@store';
import { supabase } from '@lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@store/slices/authStore';

function toUser(u: SupabaseUser): User {
    return {
        id: u.id,
        email: u.email ?? '',
        name: u.user_metadata?.display_name ?? u.email?.split('@')[0] ?? 'User',
        avatar: u.user_metadata?.avatar_url,
    };
}

/**
 * Subscribes to Supabase auth state changes for the lifetime of the app.
 * - INITIAL_SESSION fires immediately on mount with the stored session (or null),
 *   resolving the loading state without a separate getSession() call.
 * - Subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.) keep
 *   the Zustand store in sync automatically.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, setLoading, clearAuth } = useAuthStore();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(toUser(session.user));
            } else {
                clearAuth();
            }

            // INITIAL_SESSION is the first event — marks auth check as complete.
            if (event === 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [setUser, setLoading, clearAuth]);

    return <>{children}</>;
};
