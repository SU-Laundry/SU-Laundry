import { WashingMachine } from 'lucide-react';
import { Character } from '@/components/Character';

/**
 * 스플래시: 로고 · 캐릭터 2종 · 부드러운 블루 그라데이션 · 슬로건
 * 앱 실행(콜드 스타트) 때마다 잠깐 보여주고 RootGate가 걷어낸다.
 */
export function SplashScreen({ leaving }: { leaving: boolean }) {
  return (
    <div className={`splash${leaving ? ' splash--leaving' : ''}`} role="status" aria-label="SU Laundry 시작 중">
      {/* 장식용 비눗방울 — 최소한으로 */}
      <span className="bubble" style={{ width: 72, height: 72, top: '12%', left: '-18px' }} aria-hidden />
      <span className="bubble" style={{ width: 28, height: 28, top: '22%', right: '18%' }} aria-hidden />
      <span className="bubble" style={{ width: 44, height: 44, bottom: '18%', right: '-10px' }} aria-hidden />

      <div className="splash__brand">
        <span className="splash__logo" aria-hidden>
          <WashingMachine size={30} strokeWidth={2.2} />
        </span>
        <h1 className="splash__title">SU Laundry</h1>
        <p className="splash__slogan">세탁실을 더 똑똑하고 편하게</p>
      </div>

      <div className="splash__characters">
        <div className="float">
          <Character which="left" size={128} />
        </div>
        <div className="float float--delay">
          <Character which="right" size={140} />
        </div>
      </div>

      <p className="splash__footer">삼육대학교 생활교육원</p>
    </div>
  );
}
