import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { InfoBanner } from '@/components/InfoBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { isPeakNow } from '@/domain/peak';
import type { MachineStatus } from '@/domain/types';

const SUMMARY: { status: MachineStatus; label: string }[] = [
  { status: 'AVAILABLE', label: '사용 가능' },
  { status: 'IN_USE', label: '사용 중' },
  { status: 'WAITING_PICKUP', label: '수거 대기' },
];

export default function HomePage() {
  const { data } = useAsync(async () => {
    const user = await api.getCurrentUser();
    const [dorms, rooms, machines] = await Promise.all([
      api.getDormitories(),
      api.getRoomsByDormitory(user.dormitory_id),
      api.getMachines(user.laundry_room_id),
    ]);
    const policy = await api.getPeakPolicy(rooms[0]?.peak_policy_id ?? 'default');
    const dorm = dorms.find((d) => d.dormitory_id === user.dormitory_id);
    const mine = machines.find((m) => m.machine_id === user.machine_id);
    return { dorm, machines, policy, mine };
  });

  const count = (s: MachineStatus) =>
    data?.machines.filter((m) => m.current_status === s || (s === 'WAITING_PICKUP' && m.current_status === 'COMPLETED')).length ?? 0;
  const peak = data?.policy ? isPeakNow(data.policy) : false;

  return (
    <Page>
      <div className="stack">
        {/* 웰컴 카드 — 캐릭터는 화면 폭 20~35% 이내 */}
        <section
          className="card card-xl fade-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #4fa6ff 100%)',
            color: '#fff',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--fs-caption)', opacity: 0.85 }}>{data?.dorm?.name ?? ' '} 세탁실</p>
            <h2 style={{ fontSize: 'var(--fs-page)', fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>
              지금 {count('AVAILABLE')}대
              <br />
              이용 가능해요
            </h2>
          </div>
          <Character which="right" size={104} />
        </section>

        {/* 상태 요약 */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {SUMMARY.map(({ status, label }) => (
              <div key={status} className="card" style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--fs-display)', fontWeight: 700 }}>{count(status)}</p>
                <p className="caption">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/room" className="btn btn-secondary" style={{ marginTop: 'var(--space-3)' }}>
            세탁실 현황 보기
          </Link>
        </section>

        {/* 오늘의 피크 시간 */}
        {data?.policy && (
          <section>
            <InfoBanner
              icon={Clock}
              title={`오늘 피크 시간 ${data.policy.start} ~ ${data.policy.end}`}
              color="#c99400"
              bg="#fff8e1"
            >
              {peak ? '지금은 피크 시간이에요. 예약을 이용해보세요' : '피크 시간에는 예약으로 더 편하게 이용할 수 있어요'}
            </InfoBanner>
            <Link to="/reserve" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }}>
              예약하기
            </Link>
          </section>
        )}

        {/* 내 세탁 */}
        {data?.mine && (
          <section>
            <h2 className="section-title">내 세탁</h2>
            <Link to="/my-laundry" className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ flex: 1 }}>
                <strong>{data.mine.machine_number}번 세탁기</strong>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <StatusBadge status={data.mine.current_status} />
                </div>
              </div>
              <ChevronRight size={20} color="var(--color-text-sub)" />
            </Link>
          </section>
        )}
      </div>
    </Page>
  );
}
