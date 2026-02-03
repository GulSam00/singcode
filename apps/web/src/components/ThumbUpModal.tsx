'use client';

import { useState } from 'react';

import CountUp from '@/components/reactBits/CountUp';
import GradientText from '@/components/reactBits/GradientText';
import SplitText from '@/components/reactBits/SplitText';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useSongThumbMutation } from '@/queries/songThumbQuery';
import { useUserQuery } from '@/queries/userQuery';
import { usePatchSetPointMutation } from '@/queries/userQuery';

import FallingIcons from './FallingIcons';

interface ThumbUpModalProps {
  songId: string;
  handleClose: () => void;
}

export default function ThumbUpModal({ songId, handleClose }: ThumbUpModalProps) {
  const [value, setValue] = useState([0]);

  const { data: user } = useUserQuery();

  const point = user?.point ?? 0;

  const { mutate: patchSongThumb, isPending: isPendingSongThumb } = useSongThumbMutation();
  const { mutate: patchSetPoint, isPending: isPendingSetPoint } = usePatchSetPointMutation();

  const handleClickThumb = () => {
    patchSongThumb({ songId, point: value[0] });
    patchSetPoint({ point: point - value[0] });

    handleClose();
  };

  const isPending = isPendingSongThumb || isPendingSetPoint;

  return (
    <div className="flex flex-col sm:max-w-md">
      <DialogHeader>
        <DialogTitle>노래 추천하기</DialogTitle>
        <DialogDescription>
          <SplitText text="출석하고 얻은 포인트로 남들에게 노래를 추천하세요!" tag="span" />
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <GradientText className="text-4xl" colors={['#FFC300', '#FFF59D', '#FB8C00']}>
          <CountUp to={point} duration={0.2} />
        </GradientText>
        <Slider
          value={value}
          onValueChange={setValue}
          max={point}
          step={1}
          showValueLabel
          className="z-50 cursor-pointer"
        />

        <div className="relative w-full">
          <FallingIcons count={value[0]} />
        </div>

        <Button
          className="mt-8 w-full font-bold"
          size="lg"
          onClick={handleClickThumb}
          disabled={value[0] === 0 || isPending}
        >
          추천하기 ({value[0]}P)
        </Button>
      </div>
    </div>
  );
}
