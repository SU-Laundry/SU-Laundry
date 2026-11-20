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
import { RootGate } from '@/app/RootGate';

// TODO: 세탁 완료 안내 화면
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
          { path: '/my-laundry', element: <MyLaundryPage /> },
          { path: '/reserve/done', element: <ReserveDonePage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
