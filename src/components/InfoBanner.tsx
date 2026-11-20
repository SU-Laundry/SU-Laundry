import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** 카드형 안내 배너: 연한 배경 · 왼쪽 아이콘 · 제목 + 한 줄 설명 */
export function InfoBanner({
  icon: Icon,
  title,
  children,
  color = 'var(--color-primary)',
  bg = 'var(--color-sky)',
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        background: bg,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
      }}
    >
      <Icon size={22} color={color} aria-hidden style={{ flex: 'none', marginTop: 1 }} />
      <div>
        <p style={{ fontWeight: 600 }}>{title}</p>
        {children && <p className="caption" style={{ marginTop: 2 }}>{children}</p>}
      </div>
    </div>
  );
}
