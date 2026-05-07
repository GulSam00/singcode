'use client';

import KakaoMap from '@/components/KakaoMap';

export default function MapPage() {
  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-3 text-lg font-bold">노래방 찾기</h1>
      <KakaoMap />
    </div>
  );
}
