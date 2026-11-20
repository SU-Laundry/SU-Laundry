import { Link } from 'react-router-dom';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { Character } from '@/components/Character';
import { InfoBanner } from '@/components/InfoBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { isPeakNow } from '@/domain/peak';
import { DISPLAY_META, displayOf, type DisplayStatus } from '@/domain/status';

const SUMMARY: DisplayStatus[] = ['AVAILABLE', 'IN_USE', 'DONE'];

export default function HomePage() {
  const { dormId = '' } = useDorm();
  const { data } = useAsync(async () => {
    const { dorm, room, policy } = await api.getDormitoryContext(dormId);
    const roomId = room?.laundry_room_id ?? '';
    const [machines, mine] = await Promise.all([api.getMachines(roomId), api.getMyMachine(roomId)]);
    const requestsForMe = mine ? await api.getPickupRequestsForMe(mine.machine_id) : [];
    return { dorm, machines, policy, mine, requestsForMe };
  }, [dormId]);

  const count = (s: DisplayStatus) => data?.machines.filter((m) => displayOf(m.current_status) === s).length ?? 0;
  const availableOf = (t: 'WASHER' | 'DRYER') =>
    data?.machines.filter((m) => m.machine_type === t && displayOf(m.current_status) === 'AVAILABLE').length ?? 0;
  const hasDryers = !!data?.machines.some((m) => m.machine_type === 'DRYER');
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
            {/* 생활관 이름을 누르면 바로 변경 */}
            <Link
              to="/select-dorm"
              aria-label={`생활관 변경, 현재 ${data?.dorm?.name ?? ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                minHeight: 32,
                padding: '0 10px 0 12px',
                marginLeft: -4,
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.2)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 600,
              }}
            >
              {data?.dorm?.name ?? '생활관'} 세탁실
              <ChevronDown size={16} aria-hidden />
            </Link>
            <h2 style={{ fontSize: 'var(--fs-page)', fontWeight: 700, marginTop: 'var(--space-2)', lineHeight: 1.35 }}>
              지금 세탁기 {availableOf('WASHER')}대
              <br />
              이용 가능해요
            </h2>
            {hasDryers && (
              <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--fs-caption)', opacity: 0.9 }}>
                건조기는 {availableOf('DRYER')}대 비어 있어요
              </p>
            )}
          </div>
          <Character which="right" size={104} />
        </section>

        {/* 상태 요약 */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {SUMMARY.map((s) => (
              <div key={s} className="card" style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--fs-display)', fontWeight: 700 }}>{count(s)}</p>
                <p className="caption">{DISPLAY_META[s].label}</p>
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
            {/* 세탁이 끝났으면 완료 안내로, 아니면 내 세탁 상세로 */}
            <Link
              to={displayOf(data.mine.current_status) === 'DONE' ? '/laundry-done' : '/my-laundry'}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
            >
              <div style={{ flex: 1 }}>
                <strong>{data.mine.machine_number}번 세탁기</strong>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <StatusBadge status={data.mine.current_status} />
                </div>
                {data.requestsForMe.length > 0 && (
                  <p className="caption" style={{ marginTop: 'var(--space-2)', color: 'var(--status-pickup)', fontWeight: 600 }}>
                    다음 사용자가 수거를 요청했어요
                  </p>
                )}
              </div>
              <ChevronRight size={20} color="var(--color-text-sub)" />
            </Link>
          </section>
        )}
      </div>
    </Page>
  );
}
