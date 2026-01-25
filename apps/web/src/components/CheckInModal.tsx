'use client';

import { CalendarCheck, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import Checked from '@/assets/lotties/Checked.json';
import SplitText from '@/components/reactBits/SplitText';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';

import ActionAnimationFlow from './ActionAnimationFlow';

export default function CheckInModal() {
  const [open, setOpen] = useState(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const timeRemaining = useCheckInTimer(serverTime);

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
          <DialogDescription>
            <SplitText text="매일 출석하고 보상을 받아가세요!" tag="span" />
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          {isAvailable ? (
            <ActionAnimationFlow
              animationData={Checked}
              // 1. 대기 화면 (trigger 함수를 받아서 버튼에 연결)
              idleView={trigger => (
                <div className="text-center">
                  <h2 className="mb-4 text-lg font-bold">오늘 출석하시겠어요?</h2>
                  <button
                    onClick={trigger} // 👈 여기서 애니메이션 시작!
                    className="rounded-full bg-blue-500 px-6 py-2 text-white active:scale-95"
                  >
                    출석하기
                  </button>
                </div>
              )}
              // 2. 결과 화면
              doneView={
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
              }
            />
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
