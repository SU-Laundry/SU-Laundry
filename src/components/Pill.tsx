import type { LucideIcon } from 'lucide-react';

/** pill 배지 공통 모양 — 색 + 아이콘 + 텍스트 */
export function Pill({ label, color, bg, icon: Icon }: { label: string; color: string; bg: string; icon: LucideIcon }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 28,
        padding: '0 10px',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color,
        fontSize: 'var(--fs-caption)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={14} strokeWidth={2.4} aria-hidden />
      {label}
    </span>
  );
}
