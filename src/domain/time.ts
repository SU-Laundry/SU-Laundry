// 날짜·시간 표시 공통 함수

export const fmtTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "오늘" / "내일" / "어제" / "11월 18일 (수)" */
export function fmtDay(iso: string, now = Date.now()) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(d) - startOfDay(new Date(now))) / 86_400_000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

/** 남은 시간 "1시간 20분" / "15분" / "1분 미만" */
export function fmtDuration(ms: number) {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return '1분 미만';
  const h = Math.floor(min / 60);
  return h ? `${h}시간 ${min % 60}분` : `${min}분`;
}
