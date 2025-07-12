import { sleep } from 'openai/core';

import { getSongsJpnDB, getTransDictionariesDBByOriginal } from '@/supabase/getDB';
import { postTransDictionariesDB } from '@/supabase/postDB';
import { TransDictionary, TransSong } from '@/types';
import { loadDictionariesLog, saveDictionariesLog, updateDataLog } from '@/utils/logData';
import { transChatGPT } from '@/utils/transChatGPT';

const data: TransSong[] = await getSongsJpnDB();
console.log('data to translate : ', data.length);

// 만약 null로 반환된다면 해당 id와 함께 배열에 담가두다가 끝났을 때 error.txt에 저장

const unknownData: { item: TransSong; error: any }[] = [];

const transData: TransDictionary[] = [];

const refreshData = async () => {
  console.log('refreshData');

  const result = await postTransDictionariesDB(transData);
  for (const song of transData) {
    saveDictionariesLog(song.original_japanese);
  }

  updateDataLog(result.success, 'postTransDictionarySuccess.txt');
  updateDataLog(result.failed, 'postTransDictionaryFailed.txt');
  unknownData.length > 0 && updateDataLog(unknownData, 'postTransDictionaryUnknown.txt');

  transData.length = 0;
  unknownData.length = 0;
};

let count = 0;

const tryLogs = loadDictionariesLog();

for (const song of data) {
  if (count >= 10) {
    await refreshData();
    count = 0;
  }
  console.log('count : ', count++);
  await sleep(150); // 0.15초(150ms) 대기

  if (tryLogs.has(song.artist)) {
    continue;
  }

  const dupArtistTrans = await getTransDictionariesDBByOriginal(song.artist);

  if (dupArtistTrans) {
    saveDictionariesLog(song.artist);
    continue;
  }

  if (song.isArtistJp) {
    const artistTrans = await transChatGPT(song.artist);
    if (!artistTrans || artistTrans.length === 0) {
      unknownData.push({ item: song, error: 'transChatGPT failed' });
      transData.push({
        original_japanese: song.artist,
        translated_korean: null,
      });
    } else {
      console.log(song.artist, artistTrans);
      transData.push({
        original_japanese: song.artist,
        translated_korean: artistTrans,
      });
    }
  }
}

refreshData();
