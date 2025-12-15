import { ElementType } from 'react';
import { paths } from '@/routes/paths';
import { icons } from '@/utilities/icons';

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

export const MENUS: SideLink[] = [
  {
    title: 'Home',
    label: 'Home',
    // description: 'Home page',
    href: paths.home.root,
    icon: icons.dashboard,
    // subs: [
    //   {
    //     title: 'Home Dashboard',
    //     label: 'Home',
    //     description: 'Central hub with KPIs and status highlights',
    //     href: paths.manager.home,
    //     icon: icons.dashboard,
    //   },
    //   {
    //     title: 'Exploration Dashboard',
    //     label: 'Exploration',
    //     description: 'Track exploration project progress and activity',
    //     href: paths.manager.projectDash('exploration'),
    //     icon: icons.exploration,
    //   },
    //   {
    //     title: 'Development Dashboard',
    //     label: 'Development',
    //     description: 'Monitor development wells and infrastructure projects',
    //     href: paths.manager.projectDash('development'),
    //     icon: icons.development,
    //   },
    //   {
    //     title: 'Workover Dashboard',
    //     label: 'Workover',
    //     description: 'Overview of workover activities and well interventions',
    //     href: paths.manager.projectDash('workover'),
    //     icon: icons.workover,
    //   },
    //   {
    //     title: 'Well Service Dashboard',
    //     label: 'Well Service',
    //     description: 'Status of well service jobs and maintenance tasks',
    //     href: paths.manager.projectDash('wellservice'),
    //     icon: icons.wellservice,
    //   },
    // ],
  },
  {
    title: 'Inventory',
    label: 'Inventory',
    href: paths.inventory.root,
    icon: icons.inventory,
  },
  {
    title: 'Facilities',
    label: 'Facilities',
    href: paths.facilities.root,
    icon: icons.facilities,
  },
];
