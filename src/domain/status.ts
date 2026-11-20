import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Loader, Shirt, CalendarClock, AlertTriangle } from 'lucide-react';
import type { MachineStatus } from './types';

/**
 * 사용자 화면에 보여주는 상태는 단순하게 유지한다 (2026-11-20 결정).
 *   사용 가능 / 사용 중 / 사용 완료 (+ 피크 시간 예약됨)
 * 내부 상태 머신(MachineStatus)은 센서 로직용으로 그대로 두고, 화면에서는 아래로 묶어서 표시한다.
 */
export type DisplayStatus = 'AVAILABLE' | 'IN_USE' | 'DONE' | 'RESERVED' | 'UNKNOWN';

export const DISPLAY_OF: Record<MachineStatus, DisplayStatus> = {
  AVAILABLE: 'AVAILABLE',
  PICKUP_ACTION_DETECTED: 'AVAILABLE', // 문 개폐 감지 → 사용 가능으로 표시 (세탁물 남아 있으면 신고로 되돌림)
  IN_USE: 'IN_USE',
  COMPLETED: 'DONE',
  WAITING_PICKUP: 'DONE',
  RESERVED: 'RESERVED',
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
  UNKNOWN: { label: '확인 중', color: 'var(--color-text-sub)', bg: 'var(--color-bg)', icon: AlertTriangle },
};

/** 카드·상세에 보여주는 부가 정보 한 줄 (내부 상태 기준으로 조금 더 구체적으로) */
export const HINT: Record<MachineStatus, string> = {
  AVAILABLE: '지금 바로 사용할 수 있어요',
  PICKUP_ACTION_DETECTED: '방금 비워졌어요',
  IN_USE: '세탁이 진행 중이에요',
  COMPLETED: '수거를 기다리고 있어요',
  WAITING_PICKUP: '수거를 기다리고 있어요',
  RESERVED: '예약된 세탁기예요',
  UNKNOWN: '상태를 불러오고 있어요',
};

export const displayOf = (s: MachineStatus) => DISPLAY_OF[s];
