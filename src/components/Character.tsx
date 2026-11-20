import suLeft from '@/assets/characters/su-left.png';
import suRight from '@/assets/characters/su-right.png';

// 캐릭터 원본 외형 변경 금지. 리스트/타임테이블/바텀 네비에는 사용하지 않는다.
const SRC = { left: suLeft, right: suRight } as const;

export function Character({ which = 'right', size = 96 }: { which?: keyof typeof SRC; size?: number }) {
  return <img src={SRC[which]} alt="" aria-hidden width={size} style={{ height: 'auto', display: 'block' }} />;
}
