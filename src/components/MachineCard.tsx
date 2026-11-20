import { Link } from 'react-router-dom';
import { STATUS_META } from '@/domain/status';
import type { Machine } from '@/domain/types';
import { StatusBadge } from './StatusBadge';

/** 세탁기 상태 카드: 번호 · 상태 배지 · 부가 정보 한 줄 (캐릭터 넣지 않음) */
export function MachineCard({ machine }: { machine: Machine }) {
  const meta = STATUS_META[machine.current_status];
  const hint =
    machine.current_status === 'RESERVED' && machine.reserved_from
      ? `${machine.reserved_from} 예약`
      : meta.hint;

  return (
    <Link
      to={`/machines/${machine.machine_id}`}
      className="card fade-up"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minHeight: 112 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 'var(--fs-section)' }}>{machine.machine_number}번</strong>
      </div>
      <div>
        <StatusBadge status={machine.current_status} />
      </div>
      <p className="caption">{hint}</p>
    </Link>
  );
}
