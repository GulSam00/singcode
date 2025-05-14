import { getRelease } from "@repo/open-api";
import { Song } from "./types";
import { postSongsDB } from "./supabase/postSongsDB";
import { updateDataLog } from "./logData";

const parseMonth = (month: number) => {
  return month < 10 ? `0${month}` : month;
};

// TJ는 업데이트 충실한데 금영은 안되있음
// 그냥 TJ 것만 파싱해서 넣을까?
// 기존 DB와 중복되지 않게 tj_num, ky_num 고유값으로

let year = 2007;
let month = 1;

const songs: Song[] = [];
while (year <= 2025) {
  month = 1;
  while (month <= 12) {
    const response = await getRelease({
      release: `${year}${parseMonth(month)}`,
      brand: "tj",
    });
    // console.log("response", response);
    // console.log("response", `${year}${parseMonth(month)}`, response?.length);
    response?.forEach((item) => {
      const { title, singer, no, release } = item;
      songs.push({ title, artist: singer, num_tj: no, num_ky: null, release });
    });
    month++;
  }
  year++;
}

console.log("songs", songs.length);

// TJ 2007~2025 38519곡

const result = await postSongsDB(songs);

updateDataLog(result.success, "log/postByReleaseSuccess.txt");
updateDataLog(result.failed, "log/postByReleaseFailed.txt");
