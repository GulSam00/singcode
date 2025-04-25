export interface ArgList {
  url: string;
  artist: string;
  titleIndex: number;
  tjIndex: number;
  kyIndex: number;
}

export interface Song {
  title: string;
  artist: string;
  num_tj: string | null;
  num_ky: string | null;
}
