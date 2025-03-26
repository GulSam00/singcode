'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '부를 곡', href: '/' },
  { name: '검색', href: '/search' },
  { name: '인기곡', href: '/popular' },
  { name: '라이브러리', href: '/library' },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 flex h-8 w-[360px] justify-between">
      {navigation.map(item => {
        const isActive = pathname === item.href;
        return (
          <Button
            asChild
            key={item.name}
            className={cn(
              'w-[90px] flex-auto',
              isActive ? 'bg-secondary text-primary' : 'text-text-secondary hover:text-primary',
            )}
            variant="ghost"
          >
            <Link href={item.href}>{item.name}</Link>
          </Button>
        );
      })}
    </footer>
  );
}
