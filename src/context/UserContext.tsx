import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StoredUser } from '../utils/userStorage';
import { getStoredUser, setStoredUser } from '../utils/userStorage';

type UserContextType = {
  user: StoredUser | null;
  setUser: (user: StoredUser | null) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then((stored) => {
      setUserState(stored);
      setIsLoading(false);
    });
  }, []);

  const setUser = (newUser: StoredUser | null) => {
    setUserState(newUser);
    if (newUser) {
      setStoredUser(newUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
