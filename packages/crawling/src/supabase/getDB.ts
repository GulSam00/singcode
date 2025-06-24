import { getClient } from "./getClient";
import { Song, TransSong, TransDictionary } from "../types";
import { containsJapanese } from "../utils";

export async function getSongsJpnDB() {
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
    // if (song.title && containsJapanese(song.title)) {
    //   // song 속성 추가
    //   newSong.isTitleJp = true;
    // }
    if (song.artist && containsJapanese(song.artist)) {
      newSong.isArtistJp = true;
    }
    if (newSong.isTitleJp || newSong.isArtistJp) {
      hasJapaneseData.push(newSong);
    }
  });

  return hasJapaneseData;
}

export async function getSongsKyNullDB(max: number = 50000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist, num_tj, num_ky")
    .is("num_ky", null) // num_ky가 null인 데이터만 가져옴
    .order("created_at", { ascending: false }) // 최근 생성한 데이터 순으로 정렬
    .limit(max); // Supabase 쿼리 안에서의 한계를 넘을 수는 없음

  if (error) throw error;

  console.log("data", data.length);

  return data;

  // const isKYNULLData: Song[] = [];

  // data.forEach((song) => {
  //   if (song.num_ky === null) {
  //     isKYNULLData.push(song);
  //   }
  // });

  // return isKYNULLData.slice(0, max);
}

export async function getSongsKyNotNullDB(max: number = 50000) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist, num_tj, num_ky")
    .not("num_ky", "is", null) // num_ky가 null이 아닌 데이터만 가져옴
    .order("updated_at", { ascending: true })
    .limit(max); // Supabase 쿼리 안에서의 한계를 넘을 수는 없음

  if (error) throw error;

  return data;
}

export async function getTransDictionariesDB(): Promise<TransDictionary[]> {
  const supabase = getClient();

  // artist 정렬
  const { data, error } = await supabase.from("trans_dictionaries").select("*");

  if (error) throw error;

  return data;
}
export async function getTransDictionariesDBByOriginal(
  original: string
): Promise<TransDictionary | null> {
  const supabase = getClient();

  // artist 정렬
  const { data, error } = await supabase
    .from("trans_dictionaries")
    .select("*")
    .eq("original_japanese", original)
    .limit(1);

  if (error) throw error;

  return data[0] ?? null;
}
