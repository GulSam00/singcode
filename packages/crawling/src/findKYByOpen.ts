import { getSong } from "@repo/open-api";
import { Song } from "./types";
import { updateKYDB } from "./supabase/updateDB";

const getKYByOpen = async (song: Song) => {
  const { title, artist } = song;
  const response = await getSong({ title, brand: "kumyoung" });

  const trimArtist = artist.trim();
  // 가수 일치하거나 비슷한지 조회
  if (response && response.length > 0) {
    const filteredResponse = response.filter((item) => {
      const artistName = item.singer.trim();
      return artistName.includes(trimArtist);
    });

    if (filteredResponse.length === 1) {
      const kyNum = filteredResponse[0].no;
      await updateKYDB({ ...song, num_ky: kyNum });
      //   return { ...song, num_ky: kyNum };
    }
  }

  return null;
};
