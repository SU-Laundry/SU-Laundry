import { Link } from 'react-router-dom';
import { Bell, CalendarClock, ChevronRight, Shirt, Sparkles, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import type { NotificationType } from '@/domain/types';

/** 알림 종류별 아이콘·색과, 눌렀을 때 이동할 화면 (PUSH를 눌렀을 때도 같은 곳으로 보낸다) */
const TYPE_META: Record<NotificationType, { icon: LucideIcon; color: string; bg: string; to?: string }> = {
  N01_COMPLETED: { icon: Sparkles, color: 'var(--status-completed)', bg: 'var(--status-completed-bg)', to: '/laundry-done' },
  N02_PICKUP_REMIND: { icon: Shirt, color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)', to: '/laundry-done' },
  N03_PICKUP_REQUEST: { icon: Shirt, color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)', to: '/laundry-done' },
  N04_RESERVATION_START: { icon: CalendarClock, color: 'var(--status-reserved)', bg: 'var(--status-reserved-bg)', to: '/reserve' },
  N05_RESERVATION_RELEASED: { icon: XCircle, color: 'var(--status-error)', bg: 'var(--status-error-bg)', to: '/reserve' },
  SYSTEM: { icon: Bell, color: 'var(--color-text-sub)', bg: 'var(--color-bg)' },
};

export default function NotificationsPage() {
  const { data } = useAsync(() => api.getNotifications());

  return (
    <Page title="알림">
      {data && data.length === 0 ? (
        <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-7)' }}>
          <Character size={110} />
          <p className="caption">아직 받은 알림이 없어요</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {data?.map((n) => {
            const t = TYPE_META[n.type];
            const Icon = t.icon;
            const body = (
              <>
                <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: t.bg, display: 'grid', placeItems: 'center' }}>
                  <Icon size={20} color={t.color} aria-hidden />
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <p className="caption" style={{ marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {t.to && <ChevronRight size={18} color="var(--color-text-sub)" aria-hidden style={{ flex: 'none', alignSelf: 'center' }} />}
              </>
            );
            const style = { display: 'flex', gap: 'var(--space-3)', opacity: n.read ? 0.75 : 1 } as const;
            return (
              <li key={n.id}>
                {t.to ? (
                  <Link to={t.to} className="card fade-up" style={style}>
                    {body}
                  </Link>
                ) : (
                  <div className="card fade-up" style={style}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
