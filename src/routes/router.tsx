import { AuthGuard } from '@/guards/auth-guard';
import { UserGuard } from '@/guards/user-guard';
import { AuthLayout } from '@/layouts/auth';
import { KeyedDashboardLayout } from '@/layouts/keyed-dashboard-layout';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LazyPage } from './lazy-page';
import { paths } from './paths';

const router = createBrowserRouter([
  /* -------------------------------------------------------------------------- */
  /*                                  ROOT                                     */
  /* -------------------------------------------------------------------------- */
  {
    path: '/',
    element: (
      <UserGuard>
        <Navigate to={paths.manager.root} replace />
      </UserGuard>
    ),
  },

  /* -------------------------------------------------------------------------- */
  /*                                     AUTH                                   */
  /* -------------------------------------------------------------------------- */
  {
    path: paths.auth.root,
    element: (
      <UserGuard>
        <AuthLayout />
      </UserGuard>
    ),
    children: [
      {
        index: true,
        path: paths.auth.root,
        element: <Navigate to={paths.auth.login} replace />,
      },
      {
        path: paths.auth.login,
        element: LazyPage(() => import('@/pages/auth/login')),
      },
    ],
  },

  /* -------------------------------------------------------------------------- */
  /*                                   MANAGER                                  */
  /* -------------------------------------------------------------------------- */
  {
    path: paths.manager.root,
    element: (
      <UserGuard>
        <AuthGuard>
          <KeyedDashboardLayout />
        </AuthGuard>
      </UserGuard>
    ),
    children: [
      /* ------------------------------- REDIRECT ------------------------------- */
      {
        index: true,
        element: <Navigate to={paths.manager.home} replace />,
      },

      /* ------------------------------- HOME ------------------------------- */
      {
        path: paths.manager.home,
        element: LazyPage(() => import('@/pages/home')),
      },

      /* ------------------------------- INVENTORY ------------------------------- */
      {
        path: paths.manager.inventory,
        element: LazyPage(() => import('@/pages/inventory')),
      },

      /* ------------------------------- FACILITIES ------------------------------- */
      {
        path: paths.manager.facilities,
        element: LazyPage(() => import('@/pages/facilities')),
      },

      /* ------------------------------- EMPLOYEES ------------------------------- */
      {
        path: paths.manager.employees,
        element: LazyPage(() => import('@/pages/employees')),
      },
      {
        path: paths.manager.employeeDetail(':id'),
        element: LazyPage(() => import('@/pages/employees/[id]')),
      },

      /* ------------------------------- ATTENDANCE ------------------------------- */
      {
        path: paths.manager.attendance,
        element: <Navigate to={paths.manager.attendanceCheckIn} replace />,
      },
      {
        path: paths.manager.attendanceCheckIn,
        element: LazyPage(() => import('@/pages/attendance/manager/check-in')),
      },
      {
        path: paths.manager.attendanceManagement,
        element: LazyPage(() => import('@/pages/attendance/manager/management')),
      },

      /* ------------------------------- HAZARD OBSERVATIONS ------------------------------- */
      {
        path: paths.manager.hazardObservations,
        element: LazyPage(() => import('@/pages/hazard-observations')),
      },

      /* ------------------------------- CONTACTS ------------------------------- */
      {
        path: paths.manager.contacts,
        element: LazyPage(() => import('@/pages/contacts')),
      },

      /* ------------------------------- IT TICKETS ------------------------------- */
      {
        path: paths.manager.itTickets,
        element: LazyPage(() => import('@/pages/it-tickets')),
      },

      /* ------------------------------- PROFILE ------------------------------- */
      {
        path: paths.manager.profile,
        element: LazyPage(() => import('@/pages/profile')),
      },
    ],
  },

  /* -------------------------------------------------------------------------- */
  /*                                   EMPLOYEE                                 */
  /* -------------------------------------------------------------------------- */
  {
    path: paths.employee.root,
    element: (
      <UserGuard>
        <AuthGuard>
          <KeyedDashboardLayout />
        </AuthGuard>
      </UserGuard>
    ),
    children: [
      /* ------------------------------- REDIRECT ------------------------------- */
      {
        index: true,
        element: <Navigate to={paths.employee.home} replace />,
      },

      /* ------------------------------- HOME ------------------------------- */
      {
        path: paths.employee.home,
        element: LazyPage(() => import('@/pages/home')),
      },

      /* ------------------------------- INVENTORY ------------------------------- */
      {
        path: paths.employee.inventory,
        element: LazyPage(() => import('@/pages/inventory')),
      },

      /* ------------------------------- ATTENDANCE ------------------------------- */
      {
        path: paths.employee.attendance,
        element: LazyPage(() => import('@/pages/attendance/employee')),
      },

      /* ------------------------------- HAZARD OBSERVATIONS ------------------------------- */
      {
        path: paths.employee.hazardObservations,
        element: LazyPage(() => import('@/pages/hazard-observations')),
      },

      /* ------------------------------- CONTACTS ------------------------------- */
      {
        path: paths.employee.contacts,
        element: LazyPage(() => import('@/pages/contacts')),
      },

      /* ------------------------------- IT TICKETS ------------------------------- */
      {
        path: paths.employee.itTickets,
        element: LazyPage(() => import('@/pages/it-tickets')),
      },

      /* ------------------------------- PROFILE ------------------------------- */
      {
        path: paths.employee.profile,
        element: LazyPage(() => import('@/pages/profile')),
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
