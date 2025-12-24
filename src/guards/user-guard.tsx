import { User } from '@/api/entities/auth';
import { LoadingScreen } from '@/components/loading-screen';
import { app } from '@/config';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import z from 'zod';

interface UserGuardProps {
  children: ReactNode;
}

function getRedirectPath(search: string): string | null {
  const REDIRECT_QUERY_PARAM_REGEX = new RegExp(`${app.redirectQueryParamName}=([^&]*)`);
  return REDIRECT_QUERY_PARAM_REGEX.exec(search)?.[1] ?? null;
}

type Role = z.infer<typeof User>['role'];

function resolveRedirect(
  currentPath: string,
  role: Role,
  department: string | null | undefined,
  redirectPath: string | null
): string | null {
  // HR and Finance employees should use manager paths
  const shouldUseManagerPaths = 
    role === 'MANAGER' || 
    (role === 'EMPLOYEE' && (department === 'HR' || department === 'Finance'));
  
  const basePath = shouldUseManagerPaths ? paths.manager.root : paths.employee.root;
  const homePath = shouldUseManagerPaths ? paths.manager.home : paths.employee.home;
  
  const isValidRedirect = redirectPath?.startsWith(basePath);
  const alreadyOnCorrectPath = currentPath.startsWith(basePath);

  if (isValidRedirect) return redirectPath!;
  if (!alreadyOnCorrectPath) {
    return homePath; // Navigate to role-specific home
  }

  return null;
}

export function UserGuard({ children }: UserGuardProps) {
  const { pathname, search } = useLocation();
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user?.role) {
    const redirectPath = getRedirectPath(search);
    const correctedPath = resolveRedirect(pathname, user.role, user.department, redirectPath);

    if (correctedPath && pathname !== correctedPath) {
      console.log(`[UserGuard] Redirecting ${user.username} (${user.role}, ${user.department}) from ${pathname} to ${correctedPath}`);
      return <Navigate to={correctedPath} replace />;
    }
  }

  return children;
}
