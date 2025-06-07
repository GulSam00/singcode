export interface ArgList {
  url: string;
  artist: string;
  titleIndex: number;
  tjIndex: number;
  kyIndex: number;
}

export interface Song {
  id?: string;
  title: string;
  artist: string;
  num_tj: string | null;
  num_ky: string | null;
  release?: string | null;
}

export interface TransSong extends Song {
  isTitleJp: boolean;
  isArtistJp: boolean;
  type?: "title" | "artist";
}

export interface TransDictionary {
  id?: string;
  original_japanese: string;
  translated_korean: string | null;
  created_at?: string;
}

export interface LogData<T> {
  success: T[];
  failed: { item: T; error: any }[];
}
