import { scrapeAllSongs, scrapeSongs, scrapeUtaiteSongs } from './CrawlWiki.js';
import { postDB } from './postDB.js';
import { argList } from './argList.js';

const postSongs = async () => {
  const postPromises = argList.map(async (arg) => {
    const songs = await scrapeSongs(arg);

    // console.log(songs); // 크롤링한 데이터 확인
    // console.log(songs.length); // 크롤링한 데이터 확인

    await postDB(songs);
  });
  await Promise.all(postPromises);
};

const postAllSongs = async () => {
  const allSongs = await scrapeAllSongs();
  const postPromises = allSongs.map(async (song) => {
    await postDB(song);
  });
  await Promise.all(postPromises);
};

const postUtaiteSongs = async () => {
  const utaiteSongs = await scrapeUtaiteSongs();
  const postPromises = utaiteSongs.map(async (song) => {
    await postDB(song);
  });
  await Promise.all(postPromises);
};

// postSongs();
// postAllSongs();
// postUtaiteSongs();

// 크롤링 후 데이터 확인
