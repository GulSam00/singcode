import Image, { type StaticImageData } from 'next/image';

import pina1 from '../../public/characters/pina1.webp';
import pina2 from '../../public/characters/pina2.webp';
import pina3 from '../../public/characters/pina3.webp';
import pina4 from '../../public/characters/pina4.webp';
import pina5 from '../../public/characters/pina5.webp';
import pina6 from '../../public/characters/pina6.webp';

export type SdCharacterVariant = 'default' | 'greeting' | 'focus' | 'joy' | 'curious' | 'sad';

interface SdCharacterProps {
  variant?: SdCharacterVariant;
  size?: number;
  className?: string;
  priority?: boolean;
}

const SD_CHARACTER_SRC: Record<SdCharacterVariant, StaticImageData> = {
  default: pina1,
  greeting: pina2,
  focus: pina3,
  joy: pina4,
  curious: pina5,
  sad: pina6,
};

export default function SdCharacter({
  variant = 'default',
  size = 120,
  className = '',
  priority = true,
}: SdCharacterProps) {
  const src = SD_CHARACTER_SRC[variant];

  return (
    <div className={className} aria-hidden="true">
      <Image
        src={src}
        alt=""
        width={size}
        height={size * 1.25}
        className="drop-shadow-md select-none"
        draggable={false}
        priority={priority}
      />
    </div>
  );
}
