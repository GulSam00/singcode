import { getClient } from './getClient';

// PostgREST는 delete 필터를 쿼리스트링에 실으므로 id를 너무 많이 넣으면 URL 길이 제한에 걸린다.
const IDS_PER_REQUEST = 100;

async function deleteByIds(table: string, column: string, ids: string[]) {
  const supabase = getClient();
  let deleted = 0;

  for (let i = 0; i < ids.length; i += IDS_PER_REQUEST) {
    const chunk = ids.slice(i, i + IDS_PER_REQUEST);
    const { error } = await supabase.from(table).delete().in(column, chunk);

    if (error) {
      console.error(`${table} 삭제 실패:`, error);
      return { deleted, failed: ids.length - deleted };
    }

    deleted += chunk.length;
  }

  return { deleted, failed: 0 };
}

/** song_tags는 songs를 참조하므로 곡보다 먼저 지워야 한다. */
export async function deleteSongTagsBySongIdsDB(songIds: string[]) {
  return deleteByIds('song_tags', 'song_id', songIds);
}

// invalid_ky_songs / verify_ky_songs는 별도 song_id 컬럼 없이
// PK인 id가 곧 songs.id를 참조한다 (FK: invalid_ky_song_id_fkey).
export async function deleteKyLogsBySongIdsDB(songIds: string[]) {
  const invalid = await deleteByIds('invalid_ky_songs', 'id', songIds);
  const verified = await deleteByIds('verify_ky_songs', 'id', songIds);

  return { invalid, verified };
}

export async function deleteSongsByIdsDB(songIds: string[]) {
  return deleteByIds('songs', 'id', songIds);
}
