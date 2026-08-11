export type SearchType = 'all' | 'title' | 'artist' | 'number';

// TJ는 한 곡에 반주를 여러 버전으로 등록한다. 차트에도 버전별로 따로 오르고
// 검색 결과에도 나란히 나오므로, 무엇이 다른지 알려면 이 뱃지가 필요하다.
//
// 'MV'(뮤직비디오 유무)는 어느 버전을 부를지 고르는 데 도움이 안 되므로 노출하지 않는다.
// '60'은 구형 반주기에서 재생되지 않는다는 뜻이라 실사용에 중요하다.
export const VERSION_BADGES = ['MR', 'LV', '60'] as const;

// 라벨 자체에는 브랜드를 넣지 않는다. 카드에 TJ·금영 번호가 나란히 있어 오해 소지가 있으므로,
// SongBadges가 뱃지 묶음 앞에 TJ 표식을 한 번 붙여 묶음 전체가 TJ 정보임을 나타낸다.
export const BADGE_LABEL: Record<string, string> = {
  MR: 'MR',
  LV: 'LIVE',
  '60': '60↑',
};

export const BADGE_DESCRIPTION: Record<string, string> = {
  MR: '가이드 보컬이 없는 MR 버전',
  LV: '라이브 버전',
  '60': 'TJ 60 이상 반주기에서만 재생되는 곡',
};

/** 화면에 표시할 버전 뱃지만 걸러낸다. */
export function toVisibleBadges(badges: string[] | null | undefined) {
  if (!badges) return [];
  return VERSION_BADGES.filter(badge => badges.includes(badge));
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  title_ko?: string;
  artist_ko?: string;

  num_tj: string;
  num_ky: string;

  // TJ 반주 버전 뱃지. null이면 아직 수집 전, 빈 배열이면 수집했으나 뱃지 없음.
  // 값: 'MV' | 'MR' | 'LV' | '60' (packages/crawling 과 의도적으로 중복 정의)
  badges?: string[] | null;

  thumb?: number;
  release?: string;
  created_at?: string;
}

export interface ToSingSong {
  order_weight: number;
  songs: Song;
}

// 즐겨찾기 곡과 최근 곡에서 공통으로 사용하는 타입
export interface PersonalSong extends Song {
  user_id: string;
  song_id: string;
  created_at: string;
  isInToSingList: boolean;
}

export interface SaveSong extends Song {
  user_id: string;
  song_id: string;
  folder_id: string;
  created_at: string;
  isInToSingList: boolean;
  folder_name: string;
  updated_at: Date;
}

export interface SaveActivity {
  id: string;
  user_id: string;
  song_id: string;
  folder_id: string;

  created_at: string;
  updated_at: string;
}

export interface SaveSongFolder {
  folder_id: string;
  folder_name: string;
  songList: SaveSong[];
}

export interface SaveSongFolderList {
  id: string;
  user_id: string;
  folder_name: string;
  songItem: SaveActivity[];

  created_at: string;
  updated_at: string;
}

export interface SearchSong extends Song {
  isToSing: boolean;
  isLike: boolean;
  isSave: boolean;
}

export interface AddListModalSong extends Song {
  isInToSingList: boolean;
  id: string;
  song_id: string;
  user_id: string;
}

export interface ThumbUpSong extends Song {
  thumb_count: number;
}
