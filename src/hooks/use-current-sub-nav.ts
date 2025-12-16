import { useAuth } from '@/hooks/use-auth';
import { getMenusForRole } from '@/layouts/dashboard/sidebar/menu';
import { useMemo } from 'react';

interface Props {
  appTitle: string;
}

export default function useCurrentSubNav({ appTitle }: Props) {
  const { user } = useAuth();

  const currentNav = useMemo(() => {
    const menus = getMenusForRole(user?.role ?? '');
    return menus.find((link) => link.title === appTitle);
  }, [appTitle, user?.role]);

  return currentNav;
}
