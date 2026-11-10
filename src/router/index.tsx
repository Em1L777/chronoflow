import { createBrowserRouter } from 'react-router';
import { MainLayout } from '@/app/layouts/MainLayout';
import { SchedulePage } from '@/features/schedule/pages/SchedulePage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { ResourcesPage } from '@/features/resources/pages/ResourcesPage';
import { BookingPage } from '@/features/booking/pages/BookingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SchedulePage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'resources',
        element: <ResourcesPage />,
      },
      {
        path: 'book',
        element: <BookingPage />,
      },
    ],
  },
]);