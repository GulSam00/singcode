export interface SongPromotion {
  id: string;
  song_id: string;
  user_id: string;
  nickname: string;
  title: string;
  artist: string;
  title_ko: string | null;
  artist_ko: string | null;
  content: string;
  start_date: string;
  end_date: string;
  remaining_days: number;
}
