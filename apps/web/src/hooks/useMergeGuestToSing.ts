'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useMergeGuestToSingMutation } from '@/queries/tosingSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import useGuestToSingStore from '@/stores/useGuestToSingStore';

/**
 * 게스트로 담아둔 부를 곡을 로그인 계정으로 옮긴다.
 *
 * 카카오 로그인은 `/api/auth/callback`에서 서버 리다이렉트로 끝나 전체 페이지가 다시 뜬다.
 * 클라이언트에 "로그인 성공" 시점이 없으므로 전환을 감지하는 대신 "로그인 상태에서는
 * 게스트 목록이 비어 있다"는 불변식을 지킨다.
 *
 * 성공했을 때만 로컬을 비운다 — 실패하면 다음 방문에서 다시 시도하고, 그 사이에도
 * 사용자의 곡은 localStorage에 그대로 남는다.
 */
export default function useMergeGuestToSing() {
  const { isAuthenticated } = useAuthStore();
  const { guestToSingSongs, clearGuestToSingSongs } = useGuestToSingStore();
  const { mutate } = useMergeGuestToSingMutation();

  // StrictMode의 이중 실행과 리렌더로 인한 중복 요청을 막는다
  const isMergingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || guestToSingSongs.length === 0) return;
    if (isMergingRef.current) return;

    isMergingRef.current = true;
    mutate(
      guestToSingSongs.map(item => item.songs.id),
      {
        onSuccess: response => {
          if (!response.success) {
            isMergingRef.current = false;
            return;
          }

          clearGuestToSingSongs();

          const merged = response.data?.merged ?? 0;
          if (merged > 0) {
            toast.success('담아둔 곡을 옮겼어요', {
              description: `부를 곡 목록에 ${merged}곡을 추가했어요.`,
            });
          }
        },
        onError: () => {
          isMergingRef.current = false;
        },
      },
    );
  }, [isAuthenticated, guestToSingSongs, mutate, clearGuestToSingSongs]);
}
