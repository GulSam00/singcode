'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import useAppInstallBanner from '@/hooks/useAppInstallBanner';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=kr.singcode.app';

// 로그인·약관 같은 화면에서는 흐름을 끊지 않도록 주요 화면에서만 보여준다.
const ALLOWED_PATHS = ['/', '/chart', '/chart/recent', '/chart/popular', '/tosing', '/vote'];

export default function AppInstallBanner() {
  const pathname = usePathname();
  const { isVisible, dismiss } = useAppInstallBanner();

  if (!isVisible || !ALLOWED_PATHS.includes(pathname)) return null;

  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-2 shadow-md">
      <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="rounded-lg" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Singcode 앱으로 더 편하게</p>
        <p className="text-muted-foreground truncate text-xs">Play 스토어에서 설치하세요</p>
      </div>

      <Button asChild size="sm">
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
          앱 열기
        </a>
      </Button>

      <button
        type="button"
        onClick={dismiss}
        aria-label="앱 설치 안내 닫기"
        className="text-muted-foreground hover:text-foreground -mr-1 p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
