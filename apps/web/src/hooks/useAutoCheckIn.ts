'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { CHECK_IN_REWARD } from '@/constants/point';
import { usePatchUserCheckInMutation } from '@/queries/userQuery';
import useAuthStore from '@/stores/useAuthStore';
import { getTodayKST } from '@/utils/kst';

/**
 * 로그인 상태로 앱에 들어오면 출석 체크를 자동으로 한 번 부른다.
 *
 * 하루 한 번 판정은 서버(daily_check_in RPC, KST 기준)가 하므로 여기서는 요청 수만 줄인다.
 * 같은 (사용자, KST 날짜)로는 한 번만 보낸다 — StrictMode 이중 실행·리렌더·라우트 이동에도
 * 중복 호출이 생기지 않는다. 탭을 켜둔 채 자정을 넘긴 경우를 위해 탭이 다시 보일 때도 확인한다.
 *
 * 실패하면 기록을 지워 다음 진입(탭 복귀 포함) 때 다시 시도한다. 적립됐을 때만 토스트를 띄운다.
 */
export default function useAutoCheckIn() {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id;
  const { mutate } = usePatchUserCheckInMutation();

  const attemptedKeyRef = useRef<string | null>(null);

  const tryCheckIn = useCallback(() => {
    if (!isAuthenticated || !userId) return;

    const key = `${userId}:${getTodayKST()}`;
    if (attemptedKeyRef.current === key) return;
    attemptedKeyRef.current = key;

    mutate(undefined, {
      onSuccess: response => {
        if (!response.success) {
          attemptedKeyRef.current = null;
          return;
        }
        if (response.data.awarded) {
          toast.success(`출석 체크 완료 +${CHECK_IN_REWARD}P`, {
            description: '오늘도 찾아와 주셔서 고마워요!',
          });
        }
      },
      onError: () => {
        attemptedKeyRef.current = null;
      },
    });
  }, [isAuthenticated, userId, mutate]);

  useEffect(() => {
    tryCheckIn();
  }, [tryCheckIn]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tryCheckIn();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tryCheckIn]);
}
