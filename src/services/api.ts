// 데이터 접근 계층. 지금은 목 데이터를 반환하고, 백엔드가 생기면 이 파일만 fetch로 교체한다.
import * as mock from '@/mocks/data';
import { DEFAULT_PEAK, POLICY } from '@/config/policy';
import { displayOf } from '@/domain/status';
import type { FaultCategory, FaultReport, Machine, PickupRequest, Reservation } from '@/domain/types';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/**
 * 목 데이터는 항상 방금 통신한 것으로 간주한다 (페이지를 오래 열어둬도 '확인 중'으로 바뀌지 않게).
 * 실서버 연동 시: 센서 마지막 통신이 POLICY.sensorStaleSeconds 보다 오래되면 서버에서 UNKNOWN 처리.
 */
const live = (m: Machine): Machine => ({ ...m, last_seen_at: new Date().toISOString() });

const roomOf = (dormitoryId: string) => mock.laundryRooms.find((r) => r.dormitory_id === dormitoryId);
/** 세탁실의 기기 — 세탁기 먼저, 그다음 건조기 (각각 번호순) */
const machinesIn = (roomId: string) =>
  mock.machines
    .filter((m) => m.laundry_room_id === roomId)
    .sort((a, b) => (a.machine_type === b.machine_type ? a.machine_number - b.machine_number : a.machine_type === 'WASHER' ? -1 : 1));

/** 내가 지금 쓰고 있는(마지막 세션이 나인) 세탁기 */
const myMachineIn = (roomId: string) =>
  machinesIn(roomId).find((m) => mock.sessions.find((s) => s.session_id === m.current_session_id)?.user_id === mock.ME);

export type PickupRequestError = 'NO_SESSION' | 'OWN_MACHINE' | 'IN_USE';
export type ReservationError = 'ACTIVE_EXISTS' | 'TAKEN' | 'NOT_FOUND' | 'STARTED' | 'RESTRICTED' | 'UNAVAILABLE';
export type FaultReportError = 'NOT_FOUND' | 'EMPTY';

/** 노쇼 현황: 지금까지 센 횟수(제한 끝나면 0부터 다시), 예약 제한 중이면 해제 시각 */
export interface NoShowStatus {
  count: number;
  limit: number;
  restrictedUntil?: string;
}

/** 화면용 예약: 세탁기 번호 포함, 상태는 시간 경과까지 반영 */
export type ReservationView = Reservation & { machine_number: number };

/**
 * 예약 상태를 시간 기준으로 보정 (실서버에서는 서버가 처리할 일).
 * 예약 시작 후 Grace Time이 지나도 사용 시작이 없으면 미이용 자동 해제(N05).
 */
function effectiveStatus(r: Reservation, now = Date.now()): Reservation['reservation_status'] {
  const graceEnd = new Date(r.start_time).getTime() + POLICY.graceTimeMinutes * 60_000;
  if (r.reservation_status === 'BOOKED' && now > graceEnd) return 'AUTO_RELEASED';
  return r.reservation_status;
}

const toView = (r: Reservation): ReservationView => ({
  ...r,
  reservation_status: effectiveStatus(r),
  machine_number: mock.machines.find((m) => m.machine_id === r.machine_id)?.machine_number ?? 0,
});

/**
 * 노쇼 패널티 계산 (실서버에서는 서버가 User.reservation_restriction_status로 관리).
 * 미이용 자동 해제가 POLICY.noShow.limit회 쌓이면 마지막 노쇼 시각부터 restrictDays일 동안 예약 불가,
 * 제한 기간이 끝나면 횟수는 0부터 다시 센다.
 */
function noShowStatus(now = Date.now()): NoShowStatus {
  const { limit, restrictDays } = POLICY.noShow;
  const times = mock.reservations
    .filter((r) => r.user_id === mock.ME && effectiveStatus(r, now) === 'AUTO_RELEASED')
    .map((r) => new Date(r.start_time).getTime() + POLICY.graceTimeMinutes * 60_000)
    .sort((a, b) => a - b);
  let count = 0;
  let until = 0;
  for (const t of times) {
    if (t < until) continue; // 제한 기간 중엔 예약 자체가 불가 — 방어적으로 무시
    count += 1;
    if (count >= limit) {
      until = t + restrictDays * 86_400_000;
      count = 0;
    }
  }
  return until > now ? { count: limit, limit, restrictedUntil: new Date(until).toISOString() } : { count, limit };
}

const myActiveReservation = () =>
  mock.reservations.map(toView).find((r) => r.user_id === mock.ME && (r.reservation_status === 'BOOKED' || r.reservation_status === 'CHECKED_IN'));

export const api = {
  getDormitories: () => delay(mock.dormitories),

  /** 생활관 선택 화면용 요약: 세탁기 수, 지금 사용 가능 수 */
  getDormitorySummaries: () =>
    delay(
      mock.dormitories.map((d) => {
        const ms = machinesIn(roomOf(d.dormitory_id)?.laundry_room_id ?? '');
        return {
          ...d,
          total: ms.length,
          washers: ms.filter((m) => m.machine_type === 'WASHER').length,
          dryers: ms.filter((m) => m.machine_type === 'DRYER').length,
          available: ms.filter((m) => displayOf(m.current_status) === 'AVAILABLE').length,
        };
      }),
    ),

  /** 선택한 생활관의 세탁실 + 피크 정책 */
  getDormitoryContext: (dormitoryId: string) => {
    const dorm = mock.dormitories.find((d) => d.dormitory_id === dormitoryId);
    const room = roomOf(dormitoryId);
    const policy = mock.peakPolicies.find((p) => p.peak_policy_id === room?.peak_policy_id);
    return delay({ dorm, room, policy });
  },

  getMachines: (roomId: string) => delay(machinesIn(roomId).map(live)),
  getMachine: (machineId: string) => {
    const m = mock.machines.find((x) => x.machine_id === machineId);
    return delay(m && live(m));
  },
  getMyMachine: (roomId: string) => {
    const m = myMachineIn(roomId);
    return delay(m && live(m));
  },

  /** 세탁 완료 안내 화면용: 내 세탁기 + 세션(시작·완료·수거 시각) + 받은 수거 요청 */
  getMyLaundry: (roomId: string) => {
    const m = myMachineIn(roomId);
    const session = mock.sessions.find((s) => s.session_id === m?.current_session_id);
    const requests = m
      ? mock.pickupRequests.filter((r) => r.machine_id === m.machine_id && r.target_user_id === mock.ME && r.resolution === 'PENDING')
      : [];
    return delay({ machine: m && live(m), session, requests });
  },
  getNotifications: () => delay(mock.notifications),

  /* ---------- 예약 ---------- */

  /** 내 예약 내역 (현재 생활관 세탁실 기준), 최신순 */
  getMyReservations: (dormitoryId: string) => {
    const roomId = roomOf(dormitoryId)?.laundry_room_id;
    const inRoom = new Set(machinesIn(roomId ?? '').map((m) => m.machine_id));
    return delay(
      mock.reservations
        .filter((r) => r.user_id === mock.ME && inRoom.has(r.machine_id))
        .map(toView)
        .sort((a, b) => b.start_time.localeCompare(a.start_time)),
    );
  },

  /** 진행 중이거나 예정된 내 예약 (생활관 무관 — 동시에 1개만 허용) */
  getMyActiveReservation: () => delay(myActiveReservation()),

  /** 노쇼 횟수·예약 제한 여부 */
  getNoShowStatus: () => delay(noShowStatus()),

  /**
   * 예약하기 — 슬롯의 다음 시작 시각(지났으면 내일)으로 만든다.
   * 정책: 동시에 POLICY.maxActiveReservationsPerUser(1)개까지, 같은 세탁기·같은 시각 중복 불가,
   * 노쇼 누적으로 제한 중이면 불가, 점검 중인 기기는 불가.
   */
  createReservation: async (machineId: string, start: Date): Promise<ReservationView> => {
    if (noShowStatus().restrictedUntil) throw new Error('RESTRICTED' satisfies ReservationError);
    if (myActiveReservation()) throw new Error('ACTIVE_EXISTS' satisfies ReservationError);
    const machine = mock.machines.find((m) => m.machine_id === machineId);
    if (!machine || machine.current_status === 'MAINTENANCE') throw new Error('UNAVAILABLE' satisfies ReservationError);
    const taken = mock.reservations
      .map(toView)
      .some((r) => r.machine_id === machineId && r.start_time === start.toISOString() && r.reservation_status === 'BOOKED');
    if (taken) throw new Error('TAKEN' satisfies ReservationError);

    const r: Reservation = {
      reservation_id: `r-${Date.now()}`,
      user_id: mock.ME,
      machine_id: machineId,
      start_time: start.toISOString(),
      end_time: new Date(start.getTime() + DEFAULT_PEAK.slotMinutes * 60_000).toISOString(),
      reservation_status: 'BOOKED',
    };
    mock.reservations.push(r);
    // TODO(백엔드): 시작 POLICY.reservationReminderMinutes 전 N04 PUSH 예약
    return delay(toView(r), 300);
  },

  /** 예약 취소 — 시작 전에만 가능 (기획서 17.2) */
  cancelReservation: async (reservationId: string): Promise<ReservationView> => {
    const r = mock.reservations.find((x) => x.reservation_id === reservationId);
    if (!r) throw new Error('NOT_FOUND' satisfies ReservationError);
    if (new Date(r.start_time).getTime() <= Date.now()) throw new Error('STARTED' satisfies ReservationError);
    r.reservation_status = 'CANCELLED';
    return delay(toView(r), 300);
  },

  /** 세탁기 상세에 필요한 맥락: 이전 사용자가 나인지, 내가 이미 요청했는지 */
  getMachineContext: (machineId: string) => {
    const m = mock.machines.find((x) => x.machine_id === machineId);
    const session = mock.sessions.find((s) => s.session_id === m?.current_session_id);
    const myRequest = mock.pickupRequests
      .filter((r) => r.session_id === session?.session_id && r.reporter_user_id === mock.ME)
      .slice(-1)[0];
    const faultReport = mock.faultReports
      .filter((r) => r.machine_id === machineId && r.status !== 'RESOLVED')
      .slice(-1)[0];
    return delay({
      machine: m && live(m),
      hasPreviousUser: !!session,
      isMine: session?.user_id === mock.ME,
      myRequest,
      faultReport,
    });
  },

  /* ---------- 고장 신고 ---------- */

  /**
   * 고장 신고 — 접수되면 기기를 바로 '점검 중'으로 바꾼다 (관리자가 점검을 마치면 해제).
   * 이미 점검 중이면 새로 만들지 않고 진행 중인 신고를 돌려준다.
   * TODO(백엔드): 사진은 업로드 후 URL 저장, 관리자에게 알림, 점검 중 기기의 예약자에게 안내
   */
  createFaultReport: async (
    machineId: string,
    input: { category: FaultCategory; description: string; photos: string[] },
  ): Promise<FaultReport> => {
    const m = mock.machines.find((x) => x.machine_id === machineId);
    if (!m) throw new Error('NOT_FOUND' satisfies FaultReportError);
    const open = mock.faultReports.find((r) => r.machine_id === machineId && r.status !== 'RESOLVED');
    if (open && m.current_status === 'MAINTENANCE') return delay(open);

    const report: FaultReport = {
      report_id: `fr-${Date.now()}`,
      machine_id: machineId,
      reporter_user_id: mock.ME,
      category: input.category,
      description: input.description.trim().slice(0, POLICY.faultReport.maxDescription),
      photo_urls: input.photos.slice(0, POLICY.faultReport.maxPhotos),
      reported_at: new Date().toISOString(),
      status: 'OPEN',
    };
    mock.faultReports.push(report);
    m.current_status = 'MAINTENANCE';
    m.maintenance_since = report.reported_at;
    m.started_at = undefined;
    const name = `${m.machine_number}번 ${m.machine_type === 'DRYER' ? '건조기' : '세탁기'}`;
    mock.notifications.unshift({
      id: `n-${report.report_id}`,
      type: 'SYSTEM',
      message: `${name} 고장 신고가 접수됐어요. 점검이 끝날 때까지 '점검 중'으로 표시돼요.`,
      created_at: report.reported_at,
      read: false,
    });
    return delay(report, 500);
  },

  /** 내 세탁기에 들어온 처리 전 수거 요청 */
  getPickupRequestsForMe: (machineId: string) =>
    delay(
      mock.pickupRequests.filter(
        (r) => r.machine_id === machineId && r.target_user_id === mock.ME && r.resolution === 'PENDING',
      ),
    ),

  /**
   * "세탁물이 남아 있어요" → 이전 사용자에게 수거 요청 (N03)
   * - 세션의 사용자 = 대상자(target). 벌점 집계를 위해 신고자·대상자·세션을 함께 저장
   * - 같은 세션에 대한 내 요청은 쿨다운 동안 새로 만들지 않고 기존 요청을 돌려준다
   * - 기계 상태는 다시 '사용 완료(수거 대기)'로 되돌린다
   */
  createPickupRequest: async (machineId: string): Promise<PickupRequest> => {
    const m = mock.machines.find((x) => x.machine_id === machineId);
    const session = mock.sessions.find((s) => s.session_id === m?.current_session_id);
    if (!m || !session) throw new Error('NO_SESSION' satisfies PickupRequestError);
    if (session.user_id === mock.ME) throw new Error('OWN_MACHINE' satisfies PickupRequestError);
    if (m.current_status === 'IN_USE') throw new Error('IN_USE' satisfies PickupRequestError);

    const cooldownMs = POLICY.pickupRequestCooldownMinutes * 60_000;
    const recent = mock.pickupRequests.find(
      (r) =>
        r.session_id === session.session_id &&
        r.reporter_user_id === mock.ME &&
        Date.now() - new Date(r.requested_at).getTime() < cooldownMs,
    );
    if (recent) return delay(recent);

    const req: PickupRequest = {
      request_id: `pr-${Date.now()}`,
      machine_id: m.machine_id,
      session_id: session.session_id,
      reporter_user_id: mock.ME,
      target_user_id: session.user_id,
      requested_at: new Date().toISOString(),
      resolution: 'PENDING',
    };
    mock.pickupRequests.push(req);
    m.current_status = 'WAITING_PICKUP';
    // TODO(백엔드): 대상자에게 N03 PUSH 발송
    return delay(req, 400);
  },
};
