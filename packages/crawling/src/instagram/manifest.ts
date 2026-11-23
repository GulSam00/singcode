import type { InstaSong, PostKind } from './recentSongPosts';
import type { Edition } from './renderSlide';

/**
 * 이미지를 만들 때 넣은 데이터의 기록. 이미지에 잘못된 곡이 들어갔을 때 원인을 찾고,
 * JSON을 고친 뒤 같은 이미지를 다시 만들 수 있도록 곡 정보를 그대로 담는다.
 */
export interface ManifestPost {
  edition: Edition;
  kind: PostKind;
  total: number;
  omittedCount: number;
  /** 장별 곡 목록 (이미지에 실제로 그려진 값) */
  slides: InstaSong[][];
  /** slides와 같은 순서의 이미지 파일명 */
  files: string[];
}

export interface Manifest {
  /** 이미지를 올리는 날(게시일) */
  postDate: string;
  /** 이미지에 담은 신곡의 기간 (songs.release 기준, 양 끝 포함) */
  period: { from: string; to: string };
  generatedAt: string;
  /** 다시 만든 시각. 매니페스트를 고쳐 재생성했을 때만 채워진다. */
  regeneratedAt?: string;
  /** 어떤 조건으로 곡을 조회했는지 */
  query: { editions: Edition[] };
  /** 조회했지만 해당 번호가 있는 신곡이 없어 만들지 않은 번호 종류 */
  emptyEditions: Edition[];
  posts: ManifestPost[];
}

export const manifestFileName = 'manifest.json';
