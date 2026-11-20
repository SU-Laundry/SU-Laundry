import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Loader, Sparkles, Shirt, CalendarClock, AlertTriangle, DoorOpen } from 'lucide-react';
import type { MachineStatus } from './types';

interface StatusMeta {
  label: string;
  /** 카드 부가 정보 한 줄 */
  hint: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

// 색만으로 상태를 전달하지 않는다 → label + icon 항상 함께 사용
export const STATUS_META: Record<MachineStatus, StatusMeta> = {
  AVAILABLE: { label: '사용 가능', hint: '지금 바로 사용할 수 있어요', color: 'var(--status-available)', bg: 'var(--status-available-bg)', icon: CheckCircle2 },
  RESERVED: { label: '예약됨', hint: '예약된 세탁기예요', color: 'var(--status-reserved)', bg: 'var(--status-reserved-bg)', icon: CalendarClock },
  IN_USE: { label: '사용 중', hint: '세탁이 진행 중이에요', color: 'var(--status-inuse)', bg: 'var(--status-inuse-bg)', icon: Loader },
  COMPLETED: { label: '세탁 완료', hint: '세탁이 끝났어요', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)', icon: Sparkles },
  WAITING_PICKUP: { label: '수거 대기', hint: '세탁 종료 후 수거 확인 중', color: 'var(--status-pickup)', bg: 'var(--status-pickup-bg)', icon: Shirt },
  PICKUP_ACTION_DETECTED: { label: '수거 동작 감지', hint: '곧 사용 가능해질 예정이에요', color: 'var(--status-available)', bg: 'var(--status-available-bg)', icon: DoorOpen },
  UNKNOWN: { label: '확인 필요', hint: '센서 연결을 확인하고 있어요', color: 'var(--status-error)', bg: 'var(--status-error-bg)', icon: AlertTriangle },
};
