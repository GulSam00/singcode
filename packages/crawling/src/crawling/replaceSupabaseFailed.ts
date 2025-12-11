import { getSongsKyNullDB } from '@/supabase/getDB';
import { postInvalidKYSongsDB } from '@/supabase/postDB';
import { Song } from '@/types';
import { loadCrawlYoutubeFailedKYSongs, loadValidKYSongs } from '@/utils/logData';

const data: Song[] = await getSongsKyNullDB();
const failedSongs = loadValidKYSongs();

console.log('getSongsKyNullDB : ', data.length);
console.log('size : ', failedSongs.size);
let index = 0;
let successCount = 0;

for (const song of data) {
  const query = song.title + '-' + song.artist;

  if (failedSongs.has(query)) {
    console.log('post song : ', song);
    await postInvalidKYSongsDB(song);
    successCount++;

    continue;
  }
  index++;
}

console.log('successCount : ', successCount);
console.log('index : ', index);
