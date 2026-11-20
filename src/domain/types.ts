// 서비스 기획서 11장(상태 머신) · 16장(데이터 모델) 기준

export type MachineStatus =
  | 'AVAILABLE' // 사용 가능
  | 'RESERVED' // 예약됨 (피크 시간에만)
  | 'IN_USE' // 사용 중
  | 'COMPLETED' // 세탁 완료
  | 'WAITING_PICKUP' // 수거 대기
  | 'PICKUP_ACTION_DETECTED' // 수거 동작 감지 (수거 "완료"가 아님)
  | 'UNKNOWN'; // 센서 연결 끊김 → 확인 필요

export interface Dormitory {
  dormitory_id: string;
  name: string;
}

export interface LaundryRoom {
  laundry_room_id: string;
  dormitory_id: string;
  floor: string;
  peak_policy_id: string;
}

export interface Machine {
  machine_id: string;
  laundry_room_id: string;
  machine_number: number;
  machine_type: 'WASHER' | 'DRYER';
  current_status: MachineStatus;
  sensor_node_id: string;
  /** 센서 마지막 통신 시각 (ISO) — 오래되면 UNKNOWN 처리 */
  last_seen_at: string;
  /** 현재 세션 시작 시각 (IN_USE 이후) */
  started_at?: string;
  /** 다음 예약 시작 시각 "HH:mm" (RESERVED) */
  reserved_from?: string;
}

export type ReservationStatus = 'BOOKED' | 'CHECKED_IN' | 'CANCELLED' | 'AUTO_RELEASED' | 'DONE';

export interface Reservation {
  reservation_id: string;
  user_id: string;
  machine_id: string;
  start_time: string;
  end_time: string;
  reservation_status: ReservationStatus;
  checked_in_at?: string;
}

export interface LaundrySession {
  session_id: string;
  user_id: string;
  machine_id: string;
  started_at: string;
  completed_at?: string;
  pickup_action_at?: string;
}

export interface PeakPolicy {
  peak_policy_id: string;
  /** "HH:mm" */
  start: string;
  end: string;
  slot_minutes: number;
}

export type NotificationType =
  | 'N01_COMPLETED'
  | 'N02_PICKUP_REMIND'
  | 'N03_PICKUP_REQUEST'
  | 'N04_RESERVATION_START'
  | 'N05_RESERVATION_RELEASED'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  created_at: string;
  read: boolean;
}
