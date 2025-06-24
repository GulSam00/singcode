import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { getSongsKyNotNullDB } from "./supabase/getDB";
import { Song } from "./types";
import { updateDataLog, saveFailedSong, loadFailedSongs } from "./logData";
import { updateSongsKyDB } from "./supabase/updateDB";

const stackData: Song[] = [];
const totalData: Song[] = [];

const browser = await puppeteer.launch();
const page = await browser.newPage();

const baseUrl = "https://kysing.kr/search/?category=1&keyword=";
// KY에서는 가사도 크롤링 가능??? 가사 넣을 수 있나???
// TJ에서는 지원 안함, KY에서만 가능한 것 같음

const vaildExistNumber = async (number: string) => {
  const searchUrl = baseUrl + number;

  // page.goto의 waitUntil 문제였음!
  await page.goto(searchUrl, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  const html = await page.content();
  const $ = cheerio.load(html);

  // const chartList = $("search_chart_list")[1];
  const title = $(".search_chart_tit").find(".tit").eq(0).text().trim();
  const artist = $(".search_chart_tit").find(".tit").eq(1).text().trim();
  // console.log(chartList);
  console.log("title : ", title);
  console.log("artist : ", artist);
};

const refreshData = async () => {
  console.log("refreshData");
  const result = await updateSongsKyDB(stackData);

  for (const failedItem of result.failed) {
    const { title, artist } = failedItem.song;
    saveFailedSong(title, artist);
  }

  updateDataLog(result.success, "crawlYoutubeSuccess.txt");
  updateDataLog(result.failed, "crawlYoutubeFailed.txt");

  stackData.length = 0; // stackData 초기화
};
// 사용

const data = await getSongsKyNotNullDB();
const failedSongs = loadFailedSongs();

console.log("getSongsKyNotNullDB : ", data.length);
let index = 0;

for (const song of data) {
  if (stackData.length >= 10) {
    refreshData();
  }
  const query = song.title + "-" + song.artist;

  // if (failedSongs.has(query)) {
  //   // console.log("already failed : ", song.title, " - ", song.artist);
  //   // index++;
  //   continue;
  // }

  console.log(song.title, " - ", song.artist + " : ", song.num_ky);

  const result = await vaildExistNumber(song.num_ky);

  // if (result) {
  //   console.log("success : ", result);
  //   stackData.push({ ...song, num_ky: result });
  //   totalData.push({ ...song, num_ky: result });
  // } else saveFailedSong(song.title, song.artist);

  index++;
  console.log("scrapeSongNumber : ", index);
  console.log("stackData : ", stackData.length);
}

console.log("totalData : ", totalData.length);

// const result = await updateSongsKyDB(stackData);

// updateDataLog(result.success, "crawlYoutubeSuccess.txt");
// updateDataLog(result.failed, "crawlYoutubeFailed.txt");
