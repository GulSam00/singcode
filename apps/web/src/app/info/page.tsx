'use client';

import { BarChart2, Folder, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const menuItems = [
  {
    id: 'like',
    title: '좋아요 곡 관리',
    description: '좋아요를 누른 노래를 관리합니다',
    icon: <Heart className="h-5 w-5" />,
  },

  {
    id: 'save',
    title: '재생목록 관리',
    description: '재생목록을 관리합니다',
    icon: <Folder className="h-5 w-5" />,
  },
  {
    id: 'stat',
    title: '노래 통계',
    description: '내가 불렀던 노래 통계를 확인합니다',
    icon: <BarChart2 className="h-5 w-5" />,
  },
];

export default function LibraryPage() {
  const router = useRouter();

  return (
    <div className="bg-background h-full space-y-4">
      <div className="mb-6 flex items-center justify-between px-2 py-4 shadow-sm">
        <h1 className="text-2xl font-bold">내 정보</h1>
      </div>

      {menuItems.map(item => (
        <Card
          key={item.id}
          className="hover:bg-accent/50 cursor-pointer transition-all hover:shadow-md"
          onClick={() => router.push(`/info/${item.id}`)}
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
