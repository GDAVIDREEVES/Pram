import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setSession({
        user: { id: 'mock-user', email: 'demo@wriggle.app', user_metadata: { name: 'Sarah' } },
      } as unknown as Session);
      setIsLoading(false);
      return undefined;
    }

    client.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const client = getSupabase();
    if (!client) return { error: 'Supabase is not configured. Add credentials to .env' };
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const client = getSupabase();
    if (!client) return { error: 'Supabase is not configured. Add credentials to .env' };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
  }, []);

  const user = session?.user ?? null;

  const value = useMemo(() => ({
    session,
    user,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
  }), [session, user, isLoading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
