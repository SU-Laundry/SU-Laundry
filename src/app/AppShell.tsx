import type { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BottomNav } from './BottomNav';

/** 탭 화면 공통 프레임: 헤더 고정 · 콘텐츠 스크롤 · 바텀 네비 고정 */
export function TabLayout() {
  return (
    <div className="app-frame">
      <Outlet />
      <BottomNav />
    </div>
  );
}

/** 상세/플로우 화면용 프레임 (바텀 네비 없음) */
export function StackLayout() {
  return (
    <div className="app-frame">
      <Outlet />
    </div>
  );
}

export function Page({ title, back, right, children }: { title?: string; back?: boolean; right?: ReactNode; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <>
      <header className="app-header">
        {back && (
          <button
            aria-label="뒤로"
            onClick={() => navigate(-1)}
            style={{ border: 0, background: 'none', padding: 0, width: 44, height: 44, marginLeft: -12, display: 'grid', placeItems: 'center' }}
          >
            <ChevronLeft size={26} />
          </button>
        )}
        {title && <h1 style={{ flex: 1 }}>{title}</h1>}
        {right}
      </header>
      <main className="app-content">{children}</main>
    </>
  );
}
