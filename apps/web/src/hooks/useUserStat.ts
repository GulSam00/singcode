'use client';

import { useUserStatQuery } from '@/queries/userStatQuery';

export default function useUserStat() {
  const { data, isLoading } = useUserStatQuery();
  const userStat = data ?? [];

  return { userStat, isLoading };
}
