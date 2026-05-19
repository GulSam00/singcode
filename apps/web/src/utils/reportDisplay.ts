import { ReportCategory, ReportStatus } from '@/types/report';

export const REPORT_STATUS_BADGE_CLASS: Record<ReportStatus, string> = {
  pending:
    'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  applied:
    'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  rejected:
    'border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
};

export const REPORT_CATEGORY_BADGE_CLASS: Record<ReportCategory, string> = {
  title_translation:
    'border border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  artist_translation:
    'border border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300',
  num_tj: 'border border-brand-tj/40 bg-brand-tj/10 text-brand-tj',
  num_ky: 'border border-brand-ky/40 bg-brand-ky/10 text-brand-ky',
};

export function formatReportDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
