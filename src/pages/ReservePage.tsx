import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ban, CalendarCheck, Clock, ListChecks } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { InfoBanner } from '@/components/InfoBanner';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { isPeakNow, nextSlotStart, peakSlots } from '@/domain/peak';
import { fmtDay, fmtTime } from '@/domain/time';
import { POLICY } from '@/config/policy';

/** 피크 시간 예약 — 예약 색(보라)으로 상태와 구분, 타임테이블 내부에 캐릭터 금지 */
export default function ReservePage() {
  const navigate = useNavigate();
  const { dormId = '' } = useDorm();
  const { data } = useAsync(async () => {
    const { room, policy } = await api.getDormitoryContext(dormId);
    const [all, active, noShow] = await Promise.all([
      api.getMachines(room?.laundry_room_id ?? ''),
      api.getMyActiveReservation(),
      api.getNoShowStatus(),
    ]);
    // 예약은 세탁기만 (건조기는 예약 없이 자유 이용)
    return { policy, machines: all.filter((m) => m.machine_type === 'WASHER'), active, noShow };
  }, [dormId]);
  const [slot, setSlot] = useState<string>();
  const [machineId, setMachineId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!data?.policy) return <Page title="예약"><p className="caption">불러오는 중…</p></Page>;
  const { policy, machines, active, noShow } = data;
  const restricted = !!noShow.restrictedUntil;
  const { limit, restrictDays } = POLICY.noShow;
  const peak = isPeakNow(policy);
  const now = Date.now();

  const selectStyle = (selected: boolean) => ({
    minHeight: 48,
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${selected ? 'var(--status-reserved)' : 'var(--color-border)'}`,
    background: selected ? 'var(--status-reserved-bg)' : 'var(--color-surface)',
    color: selected ? 'var(--status-reserved)' : 'var(--color-text-main)',
    fontWeight: 600,
  });

  const confirm = async () => {
    if (!slot || !machineId) return;
    setBusy(true);
    setError(undefined);
    try {
      const r = await api.createReservation(machineId, nextSlotStart(slot));
      navigate('/reserve/done', { state: { start: r.start_time, machineNumber: r.machine_number } });
    } catch (e) {
      const code = (e as Error).message;
      setError(
        code === 'ACTIVE_EXISTS'
          ? '이미 예정된 예약이 있어요. 예약 내역에서 확인해주세요.'
          : code === 'TAKEN'
            ? '방금 다른 사람이 예약했어요. 다른 세탁기나 시간을 골라주세요.'
            : code === 'RESTRICTED'
              ? `노쇼 ${limit}회로 지금은 예약할 수 없어요.`
              : code === 'UNAVAILABLE'
                ? '점검 중인 세탁기예요. 다른 세탁기를 골라주세요.'
            : '예약하지 못했어요. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="예약">
      <div className="stack">
        <InfoBanner icon={Clock} title={`피크 시간 ${policy.start} ~ ${policy.end}`} color="var(--status-reserved)" bg="var(--status-reserved-bg)">
          {peak ? '피크 시간이라 예약 이용이 가능해요' : `피크 시간 외에는 자유롭게 이용할 수 있어요`}
        </InfoBanner>

        {/* 노쇼 누적으로 예약 제한 중 */}
        {restricted && (
          <InfoBanner icon={Ban} title="지금은 예약할 수 없어요" color="var(--status-error)" bg="var(--status-error-bg)">
            노쇼가 {limit}회 쌓여서 {new Date(noShow.restrictedUntil!).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}까지 예약이 제한돼요. 피크 시간 외에는 자유롭게 이용할 수 있어요.
          </InfoBanner>
        )}

        {/* 예약은 동시에 1개까지 — 이미 있으면 안내하고 새 예약을 막는다 */}
        {active && (
          <Link to="/reservations">
            <InfoBanner icon={CalendarCheck} title="예정된 예약이 있어요" color="var(--status-reserved)" bg="var(--color-surface)">
              {fmtDay(active.start_time)} {fmtTime(active.start_time)} · {active.machine_number}번 세탁기 — 예약 내역에서 보기
            </InfoBanner>
          </Link>
        )}

        <section>
          <h2 className="section-title">시간 선택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
            {peakSlots(policy).map((s) => {
              // 오늘 이미 지난 시간은 내일로 예약된다 → 버튼에 "내일" 표시
              const tomorrow = fmtDay(nextSlotStart(s, now).toISOString(), now) === '내일';
              return (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  aria-pressed={slot === s}
                  aria-label={`${tomorrow ? '내일 ' : ''}${s}`}
                  style={{ ...selectStyle(slot === s), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}
                >
                  {s}
                  {tomorrow && <span style={{ fontSize: 'var(--fs-tiny)', fontWeight: 500, opacity: 0.75 }}>내일</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="section-title">세탁기 선택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
            {machines.map((m) => {
              // 확인 중·점검 중인 기기, 또는 선택한 슬롯에 이미 예약된 기기는 선택 불가
              const maintenance = m.current_status === 'MAINTENANCE';
              const disabled = m.current_status === 'UNKNOWN' || maintenance || (!!slot && m.reserved_from === slot);
              return (
                <button
                  key={m.machine_id}
                  disabled={disabled}
                  onClick={() => setMachineId(m.machine_id)}
                  aria-pressed={machineId === m.machine_id}
                  aria-label={`${m.machine_number}번${maintenance ? ', 점검 중' : ''}`}
                  style={{ ...selectStyle(machineId === m.machine_id), opacity: disabled ? 0.4 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  {m.machine_number}번
                  {maintenance && <span style={{ fontSize: 'var(--fs-tiny)', fontWeight: 500 }}>점검 중</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* 예약 규칙 — 숫자는 정책 값에서 */}
        <section className="card" aria-labelledby="rules-title">
          <h2 id="rules-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--fs-body)', fontWeight: 700 }}>
            <ListChecks size={18} color="var(--status-reserved)" aria-hidden />
            예약 전에 꼭 확인해주세요
          </h2>
          <ul className="rules">
            <li>
              예약은 <strong>한 사람당 한 번에 1건</strong>만 할 수 있어요.
            </li>
            <li>
              예약 시간이 시작되고 <strong>{POLICY.graceTimeMinutes}분 안에</strong> 사용하지 않으면 노쇼로 자동 해제돼요.
            </li>
            <li>
              노쇼가 <strong>{limit}회</strong> 쌓이면 <strong>{restrictDays === 30 ? '한 달' : `${restrictDays}일`} 동안 예약할 수 없어요.</strong>
            </li>
            <li>못 갈 것 같으면 시작 전에 꼭 취소해주세요. 취소는 노쇼에 포함되지 않아요.</li>
          </ul>
          <p
            className="caption"
            style={{ marginTop: 'var(--space-3)', fontWeight: 600, color: noShow.count > 0 ? 'var(--status-error)' : 'var(--color-text-sub)' }}
          >
            내 노쇼 {noShow.count}/{limit}회
          </p>
        </section>

        {error && (
          <p className="caption" role="alert" style={{ color: 'var(--status-error)' }}>
            {error}
          </p>
        )}

        <button className="btn btn-primary" disabled={!slot || !machineId || !!active || restricted || busy} onClick={confirm}>
          {busy ? '예약하는 중…' : '예약 확정'}
        </button>
      </div>
    </Page>
  );
}
