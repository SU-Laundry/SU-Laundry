import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BellRing, CheckCircle2, Shirt, Wrench } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { InfoBanner } from '@/components/InfoBanner';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { TYPE_LABEL, displayOf, hintOf, machineName } from '@/domain/status';
import type { PickupRequest } from '@/domain/types';

const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';

export default function MachineDetailPage() {
  const { machineId = '' } = useParams();
  const { data, loading } = useAsync(() => api.getMachineContext(machineId), [machineId]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<PickupRequest>();
  const [error, setError] = useState<string>();
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  if (loading) return <Page back title="기기 정보"><p className="caption">불러오는 중…</p></Page>;
  const m = data?.machine;
  if (!data || !m) return <Page back title="기기 정보"><p className="caption">기기를 찾을 수 없어요</p></Page>;
  const typeLabel = TYPE_LABEL[m.machine_type];

  const status = sent ? 'WAITING_PICKUP' : m.current_status;
  const display = displayOf(status);
  const request = sent ?? data.myRequest;

  // 수거 요청 버튼: 사용 완료이거나, 사용 가능으로 바뀌었지만 실제로 세탁물이 남아 있을 수 있을 때
  // (이전 사용자가 있고, 그게 내가 아닐 때만)
  const canRequest = (display === 'DONE' || display === 'AVAILABLE') && data.hasPreviousUser && !data.isMine;

  const send = async () => {
    setSending(true);
    setError(undefined);
    try {
      setSent(await api.createPickupRequest(m.machine_id));
      setSheetOpen(false);
    } catch {
      setError('요청을 보내지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Page back title={machineName(m)}>
      <div className="stack">
        <section className="card card-xl">
          <StatusBadge status={status} />
          <p style={{ marginTop: 'var(--space-3)' }}>{hintOf(status, m.machine_type)}</p>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginTop: 'var(--space-4)' }} className="caption">
            {display === 'MAINTENANCE' ? (
              <>
                <dt>점검 시작</dt>
                <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{fmtTime(m.maintenance_since)}</dd>
              </>
            ) : (
              <>
                <dt>{m.machine_type === 'DRYER' ? '건조 시작' : '세탁 시작'}</dt>
                <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{fmtTime(m.started_at)}</dd>
                {m.machine_type === 'WASHER' && (
                  <>
                    <dt>예약</dt>
                    <dd style={{ margin: 0, color: 'var(--color-text-main)' }}>{m.reserved_from ? `${m.reserved_from} 예약` : '없음'}</dd>
                  </>
                )}
              </>
            )}
          </dl>
        </section>

        {display === 'MAINTENANCE' && (
          <InfoBanner icon={Wrench} title="점검 중이라 지금은 쓸 수 없어요" color="var(--status-maintenance)" bg="var(--status-maintenance-bg)">
            {data.faultReport ? `${fmtTime(data.faultReport.reported_at)}에 고장 신고가 접수됐어요. ` : ''}
            점검이 끝나면 다시 사용할 수 있어요. 다른 {typeLabel}를 이용해주세요.
          </InfoBanner>
        )}

        {data.isMine && display === 'DONE' && (
          <InfoBanner icon={Shirt} title="내 세탁물이에요" color="var(--status-pickup)" bg="var(--status-pickup-bg)">
            {m.machine_type === 'DRYER' ? '건조' : '세탁'}가 끝났어요. 다음 사람을 위해 수거하러 가볼까요?
          </InfoBanner>
        )}

        {canRequest && (
          <section className="card">
            {request ? (
              <>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={22} color="var(--status-available)" aria-hidden style={{ flex: 'none', marginTop: 1 }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>이전 사용자에게 알렸어요</p>
                    <p className="caption" style={{ marginTop: 2 }}>
                      {fmtTime(request.requested_at)}에 수거 요청을 보냈어요. 조금만 기다려주세요.
                    </p>
                  </div>
                </div>
                <button className="btn btn-tertiary" disabled style={{ marginTop: 'var(--space-4)' }}>
                  이미 요청했어요
                </button>
              </>
            ) : (
              <>
                <h2 className="section-title" style={{ marginBottom: 'var(--space-1)' }}>
                  세탁물이 남아 있나요?
                </h2>
                <p className="caption">이전 사용자에게 수거 요청 알림을 보내드려요.</p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setSheetOpen(true)}>
                  <BellRing size={18} aria-hidden />
                  이전 사용자에게 알리기
                </button>
              </>
            )}
            {error && (
              <p className="caption" role="alert" style={{ color: 'var(--status-error)', marginTop: 'var(--space-2)' }}>
                {error}
              </p>
            )}
          </section>
        )}

        {/* 고장 신고 — 점검 중이 아닐 때만. 주요 동작보다 눈에 덜 띄게 */}
        {display !== 'MAINTENANCE' && (
          <section style={{ textAlign: 'center' }}>
            <p className="caption">{typeLabel}에 문제가 있나요?</p>
            <Link
              to={`/machines/${m.machine_id}/report`}
              className="btn btn-tertiary"
              style={{ marginTop: 'var(--space-2)', background: 'var(--color-surface)', color: 'var(--color-text-sub)' }}
            >
              <Wrench size={18} aria-hidden />
              고장 신고하기
            </Link>
          </section>
        )}
      </div>

      <ConfirmSheet
        open={sheetOpen}
        title={`${machineName(m)}에 세탁물이 남아 있나요?`}
        confirmLabel="알림 보내기"
        busy={sending}
        onConfirm={send}
        onClose={closeSheet}
      >
        이전 사용자에게 수거 요청 알림이 전송돼요.
        <br />
        실제로 세탁물이 남아 있을 때만 보내주세요.
      </ConfirmSheet>
    </Page>
  );
}
