import { STATUS_META } from '@/domain/status';
import type { MachineStatus } from '@/domain/types';

/** pill 배지 — 상태색 + 아이콘 + 텍스트를 항상 함께 표시 */
export function StatusBadge({ status }: { status: MachineStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
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
