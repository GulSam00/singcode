'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMyReportsQuery } from '@/queries/reportSongQuery';
import useAuthStore from '@/stores/useAuthStore';
import { MyReport } from '@/types/report';

import DeleteReportModal from './DeleteReportModal';
import ReportItem from './ReportItem';

export default function MyReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useMyReportsQuery(isAuthenticated);
  const reports = data ?? [];

  const [targetReport, setTargetReport] = useState<MyReport | null>(null);

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">내 신고 내역</h1>
      </div>

      <div className="flex h-[48px] items-center justify-between p-2">
        <p className="text-muted-foreground text-sm">총 {reports.length}건</p>
      </div>

      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-20rem)]">
        {reports.length === 0 && !isLoading ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <p className="mb-2">신고한 내역이 없습니다.</p>
            <p>곡 정보 오류를 발견하면 검색 결과에서 신고할 수 있어요.</p>
          </div>
        ) : (
          reports.map(report => (
            <ReportItem key={report.id} report={report} onDelete={setTargetReport} />
          ))
        )}
      </ScrollArea>

      <DeleteReportModal
        isOpen={targetReport !== null}
        report={targetReport}
        onClose={() => setTargetReport(null)}
      />
    </div>
  );
}
