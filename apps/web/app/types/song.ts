export interface Song {
  id: string;
  title: string;
  artist: string;
  num_tj: string;
  num_ky: string;
}
export interface SearchSong extends Song {
  isLiked: boolean;
  isToSing: boolean;
}
