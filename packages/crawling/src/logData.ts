import fs from "fs";
import path from "path";

export function logUnknownData<T>(unknownData: T[], filename: string) {
  if (unknownData.length === 0) return;
  const now = new Date();
  const timeString = now.toISOString();
  const logPath = path.join(filename);

  // 로그 문자열 생성
  const logString =
    `\n[${timeString}]\n` +
    unknownData.map((item) => JSON.stringify(item)).join("\n") +
    "\n";

  fs.appendFileSync(logPath, logString, "utf-8");
}
