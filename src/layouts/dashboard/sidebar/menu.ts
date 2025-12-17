import { paths } from '@/routes/paths';
import { icons } from '@/utilities/icons';
import { ElementType } from 'react';

export interface NavLink {
  title: string;
  label: string;
  href: string;
  description?: string;
  icon: ElementType;
}

export interface SideLink extends NavLink {
  subs?: NavLink[];
}

// Manager menus
export const MANAGER_MENUS: SideLink[] = [
  {
    title: 'Home',
    label: 'Home',
    href: paths.manager.home,
    icon: icons.dashboard,
  },
  {
    title: 'Inventory',
    label: 'Inventory',
    href: paths.manager.inventory,
    icon: icons.inventory,
  },
  {
    title: 'Facilities',
    label: 'Facilities',
    href: paths.manager.facilities,
    icon: icons.facilities,
  },
  {
    title: 'Employees',
    label: 'Employees',
    href: paths.manager.employees,
    icon: icons.users,
  },
  {
    title: 'Attendance',
    label: 'Attendance',
    href: paths.manager.attendance,
    icon: icons.clock,
  },
];

// Employee menus
export const EMPLOYEE_MENUS: SideLink[] = [
  {
    title: 'Home',
    label: 'Home',
    href: paths.employee.home,
    icon: icons.dashboard,
  },
  {
    title: 'Inventory',
    label: 'Inventory',
    href: paths.employee.inventory,
    icon: icons.inventory,
  },
  {
    title: 'Facilities',
    label: 'Facilities',
    href: paths.employee.facilities,
    icon: icons.facilities,
  },
  {
    title: 'Attendance',
    label: 'Attendance',
    href: paths.employee.attendance,
    icon: icons.clock,
  },
];

/**
 * Get menus based on user role
 */
export function getMenusForRole(userRole: string): SideLink[] {
  if (userRole === 'MANAGER') {
    return MANAGER_MENUS;
  } else if (userRole === 'EMPLOYEE') {
    return EMPLOYEE_MENUS;
  }
  return [];
}
