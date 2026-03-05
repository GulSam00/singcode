'use client';

import { format } from 'date-fns';
import { Clock } from 'lucide-react';

import Checked from '@/assets/lotties/Checked.json';
import CountUp from '@/components/reactBits/CountUp';
import GradientText from '@/components/reactBits/GradientText';
import SplitText from '@/components/reactBits/SplitText';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';
import { usePatchUserCheckInMutation, useUserQuery } from '@/queries/userQuery';

import ActionAnimationFlow from './ActionAnimationFlow';

interface CheckInModalProps {
  lastCheckIn: Date;
  isLogin: boolean;
  handleNavigateLogin: () => void;
}

export default function CheckInModal({
  lastCheckIn,
  isLogin,
  handleNavigateLogin,
}: CheckInModalProps) {
  const timeRemaining = useCheckInTimer(lastCheckIn);

  const { data: user } = useUserQuery();
  const point = user?.point ?? 0;
  const CHECK_IN_REWARD = 30;

  const { mutate: patchUserCheckIn } = usePatchUserCheckInMutation();

  const today = format(new Date(), 'yyyy-MM-dd');

  const parseLastCheckIn = format(new Date(lastCheckIn), 'yyyy-MM-dd');

  const handleClickCheckIn = () => {
    patchUserCheckIn();
  };

  return (
    <div className="flex h-[400px] flex-col sm:max-w-md">
      <DialogHeader>
        <DialogTitle>출석체크</DialogTitle>
        <DialogDescription>
          <SplitText text="매일 출석하고 보상을 받아가세요!" tag="span" />
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {isLogin ? (
          <ActionAnimationFlow
            animationData={Checked}
            clickCallback={handleClickCheckIn}
            initalStatus={parseLastCheckIn >= today ? 'DONE' : 'IDLE'}
            // 1. 대기 화면 (trigger 함수를 받아서 버튼에 연결)
            idleView={trigger => (
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-lg font-bold">오늘 출석하시겠어요?</h2>
                <div className="flex w-full flex-col items-center gap-1 rounded-lg bg-gray-200 p-4">
                  <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Current Points
                  </span>
                  <GradientText
                    className="text-3xl font-black tracking-tighter"
                    colors={['#FFD700', '#FFA000', '#E65100']}
                  >
                    <CountUp to={point} duration={0.5} separator="," />
                  </GradientText>
                  <div className="mt-1 flex items-center gap-1">
                    <GradientText className="text-base font-bold" colors={['#00F260', '#0575E6']}>
                      <span>+ {CHECK_IN_REWARD} P</span>
                    </GradientText>
                  </div>
                </div>
                <Button
                  onClick={trigger} // 👈 여기서 애니메이션 시작!
                  className="rounded-full bg-blue-500 px-6 py-2 text-white active:scale-95"
                >
                  출석하기
                </Button>
              </div>
            )}
            // 2. 결과 화면
            doneView={
              <div className="w-full space-y-2 text-center">
                <div className="bg-muted flex flex-col items-center gap-1 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Current Points
                  </span>
                  <GradientText
                    className="text-2xl font-black tracking-tighter"
                    colors={['#FFD700', '#FFA000', '#E65100']}
                  >
                    <CountUp to={point} duration={0.5} separator="," />
                  </GradientText>
                </div>
                <p className="text-muted-foreground">다음 출석까지 남은 시간</p>
                <div className="text-primary flex items-center justify-center gap-2 font-mono text-3xl font-bold">
                  <Clock className="h-6 w-6" />
                  {timeRemaining || '00:00:00'}
                </div>
                <Button disabled className="w-full" variant="secondary">
                  출석 완료
                </Button>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <SplitText text="로그인 후 사용 가능합니다" tag="span" />

            <Button onClick={handleNavigateLogin} className="w-full">
              로그인하러 가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
