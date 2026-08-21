// artists.language_tag_id는 tags(id)를 FK로 참조한다 — 값은
// src/constants/languageTags.ts의 LANGUAGE_TAGS id(100~103) 중 하나다.
export interface ArtistSearchResult {
  name: string;
  name_ko: string | null;
  language_tag_id: number | null;
}
