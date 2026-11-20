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
  /** 마지막(현재) 세탁 세션 — 수거 요청 시 "이전 사용자"를 찾는 기준 */
  current_session_id?: string;
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

/**
 * 수거 요청 ("세탁물이 남아 있어요" 신고)
 * 추후 벌점 제도: target_user_id 기준으로 resolution이 CONFIRMED인 요청을 누적해 벌점 산정 예정.
 * 그래서 신고자·대상자·세션·처리 결과를 모두 남긴다.
 */
export type PickupRequestResolution =
  | 'PENDING' // 요청됨, 아직 처리 전
  | 'CONFIRMED' // 세탁물이 실제로 남아 있었음 (벌점 집계 대상)
  | 'DISMISSED'; // 허위/착오로 판단 (벌점 집계 제외, 반복 시 신고자 쪽 검토)

export interface PickupRequest {
  request_id: string;
  machine_id: string;
  session_id: string;
  /** 신고한 사람 (다음 사용자) */
  reporter_user_id: string;
  /** 알림 받는 사람 (이전 사용자) — 벌점 대상 */
  target_user_id: string;
  requested_at: string;
  resolved_at?: string;
  resolution: PickupRequestResolution;
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
