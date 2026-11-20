import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { StackLayout, TabLayout } from '@/app/AppShell';
import HomePage from '@/pages/HomePage';
import RoomPage from '@/pages/RoomPage';
import ReservePage from '@/pages/ReservePage';
import ReserveDonePage from '@/pages/ReserveDonePage';
import NotificationsPage from '@/pages/NotificationsPage';
import MyPage from '@/pages/MyPage';
import MachineDetailPage from '@/pages/MachineDetailPage';
import MyLaundryPage from '@/pages/MyLaundryPage';

import OnboardingPage from '@/pages/OnboardingPage';
import DormSelectPage from '@/pages/DormSelectPage';
import LaundryDonePage from '@/pages/LaundryDonePage';
import ReservationsPage from '@/pages/ReservationsPage';
import HelpPage from '@/pages/HelpPage';
import FaultReportPage from '@/pages/FaultReportPage';
import { RootGate } from '@/app/RootGate';
import { DormProvider } from '@/app/DormContext';

const router = createBrowserRouter([
  {
    // 스플래시 + 첫 실행 온보딩 게이트
    element: <RootGate />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        element: <TabLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/room', element: <RoomPage /> },
          { path: '/reserve', element: <ReservePage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/my', element: <MyPage /> },
        ],
      },
      {
        element: <StackLayout />,
        children: [
          { path: '/machines/:machineId', element: <MachineDetailPage /> },
          { path: '/machines/:machineId/report', element: <FaultReportPage /> },
          { path: '/my-laundry', element: <MyLaundryPage /> },
          { path: '/reserve/done', element: <ReserveDonePage /> },
          { path: '/select-dorm', element: <DormSelectPage /> },
          { path: '/laundry-done', element: <LaundryDonePage /> },
          { path: '/reservations', element: <ReservationsPage /> },
          { path: '/help', element: <HelpPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <DormProvider>
      <RouterProvider router={router} />
    </DormProvider>
  );
}
