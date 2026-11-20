import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Loader, Shirt, CalendarClock, AlertTriangle, Wrench } from 'lucide-react';
import type { Machine, MachineStatus, MachineType } from './types';

/**
 * 사용자 화면에 보여주는 상태는 단순하게 유지한다 (2026-11-20 결정).
 *   사용 가능 / 사용 중 / 사용 완료 (+ 피크 시간 예약됨, 고장 신고로 인한 점검 중)
 * 내부 상태 머신(MachineStatus)은 센서 로직용으로 그대로 두고, 화면에서는 아래로 묶어서 표시한다.
 */
export type DisplayStatus = 'AVAILABLE' | 'IN_USE' | 'DONE' | 'RESERVED' | 'MAINTENANCE' | 'UNKNOWN';

export const DISPLAY_OF: Record<MachineStatus, DisplayStatus> = {
  AVAILABLE: 'AVAILABLE',
  PICKUP_ACTION_DETECTED: 'AVAILABLE', // 문 개폐 감지 → 사용 가능으로 표시 (세탁물 남아 있으면 신고로 되돌림)
  IN_USE: 'IN_USE',
  COMPLETED: 'DONE',
  WAITING_PICKUP: 'DONE',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE', // 사용자 고장 신고로 점검 중 (센서 오류가 아님)
  UNKNOWN: 'UNKNOWN', // 실서버 연동 시에만 발생 가능. 목 데이터에는 없음
};

interface DisplayMeta {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

// 색만으로 상태를 전달하지 않는다 → label + icon 항상 함께 사용
export const DISPLAY_META: Record<DisplayStatus, DisplayMeta> = {
  AVAILABLE: { label: '사용 가능', color: 'var(--status-available)', bg: 'var(--status-available-bg)', icon: CheckCircle2 },
  IN_USE: { label: '사용 중', color: 'var(--status-inuse)', bg: 'var(--status-inuse-bg)', icon: Loader },
  DONE: { label: '사용 완료', color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)', icon: Shirt },
  RESERVED: { label: '예약됨', color: 'var(--status-reserved)', bg: 'var(--status-reserved-bg)', icon: CalendarClock },
  MAINTENANCE: { label: '점검 중', color: 'var(--status-maintenance)', bg: 'var(--status-maintenance-bg)', icon: Wrench },
  UNKNOWN: { label: '확인 중', color: 'var(--color-text-sub)', bg: 'var(--color-bg)', icon: AlertTriangle },
};

/** 세탁기 / 건조기 */
export const TYPE_LABEL: Record<MachineType, string> = { WASHER: '세탁기', DRYER: '건조기' };

/** "3번 세탁기" / "2번 건조기" */
export const machineName = (m: Pick<Machine, 'machine_number' | 'machine_type'>) => `${m.machine_number}번 ${TYPE_LABEL[m.machine_type]}`;

/** 카드·상세에 보여주는 부가 정보 한 줄 (내부 상태 기준으로 조금 더 구체적으로) */
export function hintOf(status: MachineStatus, type: MachineType = 'WASHER'): string {
  const job = type === 'DRYER' ? '건조' : '세탁';
  switch (status) {
    case 'AVAILABLE':
      return '지금 바로 사용할 수 있어요';
    case 'PICKUP_ACTION_DETECTED':
      return '방금 비워졌어요';
    case 'IN_USE':
      return `${job}가 진행 중이에요`;
    case 'COMPLETED':
    case 'WAITING_PICKUP':
      return '수거를 기다리고 있어요';
    case 'RESERVED':
      return `예약된 ${TYPE_LABEL[type]}예요`;
    case 'MAINTENANCE':
      return '고장 신고로 점검 중이에요';
    case 'UNKNOWN':
      return '상태를 불러오고 있어요';
  }
}

/** 기존 호출부 호환용 (세탁기 기준 문구) */
export const HINT = Object.fromEntries(
  (Object.keys(DISPLAY_OF) as MachineStatus[]).map((s) => [s, hintOf(s)]),
) as Record<MachineStatus, string>;

export const displayOf = (s: MachineStatus) => DISPLAY_OF[s];
