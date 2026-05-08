'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSongPromotionsQuery } from '@/queries/songPromotionQuery';

export default function PromotionBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: promotions = [] } = useSongPromotionsQuery();

  useEffect(() => {
    if (currentIndex >= promotions.length) {
      setCurrentIndex(0);
    }
  }, [promotions.length, currentIndex]);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promotions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  if (promotions.length === 0) return null;

  const current = promotions[currentIndex];
  const displayTitle =
    current.title_ko && current.title_ko !== current.title ? current.title_ko : current.title;
  const displayArtist =
    current.artist_ko && current.artist_ko !== current.artist ? current.artist_ko : current.artist;

  return (
    <div className="border-border bg-muted/20 relative overflow-hidden rounded-lg border px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Megaphone className="text-primary h-3.5 w-3.5" />
        <span className="text-primary text-xs font-semibold">홍보 중인 곡</span>
        <span className="text-muted-foreground text-xs">
          {currentIndex + 1}/{promotions.length}
        </span>
      </div>

      <div className="h-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex flex-col gap-0.5"
          >
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="truncate text-sm font-semibold">{displayTitle}</span>
              <span className="text-muted-foreground shrink-0 text-xs">{displayArtist}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <span className="font-medium">{current.nickname}</span>
              <span>-</span>
              <span className="truncate">{current.content}</span>
            </div>
            <span className="text-muted-foreground/60 text-xs">
              {current.start_date} ~ {current.end_date}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
