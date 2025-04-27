import { Song } from "../types";
import { getClient } from "./getClient";

export async function postDB(songs: Song[] | Song) {
  const supabase = getClient();
  const songsArray = Array.isArray(songs) ? songs : [songs];

  const results = {
    success: [] as Song[],
    failed: [] as { song: Song; error: any }[],
  };

  // 각 곡을 개별적으로 처리
  for (const song of songsArray) {
    try {
      const { data, error } = await supabase
        .from("songs")
        .upsert(song, {
          onConflict: ["title", "artist"],
        })
        .select();

      if (error) {
        results.failed.push({ song, error });
        // console.error(`❌ 저장 실패 - ${song.title}: `, song);
      } else {
        results.success.push(song);
      }
    } catch (error) {
      results.failed.push({ song, error });
      // console.error(`❌ 예외 발생 - ${song.title}: `, song);
    }
  }

  // 최종 결과 출력
  console.log(`
    총 ${songsArray.length}곡 중:
    - 성공: ${results.success.length}곡
    - 실패: ${results.failed.length}곡
  `);

  return results;
}
