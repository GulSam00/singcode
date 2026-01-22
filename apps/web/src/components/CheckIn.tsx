'use client';

import { CalendarCheck, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CheckIn() {
  const [open, setOpen] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Mock fetching server time
  useEffect(() => {
    if (open) {
      // Simulate API call
      const now = new Date();
      setServerTime(now);

      // In a real app, we would also fetch "isCheckedIn" status here.
      // For now, we rely on local state or we can reset it if needed.
    }
  }, [open]);

  // Timer logic
  useEffect(() => {
    if (!serverTime) return;

    const timer = setInterval(() => {
      const now = new Date(); // Current local time as proxy for server time in loop

      // Calculate KST times
      // UTC+9
      const kstOffset = 9 * 60 * 60 * 1000;
      const nowKst = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + kstOffset);

      // Tomorrow 00:00 KST
      const tomorrowKst = new Date(nowKst);
      tomorrowKst.setDate(tomorrowKst.getDate() + 1);
      tomorrowKst.setHours(0, 0, 0, 0);

      const diff = tomorrowKst.getTime() - nowKst.getTime();

      if (diff < 0) {
        // Should ideally reset
        setTimeRemaining('00:00:00');
        // setIsCheckedIn(false); // Reset for new day?
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [serverTime, isCheckedIn]);

  // Check condition: Time > Today 00:00 KST
  // We effectively check if "now" is valid.
  // We combine this with "isCheckedIn" to toggle the UI state as requested ("Otherwise... timer").
  const isAvailable = serverTime && !isCheckedIn;

  const handleCheckIn = () => {
    // Mock API call to check in
    setIsCheckedIn(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <CalendarCheck className="h-4 w-4" />
          출석체크
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>출석체크</DialogTitle>
          <DialogDescription>매일 출석하고 보상을 받아가세요!</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <div className="bg-muted rounded-full p-4 text-4xl font-bold">
            {isCheckedIn ? '✅' : '👋'}
          </div>

          {isAvailable ? (
            <div className="space-y-2 text-center">
              <p className="text-lg font-medium">출석체크가 가능합니다!</p>
              <Button onClick={handleCheckIn} className="h-12 w-full text-lg">
                출석하기
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-2 text-center">
              <p className="text-muted-foreground">다음 출석까지 남은 시간</p>
              <div className="text-primary flex items-center justify-center gap-2 font-mono text-3xl font-bold">
                <Clock className="h-6 w-6" />
                {timeRemaining || 'Loading...'}
              </div>
              <Button disabled className="w-full" variant="secondary">
                출석 완료
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
