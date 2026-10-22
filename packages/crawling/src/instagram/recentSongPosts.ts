export interface InstaSong {
  id: number | string;
  title: string;
  artist: string;
  title_ko?: string | null;
  artist_ko?: string | null;
  num_tj?: number | string | null;
  num_ky?: number | string | null;
}

/** 일본곡(jpop)과 그 외(general)는 서로 다른 게시물로 나눠 만든다. */
export type PostKind = 'jpop' | 'general';

export interface Post {
  kind: PostKind;
  /** 이 게시물 그룹의 전체 곡 수 (장 수 제한으로 못 넣은 곡 포함) */
  total: number;
  /** 한 장에 들어가는 곡 목록 */
  slides: InstaSong[][];
  /** 장 수 제한 때문에 이미지에 넣지 못한 곡 수 */
  omittedCount: number;
}

/** 한 장에 담는 최대 곡 수. 카드 높이가 고정이라, 이 수만큼 곡이 꼭 맞게 들어가도록 잡았다. */
export const MAX_SONGS_PER_SLIDE = 5;
/** 인스타그램 캐러셀은 최대 10장이지만 길어지면 끝까지 넘기지 않아 게시물당 6장(30곡)으로 제한한다. */
export const MAX_SLIDES = 6;

const KANA = /[぀-ヿ]/;

/**
 * 일본곡 판별. 가나가 있거나, 일본곡 번역 배치가 한국어 표기를 채운 곡이다.
 * 한자만 있는 곡(米津玄師 같은 이름)은 가나가 없어 놓칠 수 있지만, 번역 배치가 돈 뒤에는 잡힌다.
 */
export const isJapaneseSong = (song: InstaSong): boolean =>
  KANA.test(song.title) || KANA.test(song.artist) || !!song.title_ko || !!song.artist_ko;

/** 마지막 장에 한두 곡만 덩그러니 남지 않도록 장 수를 먼저 정하고 곡을 고르게 나눈다. */
const chunkEvenly = (songs: InstaSong[]): InstaSong[][] => {
  const slideCount = Math.ceil(songs.length / MAX_SONGS_PER_SLIDE);
  const perSlide = Math.ceil(songs.length / slideCount) || 0;

  const slides: InstaSong[][] = [];
  for (let i = 0; i < songs.length; i += perSlide) {
    slides.push(songs.slice(i, i + perSlide));
  }
  return slides;
};

const buildPost = (kind: PostKind, songs: InstaSong[]): Post => {
  const visible = songs.slice(0, MAX_SONGS_PER_SLIDE * MAX_SLIDES);
  return {
    kind,
    total: songs.length,
    slides: chunkEvenly(visible),
    omittedCount: songs.length - visible.length,
  };
};

/** 곡이 있는 그룹만 게시물로 만든다. 일본곡이 먼저 온다. 같은 그룹 안에서는 들어온 순서를 지킨다. */
export function buildRecentSongPosts(songs: InstaSong[]): Post[] {
  const japanese = songs.filter(isJapaneseSong);
  const general = songs.filter(song => !isJapaneseSong(song));

  return [
    ...(japanese.length > 0 ? [buildPost('jpop', japanese)] : []),
    ...(general.length > 0 ? [buildPost('general', general)] : []),
  ];
}
