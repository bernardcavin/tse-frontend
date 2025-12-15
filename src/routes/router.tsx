import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '@/guards/auth-guard';
import { GuestGuard } from '@/guards/guest-guard';
import { AuthLayout } from '@/layouts/auth';
import { DashboardLayout } from '@/layouts/dashboard';
import { LazyPage } from './lazy-page';
import { paths } from './paths';

const router = createBrowserRouter([
  /* -------------------------------------------------------------------------- */
  /*                                     AUTH                                   */
  /* -------------------------------------------------------------------------- */
  {
    path: paths.auth.root,
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
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

  {
    path: '/',
    element: <Navigate to={paths.home.root} replace />,
  },

  {
    path: paths.home.root,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: paths.home.root,
        element: LazyPage(() => import('@/pages/home')),
      },
    ],
  },
  {
    path: paths.inventory.root,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: paths.inventory.root,
        element: LazyPage(() => import('@/pages/inventory')),
      },
    ],
  },
  {
    path: paths.facilities.root,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: paths.facilities.root,
        element: LazyPage(() => import('@/pages/facilities')),
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
