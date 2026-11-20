import { useNavigate } from 'react-router-dom';
import { BellRing, Clock, DoorClosed } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { Character } from '@/components/Character';
import { InfoBanner } from '@/components/InfoBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { useNow } from '@/services/useNow';
import { displayOf } from '@/domain/status';
import { POLICY } from '@/config/policy';

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';

const fmtElapsed = (min: number) => (min < 1 ? '방금' : min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간 ${min % 60}분`);

/**
 * 세탁 완료 안내 (N01 알림을 눌렀을 때 들어오는 화면)
 * - 상태는 센서가 판단한다 → "수거 완료" 버튼을 두지 않는다 (기획서 원칙 1)
 * - 완료 후 경과 시간이 길어지면 부드럽게 재안내, 수거 요청을 받았으면 그걸 우선 표시
 * - 세탁 중 / 완료 / 수거 확인 세 가지 상태를 모두 처리 (센서 상태가 바뀌어도 화면이 맞게)
 */
export default function LaundryDonePage() {
  const navigate = useNavigate();
  const now = useNow();
  const { dormId = '' } = useDorm();
  const { data, loading } = useAsync(async () => {
    const { dorm, room } = await api.getDormitoryContext(dormId);
    return { dorm, ...(await api.getMyLaundry(room?.laundry_room_id ?? '')) };
  }, [dormId]);

  const footer = (
    <button className="btn btn-primary" onClick={() => navigate('/', { replace: true })}>
      확인했어요
    </button>
  );

  if (loading) {
    return (
      <Page back>
        <p className="caption">불러오는 중…</p>
      </Page>
    );
  }

  const m = data?.machine;
  if (!data || !m) {
    return (
      <Page back footer={footer}>
        <div className="done-hero fade-up">
          <Character which="right" size={120} />
          <h1 className="done-hero__title">완료된 세탁이 없어요</h1>
          <p className="done-hero__sub">세탁이 끝나면 여기서 알려드릴게요</p>
        </div>
      </Page>
    );
  }

  const display = displayOf(m.current_status);
  const { session, requests } = data;
  const elapsedMin = session?.completed_at ? Math.max(0, Math.floor((now - new Date(session.completed_at).getTime()) / 60_000)) : 0;
  const overdue = elapsedMin >= POLICY.pickupRemindIntervalMinutes;
  const machineLabel = `${data.dorm?.name ?? ''} ${m.machine_number}번 세탁기`;

  // 상태별 문구 — 완료(DONE)가 기본, 그 외는 센서 상태가 바뀐 경우
  const hero =
    display === 'DONE'
      ? { which: 'right' as const, title: '세탁이 끝났어요!', sub: '수거하러 가볼까요?' }
      : display === 'IN_USE'
        ? { which: 'left' as const, title: '아직 세탁 중이에요', sub: '끝나면 바로 알려드릴게요' }
        : { which: 'left' as const, title: '세탁물을 꺼냈어요', sub: '다음 사람이 바로 쓸 수 있어요. 고마워요!' };

  return (
    <Page back footer={footer}>
      <div className="stack">
        <div className="done-hero fade-up">
          <div className="done-hero__glow" aria-hidden />
          <span className="bubble done-bubble" style={{ width: 22, height: 22, top: 18, left: '22%' }} aria-hidden />
          <span className="bubble done-bubble" style={{ width: 14, height: 14, top: 64, right: '24%' }} aria-hidden />
          <div className="pop">
            <Character which={hero.which} size={128} />
          </div>
          <h1 className="done-hero__title">{hero.title}</h1>
          <p className="done-hero__sub">{hero.sub}</p>
        </div>

        <section className="card card-xl fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--fs-section)', fontWeight: 600 }}>{machineLabel}</h2>
            <StatusBadge status={m.current_status} />
          </div>
          <dl className="done-rows">
            <dt>세탁 시작</dt>
            <dd>{fmtTime(session?.started_at)}</dd>
            {display !== 'IN_USE' && (
              <>
                <dt>세탁 완료</dt>
                <dd>{fmtTime(session?.completed_at)}</dd>
              </>
            )}
            {display === 'DONE' && (
              <>
                <dt>완료 후</dt>
                <dd style={{ color: overdue ? 'var(--status-pickup)' : undefined, fontWeight: overdue ? 600 : undefined }}>
                  {fmtElapsed(elapsedMin)} 지났어요
                </dd>
              </>
            )}
          </dl>
        </section>

        {display === 'DONE' &&
          (requests.length > 0 ? (
            <InfoBanner icon={BellRing} title="다음 사용자가 기다리고 있어요" color="var(--status-pickup)" bg="var(--status-pickup-bg)">
              {fmtTime(requests[requests.length - 1].requested_at)}에 수거 요청이 왔어요. 확인 부탁드려요.
            </InfoBanner>
          ) : overdue ? (
            <InfoBanner icon={Clock} title={`완료된 지 ${fmtElapsed(elapsedMin)}이 지났어요`} color="var(--status-pickup)" bg="var(--status-pickup-bg)">
              다음 사용자를 위해 세탁물을 확인해주세요
            </InfoBanner>
          ) : null)}

        {display === 'DONE' && (
          <InfoBanner icon={DoorClosed} title="꺼내고 문을 닫아주세요" color="var(--color-primary)" bg="var(--color-sky)">
            문을 닫으면 자동으로 확인돼요. 따로 누를 건 없어요.
          </InfoBanner>
        )}
      </div>
    </Page>
  );
}
