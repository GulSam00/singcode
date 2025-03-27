import { scrapeSongs } from './CrawlWiki.js';
import { postDB } from './postDB.js';
import { argList } from './argList.js';

const main = async () => {
  const postPromises = argList.map(async (arg) => {
    const songs = await scrapeSongs(arg);

    // console.log(songs); // 크롤링한 데이터 확인
    // console.log(songs.length); // 크롤링한 데이터 확인

    await postDB(songs);
  });
  await Promise.all(postPromises);
};

main();

// 크롤링 후 데이터 확인
