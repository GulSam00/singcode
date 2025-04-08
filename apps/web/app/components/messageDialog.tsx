'use client';

import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModalStore } from '@/store/useModalStore';
import { cn } from '@/utils/cn';

export function MessageDialog() {
  const { isOpen, title, message, variant, buttonText, onButtonClick, closeMessage } =
    useModalStore();

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    closeMessage();
  };

  // ESC 키로 닫기 방지 (필요한 경우)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 아이콘 선택
  const IconComponent = (() => {
    switch (variant) {
      case 'success':
        return CheckCircle2;
      case 'error':
        return XCircle;
      case 'warning':
      case 'info':
        return AlertCircle;
      default:
        return Info;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && closeMessage()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <IconComponent
              className={cn(
                'h-5 w-5',
                variant === 'success' && 'text-green-500',
                variant === 'error' && 'text-red-500',
                variant === 'warning' && 'text-yellow-500',
                variant === 'info' && 'text-blue-500',
              )}
            />
            {title && <DialogTitle>{title}</DialogTitle>}
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleButtonClick}
            className={cn(
              variant === 'success' && 'bg-green-500 hover:bg-green-600',
              variant === 'error' && 'bg-red-500 hover:bg-red-600',
              variant === 'warning' && 'bg-yellow-500 hover:bg-yellow-600',
              variant === 'info' && 'bg-blue-500 hover:bg-blue-600',
            )}
          >
            {buttonText || '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
