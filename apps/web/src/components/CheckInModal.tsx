'use client';

import Lottie from 'lottie-react';
import { Clock } from 'lucide-react';

import Checked from '@/assets/lotties/Checked.json';
import CountUp from '@/components/reactBits/CountUp';
import GradientText from '@/components/reactBits/GradientText';
import SplitText from '@/components/reactBits/SplitText';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CHECK_IN_REWARD } from '@/constants/point';
import { useCheckInTimer } from '@/hooks/useCheckInTimer';
import { useUserQuery } from '@/queries/userQuery';

interface CheckInModalProps {
  lastCheckIn: Date | null;
  isCheckedIn: boolean;
  isLogin: boolean;
  handleNavigateLogin: () => void;
}

/**
 * 출석 상태 표시용 모달. 적립은 앱 진입 시 useAutoCheckIn이 자동으로 하므로 여기에는 적립 버튼이 없다.
 */
export default function CheckInModal({
  lastCheckIn,
  isCheckedIn,
  isLogin,
  handleNavigateLogin,
}: CheckInModalProps) {
  const timeRemaining = useCheckInTimer(lastCheckIn);

  const { data: user } = useUserQuery();
  const point = user?.point ?? 0;

  const pointCard = (
    <div className="bg-muted flex w-full flex-col items-center gap-1 rounded-lg p-3">
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
  );

  return (
    <div className="flex h-[400px] flex-col sm:max-w-md">
      <DialogHeader>
        <DialogTitle>출석체크</DialogTitle>
        <DialogDescription>
          <SplitText text="매일 들어오기만 하면 자동으로 출석돼요!" tag="span" />
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {!isLogin ? (
          <div className="flex flex-col gap-4 text-center">
            <SplitText text="로그인 후 사용 가능합니다" tag="span" />

            <Button onClick={handleNavigateLogin} className="w-full">
              로그인하러 가기
            </Button>
          </div>
        ) : isCheckedIn ? (
          <div className="w-full space-y-2 text-center">
            <div className="mx-auto h-20 w-20">
              <Lottie animationData={Checked} loop={false} autoplay />
            </div>
            {pointCard}
            <p className="text-muted-foreground">다음 출석까지 남은 시간</p>
            <div className="text-primary flex items-center justify-center gap-2 font-mono text-3xl font-bold">
              <Clock className="h-6 w-6" />
              {timeRemaining || '00:00:00'}
            </div>
            <Button disabled className="w-full" variant="secondary">
              오늘 출석 완료
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-bold">아직 오늘 출석 전이에요</h2>
            {pointCard}
            <GradientText className="text-base font-bold" colors={['#00F260', '#0575E6']}>
              <span>+ {CHECK_IN_REWARD} P</span>
            </GradientText>
            <p className="text-muted-foreground text-sm">
              앱에 다시 들어오면 자동으로 출석이 처리돼요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
