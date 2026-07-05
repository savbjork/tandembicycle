import React, { useEffect } from 'react';
import { useAuthStore } from '@store';
import { supabase } from '@lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@store/slices/authStore';
import { TEST_AUTOLOGIN, TEST_EMAIL, TEST_PASSWORD } from '@shared/constants/config';

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const baseUser = toUser(session.user);
        setUser(baseUser);

        // Fetch display_name from profiles (authoritative source) and
        // resolve loading state once done, whether the fetch succeeds or fails.
        // (Supabase's query builder `.then` returns a PromiseLike, not a full
        // Promise, so `.finally()` isn't available — use Promise.resolve to
        // get one back.)
        Promise.resolve(
          supabase.from('profiles').select('display_name').eq('user_id', session.user.id).single()
        )
          .then(({ data }) => {
            if (data?.display_name) {
              setUser({ ...baseUser, name: data.display_name });
            }
          })
          .finally(() => setLoading(false));
      } else {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, clearAuth]);

  // Dev-only auto sign-in (EXPO_PUBLIC_TEST_AUTOLOGIN set by npm scripts).
  useEffect(() => {
    if (!TEST_AUTOLOGIN) return;
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      console.warn(
        'TEST_AUTOLOGIN is enabled but EXPO_PUBLIC_TEST_EMAIL / EXPO_PUBLIC_TEST_PASSWORD are not set in .env'
      );
      return;
    }
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user.email === TEST_EMAIL) return;
      // Supabase persists sessions across Metro restarts, so a previous
      // (different) test account may still be signed in — clear it first.
      if (session) await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      if (error) console.warn(`Test auto-login failed: ${error.message}`);
    })();
  }, []);

  return <>{children}</>;
};
