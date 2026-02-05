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
    title: 'Safety Observations',
    label: 'Safety Observations',
    href: paths.manager.safetyObservations,
    icon: icons.alert,
  },
  {
    title: 'Housekeeping',
    label: 'Housekeeping',
    href: paths.manager.housekeeping,
    icon: icons.clipboardCheck,
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
  {
    title: 'Expeditions',
    label: 'Expeditions',
    href: paths.manager.expeditions,
    icon: icons.truck,
  },
  {
    title: 'Requests',
    label: 'Requests',
    href: paths.manager.requests,
    icon: icons.fileText,
  },
  {
    title: 'Tasks',
    label: 'Tasks',
    href: paths.manager.tasks,
    icon: icons.tasks,
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
    title: 'Safety Observations',
    label: 'Safety Observations',
    href: paths.employee.safetyObservations,
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
  {
    title: 'Expeditions',
    label: 'Expeditions',
    href: paths.employee.expeditions,
    icon: icons.truck,
  },
  {
    title: 'Requests',
    label: 'Requests',
    href: paths.employee.requests,
    icon: icons.fileText,
  },
  {
    title: 'Tasks',
    label: 'Tasks',
    href: paths.employee.tasks,
    icon: icons.tasks,
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
    
    // HSE employees get housekeeping menu added
    if (userDepartment === 'HSE') {
      const hseMenus: SideLink[] = [...EMPLOYEE_MENUS];
      // Add housekeeping after safety observations
      const safetyIndex = hseMenus.findIndex(m => m.href === paths.employee.safetyObservations);
      if (safetyIndex !== -1) {
        hseMenus.splice(safetyIndex + 1, 0, {
          title: 'Housekeeping',
          label: 'Housekeeping',
          href: paths.employee.housekeeping,
          icon: icons.clipboardCheck,
        });
      }
      return hseMenus;
    }
    
    // All other employees see employee menus
    return EMPLOYEE_MENUS;
  }
  return [];
}
