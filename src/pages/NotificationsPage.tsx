import { Bell, CalendarClock, Shirt, Sparkles, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import type { NotificationType } from '@/domain/types';

const TYPE_META: Record<NotificationType, { icon: LucideIcon; color: string; bg: string }> = {
  N01_COMPLETED: { icon: Sparkles, color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  N02_PICKUP_REMIND: { icon: Shirt, color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)' },
  N03_PICKUP_REQUEST: { icon: Shirt, color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)' },
  N04_RESERVATION_START: { icon: CalendarClock, color: 'var(--status-reserved)', bg: 'var(--status-reserved-bg)' },
  N05_RESERVATION_RELEASED: { icon: XCircle, color: 'var(--status-error)', bg: 'var(--status-error-bg)' },
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
            return (
              <li key={n.id} className="card fade-up" style={{ display: 'flex', gap: 'var(--space-3)', opacity: n.read ? 0.75 : 1 }}>
                <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: t.bg, display: 'grid', placeItems: 'center' }}>
                  <Icon size={20} color={t.color} aria-hidden />
                </span>
                <div>
                  <p style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <p className="caption" style={{ marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
