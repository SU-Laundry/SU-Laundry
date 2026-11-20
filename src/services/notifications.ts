// PUSH 알림 추상화. 웹(PWA)과 앱(Capacitor) 구현을 나중에 이 인터페이스 뒤에 붙인다.
export interface PushService {
  requestPermission(): Promise<boolean>;
  /** 서버에 저장할 알림 토큰 (User.notification_token) */
  getToken(): Promise<string | null>;
}

export const pushService: PushService = {
  async requestPermission() {
    if (!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  },
  async getToken() {
    return null; // TODO: Web Push(VAPID) 또는 @capacitor/push-notifications 연동
  },
};
