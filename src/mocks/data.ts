// 센서/백엔드 연동 전 사용하는 목 데이터. 필드명은 기획서 데이터 모델을 따른다.
// 화면에 보이는 상태는 사용 가능 / 사용 중 / 사용 완료 / 예약됨만 나오도록 구성한다 (센서 오류 상태 없음).
import { DEFAULT_PEAK } from '@/config/policy';
import type {
  AppNotification,
  Dormitory,
  LaundryRoom,
  LaundrySession,
  Machine,
  MachineStatus,
  PeakPolicy,
  PickupRequest,
} from '@/domain/types';

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const ME = 'me';

/** 생활관 목록 (표시 순서 그대로) — 세탁기 수는 2026 운영 제안요청서 기준 */
const DORM_SPECS = [
  { dormitory_id: 'zion', name: '시온관', washers: 8 },
  { dormitory_id: 'peniel', name: '브니엘관', washers: 7 },
  { dormitory_id: 'salem', name: '살렘관', washers: 7 },
  { dormitory_id: 'eden', name: '에덴관', washers: 10 },
  { dormitory_id: 'newstart', name: '뉴스타트관', washers: 2 },
];

export const dormitories: Dormitory[] = DORM_SPECS.map(({ dormitory_id, name }) => ({ dormitory_id, name }));

export const laundryRooms: LaundryRoom[] = DORM_SPECS.map((d) => ({
  laundry_room_id: `${d.dormitory_id}-room`,
  dormitory_id: d.dormitory_id,
  floor: '', // 실제 세탁실 위치 미확인 — 확인되면 채운다
  peak_policy_id: 'default',
}));

export const peakPolicies: PeakPolicy[] = [
  { peak_policy_id: 'default', start: DEFAULT_PEAK.start, end: DEFAULT_PEAK.end, slot_minutes: DEFAULT_PEAK.slotMinutes },
];

/**
 * 세탁기 n번의 상태 패턴. 3번은 항상 "내 세탁기"(사용 완료, 수거 전).
 * 뉴스타트관(2대)에는 3번이 없으므로 "이용 중인 세탁기 없음" 상태를 볼 수 있다.
 */
const PATTERN: MachineStatus[] = [
  'AVAILABLE',
  'IN_USE',
  'WAITING_PICKUP', // 3번 = 내 세탁기
  'RESERVED',
  'AVAILABLE',
  'IN_USE',
  'COMPLETED', // 다른 사람 — 완료, 수거 전 → 수거 요청 시연용
  'PICKUP_ACTION_DETECTED', // 문 열렸다 닫힘 → 사용 가능 표시, 실제론 남아 있을 수 있음
  'IN_USE',
  'AVAILABLE',
];

const STARTED_MINS: Partial<Record<MachineStatus, number>> = {
  IN_USE: 20,
  COMPLETED: 55,
  WAITING_PICKUP: 70,
  PICKUP_ACTION_DETECTED: 90,
  AVAILABLE: 200,
};

export const sessions: LaundrySession[] = [];
export const machines: Machine[] = [];

for (const d of DORM_SPECS) {
  for (let n = 1; n <= d.washers; n++) {
    const status = PATTERN[(n - 1) % PATTERN.length];
    const machine_id = `${d.dormitory_id}-${n}`;
    const started = STARTED_MINS[status];

    // 예약된 기기 외에는 마지막 세션(= 이전 사용자)이 있다
    let session: LaundrySession | undefined;
    if (status !== 'RESERVED' && started !== undefined) {
      session = {
        session_id: `s-${machine_id}`,
        user_id: n === 3 ? ME : `u-${machine_id}`,
        machine_id,
        started_at: minsAgo(started + n), // 기기마다 시간이 조금씩 다르게
        completed_at: status === 'IN_USE' ? undefined : minsAgo(started - 50),
        pickup_action_at: status === 'AVAILABLE' || status === 'PICKUP_ACTION_DETECTED' ? minsAgo(Math.max(started - 87, 1)) : undefined,
      };
      sessions.push(session);
    }

    machines.push({
      machine_id,
      laundry_room_id: `${d.dormitory_id}-room`,
      machine_number: n,
      machine_type: 'WASHER',
      current_status: status,
      sensor_node_id: `node-${machine_id}`,
      last_seen_at: minsAgo(0),
      started_at: status === 'AVAILABLE' ? undefined : session?.started_at,
      reserved_from: status === 'RESERVED' ? '20:00' : undefined,
      current_session_id: session?.session_id,
    });
  }
}

/** 수거 요청 — 각 생활관 내 세탁기(3번)에 다음 사용자가 이미 한 번 요청한 상태 (받은 쪽 화면 시연용) */
export const pickupRequests: PickupRequest[] = machines
  .filter((m) => m.machine_number === 3)
  .map((m) => ({
    request_id: `pr-${m.machine_id}`,
    machine_id: m.machine_id,
    session_id: m.current_session_id!,
    reporter_user_id: `u-other`,
    target_user_id: ME,
    requested_at: minsAgo(4),
    resolution: 'PENDING' as const,
  }));

export const notifications: AppNotification[] = [
  { id: 'a0', type: 'N03_PICKUP_REQUEST', message: '3번 세탁기에 세탁물이 남아 있습니다. 확인 부탁드립니다.', created_at: minsAgo(4), read: false },
  { id: 'a1', type: 'N01_COMPLETED', message: '3번 세탁기의 세탁이 완료되었습니다. 세탁물을 수거해주세요.', created_at: minsAgo(20), read: false },
  { id: 'a2', type: 'N04_RESERVATION_START', message: '20:00부터 4번 세탁기를 예약했습니다. 예약 시간에 맞춰 이용해주세요.', created_at: minsAgo(40), read: true },
];
