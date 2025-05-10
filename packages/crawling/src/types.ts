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
  release?: string;
}

export interface TransSong extends Song {
  isTitleJp: boolean;
  isArtistJp: boolean;
  type?: "title" | "artist";
}
