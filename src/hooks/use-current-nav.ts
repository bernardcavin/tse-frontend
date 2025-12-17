import { useAuth } from '@/hooks/use-auth';
import { getMenusForRole } from '@/layouts/dashboard/sidebar/menu';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export default function useCurrentNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const currentNav = useMemo(() => {
    const menus = getMenusForRole(user?.role ?? '', user?.department);
    return menus.find((link) => {
      return pathname.includes(link.href);
    });
  }, [pathname, user?.role, user?.department]);

  return currentNav;
}
