import fs from "fs";
import path from "path";

export function logUnknownData<T>(unknownData: T[], filename: string) {
  if (unknownData.length === 0) return;
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

  const logPath = path.join(filename);

  // 로그 문자열 생성
  const logString =
    `\n[${timeString}]\n` +
    unknownData.map((item) => JSON.stringify(item)).join("\n") +
    "\n";

  fs.appendFileSync(logPath, logString, "utf-8");
}
