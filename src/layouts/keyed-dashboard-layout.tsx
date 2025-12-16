import { useAuth } from '@/hooks';
import { DashboardLayout } from '@/layouts/dashboard';
import { useEffect } from 'react';

/**
 * Wrapper that ensures DashboardLayout re-mounts when user changes
 * Uses user ID as React key to force complete re-mount
 */
export function KeyedDashboardLayout() {
  const { user } = useAuth();
  
  // Use user ID as key - when user changes, entire layout re-mounts
  const key = user?.id ?? 'no-user';
  
  useEffect(() => {
    console.log('[KeyedDashboardLayout] Mounted with user:', user?.username, 'role:', user?.role, 'key:', key);
    return () => {
      console.log('[KeyedDashboardLayout] Unmounting user:', user?.username);
    };
  }, []);
  
  return <DashboardLayout key={key} />;
}
