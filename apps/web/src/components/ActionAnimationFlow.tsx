'use client';

import Lottie from 'lottie-react';
import React, { ReactNode, useState } from 'react';

interface ActionAnimationFlowProps {
  // 1. 실행할 로티 애니메이션 데이터
  animationData: unknown;
  // 2. 대기 화면 (함수형으로 받아서 'trigger' 함수를 전달해줍니다)
  idleView: (trigger: () => void) => ReactNode;
  // 3. 결과 화면
  doneView: ReactNode;
  // (옵션) 애니메이션 크기 등 스타일
  className?: string;
  clickCallback?: () => void;
}

export default function ActionAnimationFlow({
  animationData,
  idleView,
  doneView,
  className = 'w-64 h-64',
  clickCallback,
}: ActionAnimationFlowProps) {
  const [status, setStatus] = useState<'IDLE' | 'PLAYING' | 'DONE'>('IDLE');

  const trigger = () => {
    if (clickCallback) {
      clickCallback();
    }
    setStatus('PLAYING');
  };
  const handleComplete = () => setStatus('DONE');

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* 1. 대기 상태: trigger 함수를 자식에게 넘겨줌 */}
      {status === 'IDLE' && idleView(trigger)}

      {/* 2. 재생 상태 */}
      {status === 'PLAYING' && (
        <div className={className}>
          <Lottie
            animationData={animationData}
            loop={false}
            autoplay={true}
            onComplete={handleComplete}
          />
        </div>
      )}

      {/* 3. 완료 상태 */}
      {status === 'DONE' && doneView}
    </div>
  );
}
