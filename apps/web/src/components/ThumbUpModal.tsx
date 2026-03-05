'use client';

import { useState } from 'react';

import CountUp from '@/components/reactBits/CountUp';
import GradientText from '@/components/reactBits/GradientText';
import SplitText from '@/components/reactBits/SplitText';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useSongThumbMutation } from '@/queries/songThumbQuery';
import { useUserQuery } from '@/queries/userQuery';
import { usePatchSetPointMutation } from '@/queries/userQuery';
import useFooterAnimateStore from '@/stores/useFooterAnimateStore';

import FallingIcons from './FallingIcons';

interface ThumbUpModalProps {
  songId: string;
  title: string;
  artist: string;
  thumb: number;
  handleClose: () => void;
}

export default function ThumbUpModal({
  songId,
  title,
  artist,
  thumb,
  handleClose,
}: ThumbUpModalProps) {
  const [value, setValue] = useState([0]);

  const { data: user } = useUserQuery();

  const point = user?.point ?? 0;

  const { mutate: patchSongThumb, isPending: isPendingSongThumb } = useSongThumbMutation();
  const { mutate: patchSetPoint, isPending: isPendingSetPoint } = usePatchSetPointMutation();

  const { setFooterAnimateKey } = useFooterAnimateStore();

  const handleClickThumb = () => {
    patchSongThumb({ songId, point: value[0] });
    patchSetPoint({ point: point - value[0] });

    setFooterAnimateKey('POPULAR');

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
        <div className="flex flex-col items-center">
          {/* 레이블 추가로 가독성 향상 */}
          <span className="mb-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Total Points
          </span>

          <div className="relative flex items-center gap-2">
            <GradientText
              className="text-4xl font-black tracking-tighter"
              colors={['#FFC300', '#FFF59D', '#FB8C00']}
            >
              <CountUp to={thumb} duration={0.5} separator="," />
            </GradientText>

            <div>
              <GradientText className="text-xl font-bold" colors={['#00F260', '#0575E6']}>
                <span>+</span>
                <CountUp to={value[0]} duration={0.8} />
              </GradientText>
            </div>
          </div>
        </div>

        <Slider
          value={value}
          onValueChange={setValue}
          max={point}
          step={1}
          showValueLabel
          className="z-50 cursor-pointer"
        />

        <div className="flex w-full items-center gap-2">
          <Input
            type="number"
            min={0}
            max={point}
            value={value[0]}
            onChange={e => {
              const parsed = Number(e.target.value);
              if (isNaN(parsed)) return;
              const clamped = Math.min(Math.max(parsed, 0), point);
              setValue([clamped]);
            }}
            className="text-center text-lg font-bold"
          />
          <span className="text-muted-foreground text-sm font-bold">P</span>
        </div>

        <div className="relative w-full">
          <FallingIcons count={value[0]} />
          <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center px-4 text-center opacity-50">
            <div className="text-lg font-bold">{title}</div>
            <div className="text-muted-foreground text-sm">{artist}</div>
          </div>
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
