import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

import { ArgList, Song } from "./types";

import { parseNumber, parseJapaneseText, parseText } from "./utils";
dotenv.config();

// ✅ 나무위키에서 데이터 크롤링
export async function scrapeSongs(dst: ArgList) {
  try {
    const { url, artist, titleIndex, tjIndex, kyIndex } = dst;
    if (!url || !artist) {
      throw new Error("url 또는 artist가 없습니다.");
    }

    const baseUrl = "https://namu.wiki/w/";
    const endURL =
      "/%EB%85%B8%EB%9E%98%EB%B0%A9%20%EC%88%98%EB%A1%9D%20%EB%AA%A9%EB%A1%9D";
    const fullURL = baseUrl + url + endURL;
    console.log(fullURL);
    const { data } = await axios.get(fullURL);
    // const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);

    let songs: Song[] = [];

    $("table tbody tr").each((index, element) => {
      const cols = $(element).find("td");

      const title = parseJapaneseText($(cols[titleIndex]).text());
      const num_tj = parseNumber($(cols[tjIndex]).text().trim().slice(0, 5));
      const num_ky = parseNumber($(cols[kyIndex]).text().trim().slice(0, 5));
      if (num_tj || num_ky) {
        songs.push({ title, artist, num_tj, num_ky });
      }
    });

    return songs;
  } catch (error) {
    console.error("크롤링 실패:", error);
    return [];
  }
}

export async function scrapeAllSongs() {
  try {
    const titleIndex = 2;
    const artistIndex = 3;
    const tjIndex = 0;
    const kyIndex = 1;

    const baseUrl = "https://namu.wiki/w/";
    const url = "애니메이션%20음악/노래방%20수록%20목록/전체곡%20일람";
    const fullURL = baseUrl + url;
    console.log(fullURL);
    const { data } = await axios.get(fullURL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);

    let songs: Song[] = [];

    $("table tbody tr").each((index, element) => {
      const cols = $(element).find("td");

      const title = parseText($(cols[titleIndex]).text());
      const artist = parseText($(cols[artistIndex]).text());
      const num_tj = parseNumber($(cols[tjIndex]).text().trim().slice(0, 5));
      const num_ky = parseNumber($(cols[kyIndex]).text().trim().slice(0, 5));
      if (num_tj || num_ky) {
        songs.push({ title, artist, num_tj, num_ky });
      }
    });

    return songs;
  } catch (error) {
    console.error("크롤링 실패:", error);
    return [];
  }
}

export async function scrapeUtaiteSongs() {
  try {
    const titleIndex = 2;
    const artistIndex = 3;
    const tjIndex = 0;
    const kyIndex = 1;

    const baseUrl = "https://namu.wiki/w/";
    const url = "우타이테 오리지널 곡/노래방 수록 목록";
    const fullURL = baseUrl + url;
    console.log(fullURL);
    const { data } = await axios.get(fullURL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);

    let songs: Song[] = [];

    $("table tbody tr").each((index, element) => {
      const cols = $(element).find("td");

      const title = parseText($(cols[titleIndex]).text());
      const artist = parseText($(cols[artistIndex]).text());
      const num_tj = parseNumber($(cols[tjIndex]).text().trim().slice(0, 5));
      const num_ky = parseNumber($(cols[kyIndex]).text().trim().slice(0, 5));
      if (num_tj || num_ky) {
        songs.push({ title, artist, num_tj, num_ky });
      }
    });

    return songs;
  } catch (error) {
    console.error("크롤링 실패:", error);
    return [];
  }
}
