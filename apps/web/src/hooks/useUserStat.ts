'use client';

import { useEffect, useState } from 'react';

import { getUserStats } from '@/lib/api/userStat';
import { UserSongStat } from '@/types/userStat';
import { isSuccessResponse } from '@/utils/isSuccessResponse';

export default function useUserStat() {
  const [userStat, setUserStat] = useState<UserSongStat[]>([]);

  const getUserStat = async () => {
    const response = await getUserStats();
    if (isSuccessResponse(response)) {
      setUserStat(response.data ?? []);
    }
  };

  useEffect(() => {
    getUserStat();
  }, []);

  return { userStat, getUserStat };
}
