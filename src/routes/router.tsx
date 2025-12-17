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
        element: LazyPage(() => import('@/pages/attendance/manager')),
      },

      /* ------------------------------- HAZARD OBSERVATIONS ------------------------------- */
      {
        path: paths.manager.hazardObservations,
        element: LazyPage(() => import('@/pages/hazard-observations')),
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

      /* ------------------------------- FACILITIES ------------------------------- */
      {
        path: paths.employee.facilities,
        element: LazyPage(() => import('@/pages/facilities')),
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
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
