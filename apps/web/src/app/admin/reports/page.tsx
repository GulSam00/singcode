'use client';

import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import StaticLoading from '@/components/StaticLoading';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminReportsQuery } from '@/queries/adminReportQuery';
import useAuthStore from '@/stores/useAuthStore';
import {
  ADMIN_REPORT_STATUS_FILTERS,
  ADMIN_REPORT_STATUS_FILTER_LABEL,
  AdminReport,
  AdminReportAction,
  AdminReportStatusFilter,
} from '@/types/report';

import AdminReportItem from './AdminReportItem';
import ReviewActionModal from './ReviewActionModal';

export default function AdminReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<AdminReportStatusFilter>('pending');
  const { data, isLoading, error } = useAdminReportsQuery(statusFilter, isAuthenticated);
  const reports = data ?? [];

  const [reviewTarget, setReviewTarget] = useState<{
    report: AdminReport;
    action: AdminReportAction;
  } | null>(null);

  useEffect(() => {
    if (!error) return;
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        toast.error('관리자 권한이 없습니다.');
        router.replace('/');
      }
    }
  }, [error, router]);

  const handleAction = (report: AdminReport, action: AdminReportAction) => {
    setReviewTarget({ report, action });
  };

  const handleClose = () => {
    setReviewTarget(null);
  };

  return (
    <div className="bg-background h-full">
      {isLoading && <StaticLoading />}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">신고 관리</h1>
      </div>

      <div className="flex h-[48px] items-center justify-between p-2">
        <p className="text-muted-foreground text-sm">총 {reports.length}건</p>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={value => setStatusFilter(value as AdminReportStatusFilter)}
        className="mb-2"
      >
        <TabsList className="w-full">
          {ADMIN_REPORT_STATUS_FILTERS.map(filter => (
            <TabsTrigger key={filter} value={filter}>
              {ADMIN_REPORT_STATUS_FILTER_LABEL[filter]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Separator className="mb-2" />

      <ScrollArea className="h-[calc(100vh-22rem)]">
        {reports.length === 0 && !isLoading ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <p>해당 상태의 신고 내역이 없습니다.</p>
          </div>
        ) : (
          reports.map(report => (
            <AdminReportItem key={report.id} report={report} onAction={handleAction} />
          ))
        )}
      </ScrollArea>

      <ReviewActionModal
        isOpen={reviewTarget !== null}
        report={reviewTarget?.report ?? null}
        action={reviewTarget?.action ?? null}
        onClose={handleClose}
      />
    </div>
  );
}
