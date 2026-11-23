import { describe, expect, it } from 'vitest';

import {
  InstaSong,
  MAX_SLIDES,
  MAX_SONGS_PER_SLIDE,
  buildRecentSongPosts,
  isJapaneseSong,
} from './recentSongPosts';

const song = (id: number, overrides: Partial<InstaSong> = {}): InstaSong => ({
  id,
  title: `곡${id}`,
  artist: `가수${id}`,
  ...overrides,
});

const songs = (count: number) => Array.from({ length: count }, (_, i) => song(i));
const jpSong = (id: number) => song(id, { title: 'アイドル' });
const sizesOf = (count: number) =>
  buildRecentSongPosts(songs(count))[0].slides.map(slide => slide.length);

describe('isJapaneseSong', () => {
  it('가나가 있으면 일본곡이다', () => {
    expect(isJapaneseSong(song(1, { title: 'アイドル' }))).toBe(true);
    expect(isJapaneseSong(song(2, { artist: 'ヨルシカ' }))).toBe(true);
  });

  it('번역 배치가 한국어 표기를 채운 곡은 일본곡이다', () => {
    expect(isJapaneseSong(song(1, { title_ko: '아이돌' }))).toBe(true);
    expect(isJapaneseSong(song(2, { artist_ko: '요아소비' }))).toBe(true);
  });

  it('한글·영문만 있으면 일본곡이 아니다', () => {
    expect(isJapaneseSong(song(1, { title: 'Stop The Wedding!', artist: 'Ashe' }))).toBe(false);
  });
});

describe('buildRecentSongPosts', () => {
  it('곡이 없으면 게시물이 없다 (게시를 건너뛰는 기준)', () => {
    expect(buildRecentSongPosts([])).toEqual([]);
  });

  it('일본곡과 그 외는 서로 다른 게시물이 된다', () => {
    const posts = buildRecentSongPosts([song(1), jpSong(2), song(3), jpSong(4)]);

    expect(posts.map(post => post.kind)).toEqual(['jpop', 'general']);
    expect(posts[0].slides.flat().map(s => s.id)).toEqual([2, 4]);
    expect(posts[1].slides.flat().map(s => s.id)).toEqual([1, 3]);
  });

  it('곡이 있는 그룹만 게시물이 된다', () => {
    expect(buildRecentSongPosts([jpSong(1)]).map(post => post.kind)).toEqual(['jpop']);
    expect(buildRecentSongPosts([song(1)]).map(post => post.kind)).toEqual(['general']);
  });

  it('한 장에 담을 수 있는 곡 수 이하면 한 장이다', () => {
    expect(sizesOf(1)).toEqual([1]);
    expect(sizesOf(MAX_SONGS_PER_SLIDE)).toEqual([MAX_SONGS_PER_SLIDE]);
  });

  it('한 장에 최대 곡 수를 넘으면 다음 장으로 넘기되 곡을 고르게 나눈다', () => {
    // 5 + 1 이 아니라 3 + 3 으로 나뉘어 마지막 장이 휑하지 않다
    expect(sizesOf(MAX_SONGS_PER_SLIDE + 1)).toEqual([3, 3]);
    expect(sizesOf(11)).toEqual([4, 4, 3]);
    expect(sizesOf(15)).toEqual([5, 5, 5]);
  });

  it('장 수 제한을 넘는 곡은 넣지 않고 개수만 알려준다', () => {
    const count = MAX_SONGS_PER_SLIDE * MAX_SLIDES + 4;
    const [post] = buildRecentSongPosts(songs(count));

    expect(post.slides).toHaveLength(MAX_SLIDES);
    expect(post.omittedCount).toBe(4);
    expect(post.total).toBe(count);
  });

  it('일본곡 게시물과 그 외 게시물은 장 수 제한을 따로 가진다', () => {
    const input = [
      ...Array.from({ length: MAX_SONGS_PER_SLIDE * MAX_SLIDES }, (_, i) => jpSong(i)),
      ...Array.from({ length: 3 }, (_, i) => song(100 + i)),
    ];
    const [jpop, general] = buildRecentSongPosts(input);

    expect(jpop.slides).toHaveLength(MAX_SLIDES);
    expect(jpop.omittedCount).toBe(0);
    expect(general.slides).toHaveLength(1);
  });
});
