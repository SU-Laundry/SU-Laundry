import { useEffect, useState } from 'react';

/** 간단한 비동기 로딩 훅 — 서버 연동 시 react-query 등으로 교체 가능 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);

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
  }, deps);

  return { data, loading };
}
