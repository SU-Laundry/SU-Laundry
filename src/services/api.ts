// 데이터 접근 계층. 지금은 목 데이터를 반환하고, 백엔드가 생기면 이 파일만 fetch로 교체한다.
import * as mock from '@/mocks/data';
import { POLICY } from '@/config/policy';
import type { Machine } from '@/domain/types';

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/** 오래된 센서 데이터를 실시간처럼 보여주지 않는다 → 확인 필요 */
function withStaleCheck(m: Machine): Machine {
  const age = (Date.now() - new Date(m.last_seen_at).getTime()) / 1000;
  return age > POLICY.sensorStaleSeconds ? { ...m, current_status: 'UNKNOWN' } : m;
}

export const api = {
  getDormitories: () => delay(mock.dormitories),
  getCurrentUser: () => delay(mock.currentUser),
  getRoomsByDormitory: (dormitoryId: string) =>
    delay(mock.laundryRooms.filter((r) => r.dormitory_id === dormitoryId)),
  getMachines: (roomId: string) =>
    delay(mock.machines.filter((m) => m.laundry_room_id === roomId).map(withStaleCheck)),
  getMachine: (machineId: string) =>
    delay(mock.machines.map(withStaleCheck).find((m) => m.machine_id === machineId)),
  getPeakPolicy: (policyId: string) => delay(mock.peakPolicies.find((p) => p.peak_policy_id === policyId)),
  getNotifications: () => delay(mock.notifications),
};
