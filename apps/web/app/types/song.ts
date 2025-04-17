export interface ToSingSong {
  order_weight: number;
  songs: Song;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  num_tj: string;
  num_ky: string;
}

export interface PersonalSong extends Song {
  user_id: string;
  song_id: string;
  created_at: string;
  isInToSingList: boolean;
}

export interface SearchSong extends Song {
  isLiked: boolean;
  isToSing: boolean;
}

export interface AddListModalSong extends Song {
  isInToSingList: boolean;
  id: string;
  song_id: string;
  user_id: string;
}
