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
  {
    title: 'IT Tickets',
    label: 'IT Tickets',
    href: paths.manager.itTickets,
    icon: icons.ticket,
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
  {
    title: 'IT Tickets',
    label: 'IT Tickets',
    href: paths.employee.itTickets,
    icon: icons.ticket,
  },
];

/**
 * Get menus based on user role and department
 */
export function getMenusForRole(userRole: string, userDepartment?: string | null): SideLink[] {
  if (userRole === 'MANAGER') {
    return MANAGER_MENUS;
  } else if (userRole === 'EMPLOYEE') {
    // HR and Finance employees can see manager menus (with read-only access)
    if (userDepartment === 'HR' || userDepartment === 'Finance') {
      return MANAGER_MENUS;
    }
    // All other employees see employee menus
    return EMPLOYEE_MENUS;
  }
  return [];
}
