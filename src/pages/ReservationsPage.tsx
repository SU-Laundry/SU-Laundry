import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { Pill } from '@/components/Pill';
import { api, type ReservationView } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { useNow } from '@/services/useNow';
import { RESERVATION_META, isActiveReservation } from '@/domain/reservation';
import { fmtDay, fmtDuration, fmtTime } from '@/domain/time';
import { POLICY } from '@/config/policy';
import { dormitories } from '@/mocks/data';

function ReservationPill({ r }: { r: ReservationView }) {
  return <Pill {...RESERVATION_META[r.reservation_status]} />;
}

/** 마이 > 예약 내역: 예정된 예약(남은 시간·취소) + 지난 예약 */
export default function ReservationsPage() {
  const now = useNow();
  const { dormId = '' } = useDorm();
  const dormName = dormitories.find((d) => d.dormitory_id === dormId)?.name ?? '';
  const { data, reload } = useAsync(() => api.getMyReservations(dormId), [dormId]);
  const [cancelTarget, setCancelTarget] = useState<ReservationView>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const closeSheet = useCallback(() => setCancelTarget(undefined), []);

  const upcoming = data?.filter((r) => isActiveReservation(r.reservation_status)) ?? [];
  const past = data?.filter((r) => !isActiveReservation(r.reservation_status)) ?? [];

  const cancel = async () => {
    if (!cancelTarget) return;
    setBusy(true);
    setError(undefined);
    try {
      await api.cancelReservation(cancelTarget.reservation_id);
      setCancelTarget(undefined);
      reload();
    } catch (e) {
      setCancelTarget(undefined);
      setError((e as Error).message === 'STARTED' ? '이미 시작된 예약은 취소할 수 없어요.' : '취소하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page back title="예약 내역">
      {!data ? (
        <p className="caption">불러오는 중…</p>
      ) : (
        <div className="stack">
          {/* 예정된 예약 */}
          <section>
            <h2 className="section-title">예정된 예약</h2>
            {upcoming.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
                <p className="caption">예정된 예약이 없어요</p>
                <Link to="/reserve" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
                  예약하러 가기
                </Link>
              </div>
            ) : (
              upcoming.map((r) => {
                const startMs = new Date(r.start_time).getTime();
                const started = now >= startMs;
                const graceLeft = startMs + POLICY.graceTimeMinutes * 60_000 - now;
                return (
                  <article key={r.reservation_id} className="card card-xl fade-up">
                    <ReservationPill r={r} />
                    <p style={{ fontSize: 'var(--fs-page)', fontWeight: 700, marginTop: 'var(--space-3)' }}>
                      {fmtDay(r.start_time, now)} {fmtTime(r.start_time)} ~ {fmtTime(r.end_time)}
                    </p>
                    <p style={{ marginTop: 'var(--space-1)' }}>
                      {dormName} {r.machine_number}번 세탁기
                    </p>
                    <p
                      className="caption"
                      style={{ marginTop: 'var(--space-3)', color: started ? 'var(--status-pickup)' : 'var(--status-reserved)', fontWeight: 600 }}
                    >
                      {started
                        ? `지금 이용 시간이에요 · ${fmtDuration(graceLeft)} 안에 시작해주세요`
                        : `시작까지 ${fmtDuration(startMs - now)}`}
                    </p>
                    {!started && (
                      <button className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setCancelTarget(r)}>
                        예약 취소
                      </button>
                    )}
                  </article>
                );
              })
            )}
            {error && (
              <p className="caption" role="alert" style={{ color: 'var(--status-error)', marginTop: 'var(--space-2)' }}>
                {error}
              </p>
            )}
          </section>

          {/* 지난 예약 */}
          <section>
            <h2 className="section-title">지난 예약</h2>
            {past.length === 0 ? (
              <p className="caption">지난 예약이 없어요</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {past.map((r) => (
                  <li key={r.reservation_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600 }}>
                        {fmtDay(r.start_time, now)} {fmtTime(r.start_time)}
                      </p>
                      <p className="caption" style={{ marginTop: 2 }}>
                        {dormName} {r.machine_number}번 세탁기
                      </p>
                    </div>
                    <ReservationPill r={r} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="caption">
            예약 시간 {POLICY.graceTimeMinutes}분 안에 사용이 확인되지 않으면 자동으로 해제돼요. 예약은 시작 전까지 취소할 수 있어요.
          </p>
        </div>
      )}

      <ConfirmSheet
        open={!!cancelTarget}
        title="예약을 취소할까요?"
        confirmLabel="예약 취소"
        cancelLabel="유지하기"
        busy={busy}
        onConfirm={cancel}
        onClose={closeSheet}
      >
        {cancelTarget && (
          <>
            {fmtDay(cancelTarget.start_time, now)} {fmtTime(cancelTarget.start_time)} · {cancelTarget.machine_number}번 세탁기
            <br />
            취소하면 다른 사람이 이 시간을 예약할 수 있어요.
          </>
        )}
      </ConfirmSheet>
    </Page>
  );
}
