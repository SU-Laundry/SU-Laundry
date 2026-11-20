import type { CapacitorConfig } from '@capacitor/cli';

// 앱 패키징 단계에서 사용: npm run cap:sync → npx cap add android
const config: CapacitorConfig = {
  appId: 'kr.ac.syu.sulaundry',
  appName: 'SU Laundry',
  webDir: 'dist',
};

export default config;
