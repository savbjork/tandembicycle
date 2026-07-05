import { supabase } from '@lib/supabase';
import { useAuthStore } from '@store';

export const useAuth = () => {
  const { user, isLoading, error, setLoading, setError } = useAuthStore();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, AuthInitializer's onAuthStateChange handles setUser + loading.
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, AuthInitializer's onAuthStateChange handles setUser + loading.
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // AuthInitializer's onAuthStateChange will call clearAuth().
  };

  return { user, signIn, signUp, signOut, isLoading, error };
};
