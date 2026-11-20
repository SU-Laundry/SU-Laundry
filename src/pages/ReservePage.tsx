import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Clock } from 'lucide-react';
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
    const [machines, active] = await Promise.all([api.getMachines(room?.laundry_room_id ?? ''), api.getMyActiveReservation()]);
    return { policy, machines, active };
  }, [dormId]);
  const [slot, setSlot] = useState<string>();
  const [machineId, setMachineId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!data?.policy) return <Page title="예약"><p className="caption">불러오는 중…</p></Page>;
  const { policy, machines, active } = data;
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
              // 확인 중인 기기, 또는 선택한 슬롯에 이미 예약된 기기는 선택 불가
              const disabled = m.current_status === 'UNKNOWN' || (!!slot && m.reserved_from === slot);
              return (
                <button
                  key={m.machine_id}
                  disabled={disabled}
                  onClick={() => setMachineId(m.machine_id)}
                  aria-pressed={machineId === m.machine_id}
                  style={{ ...selectStyle(machineId === m.machine_id), opacity: disabled ? 0.4 : 1 }}
                >
                  {m.machine_number}번
                </button>
              );
            })}
          </div>
        </section>

        <p className="caption">
          예약 시간 {POLICY.graceTimeMinutes}분 안에 사용이 확인되지 않으면 예약이 자동 해제돼요. 예약은 한 번에 하나만 할 수 있어요.
        </p>

        {error && (
          <p className="caption" role="alert" style={{ color: 'var(--status-error)' }}>
            {error}
          </p>
        )}

        <button className="btn btn-primary" disabled={!slot || !machineId || !!active || busy} onClick={confirm}>
          {busy ? '예약하는 중…' : '예약 확정'}
        </button>
      </div>
    </Page>
  );
}
