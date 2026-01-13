import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string, firstName?: string) => Promise<{ error: AuthError | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
        },
        emailRedirectTo: undefined, // Désactiver la redirection email
      },
    });

    // Créer l'utilisateur dans la table users si l'inscription réussit
    if (data.user && !error) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('Error creating user in users table:', insertError);
      }

      // Si une session est créée (email confirmation désactivée), on la définit
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
    }

    return { error, session: data.session };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    setIsDemo(false);
    await supabase.auth.signOut();
  };

  const signInAsGuest = () => {
    setIsDemo(true);
    // Créer un objet user factice pour le mode demo
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@garagiste.app',
      created_at: new Date().toISOString(),
    } as User;
    setUser(demoUser);
    // Créer une session factice pour le mode demo
    const demoSession = {
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'demo-refresh-token',
      user: demoUser,
    } as Session;
    setSession(demoSession);
  };

  const value = {
    user,
    session,
    loading,
    isDemo,
    signUp,
    signIn,
    signOut,
    signInAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

