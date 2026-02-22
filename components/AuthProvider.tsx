'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, User } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuthUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        const storedUser = auth.getUser();
        if (storedUser && auth.getAccessToken()) {
          // Try to verify the token is still valid
          try {
            const me = await apiClient.getMe();
            setUser(me);
          } catch {
            // Token might be expired, try to refresh
            try {
              const tokens = await apiClient.refresh();
              auth.setTokens(tokens);
              const me = await apiClient.getMe();
              setUser(me);
            } catch {
              // Refresh failed, clear auth
              auth.clearAuth();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('[v0] Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    auth.clearAuth();
    setUser(null);
    router.replace('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setAuthUser: setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
