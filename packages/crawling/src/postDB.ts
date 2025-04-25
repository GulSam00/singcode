import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { Song } from "./types";

export async function postDB(songs: Song[] | Song) {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_KEY || "";

  const supabase = createClient(supabaseUrl, supabaseKey);

  let { data, error } = await supabase
    .from("songs")
    .upsert(songs, {
      onConflict: ["title", "artist"],
    })
    .select();

  console.log("res : ", data);

  if (!error) {
    console.log("✅ Supabase에 데이터 저장 완료!");
  } else {
    console.error("❌ Supabase 저장 실패:", error);
  }
}
