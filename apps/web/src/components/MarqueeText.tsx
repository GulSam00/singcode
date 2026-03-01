'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

interface MarqueeTextProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MarqueeText({ children, className, onClick }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    const resizeObserver = new ResizeObserver(() => checkOverflow());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn('group w-full overflow-hidden', className)}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex w-max items-center',
          isOverflowing && 'animate-marquee group-hover:!animate-none',
        )}
      >
        <span className="whitespace-nowrap">{children}</span>
        {/* 오버플로우 시에만 복제본을 렌더링 */}
        {isOverflowing && (
          <span className="pl-4 whitespace-nowrap" aria-hidden="true">
            {children}
          </span>
        )}
      </div>
    </div>
  );
}
