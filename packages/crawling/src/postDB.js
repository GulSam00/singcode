import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

export async function postDB(songs) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  let { data, error } = await supabase
    .from('songs')
    .upsert(songs, {
      onConflict: ['title', 'artist'],
    })
    .select();

  console.log('res : ', data);

  if (!error) {
    console.log('✅ Supabase에 데이터 저장 완료!');
  } else {
    console.error('❌ Supabase 저장 실패:', error);
  }
}

// postDB({ title: '아이묭dd', artist: '아이묭 (あいみょん)', num_tj: 1, num_ky: 1 });
