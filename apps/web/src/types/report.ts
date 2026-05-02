export type ReportCategory = 'artist_translation' | 'title_translation' | 'num_tj' | 'num_ky';

export const REPORT_CATEGORIES: ReportCategory[] = [
  'title_translation',
  'artist_translation',
  'num_tj',
  'num_ky',
];

export const REPORT_CATEGORY_LABEL: Record<ReportCategory, string> = {
  title_translation: '제목 번역',
  artist_translation: '가수 번역',
  num_tj: 'TJ 번호',
  num_ky: '금영 번호',
};

export type ReportStatus = 'pending' | 'applied' | 'rejected';

export const REPORT_STATUSES: ReportStatus[] = ['pending', 'applied', 'rejected'];

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '대기중',
  applied: '반영됨',
  rejected: '거절됨',
};
