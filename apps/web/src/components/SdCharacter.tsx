import Image from 'next/image';

interface SdCharacterProps {
  variant?: 'default' | 'sad';
  size?: number;
  className?: string;
}

export default function SdCharacter({
  variant = 'default',
  size = 120,
  className = '',
}: SdCharacterProps) {
  const src =
    variant === 'sad' ? '/characters/sd-character-sad.svg' : '/characters/sd-character.svg';

  return (
    <div className={className} aria-hidden="true">
      <Image
        src={src}
        alt=""
        width={size}
        height={size * 1.25}
        className="drop-shadow-md select-none"
        draggable={false}
        priority={false}
      />
    </div>
  );
}
