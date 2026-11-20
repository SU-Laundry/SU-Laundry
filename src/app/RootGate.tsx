import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SplashScreen } from '@/pages/SplashScreen';
import { prefs } from '@/services/prefs';
import { useDorm } from './DormContext';

const SPLASH_MS = 1500;
const FADE_MS = 300;

/**
 * 앱 진입 게이트
 * 1) 콜드 스타트마다 스플래시를 잠깐 띄운다 (그동안 아래 화면은 미리 렌더링)
 * 2) 온보딩을 본 적 없으면 /onboarding
 * 3) 생활관을 아직 고르지 않았으면 /select-dorm
 */
export function RootGate() {
  const { pathname } = useLocation();
  const { dormId } = useDorm();
  const [phase, setPhase] = useState<'show' | 'leaving' | 'done'>('show');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leaving'), SPLASH_MS);
    const t2 = setTimeout(() => setPhase('done'), SPLASH_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!prefs.isOnboarded() && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (prefs.isOnboarded() && !dormId && pathname !== '/select-dorm' && pathname !== '/onboarding') {
    return <Navigate to="/select-dorm" replace />;
  }

  // .device: 실제 폰에선 화면 전체, PC 화면에선 폰 모양 프레임 (global.css 참고)
  return (
    <div className="device">
      <Outlet />
      {phase !== 'done' && <SplashScreen leaving={phase === 'leaving'} />}
    </div>
  );
}
