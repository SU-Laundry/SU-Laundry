import { useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Character } from '@/components/Character';
import { StatusBadge } from '@/components/StatusBadge';
import { prefs } from '@/services/prefs';
import type { MachineStatus } from '@/domain/types';

/* ---------- 슬라이드별 예시 화면 (실제 UI 컴포넌트를 축소해 보여준다) ---------- */

function StatusPreview() {
  const rows: [number, MachineStatus][] = [
    [1, 'AVAILABLE'],
    [2, 'IN_USE'],
    [3, 'WAITING_PICKUP'],
  ];
  return (
    <div className="ob-card">
      {rows.map(([n, s]) => (
        <div key={n} className="ob-row">
          <strong>{n}번</strong>
          <StatusBadge status={s} />
        </div>
      ))}
    </div>
  );
}

function ReservePreview() {
  const slots = ['19:00', '20:00', '21:00'];
  return (
    <div className="ob-card">
      <p className="caption" style={{ marginBottom: 'var(--space-3)' }}>
        피크 시간 19:00 ~ 22:00
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
        {slots.map((s) => (
          <span key={s} className={`ob-slot${s === '20:00' ? ' ob-slot--active' : ''}`}>
            {s}
          </span>
        ))}
      </div>
      <div className="ob-row" style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
        <strong>4번 세탁기</strong>
        <StatusBadge status="RESERVED" />
      </div>
    </div>
  );
}

function NotifyPreview() {
  return (
    <div className="ob-card" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
      <span
        style={{
          flex: 'none',
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-completed-bg)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Sparkles size={20} color="var(--status-completed)" aria-hidden />
      </span>
      <div>
        <p style={{ fontWeight: 600 }}>세탁이 끝났어요</p>
        <p className="caption" style={{ marginTop: 2 }}>
          3번 세탁기의 세탁이 완료되었습니다. 세탁물을 수거해주세요.
        </p>
      </div>
    </div>
  );
}

interface Slide {
  title: string;
  desc: string;
  character: 'left' | 'right';
  preview: ReactNode;
}

const SLIDES: Slide[] = [
  {
    title: '세탁기 현황을\n한눈에 확인해요',
    desc: '세탁실에 가기 전에 방에서 빈 세탁기를 바로 볼 수 있어요',
    character: 'right',
    preview: <StatusPreview />,
  },
  {
    title: '피크 시간에는\n예약으로 더 편하게',
    desc: '사람이 몰리는 시간엔 미리 예약하고 내 차례에 맞춰 가면 돼요',
    character: 'left',
    preview: <ReservePreview />,
  },
  {
    title: '세탁 완료와 수거까지\n놓치지 않게',
    desc: '세탁이 끝나면 알려드려요. 다음 사람을 위해 빨리 꺼내주세요',
    character: 'right',
    preview: <NotifyPreview />,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const finish = () => {
    prefs.setOnboarded();
    navigate('/', { replace: true });
  };

  const goTo = (i: number) => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // 스와이프(스크롤 스냅)와 버튼 둘 다 지원 — 현재 페이지는 스크롤 위치로 계산
  const onScroll = () => {
    const el = scroller.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="app-frame onboarding">
      <header className="onboarding__top">
        {!last && (
          <button className="onboarding__skip" onClick={finish}>
            건너뛰기
          </button>
        )}
      </header>

      <div ref={scroller} className="onboarding__slides" onScroll={onScroll}>
        {SLIDES.map((s, i) => (
          <section key={i} className="onboarding__slide" aria-roledescription="slide" aria-label={`${i + 1} / ${SLIDES.length}`} aria-hidden={i !== index}>
            <div className="onboarding__visual">
              <div className="float">
                <Character which={s.character} size={112} />
              </div>
              {s.preview}
            </div>
            <div className="onboarding__text">
              <h1>{s.title}</h1>
              <p>{s.desc}</p>
            </div>
          </section>
        ))}
      </div>

      <footer className="onboarding__bottom">
        <div className="dots" aria-hidden>
          {SLIDES.map((_, i) => (
            <span key={i} className={`dot${i === index ? ' dot--active' : ''}`} />
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => (last ? finish() : goTo(index + 1))}>
          {last ? '시작하기' : '다음'}
        </button>
      </footer>
    </div>
  );
}
