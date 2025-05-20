import fs from "fs";
import path from "path";

export function updateDataLog<T>(unknownData: T[] | T, filename: string) {
  if (!unknownData) return;
  if (unknownData instanceof Array && unknownData.length === 0) return;

  const now = new Date();
  const timeString = now.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const logPath = path.join("log", filename);
  const logDir = path.dirname(logPath); // 디렉터리 경로 추출

  // 디렉터리가 없으면 생성
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  if (unknownData instanceof Array) {
    // 로그 문자열 생성
    const logString =
      `\n[${timeString}]\n` +
      `\n[총 ${unknownData.length}개의 데이터]\n` +
      unknownData.map((item) => JSON.stringify(item)).join("\n") +
      "\n";

    fs.appendFileSync(logPath, logString, "utf-8");
  } else {
    // 로그 문자열 생성
    const logString =
      `\n[${timeString}]\n` + JSON.stringify(unknownData) + "\n";

    fs.appendFileSync(logPath, logString, "utf-8");
  }
}

export function saveFailedSong(title: string, artist: string) {
  const logPath = path.join("log", "crawlYoutubeFailedList.txt");
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(logPath, `${title}-${artist}\n`, "utf-8");
}

export function loadFailedSongs(): Set<string> {
  const logPath = path.join("log", "crawlYoutubeFailedList.txt");
  if (!fs.existsSync(logPath)) return new Set();
  const lines = fs
    .readFileSync(logPath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return new Set(lines);
}
