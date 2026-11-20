import { useEffect, useState } from 'react';

/** 현재 시각을 주기적으로 갱신 (경과 시간 표시용) */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
