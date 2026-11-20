import { useEffect, useState } from 'react';

/**
 * PC 시연용 폰 프레임의 장식 (상태바·다이내믹 아일랜드·홈 인디케이터·측면 버튼)
 * - 실제 폰/DevTools 기기 모드에서는 CSS로 숨겨진다 (global.css의 PC 프레임 미디어쿼리에서만 표시)
 * - 클릭을 막지 않도록 pointer-events: none
 */
export function DeviceChrome({ light = false }: { light?: boolean }) {
  const time = useClock();
  return (
    <div className={`device-chrome${light ? ' device-chrome--light' : ''}`} aria-hidden="true">
      <div className="device-chrome__status">
        <span className="device-chrome__time">{time}</span>
        <span className="device-chrome__island" />
        <span className="device-chrome__icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </span>
      </div>
      <span className="device-chrome__home" />
    </div>
  );
}

/** 측면 버튼 — .device(overflow:hidden) 밖에 그려야 해서 따로 둔다 */
export function DeviceButtons() {
  return (
    <span className="device-buttons" aria-hidden="true">
      <i className="device-buttons__action" />
      <i className="device-buttons__vol-up" />
      <i className="device-buttons__vol-down" />
      <i className="device-buttons__power" />
    </span>
  );
}

function useClock() {
  const fmt = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 10_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Z" />
      <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 3.8a7 7 0 0 0-4.8 1.9L4.4 7c1-.9 2.2-1.4 3.6-1.4Z" />
      <path d="M8 9a1.8 1.8 0 0 1 1.3.5L8 11.6 6.7 9.5A1.8 1.8 0 0 1 8 9Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="16" height="9" rx="2.4" fill="currentColor" />
      <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
