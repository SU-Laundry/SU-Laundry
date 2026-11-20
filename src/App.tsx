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

// TODO: 스플래시, 온보딩(3장), 세탁 완료 안내 화면
const router = createBrowserRouter([
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
]);

export default function App() {
  return <RouterProvider router={router} />;
}
