'use client';

import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePatchAdminReportMutation } from '@/queries/adminReportQuery';
import {
  AdminReport,
  AdminReportAction,
  REPORT_CATEGORY_LABEL,
  REPORT_NO_DATA_LABEL,
} from '@/types/report';

interface ReviewActionModalProps {
  isOpen: boolean;
  report: AdminReport | null;
  action: AdminReportAction | null;
  onClose: () => void;
}

export default function ReviewActionModal({
  isOpen,
  report,
  action,
  onClose,
}: ReviewActionModalProps) {
  const { mutate, isPending } = usePatchAdminReportMutation();

  const handleConfirm = () => {
    if (!report || !action) return;
    mutate(
      { reportId: report.id, action },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const isApprove = action === 'approve';
  const titleText = isApprove ? '신고 승인' : '신고 거부';
  const Icon = isApprove ? Check : X;
  const suggestedValue = report?.suggested_value ?? REPORT_NO_DATA_LABEL;
  const categoryLabel = report ? REPORT_CATEGORY_LABEL[report.category] : '';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {titleText}
          </DialogTitle>
          <DialogDescription>
            {report
              ? `${report.title || '해당 곡'} - ${categoryLabel} 신고를 ${isApprove ? '승인' : '거부'}합니다.`
              : '신고를 처리합니다.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isApprove ? (
            <p className="text-muted-foreground text-center text-sm">
              제안값{' '}
              <span className="text-foreground font-semibold">&quot;{suggestedValue}&quot;</span>
              으로 곡 정보가 업데이트됩니다.
            </p>
          ) : (
            <p className="text-muted-foreground text-center text-sm">
              이 신고를 거부 상태로 변경합니다.
            </p>
          )}
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            variant={isApprove ? 'default' : 'destructive'}
          >
            {isPending ? '처리 중...' : isApprove ? '승인' : '거부'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
