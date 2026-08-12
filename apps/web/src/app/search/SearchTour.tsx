'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo } from 'react';
import {
  type ButtonType,
  EVENTS,
  type EventData,
  STATUS,
  type Step,
  useJoyride,
} from 'react-joyride';

import { TOUR_DEMO_SEARCH_TERM } from '@/constants/tourDemoSong';

const TOOLTIP_BUTTONS: ButtonType[] = ['back', 'close', 'skip', 'primary'];

const STORAGE_KEY = 'singcode-search-tour-seen';

// 예시 검색 결과가 화면에 실제로 마운트될 때까지 기다린다.
// react-joyride의 targetWaitTimeout은 `before` 훅이 즉시 resolve되면 기다려주지 않으므로,
// before 훅 자체를 이 target이 나타날 때까지 붙잡아 둔다.
function waitForElement(selector: string, timeoutMs: number): Promise<void> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeoutMs);
  });
}

const LOCALE = {
  back: '이전',
  close: '닫기',
  last: '완료',
  next: '다음',
  nextWithProgress: '다음 ({current}/{total})',
  skip: '건너뛰기',
};

interface SearchTourProps {
  onPrepareExampleSearch: () => void;
  onTourNormalizeState: () => void;
  triggerSignal: number;
}

export default function SearchTour({
  onPrepareExampleSearch,
  onTourNormalizeState,
  triggerSignal,
}: SearchTourProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '[data-tour="search-type-tabs"]',
        title: '검색 타입 선택',
        content: '전체·제목·가수·번호 중 원하는 방식으로 검색할 수 있어요.',
        skipBeacon: true,
      },
      {
        target: '[data-tour="language-filter"]',
        title: '국가로 필터링',
        content: '한국·일본·팝송처럼 국가(언어)로 검색 범위를 좁혀볼 수 있어요.',
      },
      {
        target: '[data-tour="search-result-list"]',
        title: '검색 결과 살펴보기',
        content: `예시 곡 '${TOUR_DEMO_SEARCH_TERM}' 카드로 기능들을 하나씩 살펴볼게요. 실제 곡은 아니에요.`,
        beforeTimeout: 15000,
        before: async () => {
          onPrepareExampleSearch();
          await waitForElement('[data-tour="search-result-list"]', 12000);
        },
      },
      {
        target: '[data-tour="card-expand-toggle"]',
        title: '상세 기능 펼치기',
        content: 'TJ·금영 번호가 있는 영역을 누르면 이 곡에 대한 여러 기능이 펼쳐져요.',
      },
      {
        target: '[data-tour="card-tosing-button"]',
        title: '부를곡 추가',
        content: '부를 노래 목록에 곡을 추가하거나 다시 뺄 수 있어요.',
        beforeTimeout: 3500,
        before: async () => {
          const alreadyExpanded = !!document.querySelector('[data-tour="card-tosing-button"]');
          if (!alreadyExpanded) {
            document.querySelector<HTMLElement>('[data-tour="card-expand-toggle"]')?.click();
            await waitForElement('[data-tour="card-tosing-button"]', 3000);
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        },
      },
      {
        target: '[data-tour="card-like-button"]',
        title: '즐겨찾기',
        content: '(회원 기능) 자주 부르는 곡은 즐겨찾기에 등록해두고 빠르게 찾아볼 수 있어요.',
      },
      {
        target: '[data-tour="card-save-button"]',
        title: '재생목록 추가',
        content: '(회원 기능) 원하는 재생목록(폴더)에 곡을 저장해서 따로 관리할 수 있어요.',
      },
      {
        target: '[data-tour="card-promotion-button"]',
        title: '홍보하기',
        content: '(회원 기능) 포인트를 사용해 내가 부른 곡을 다른 사람들에게 홍보할 수 있어요.',
      },
      {
        target: '[data-tour="card-report-button"]',
        title: '수정 요청',
        content: '(회원 기능) 곡 정보가 잘못됐다면 수정 요청을 남겨서 알려줄 수 있어요.',
      },
    ],
    [onPrepareExampleSearch],
  );

  const options = useMemo(
    () => ({
      primaryColor: 'oklch(0.75 0.2 145)',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      textColor: isDark ? '#f4f4f5' : '#18181b',
      arrowColor: isDark ? '#18181b' : '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 10000,
      showProgress: true,
      buttons: TOOLTIP_BUTTONS,
      skipBeacon: true,
      // 라이브러리 기본값(고정 380px)은 375px 이하 모바일 화면에서 좌우로 넘친다.
      // 뷰포트보다 넓어지지 않되, 넓은 화면에서는 기존 380px 상한을 유지한다.
      width: 'min(380px, calc(100vw - 32px))',
    }),
    [isDark],
  );

  const { controls, on, Tour } = useJoyride({
    continuous: true,
    steps,
    options,
    locale: LOCALE,
  });

  useEffect(() => {
    return on(EVENTS.TOUR_END, (data: EventData) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        localStorage.setItem(STORAGE_KEY, '1');
      }
    });
  }, [on]);

  useEffect(() => {
    if (typeof window === 'undefined' || localStorage.getItem(STORAGE_KEY)) return;

    // 새 버전 안내 등 다른 다이얼로그는 비동기(fetch)로 늦게 열릴 수 있어 한 번 확인하는 것만으로는
    // 경합이 생긴다. 다이얼로그가 없는 상태가 일정 횟수 연속으로 확인될 때까지 기다렸다가 시작한다.
    let cancelled = false;
    let clearStreak = 0;
    let totalWaited = 0;
    const STEP_MS = 300;
    const REQUIRED_CLEAR_STREAK = 2;
    const MAX_WAIT_MS = 6000;

    const tick = () => {
      if (cancelled) return;

      if (document.querySelector('[role="dialog"]')) {
        clearStreak = 0;
      } else {
        clearStreak += 1;
      }
      totalWaited += STEP_MS;

      if (clearStreak >= REQUIRED_CLEAR_STREAK || totalWaited >= MAX_WAIT_MS) {
        onTourNormalizeState();
        controls.start();
        return;
      }
      setTimeout(tick, STEP_MS);
    };

    const timer = setTimeout(tick, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (triggerSignal === 0) return;
    onTourNormalizeState();
    controls.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSignal]);

  return Tour;
}
