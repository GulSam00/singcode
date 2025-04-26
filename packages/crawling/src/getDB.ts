import { getClient } from "./getClient";
import { TransSong } from "./types";
import { containsJapanese } from "./utils";

export async function getDB() {
  const supabase = getClient();

  // artist 정렬
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist, num_tj, num_ky")
    .order("title", { ascending: false });

  if (error) throw error;

  const hasJapaneseData: TransSong[] = [];

  data.forEach((song) => {
    const newSong: TransSong = { ...song, isTitleJp: false, isArtistJp: false };
    if (song.title && containsJapanese(song.title)) {
      // song 속성 추가
      newSong.isTitleJp = true;
    }
    if (song.artist && containsJapanese(song.artist)) {
      newSong.isArtistJp = true;
    }
    if (newSong.isTitleJp || newSong.isArtistJp) {
      hasJapaneseData.push(newSong);
    }
  });

  return hasJapaneseData;
}
