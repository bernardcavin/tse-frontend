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
    subs: [
      {
        title: 'Check In',
        label: 'Check In',
        href: paths.manager.attendanceCheckIn,
        description: 'Scan QR code to check in',
        icon: icons.qrCode,
      },
      {
        title: 'Management',
        label: 'Management',
        href: paths.manager.attendanceManagement,
        description: 'Manage locations & records',
        icon: icons.settings,
      },
    ],
  },
  {
    title: 'Hazard Observations',
    label: 'Hazard Observations',
    href: paths.manager.hazardObservations,
    icon: icons.alert,
  },
  {
    title: 'Contacts',
    label: 'Contacts',
    href: paths.manager.contacts,
    icon: icons.contacts,
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
  {
    title: 'Hazard Observations',
    label: 'Hazard Observations',
    href: paths.employee.hazardObservations,
    icon: icons.alert,
  },
  {
    title: 'Contacts',
    label: 'Contacts',
    href: paths.employee.contacts,
    icon: icons.contacts,
  },
];

/**
 * Get menus based on user role and department
 */
export function getMenusForRole(userRole: string, userDepartment?: string | null): SideLink[] {
  if (userRole === 'MANAGER') {
    return MANAGER_MENUS;
  } else if (userRole === 'EMPLOYEE') {
    // All employees can see and report Hazard Observations
    return EMPLOYEE_MENUS;
  }
  return [];
}
