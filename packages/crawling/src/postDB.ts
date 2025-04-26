import { Song } from "./types";
import { getClient } from "./getClient";

export async function postDB(songs: Song[] | Song) {
  const supabase = getClient();

  let { data, error } = await supabase
    .from("songs")
    .upsert(songs, {
      onConflict: ["title", "artist"],
    })
    .select();

  console.log("res : ", data);

  if (!error) {
    console.log("✅ Supabase에 데이터 저장 완료!");
  } else {
    console.error("❌ Supabase 저장 실패:", error);
  }
}
