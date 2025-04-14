'use client';

import { BarChart2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/stores/useAuthStore';

const menuItems = [
  {
    id: 'liked',
    title: '좋아요 곡 관리',
    description: '좋아요를 누른 노래를 관리합니다',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: 'stats',
    title: '노래방 통계',
    description: '나의 노래 통계를 확인합니다',
    icon: <BarChart2 className="h-5 w-5" />,
  },
];

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="bg-background h-full space-y-4 px-4 py-8">
      <h1 className="text-2xl font-bold">반갑습니다, {user?.nickname}님</h1>

      {menuItems.map(item => (
        <Card
          key={item.id}
          className="hover:bg-accent/50 cursor-pointer transition-all hover:shadow-md"
          onClick={() => router.push(`/library/${item.id}`)}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="bg-primary/10 text-primary mr-4 rounded-lg p-2">{item.icon}</div>
            <div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
