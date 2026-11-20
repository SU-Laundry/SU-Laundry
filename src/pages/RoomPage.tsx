import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { MachineCard } from '@/components/MachineCard';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { DISPLAY_META, displayOf, type DisplayStatus } from '@/domain/status';

const FILTERS: (DisplayStatus | 'ALL')[] = ['ALL', 'AVAILABLE', 'IN_USE', 'DONE', 'RESERVED'];

/** 세탁실 현황 — 가장 많이 쓰는 화면, 확인 속도 최우선 */
export default function RoomPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const { dormId = '' } = useDorm();
  const { data, loading } = useAsync(async () => {
    const { dorm, room } = await api.getDormitoryContext(dormId);
    return { dorm, machines: await api.getMachines(room?.laundry_room_id ?? '') };
  }, [dormId]);

  const list = (data?.machines ?? []).filter((m) => filter === 'ALL' || displayOf(m.current_status) === filter);

  return (
    <Page
      title={`${data?.dorm?.name ?? ''} 세탁실`}
      right={
        <Link
          to="/select-dorm"
          style={{ minHeight: 44, display: 'grid', placeItems: 'center', padding: '0 4px', color: 'var(--color-primary)', fontSize: 'var(--fs-caption)', fontWeight: 600 }}
        >
          생활관 변경
        </Link>
      }
    >
      <div role="tablist" className="no-scrollbar" style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-4)' }}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              style={{
                flex: 'none',
                height: 36,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                border: 0,
                fontSize: 'var(--fs-caption)',
                fontWeight: 600,
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-text-main)',
              }}
            >
              {f === 'ALL' ? '전체' : DISPLAY_META[f].label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="caption">불러오는 중…</p>
      ) : list.length === 0 ? (
        <p className="caption" style={{ textAlign: 'center', padding: 'var(--space-7) 0' }}>
          해당하는 세탁기가 없어요
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {list.map((m) => (
            <MachineCard key={m.machine_id} machine={m} />
          ))}
        </div>
      )}
    </Page>
  );
}
