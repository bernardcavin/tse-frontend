import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { MENUS } from '@/layouts/dashboard/sidebar/menu';

export default function useCurrentNav() {
  const { pathname } = useLocation();

  const currentNav = useMemo(
    () =>
      MENUS.find((link) => {
        return pathname.includes(link.href);
      }),
    [pathname]
  );

  return currentNav;
}
