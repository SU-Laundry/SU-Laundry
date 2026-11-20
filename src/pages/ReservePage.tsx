import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { InfoBanner } from '@/components/InfoBanner';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { isPeakNow, peakSlots } from '@/domain/peak';
import { POLICY } from '@/config/policy';

/** 피크 시간 예약 — 예약 색(보라)으로 상태와 구분, 타임테이블 내부에 캐릭터 금지 */
export default function ReservePage() {
  const navigate = useNavigate();
  const { data } = useAsync(async () => {
    const [policy, machines] = await Promise.all([api.getPeakPolicy('default'), api.getMachines('zion-b1')]);
    return { policy, machines };
  });
  const [slot, setSlot] = useState<string>();
  const [machineId, setMachineId] = useState<string>();

  if (!data?.policy) return <Page title="예약"><p className="caption">불러오는 중…</p></Page>;
  const { policy, machines } = data;
  const peak = isPeakNow(policy);

  const selectStyle = (active: boolean) => ({
    height: 48,
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${active ? 'var(--status-reserved)' : 'var(--color-border)'}`,
    background: active ? 'var(--status-reserved-bg)' : 'var(--color-surface)',
    color: active ? 'var(--status-reserved)' : 'var(--color-text-main)',
    fontWeight: 600,
  });

  return (
    <Page title="예약">
      <div className="stack">
        <InfoBanner icon={Clock} title={`피크 시간 ${policy.start} ~ ${policy.end}`} color="var(--status-reserved)" bg="var(--status-reserved-bg)">
          {peak ? '피크 시간이라 예약 이용이 가능해요' : `피크 시간 외에는 자유롭게 이용할 수 있어요`}
        </InfoBanner>

        <section>
          <h2 className="section-title">시간 선택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {peakSlots(policy).map((s) => (
              <button key={s} onClick={() => setSlot(s)} aria-pressed={slot === s} style={selectStyle(slot === s)}>
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">세탁기 선택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
            {machines.map((m) => {
              // 센서 끊긴 기기, 또는 선택한 슬롯에 이미 예약된 기기는 선택 불가
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
          예약 시간 {POLICY.graceTimeMinutes}분 안에 사용이 확인되지 않으면 예약이 자동 해제돼요.
        </p>

        <button className="btn btn-primary" disabled={!slot || !machineId} onClick={() => navigate('/reserve/done', { state: { slot, machineId } })}>
          예약 확정
        </button>
      </div>
    </Page>
  );
}
