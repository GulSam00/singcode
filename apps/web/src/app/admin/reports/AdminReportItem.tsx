'use client';

import { Check, X } from 'lucide-react';

import ReportFieldCard from '@/components/ReportFieldCard';
import { Button } from '@/components/ui/button';
import {
  AdminReport,
  AdminReportAction,
  REPORT_CATEGORY_LABEL,
  REPORT_CATEGORY_TO_FIELD,
  REPORT_NO_DATA_LABEL,
  REPORT_STATUS_LABEL,
} from '@/types/report';
import { cn } from '@/utils/cn';
import {
  REPORT_CATEGORY_BADGE_CLASS,
  REPORT_STATUS_BADGE_CLASS,
  formatReportDate,
} from '@/utils/reportDisplay';

interface AdminReportItemProps {
  report: AdminReport;
  onAction: (report: AdminReport, action: AdminReportAction) => void;
  isDisabled?: boolean;
}

export default function AdminReportItem({ report, onAction, isDisabled }: AdminReportItemProps) {
  const activeField = REPORT_CATEGORY_TO_FIELD[report.category];
  const newValue = report.suggested_value ?? REPORT_NO_DATA_LABEL;
  const isPending = report.status === 'pending';

  return (
    <div className="border-border border-b py-3 last:border-0">
      <div className="mb-2 flex flex-wrap items-center gap-2 pr-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            REPORT_STATUS_BADGE_CLASS[report.status],
          )}
        >
          {REPORT_STATUS_LABEL[report.status]}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            REPORT_CATEGORY_BADGE_CLASS[report.category],
          )}
        >
          {REPORT_CATEGORY_LABEL[report.category]}
        </span>
        <span className="text-muted-foreground text-xs">{report.nickname}</span>
        <span className="text-muted-foreground ml-auto text-xs">
          {formatReportDate(report.created_at)}
        </span>
      </div>

      <ReportFieldCard
        title={report.title}
        artist={report.artist}
        title_ko={report.title_ko}
        artist_ko={report.artist_ko}
        num_tj={report.num_tj}
        num_ky={report.num_ky}
        activeField={activeField}
        newValue={newValue}
      />

      {isPending && (
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(report, 'reject')}
            disabled={isDisabled}
          >
            <X className="mr-1 h-4 w-4" />
            거부
          </Button>
          <Button size="sm" onClick={() => onAction(report, 'approve')} disabled={isDisabled}>
            <Check className="mr-1 h-4 w-4" />
            승인
          </Button>
        </div>
      )}
    </div>
  );
}
