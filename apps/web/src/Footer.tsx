'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import useFooterAnimateStore, { FooterKey } from '@/stores/useFooterAnimateStore';
import { cn } from '@/utils/cn';

interface Navigation {
  name: string;
  href: string;
  key: FooterKey;
}

const navigation: Navigation[] = [
  { name: '최신 곡', href: '/recent', key: 'RECENT' },

  { name: '부를 곡', href: '/tosing', key: 'TOSING' },
  { name: '검색', href: '/', key: 'SEARCH' },

  { name: '인기곡', href: '/popular', key: 'POPULAR' },
  { name: '정보', href: '/info', key: 'INFO' },
];

export default function Footer() {
  const pathname = usePathname();
  const { footerAnimateKey } = useFooterAnimateStore();
  const navPath = pathname.split('/')[1];

  return (
    <footer className="bg-background fixed bottom-0 flex h-8 w-full max-w-md justify-between">
      {navigation.map(item => {
        const isActive = '/' + navPath === item.href;
        const isAnimating = footerAnimateKey === item.key;

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
                'h-full w-full px-0 text-sm',
                isActive && 'bg-accent text-accent-foreground',
              )}
              variant="ghost"
            >
              <Link href={item.href}>
                <motion.span
                  className="inline-block"
                  animate={isAnimating ? { scale: 1.4 } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
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
