import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// 허브(/chart)에서 들어온 전체 보기 화면의 제목 줄. 허브로 돌아가는 링크를 함께 둔다.
export default function ChartPageHeader({ title }: { title: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link href="/chart" aria-label="노래방 차트로 돌아가기" className="-ml-2 p-1">
        <ChevronLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
