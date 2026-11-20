import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { InfoBanner } from '@/components/InfoBanner';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { STATUS_META } from '@/domain/status';

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';

export default function MachineDetailPage() {
  const { machineId = '' } = useParams();
  const { data: m, loading } = useAsync(() => api.getMachine(machineId), [machineId]);

  if (loading) return <Page back title="세탁기 정보"><p className="caption">불러오는 중…</p></Page>;
  if (!m) return <Page back title="세탁기 정보"><p className="caption">세탁기를 찾을 수 없어요</p></Page>;

  const canReportLeftover = m.current_status === 'PICKUP_ACTION_DETECTED' || m.current_status === 'AVAILABLE';

  return (
    <Page back title={`${m.machine_number}번 세탁기`}>
      <div className="stack">
        <section className="card card-xl">
          <StatusBadge status={m.current_status} />
          <p style={{ marginTop: 'var(--space-3)' }}>{STATUS_META[m.current_status].hint}</p>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginTop: 'var(--space-4)' }} className="caption">
            <dt>세탁 시작</dt>
            <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{fmtTime(m.started_at)}</dd>
            <dt>예약</dt>
            <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{m.reserved_from ? `${m.reserved_from} 예약` : '없음'}</dd>
            <dt>센서 통신</dt>
            <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{fmtTime(m.last_seen_at)}</dd>
          </dl>
        </section>

        {m.current_status === 'UNKNOWN' && (
          <InfoBanner icon={AlertCircle} title="센서 연결을 확인하고 있어요" color="var(--status-error)" bg="var(--status-error-bg)">
            현재 상태가 정확하지 않을 수 있어요
          </InfoBanner>
        )}

        {/* 문 열림 ≠ 수거 완료 → 다음 사용자가 남은 세탁물 신고 (N03) */}
        {canReportLeftover && (
          <button className="btn btn-tertiary" onClick={() => alert('수거 요청을 보냈어요 (목업)')}>
            세탁물이 남아 있어요
          </button>
        )}
      </div>
    </Page>
  );
}
