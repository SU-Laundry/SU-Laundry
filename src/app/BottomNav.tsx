import { NavLink } from 'react-router-dom';
import { Home, WashingMachine, CalendarDays, Bell, User } from 'lucide-react';

const TABS = [
  { to: '/', label: '홈', icon: Home, end: true },
  { to: '/room', label: '세탁실', icon: WashingMachine },
  { to: '/reserve', label: '예약', icon: CalendarDays },
  { to: '/notifications', label: '알림', icon: Bell },
  { to: '/my', label: '마이', icon: User },
];

/** 하단 고정 네비게이션 — 활성 탭만 Primary Blue, 캐릭터 사용 금지 */
export function BottomNav() {
  return (
    <nav
      aria-label="주요 메뉴"
      style={{
        flex: 'none',
        display: 'grid',
        gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
        height: 'calc(var(--nav-h) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            minHeight: 44,
            fontSize: 'var(--fs-tiny)',
            fontWeight: 500,
            color: isActive ? 'var(--color-primary)' : 'var(--color-nav-inactive)',
          })}
        >
          <Icon size={24} strokeWidth={2} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
