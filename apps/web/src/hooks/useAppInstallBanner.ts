import { useEffect, useState } from 'react';

const DISMISSED_AT_KEY = 'app-install-banner-dismissed-at';
const HIDE_DAYS = 1;
const HIDE_MS = HIDE_DAYS * 24 * 60 * 60 * 1000;

// TWA(Play 스토어 앱)는 첫 진입 referrer가 android-app://, 설치형 PWA는 display-mode가 standalone이다.
const isInstalledApp = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  document.referrer.startsWith('android-app://');

const isAndroidBrowser = () => /Android/i.test(window.navigator.userAgent) && !isInstalledApp();

// 저장소가 막힌 환경(시크릿 모드 등)에서는 접근만으로 예외가 나므로 항상 감싼다.
const readDismissedAt = () => {
  try {
    return Number(window.localStorage.getItem(DISMISSED_AT_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeDismissedAt = (time: number) => {
  try {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(time));
  } catch {
    // 저장에 실패해도 이번 방문 동안은 숨겨진다.
  }
};

/** 안드로이드 모바일 브라우저에서, 최근 7일 안에 닫지 않았을 때만 보여준다. */
export default function useAppInstallBanner() {
  // 서버 렌더와 첫 클라이언트 렌더를 맞추려고 기본값은 숨김이고, 마운트 뒤에 판별한다.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissedRecently = Date.now() - readDismissedAt() < HIDE_MS;
    setIsVisible(isAndroidBrowser() && !isDismissedRecently);
  }, []);

  const dismiss = () => {
    writeDismissedAt(Date.now());
    setIsVisible(false);
  };

  return { isVisible, dismiss };
}
