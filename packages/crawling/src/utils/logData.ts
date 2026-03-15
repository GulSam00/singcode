import fs from 'fs';
import path from 'path';

export function saveDictionariesLog(japanese: string) {
  const logPath = path.join('src', 'assets', 'transList.txt');
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(logPath, `${japanese}\n`, 'utf-8');
}

export function loadDictionariesLog(): Set<string> {
  const logPath = path.join('src', 'assets', 'transList.txt');
  if (!fs.existsSync(logPath)) return new Set();
  const lines = fs
    .readFileSync(logPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return new Set(lines);
}

export function loadCrawlYoutubeFailedKYSongs(): Set<string> {
  const logPath = path.join('src', 'assets', 'crawlKYYoutubeFailedList.txt');
  if (!fs.existsSync(logPath)) return new Set();
  const lines = fs
    .readFileSync(logPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return new Set(lines);
}

export function saveValidKYSongs(title: string, artist: string) {
  const logPath = path.join('src', 'assets', 'crawlKYValidList.txt');
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(logPath, `${title}-${artist}\n`, 'utf-8');
}

export function loadValidKYSongs(): Set<string> {
  const logPath = path.join('src', 'assets', 'crawlKYValidList.txt');
  if (!fs.existsSync(logPath)) return new Set();
  const lines = fs
    .readFileSync(logPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return new Set(lines);
}
