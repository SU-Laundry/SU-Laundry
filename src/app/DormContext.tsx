import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { prefs } from '@/services/prefs';
import { dormitories } from '@/mocks/data';

interface DormState {
  /** 선택한 생활관 id — 아직 고르지 않았으면 undefined */
  dormId?: string;
  setDormId: (id: string) => void;
}

const DormCtx = createContext<DormState>({ setDormId: () => {} });

const isKnown = (id?: string) => !!id && dormitories.some((d) => d.dormitory_id === id);

/** 앱 전체에서 공유하는 "내 생활관" 선택 상태 (기기에 저장) */
export function DormProvider({ children }: { children: ReactNode }) {
  const [dormId, setState] = useState(() => {
    const saved = prefs.getDormitory();
    return isKnown(saved) ? saved : undefined;
  });

  const setDormId = useCallback((id: string) => {
    prefs.setDormitory(id);
    setState(id);
  }, []);

  const value = useMemo(() => ({ dormId, setDormId }), [dormId, setDormId]);
  return <DormCtx.Provider value={value}>{children}</DormCtx.Provider>;
}

export const useDorm = () => useContext(DormCtx);
