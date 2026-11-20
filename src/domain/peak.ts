import type { PeakPolicy } from './types';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHmm = (t: number) =>
  `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

/** 지금이 피크 시간인지 — 예약 UI는 피크 시간에만 활성화 */
export function isPeakNow(p: PeakPolicy, at = new Date()) {
  const n = at.getHours() * 60 + at.getMinutes();
  return n >= toMin(p.start) && n < toMin(p.end);
}

/**
 * 슬롯("HH:mm")의 다음 시작 시각.
 * 오늘 그 시각이 이미 지났으면 내일 같은 시각으로 — 지나간 시간에는 예약하지 않는다.
 */
export function nextSlotStart(slot: string, now = Date.now()): Date {
  const [h, m] = slot.split(':').map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (t.getTime() <= now) t.setDate(t.getDate() + 1);
  return t;
}

export function peakSlots(p: PeakPolicy): string[] {
  const out: string[] = [];
  for (let t = toMin(p.start); t < toMin(p.end); t += p.slot_minutes) out.push(toHHmm(t));
  return out;
}
