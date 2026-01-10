'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

const navigation = [
  { name: '최신 곡', href: '/recent' },

  { name: '부를 곡', href: '/tosing' },
  { name: '검색', href: '/' },

  { name: '인기곡', href: '/popular' },
  { name: '정보', href: '/info' },
];

export default function Footer() {
  const pathname = usePathname();
  const navPath = pathname.split('/')[1];

  return (
    <footer className="bg-background fixed bottom-0 flex h-8 w-full max-w-md justify-between">
      {navigation.map(item => {
        const isActive = '/' + navPath === item.href;
        return (
          <Button
            asChild
            key={item.name}
            className={cn('flex-1 px-0 text-sm', isActive && 'bg-accent text-accent-foreground')}
            variant="ghost"
          >
            <Link href={item.href}>{item.name}</Link>
          </Button>
        );
      })}
    </footer>
  );
}
