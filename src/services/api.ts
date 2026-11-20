// 데이터 접근 계층. 지금은 목 데이터를 반환하고, 백엔드가 생기면 이 파일만 fetch로 교체한다.
import * as mock from '@/mocks/data';
import { POLICY } from '@/config/policy';
import { displayOf } from '@/domain/status';
import type { Machine, PickupRequest } from '@/domain/types';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/**
 * 목 데이터는 항상 방금 통신한 것으로 간주한다 (페이지를 오래 열어둬도 '확인 중'으로 바뀌지 않게).
 * 실서버 연동 시: 센서 마지막 통신이 POLICY.sensorStaleSeconds 보다 오래되면 서버에서 UNKNOWN 처리.
 */
const live = (m: Machine): Machine => ({ ...m, last_seen_at: new Date().toISOString() });

const roomOf = (dormitoryId: string) => mock.laundryRooms.find((r) => r.dormitory_id === dormitoryId);
const machinesIn = (roomId: string) => mock.machines.filter((m) => m.laundry_room_id === roomId);

/** 내가 지금 쓰고 있는(마지막 세션이 나인) 세탁기 */
const myMachineIn = (roomId: string) =>
  machinesIn(roomId).find((m) => mock.sessions.find((s) => s.session_id === m.current_session_id)?.user_id === mock.ME);

export type PickupRequestError = 'NO_SESSION' | 'OWN_MACHINE' | 'IN_USE';

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
  getNotifications: () => delay(mock.notifications),

  /** 세탁기 상세에 필요한 맥락: 이전 사용자가 나인지, 내가 이미 요청했는지 */
  getMachineContext: (machineId: string) => {
    const m = mock.machines.find((x) => x.machine_id === machineId);
    const session = mock.sessions.find((s) => s.session_id === m?.current_session_id);
    const myRequest = mock.pickupRequests
      .filter((r) => r.session_id === session?.session_id && r.reporter_user_id === mock.ME)
      .slice(-1)[0];
    return delay({
      machine: m && live(m),
      hasPreviousUser: !!session,
      isMine: session?.user_id === mock.ME,
      myRequest,
    });
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
