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
  ReportCategory,
  ReportStatus,
} from '@/types/report';
import { cn } from '@/utils/cn';

interface ReportItemProps {
  report: MyReport;
  onDelete: (report: MyReport) => void;
  isDisabled?: boolean;
}

const STATUS_BADGE_CLASS: Record<ReportStatus, string> = {
  pending:
    'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  applied:
    'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  rejected:
    'border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
};

const CATEGORY_BADGE_CLASS: Record<ReportCategory, string> = {
  title_translation:
    'border border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  artist_translation:
    'border border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300',
  num_tj: 'border border-brand-tj/40 bg-brand-tj/10 text-brand-tj',
  num_ky: 'border border-brand-ky/40 bg-brand-ky/10 text-brand-ky',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
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
            STATUS_BADGE_CLASS[report.status],
          )}
        >
          {REPORT_STATUS_LABEL[report.status]}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            CATEGORY_BADGE_CLASS[report.category],
          )}
        >
          {REPORT_CATEGORY_LABEL[report.category]}
        </span>
        <span className="text-muted-foreground ml-auto text-xs">
          {formatDate(report.created_at)}
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
