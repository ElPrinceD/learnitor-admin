import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import ProtectedRoute from './protected-route'; 

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const TopicsPage = lazy(() => import('src/pages/topics'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const QuestionsPage = lazy(() => import('src/pages/qna'))
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
         <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
       children: [
        { path: 'dashboard', element: <IndexPage /> },
        { path: '/products/:courseId/topics', element: <TopicsPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: '/topics/:topicId/topic-content', element: <BlogPage /> },
        { path: '/topic-content/:topicId/questions-answers', element: <QuestionsPage />}
      ],
    },
    {
      path: '/',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
