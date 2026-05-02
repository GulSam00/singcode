'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteMyReportMutation } from '@/queries/reportSongQuery';
import { MyReport, REPORT_CATEGORY_LABEL } from '@/types/report';

interface DeleteReportModalProps {
  isOpen: boolean;
  report: MyReport | null;
  onClose: () => void;
}

export default function DeleteReportModal({ isOpen, report, onClose }: DeleteReportModalProps) {
  const { mutate: deleteReport, isPending } = useDeleteMyReportMutation();

  const handleDelete = () => {
    if (!report) return;
    deleteReport(report.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            신고 내역 삭제
          </DialogTitle>
          <DialogDescription>
            {report
              ? `${report.title || '해당 곡'} - ${REPORT_CATEGORY_LABEL[report.category]} 신고를 삭제합니다.`
              : '신고 내역을 삭제합니다.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-muted-foreground text-center text-sm">
            정말 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button onClick={handleDelete} disabled={isPending} variant="destructive">
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
