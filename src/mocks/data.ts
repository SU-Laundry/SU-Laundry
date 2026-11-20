// 센서/백엔드 연동 전 사용하는 목 데이터. 필드명은 기획서 데이터 모델을 따른다.
import type { AppNotification, Dormitory, LaundryRoom, Machine, PeakPolicy } from '@/domain/types';

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

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

const washer = (n: number, status: Machine['current_status'], extra: Partial<Machine> = {}): Machine => ({
  machine_id: `zion-b1-${n}`,
  laundry_room_id: 'zion-b1',
  machine_number: n,
  machine_type: 'WASHER',
  current_status: status,
  sensor_node_id: `node-${n}`,
  last_seen_at: minsAgo(0),
  ...extra,
});

export const machines: Machine[] = [
  washer(1, 'AVAILABLE'),
  washer(2, 'IN_USE', { started_at: minsAgo(25) }),
  washer(3, 'WAITING_PICKUP', { started_at: minsAgo(70) }),
  washer(4, 'RESERVED', { reserved_from: '20:00' }),
  washer(5, 'AVAILABLE', { last_seen_at: minsAgo(1) }),
  washer(6, 'IN_USE', { started_at: minsAgo(10) }),
  washer(7, 'COMPLETED', { started_at: minsAgo(55) }),
  washer(8, 'AVAILABLE', { last_seen_at: minsAgo(30) }), // 센서 끊김 → api에서 UNKNOWN 처리
];

export const notifications: AppNotification[] = [
  { id: 'a1', type: 'N01_COMPLETED', message: '3번 세탁기의 세탁이 완료되었습니다. 세탁물을 수거해주세요.', created_at: minsAgo(5), read: false },
  { id: 'a2', type: 'N04_RESERVATION_START', message: '20:00부터 4번 세탁기를 예약했습니다. 예약 시간에 맞춰 이용해주세요.', created_at: minsAgo(40), read: true },
  { id: 'a3', type: 'SYSTEM', message: '8번 세탁기 센서를 점검하고 있어요.', created_at: minsAgo(120), read: true },
];

/** 목 사용자 — 현재 3번 세탁기 이용 중 */
export const currentUser = { user_id: 'me', dormitory_id: 'zion', laundry_room_id: 'zion-b1', machine_id: 'zion-b1-3' };
