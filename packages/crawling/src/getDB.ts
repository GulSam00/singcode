import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { transChatGPT } from "./transChatGPT";

function containsJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/.test(text);
}

export async function getDB() {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_KEY || "";

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist")
    .limit(5);

  if (error) throw error;

  const japaneseSongs = data.filter(
    (song) =>
      (song.title && containsJapanese(song.title)) ||
      (song.artist && containsJapanese(song.artist))
  );
  console.log(japaneseSongs);

  return data;
}

const data = await getDB();
console.log(data);

// 만약 null로 반환된다면 해당 id와 함께 배열에 담가두다가 끝났을 때 error.txt에 저장
const transData = await Promise.all(
  data.map(async (song) => {
    const titleTrans = await transChatGPT(song.title);
    const artistTrans = await transChatGPT(song.artist);
    return { ...song, title: titleTrans, artist: artistTrans };
  })
);

console.log(transData);
