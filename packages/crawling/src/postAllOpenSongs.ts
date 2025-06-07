import fs from "fs";
import path from "path";
import { getSong } from "@repo/open-api";
import { updateDataLog } from "./logData";
import { LogData, Song } from "./types";
import { postSongsDB } from "./supabase/postDB";

const START_CODE = 0xac00; // '가'
const END_CODE = 0xd7a3; // '힣'

// a ~ z, 0 ~ 9도 따로 처리해야 함

const STATE_FILE = path.join("src", "progress.json");

function loadProgress(): number {
  try {
    const data = fs.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data).index ?? START_CODE;
  } catch {
    return START_CODE;
  }
}

function saveProgress(index: number): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ index }), "utf-8");
}

function getNextHangulCharacter(index: number): string {
  return String.fromCharCode(index);
}

async function main() {
  let index = loadProgress();

  while (index <= END_CODE) {
    const char = getNextHangulCharacter(index);
    console.log(`[${index}] ${char}`);

    // 여기서 원하는 작업 수행
    // 예: GPT 번역 요청, DB 저장, 로그 작성 등

    const response = await getSong({ title: char, brand: "tj" });
    if (!response) {
      console.log("null");
      continue;
    }

    console.log(response.length);
    const songs = response.map((item) => ({
      title: item.title,
      artist: item.singer,
      num_tj: item.no,
      num_ky: null,
      release: item.release === "0000-00-00" ? null : item.release,
    }));
    const result: LogData<Song> = await postSongsDB(songs);

    updateDataLog(result.success, "postByAllOpenSuccess.txt");
    updateDataLog(result.failed, "postByAllOpenFailed.txt");

    saveProgress(index);
    index++;
  }
}

main();
