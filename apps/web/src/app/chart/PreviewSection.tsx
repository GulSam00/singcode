import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

// 허브 한 섹션에 보여줄 미리보기 곡 수
export const PREVIEW_COUNT = 5;

interface PreviewSectionProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

// 허브의 미리보기 블록. 제목 줄 오른쪽의 "전체 보기"로 본래 기능이 있는 화면에 들어간다.
export default function PreviewSection({ title, href, children }: PreviewSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between px-2 pb-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          href={href}
          className="text-muted-foreground flex items-center text-sm hover:underline"
        >
          전체 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
