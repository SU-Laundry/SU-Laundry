import type { LucideIcon } from 'lucide-react';
import { CalendarClock, CheckCircle2, Loader, MinusCircle, AlarmClockOff } from 'lucide-react';
import type { ReservationStatus } from './types';

/** 예약 상태 표시 (색 + 아이콘 + 텍스트) */
export const RESERVATION_META: Record<ReservationStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  BOOKED: { label: '예약됨', color: 'var(--status-reserved)', bg: 'var(--status-reserved-bg)', icon: CalendarClock },
  CHECKED_IN: { label: '이용 중', color: 'var(--status-inuse)', bg: 'var(--status-inuse-bg)', icon: Loader },
  DONE: { label: '이용 완료', color: 'var(--status-available)', bg: 'var(--status-available-bg)', icon: CheckCircle2 },
  CANCELLED: { label: '취소함', color: 'var(--color-text-sub)', bg: 'var(--color-bg)', icon: MinusCircle },
  AUTO_RELEASED: { label: '미이용 자동 해제', color: 'var(--status-error)', bg: 'var(--status-error-bg)', icon: AlarmClockOff },
};

/** 아직 끝나지 않은(예정·진행 중) 예약인지 */
export const isActiveReservation = (s: ReservationStatus) => s === 'BOOKED' || s === 'CHECKED_IN';
