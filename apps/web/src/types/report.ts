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

export type ReportCardField = 'title' | 'artist' | 'num_tj' | 'num_ky';

export const REPORT_CATEGORY_TO_FIELD: Record<ReportCategory, ReportCardField> = {
  title_translation: 'title',
  artist_translation: 'artist',
  num_tj: 'num_tj',
  num_ky: 'num_ky',
};

export const REPORT_NO_DATA_LABEL = '데이터 없음';

export type ReportStatus = 'pending' | 'applied' | 'rejected';

export const REPORT_STATUSES: ReportStatus[] = ['pending', 'applied', 'rejected'];

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '대기중',
  applied: '반영됨',
  rejected: '거절됨',
};

export interface MyReport {
  id: string;
  song_id: string;
  category: ReportCategory;
  suggested_value: string | null;
  status: ReportStatus;
  created_at: string;
  title: string;
  artist: string;
  title_ko?: string;
  artist_ko?: string;
  num_tj: string;
  num_ky: string;
}
