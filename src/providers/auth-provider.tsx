import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import z from 'zod';
import { loadAccessToken } from '@/api/axios';
import { User } from '@/api/entities/auth';
import { getAccountInfo } from '@/api/resources/auth';
import { useLogin, useLogout } from '@/hooks/api/auth';

interface AuthContextValues {
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => void;
  isPendingLogin: boolean;
  logout: () => void;
  isPendingLogout: boolean;
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

  const refreshUserInfo = useCallback(() => {
    console.log('BRUHHH');
    getAccountInfo()
      .then((user) => {
        console.log('BRUHHHHHH');
        setIsAuthenticated(true);
        setUser(user);
      })
      .catch((error) => {
        console.log(error);
        resetData();
      })
      .finally(() => setIsInitialized(true));
  }, []);

  useEffect(() => {
    loadAccessToken();
    refreshUserInfo();
  }, []);

  const resetData = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    logoutBackend({ variables: null });
    resetData();
  }, []);

  const login = useCallback((username: string, password: string) => {
    loginBackend(
      { variables: { username, password } },
      {
        onSuccess: () => {
          refreshUserInfo();
        },
        onError: () => {
          resetData();
        },
      }
    );
  }, []);

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
    [isAuthenticated, isInitialized, isPendingLogin, isPendingLogout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
