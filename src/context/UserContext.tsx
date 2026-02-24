import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { StoredUser } from '../utils/userStorage';
import { getStoredUser, clearStoredUser } from '../utils/userStorage';

type UserContextType = {
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stored = await getStoredUser();
        if (mounted) {
          setUserState(stored);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const timeout = setTimeout(() => {
      if (mounted && isLoading) setIsLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setUserState(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const stored = await getStoredUser();
            if (mounted) setUserState(stored);
          } catch {}
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const setUser = (newUser: StoredUser | null) => {
    setUserState(newUser);
  };

  const logout = async () => {
    await clearStoredUser();
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
