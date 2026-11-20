// 기기별 간단한 설정 저장. localStorage가 막혀 있어도(프라이빗 모드, 웹뷰 설정 등)
// 앱이 멈추지 않도록 메모리 값으로 대체한다.
const KEY_ONBOARDED = 'su-laundry:onboarded';
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* 메모리 값만 유지 */
  }
}

export const prefs = {
  isOnboarded: () => read(KEY_ONBOARDED) === '1',
  setOnboarded: () => write(KEY_ONBOARDED, '1'),
};
