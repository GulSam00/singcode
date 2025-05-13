import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { getKYNULLDB } from "./supabase/getDB";
import { Song } from "./types";
import { updateDataLog } from "./logData";
import { updateKYDB } from "./supabase/updateDB";

const successCase: Song[] = [];
const failedCase: Song[] = [];

// process.on("SIGINT", async () => {
//   console.log("프로세스가 종료됩니다. 지금까지의 데이터를 업데이트 중...");
//   console.log("resultData : ", resultData.length);
//   const result = await updateKYDB(resultData);

//   console.log(result);
//   console.log("프로세스가 종료됩니다. 로그를 기록 중...");

//   await Promise.all([
//     updateDataLog(successCase, "log/crawlYodutubeSuccess.txt"),
//     updateDataLog(failedCase, "log/crawlYoutubeFailed.txt"),
//   ]);

//   console.log("로그 기록 완료.");
// });

const browser = await puppeteer.launch();
const page = await browser.newPage();

const baseUrl = "https://www.youtube.com/@KARAOKEKY/search";

async function scrapeSongNumber(query: string) {
  const searchUrl = `${baseUrl}?query=${encodeURIComponent(query)}`;

  // page.goto의 waitUntil 문제였음!
  await page.goto(searchUrl, {
    waitUntil: "networkidle2",
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  // id contents 의 첫번째  ytd-item-section-renderer 찾기
  // const firstItem = $("#contents ytd-item-section-renderer").first();

  // await 안해도 해결!
  // await page.waitForSelector("ytd-video-renderer");

  const firstItem = $("ytd-video-renderer").first();

  // yt-formatted-string 찾기
  const title = firstItem.find("yt-formatted-string").first().text().trim();

  const karaokeNumber = extractKaraokeNumber(title);

  // await browser.close();

  return karaokeNumber;
}

function extractKaraokeNumber(title: string) {
  // KY. 찾고 ) 가 올때까지 찾기
  const matchResult = title.match(/KY\.\s*(\d{2,5})\)/);
  const karaokeNumber = matchResult ? matchResult[1] : null;
  return karaokeNumber;
}

// 사용

const data = await getKYNULLDB(5000);
console.log("getKYNULLDB : ", data.length);
const resultData: Song[] = [];
let index = 0;

for (const song of data) {
  const query = song.title + "-" + song.artist;
  console.log(song.title, " - ", song.artist);
  const result = await scrapeSongNumber(query);
  if (result) {
    console.log("success : ", result);
    resultData.push({ ...song, num_ky: result });
    successCase.push(song);
  } else {
    failedCase.push(song);
  }
  index++;
  console.log("scrapeSongNumber : ", index);
}

console.log("resultData : ", resultData.length);
const result = await updateKYDB(resultData);

console.log(result);

updateDataLog(result.success, "log/crawlYoutubeSuccess.txt");
updateDataLog(result.failed, "log/crawlYoutubeFailed.txt");
