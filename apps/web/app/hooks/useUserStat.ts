'use client';

import { useEffect, useState } from 'react';

import { getUserStats } from '@/lib/api/user_stats';
import { UserSongStat } from '@/types/userStat';

export default function useUserStat() {
  const [userStat, setUserStat] = useState<UserSongStat[]>([]);

  const getUserStat = async () => {
    const { success, data } = await getUserStats();
    if (success) {
      setUserStat(data);
    }
  };

  useEffect(() => {
    getUserStat();
  }, []);

  return { userStat, getUserStat };
}
