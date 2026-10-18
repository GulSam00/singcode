'use client';

import { motion } from 'framer-motion';
import { ChartColumn, Crown, ListMusic, type LucideIcon, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import useFooterAnimateStore, { FooterKey } from '@/stores/useFooterAnimateStore';
import { cn } from '@/utils/cn';

interface Navigation {
  name: string;
  href: string;
  key: FooterKey;
  icon: LucideIcon;
}

const navigation: Navigation[] = [
  { name: '차트', href: '/chart', key: 'CHART', icon: ChartColumn },

  { name: '부를 곡', href: '/tosing', key: 'TOSING', icon: ListMusic },
  { name: '검색', href: '/', key: 'SEARCH', icon: Search },

  { name: '투표', href: '/vote', key: 'VOTE', icon: Crown },
  { name: '정보', href: '/info', key: 'INFO', icon: User },
];

export default function Footer() {
  const pathname = usePathname();
  const { footerAnimateKey } = useFooterAnimateStore();
  const navPath = pathname.split('/')[1];

  return (
    <footer className="bg-background flex h-14 w-full max-w-md shrink-0 justify-between border-t">
      {navigation.map(item => {
        const isActive = '/' + navPath === item.href;
        const isAnimating = footerAnimateKey === item.key;
        const Icon = item.icon;

        return (
          <div key={item.name} className="relative flex-1">
            {isAnimating && (
              <motion.div
                className="bg-accent absolute top-0 left-1/2 z-0 h-4 w-4 -translate-x-1/2 rounded-full"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 10, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
            <Button
              asChild
              className={cn(
                'h-full w-full px-0 text-xs',
                isActive && 'bg-accent text-accent-foreground',
              )}
              variant="ghost"
            >
              <Link href={item.href}>
                <motion.span
                  className="flex flex-col items-center gap-0.5"
                  animate={isAnimating ? { scale: 1.4 } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Icon className="size-5" />
                  {item.name}
                </motion.span>
              </Link>
            </Button>
          </div>
        );
      })}
    </footer>
  );
}
