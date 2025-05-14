import { scrapeAllSongs, scrapeSongs, scrapeUtaiteSongs } from "./crawlWiki.js";
import { postSongsDB } from "./supabase/postSongsDB.js";
import { argList } from "./argList.js";

const postSongs = async () => {
  const postPromises = argList.map(async (arg) => {
    const songs = await scrapeSongs(arg);

    // console.log(songs); // 크롤링한 데이터 확인
    // console.log(songs.length); // 크롤링한 데이터 확인

    await postSongsDB(songs);
  });
  await Promise.all(postPromises);
};

const postAllSongs = async () => {
  const allSongs = await scrapeAllSongs();
  const postPromises = allSongs.map(async (song) => {
    await postSongsDB(song);
  });
  await Promise.all(postPromises);
};

const postUtaiteSongs = async () => {
  const utaiteSongs = await scrapeUtaiteSongs();
  const postPromises = utaiteSongs.map(async (song) => {
    await postSongsDB(song);
  });
  await Promise.all(postPromises);
};

// 그대로 활용 불가 (잘못된 데이터 존재)

// postSongs();
// postAllSongs();
// postUtaiteSongs();

// 크롤링 후 데이터 확인
