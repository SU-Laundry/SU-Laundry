// 센서/백엔드 연동 전 사용하는 목 데이터. 필드명은 기획서 데이터 모델을 따른다.
// 화면에 보이는 상태는 사용 가능 / 사용 중 / 사용 완료 / 예약됨만 나오도록 구성한다 (센서 오류 상태 없음).
import type { AppNotification, Dormitory, LaundryRoom, LaundrySession, Machine, PeakPolicy, PickupRequest } from '@/domain/types';

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const ME = 'me';

export const dormitories: Dormitory[] = [
  { dormitory_id: 'peniel', name: '브니엘관' },
  { dormitory_id: 'salem', name: '살렘관' },
  { dormitory_id: 'zion', name: '시온관' },
  { dormitory_id: 'eden', name: '에덴관' },
  { dormitory_id: 'newstart', name: '뉴스타트관' },
];

export const laundryRooms: LaundryRoom[] = [
  { laundry_room_id: 'zion-b1', dormitory_id: 'zion', floor: 'B1', peak_policy_id: 'default' },
];

export const peakPolicies: PeakPolicy[] = [
  { peak_policy_id: 'default', start: '19:00', end: '22:00', slot_minutes: 60 },
];

/** 세탁 세션 — "이전 사용자"를 찾는 기준 */
export const sessions: LaundrySession[] = [
  { session_id: 's1', user_id: 'u1', machine_id: 'zion-b1-1', started_at: minsAgo(180), completed_at: minsAgo(130), pickup_action_at: minsAgo(120) },
  { session_id: 's2', user_id: 'u2', machine_id: 'zion-b1-2', started_at: minsAgo(25) },
  { session_id: 's3', user_id: ME, machine_id: 'zion-b1-3', started_at: minsAgo(70), completed_at: minsAgo(20) },
  { session_id: 's5', user_id: 'u5', machine_id: 'zion-b1-5', started_at: minsAgo(240), completed_at: minsAgo(190), pickup_action_at: minsAgo(185) },
  { session_id: 's6', user_id: 'u6', machine_id: 'zion-b1-6', started_at: minsAgo(10) },
  { session_id: 's7', user_id: 'u7', machine_id: 'zion-b1-7', started_at: minsAgo(55), completed_at: minsAgo(5) },
  { session_id: 's8', user_id: 'u8', machine_id: 'zion-b1-8', started_at: minsAgo(90), completed_at: minsAgo(40), pickup_action_at: minsAgo(3) },
];

const washer = (n: number, status: Machine['current_status'], extra: Partial<Machine> = {}): Machine => ({
  machine_id: `zion-b1-${n}`,
  laundry_room_id: 'zion-b1',
  machine_number: n,
  machine_type: 'WASHER',
  current_status: status,
  sensor_node_id: `node-${n}`,
  last_seen_at: minsAgo(0),
  current_session_id: sessions.find((s) => s.machine_id === `zion-b1-${n}`)?.session_id,
  ...extra,
});

export const machines: Machine[] = [
  washer(1, 'AVAILABLE'),
  washer(2, 'IN_USE', { started_at: minsAgo(25) }),
  washer(3, 'WAITING_PICKUP', { started_at: minsAgo(70) }), // 내 세탁기 — 완료 후 수거 전
  washer(4, 'RESERVED', { reserved_from: '20:00' }),
  washer(5, 'AVAILABLE'),
  washer(6, 'IN_USE', { started_at: minsAgo(10) }),
  washer(7, 'COMPLETED', { started_at: minsAgo(55) }), // 다른 사람 — 완료, 수거 전 → 신고 시연용
  washer(8, 'PICKUP_ACTION_DETECTED', { started_at: minsAgo(90) }), // 문 열렸다 닫힘 → 사용 가능 표시, 실제론 남아 있을 수 있음
];

/** 수거 요청 — 내 3번 세탁기에 대해 다음 사용자가 이미 한 번 요청한 상태 (받은 쪽 화면 시연용) */
export const pickupRequests: PickupRequest[] = [
  {
    request_id: 'pr1',
    machine_id: 'zion-b1-3',
    session_id: 's3',
    reporter_user_id: 'u9',
    target_user_id: ME,
    requested_at: minsAgo(4),
    resolution: 'PENDING',
  },
];

export const notifications: AppNotification[] = [
  { id: 'a0', type: 'N03_PICKUP_REQUEST', message: '3번 세탁기에 세탁물이 남아 있습니다. 확인 부탁드립니다.', created_at: minsAgo(4), read: false },
  { id: 'a1', type: 'N01_COMPLETED', message: '3번 세탁기의 세탁이 완료되었습니다. 세탁물을 수거해주세요.', created_at: minsAgo(20), read: false },
  { id: 'a2', type: 'N04_RESERVATION_START', message: '20:00부터 4번 세탁기를 예약했습니다. 예약 시간에 맞춰 이용해주세요.', created_at: minsAgo(40), read: true },
];

/** 목 사용자 — 현재 3번 세탁기 이용 중 */
export const currentUser = { user_id: ME, dormitory_id: 'zion', laundry_room_id: 'zion-b1', machine_id: 'zion-b1-3' };
