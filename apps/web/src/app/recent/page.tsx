'use client';

import { BarChart2, Folder, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/stores/useAuthStore';

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="bg-background h-full space-y-4">
      <div className="mb-6 flex items-center justify-between px-2 py-4 shadow-sm">
        <h1 className="text-2xl font-bold">최신곡</h1>
      </div>

      {/* <h1 className="text-xl font-bold">반가워요, {nickname}</h1> */}
    </div>
  );
}
