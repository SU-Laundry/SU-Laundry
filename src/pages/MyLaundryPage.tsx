import { BellRing } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { Character } from '@/components/Character';
import { InfoBanner } from '@/components/InfoBanner';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { HINT } from '@/domain/status';

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';

export default function MyLaundryPage() {
  const { data, loading } = useAsync(async () => {
    const user = await api.getCurrentUser();
    const [machine, requests] = await Promise.all([
      user.machine_id ? api.getMachine(user.machine_id) : Promise.resolve(undefined),
      api.getPickupRequestsForMe(),
    ]);
    return { machine, requests };
  });
  const m = data?.machine;
  const latestRequest = data?.requests.slice(-1)[0];

  return (
    <Page back title="내 세탁">
      {loading ? (
        <p className="caption">불러오는 중…</p>
      ) : !m ? (
        <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-7)' }}>
          <Character size={110} />
          <p className="caption">지금 이용 중인 세탁기가 없어요</p>
        </div>
      ) : (
        <div className="stack">
          {/* 다음 사용자에게서 받은 수거 요청 (N03) */}
          {latestRequest && (
            <InfoBanner icon={BellRing} title="다음 사용자가 수거를 요청했어요" color="var(--status-pickup)" bg="var(--status-pickup-bg)">
              {fmtTime(latestRequest.requested_at)} · {m.machine_number}번 세탁기에 세탁물이 남아 있어요. 확인 부탁드려요.
            </InfoBanner>
          )}

          <section className="card card-xl">
            <h2 className="section-title">{m.machine_number}번 세탁기</h2>
            <StatusBadge status={m.current_status} />
            <p style={{ marginTop: 'var(--space-3)' }}>{HINT[m.current_status]}</p>
            <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
              시작 {fmtTime(m.started_at)}
            </p>
            {/* TODO: 진행 이력 타임라인 */}
          </section>
        </div>
      )}
    </Page>
  );
}
