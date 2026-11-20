// 운영 정책 값 — 파일럿 결과에 따라 조정하므로 하드코딩하지 않고 여기서만 관리한다.
/** 기본 피크 시간 (관리자 설정 값 — 세탁실별 PeakPolicy의 기본값). 2026-11-20: 18~22시로 결정 */
export const DEFAULT_PEAK = { start: '18:00', end: '22:00', slotMinutes: 60 } as const;

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
  /** 같은 세션에 대해 한 사람이 수거 요청을 다시 보낼 수 있는 간격 (중복·도배 방지) */
  pickupRequestCooldownMinutes: 10,
  /**
   * (예정) 벌점 제도 — 아직 미적용, 값도 미확정.
   * CONFIRMED 된 수거 요청을 대상자에게 누적해 기준을 넘으면 예약 제한 등에 사용.
   */
  penalty: {
    enabled: false,
    pointsPerConfirmedRequest: 1,
    restrictThreshold: 3,
    windowDays: 30,
  },
} as const;
