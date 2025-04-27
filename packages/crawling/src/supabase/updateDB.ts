import { getClient } from "./getClient";
import { TransSong } from "../types";

export const updateDB = async (song: TransSong) => {
  const supabase = getClient();

  if (song.isArtistJp || song.isTitleJp) {
    const { data, error } = await supabase
      .from("songs")
      .update({ title: song.title, artist: song.artist })
      .eq("id", song.id)
      .select();
  }
};
