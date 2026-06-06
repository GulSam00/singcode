import { type ReactNode } from 'react';

import SdCharacter, { type SdCharacterVariant } from '@/components/SdCharacter';
import { cn } from '@/utils/cn';

interface CharacterMessageProps {
  message: ReactNode;
  variant?: SdCharacterVariant;
  size?: number;
  className?: string;
}

// variant별 캐릭터 애니메이션 (지정되지 않은 variant는 정적 표시)
const VARIANT_ANIMATION: Partial<Record<SdCharacterVariant, string>> = {
  default: 'animate-character-bounce',
  greeting: 'animate-character-bounce',
  joy: 'animate-character-bounce',
  sad: 'animate-character-shake',
};

export default function CharacterMessage({
  message,
  variant = 'default',
  size = 200,
  className = '',
}: CharacterMessageProps) {
  const animationClassName = VARIANT_ANIMATION[variant];

  return (
    <div
      className={cn(
        'text-muted-foreground flex flex-col items-center justify-center py-6',
        className,
      )}
    >
      <SdCharacter variant={variant} size={size} className={cn('mb-2', animationClassName)} />
      <p className="m-2 text-center text-lg">{message}</p>
    </div>
  );
}
