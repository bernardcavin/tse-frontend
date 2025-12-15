import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MENUS } from '@/layouts/dashboard/sidebar/menu';

interface Props {
  appTitle: string;
}

export default function useCurrentSubNav({ appTitle }: Props) {
  const currentNav = useMemo(() => MENUS.find((link) => link.title === appTitle), [appTitle]);

  return currentNav;
}
