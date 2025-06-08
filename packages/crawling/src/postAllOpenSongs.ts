import fs from "fs";
import path from "path";
import { getSong } from "@repo/open-api";
import { updateDataLog } from "./logData";
import { LogData, Song } from "./types";
import { postSongsDB } from "./supabase/postDB";

const START_CODE = 0xac00; // '가'
const END_CODE = 0xd7a3; // '힣'

const ALPHA_START_CODE = 0x0041; // 'A'
const ALPHA_END_CODE = 0x005a; // 'Z'

const NUMBER_START_CODE = 0x0030; // '0'
const NUMBER_END_CODE = 0x0039; // '9'

// a ~ z, 0 ~ 9도 따로 처리해야 함

const STATE_FILE = path.join("src", "progress.json");
const ALPHA_STATE_FILE = path.join("src", "alphaProgress.json");

function loadProgress(): number {
  try {
    const data = fs.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data).index ?? START_CODE;
  } catch {
    return START_CODE;
  }
}

function loadAlphaProgress(): number {
  try {
    const data = fs.readFileSync(ALPHA_STATE_FILE, "utf-8");
    return JSON.parse(data).alphaIndex ?? ALPHA_START_CODE;
  } catch {
    return ALPHA_START_CODE;
  }
}

function saveProgress(index: number): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ index }), "utf-8");
}

function saveAlphaProgress(index: number): void {
  fs.writeFileSync(
    ALPHA_STATE_FILE,
    JSON.stringify({ alphaIndex: index }),
    "utf-8"
  );
}

async function getHangulSongs() {
  let index = loadProgress();

  while (index <= END_CODE) {
    const char = String.fromCharCode(index);
    console.log(`[${index}] ${char}`);

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

async function getAlphaSongs() {
  let index = loadAlphaProgress();

  while (index <= ALPHA_END_CODE) {
    const char = String.fromCharCode(index);
    console.log(`[${index}] ${char}`);

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

    saveAlphaProgress(index);
    index++;
  }
}

async function getNumberSongs() {
  let index = NUMBER_START_CODE;

  while (index <= NUMBER_END_CODE) {
    const char = String.fromCharCode(index);
    console.log(`[${index}] ${char}`);

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

    saveAlphaProgress(index);
    index++;
  }
}

// getHangulSongs();
getAlphaSongs();
// getNumberSongs();
