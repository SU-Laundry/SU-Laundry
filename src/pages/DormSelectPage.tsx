import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { Character } from '@/components/Character';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';

/** 생활관 선택 (F01). 첫 실행 때는 필수, 이후엔 홈·세탁실·마이에서 바꿀 수 있다. */
export default function DormSelectPage() {
  const navigate = useNavigate();
  const { dormId, setDormId } = useDorm();
  const [firstTime] = useState(() => !dormId);
  const [picked, setPicked] = useState(dormId);
  const { data: dorms } = useAsync(() => api.getDormitorySummaries());

  const confirm = () => {
    if (!picked) return;
    setDormId(picked);
    if (firstTime) navigate('/', { replace: true });
    else navigate(-1);
  };

  return (
    <Page back={!firstTime} title={firstTime ? undefined : '생활관 선택'}>
      <div className="stack">
        {firstTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 'var(--fs-page)', fontWeight: 700, lineHeight: 1.4 }}>
                어느 생활관에
                <br />
                살고 있나요?
              </h1>
              <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
                나중에 마이에서 바꿀 수 있어요
              </p>
            </div>
            <Character which="left" size={88} />
          </div>
        )}

        <ul role="radiogroup" aria-label="생활관" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {dorms?.map((d) => {
            const active = d.dormitory_id === picked;
            return (
              <li key={d.dormitory_id}>
                <button
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPicked(d.dormitory_id)}
                  className="card"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    minHeight: 72,
                    textAlign: 'left',
                    border: `1.5px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                    background: active ? 'var(--color-sky)' : 'var(--color-surface)',
                    transition: 'background-color .15s, border-color .15s',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--fs-section)', fontWeight: 600 }}>{d.name}</p>
                    <p className="caption" style={{ marginTop: 2 }}>
                      세탁기 {d.total}대 · 지금 {d.available}대 사용 가능
                    </p>
                  </div>
                  <span
                    aria-hidden
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: active ? 'var(--color-primary)' : 'transparent',
                      border: active ? 0 : '1.5px solid var(--color-border)',
                      color: '#fff',
                    }}
                  >
                    {active && <Check size={16} strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button className="btn btn-primary" disabled={!picked} onClick={confirm}>
          {firstTime ? '이 생활관으로 시작하기' : '선택 완료'}
        </button>
      </div>
    </Page>
  );
}
