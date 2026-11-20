import { useCallback, useEffect, useState } from 'react';

/**
 * 간단한 비동기 로딩 훅 — 서버 연동 시 react-query 등으로 교체 가능
 * reload(): 같은 요청을 다시 실행 (다시 불러오는 동안 기존 data는 유지)
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then((v) => {
      if (alive) {
        setData(v);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, reload };
}
