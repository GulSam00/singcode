'use client';

import { Trash2 } from 'lucide-react';

import ReportFieldCard from '@/components/ReportFieldCard';
import { Button } from '@/components/ui/button';
import {
  MyReport,
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

interface ReportItemProps {
  report: MyReport;
  onDelete: (report: MyReport) => void;
  isDisabled?: boolean;
}

export default function ReportItem({ report, onDelete, isDisabled }: ReportItemProps) {
  const activeField = REPORT_CATEGORY_TO_FIELD[report.category];
  const newValue = report.suggested_value ?? REPORT_NO_DATA_LABEL;

  return (
    <div className="border-border border-b py-3 last:border-0">
      <div className="mb-2 flex items-center gap-2 pr-4">
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
        <span className="text-muted-foreground ml-auto text-xs">
          {formatReportDate(report.created_at)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDelete(report)}
          disabled={isDisabled}
          aria-label="신고 삭제"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
    </div>
  );
}
