'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Megaphone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSongPromotionsQuery } from '@/queries/songPromotionQuery';

const ALLOWED_PATHS = ['/', '/popular', '/recent', '/tosing'];
const COLLAPSED_STORAGE_KEY = 'promotion-banner-collapsed';

export default function PromotionBanner() {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: promotions = [] } = useSongPromotionsQuery();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsCollapsed(window.sessionStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');
  }, []);

  useEffect(() => {
    if (currentIndex >= promotions.length) {
      setCurrentIndex(0);
    }
  }, [promotions.length, currentIndex]);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const handleToggle = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  if (!ALLOWED_PATHS.includes(pathname)) return null;
  if (promotions.length === 0) return null;

  const current = promotions[currentIndex];
  const hasKoTitle = current.title_ko && current.title_ko !== current.title;
  const hasKoArtist = current.artist_ko && current.artist_ko !== current.artist;

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-lg border px-4 py-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isCollapsed ? '전광판 펼치기' : '전광판 접기'}
        className={`hover:text-foreground flex w-full items-center gap-1.5 text-left ${
          isCollapsed ? 'mb-0' : 'mb-2'
        }`}
      >
        <Megaphone className="text-primary h-3.5 w-3.5" />
        <span className="text-primary text-xs font-semibold">전광판</span>
        <span className="text-muted-foreground text-xs">
          {currentIndex + 1}/{promotions.length}
        </span>
        <span className="text-muted-foreground ml-auto flex h-5 w-5 items-center justify-center">
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="h-24 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ y: '-100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1.5 truncate">
                      <span className="truncate text-sm font-semibold">{current.title}</span>
                      {hasKoTitle && (
                        <span className="text-muted-foreground shrink-0 truncate text-xs">
                          {current.title_ko}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 truncate">
                      <span className="text-muted-foreground truncate text-sm">
                        {current.artist}
                      </span>
                      {hasKoArtist && (
                        <span className="text-muted-foreground/70 shrink-0 truncate text-xs">
                          {current.artist_ko}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed wrap-break-word">
                    <span className="bg-primary/10 text-primary mr-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                      {current.nickname}
                    </span>
                    <span className="text-foreground">{current.content}</span>
                  </p>

                  <span className="text-muted-foreground/60 text-xs">
                    {current.start_date} ~ {current.end_date}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
