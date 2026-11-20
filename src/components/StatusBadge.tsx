import { DISPLAY_META, DISPLAY_OF } from '@/domain/status';
import type { MachineStatus } from '@/domain/types';

/** pill 배지 — 상태색 + 아이콘 + 텍스트를 항상 함께 표시 (내부 상태 → 화면 상태로 묶어서) */
export function StatusBadge({ status }: { status: MachineStatus }) {
  const m = DISPLAY_META[DISPLAY_OF[status]];
  const Icon = m.icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 28,
        padding: '0 10px',
        borderRadius: 'var(--radius-pill)',
        background: m.bg,
        color: m.color,
        fontSize: 'var(--fs-caption)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'background-color .3s, color .3s',
      }}
    >
      <Icon size={14} strokeWidth={2.4} aria-hidden />
      {m.label}
    </span>
  );
}
