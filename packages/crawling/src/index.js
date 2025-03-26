import { scrapeSongs } from './CrawlWiki.js';
import { postDB } from './postDB.js';

const main = async () => {
  const songs = await scrapeSongs('아이묭');
  await postDB(songs);
};

main();

// 크롤링 후 데이터 확인
