import { loadAccessToken } from '@/api/axios';
import { User } from '@/api/entities/auth';
import { getAccountInfo } from '@/api/resources/auth';
import { useLogin, useLogout } from '@/hooks/api/auth';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import z from 'zod';

interface AuthContextValues {
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => void;
  isPendingLogin: boolean;
  isPendingLogout: boolean;
  logout: () => void;
  user: z.infer<typeof User> | null;
}

export const AuthContext = createContext<AuthContextValues | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [user, setUser] = useState<z.infer<typeof User> | null>(null);

  const { isPending: isPendingLogin, mutate: loginBackend } = useLogin();
  const { isPending: isPendingLogout, mutate: logoutBackend } = useLogout();

  const resetData = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const refreshUserInfo = useCallback(() => {
    console.log('[AuthProvider] Fetching user info...');
    getAccountInfo()
      .then((user) => {
        console.log('[AuthProvider] User info received:', user.username, user.role);
        setIsAuthenticated(true);
        setUser(user);
      })
      .catch((error) => {
        console.log('[AuthProvider] Failed to get user info:', error);
        resetData();
      })
      .finally(() => setIsInitialized(true));
  }, [resetData]);

  useEffect(() => {
    loadAccessToken();
    refreshUserInfo();
  }, [refreshUserInfo]);

  const logout = useCallback(() => {
    console.log('[AuthProvider] Logging out...');
    logoutBackend({ variables: null });
    resetData();
    // AuthGuard will handle redirect to login when isAuthenticated becomes false
  }, [logoutBackend, resetData]);

  const login = useCallback((username: string, password: string) => {
    console.log('[AuthProvider] Logging in as:', username);
    loginBackend(
      { variables: { username, password } },
      {
        onSettled: () => {
          refreshUserInfo();
        },
        onError: () => {
          console.log('[AuthProvider] Login failed');
          resetData();
        },
      }
    );
  }, [loginBackend, refreshUserInfo, resetData]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isInitialized,
      isPendingLogin,
      isPendingLogout,
      logout,
      login,
      setIsAuthenticated,
      user,
    }),
    [isAuthenticated, isInitialized, isPendingLogin, isPendingLogout, logout, login, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
