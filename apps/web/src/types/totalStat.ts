// 유효한 카운트 타입 정의
export type CountType = 'sing_count' | 'like_count';

// all, month, week로 구분하는 타입
export type PeriodType = 'all' | 'year' | 'month';

export interface SongStat {
  value: number;
  title: string;
  artist: string;
  song_id: string;

  sing_count?: number;
  like_count?: number;
  save_count?: number;
}
