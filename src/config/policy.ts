// 운영 정책 값 — 파일럿 결과에 따라 조정하므로 하드코딩하지 않고 여기서만 관리한다.
export const POLICY = {
  /** 예약 시작 후 이 시간 안에 진동(사용 시작) 미감지 시 자동 해제 (N05) — 미확정 */
  graceTimeMinutes: 10,
  /** 예약 시작 몇 분 전에 알림 (N04) */
  reservationReminderMinutes: 10,
  /** 완료 후 수거 지연 재알림 간격/횟수 (N02) — 미확정 */
  pickupRemindIntervalMinutes: 15,
  pickupRemindMaxCount: 2,
  /** 센서 마지막 통신이 이 시간보다 오래되면 '확인 필요' */
  sensorStaleSeconds: 120,
  /** 한 사용자가 동시에 가질 수 있는 예약 수 */
  maxActiveReservationsPerUser: 1,
} as const;
