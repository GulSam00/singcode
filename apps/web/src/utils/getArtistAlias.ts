import { getChoseong } from 'es-hangul';

import { artistAlias } from '@repo/constants';

export type SearchCandidate = { label: string; value: string };

// getChoseong은 공백을 그대로 남긴다 — getChoseong('요네즈 켄시') === 'ㅇㄴㅈ ㅋㅅ'.
// 사람은 초성을 붙여서 치므로("ㅇㄴㅈㅋㅅ") 양쪽에서 공백을 지우고 비교해야
// 이름 중간의 공백을 넘어가도 초성 검색이 이어진다. 전사된 일본 아티스트명은
// 대부분 "성 이름" 꼴이라 이걸 안 하면 초성 검색이 첫 단어에서 끊긴다.
const removeSpaces = (value: string) => value.replace(/\s+/g, '');

type IndexedCandidate = SearchCandidate & {
  /** 소문자로 맞춘 라벨 — 입력할 때마다 다시 만들지 않도록 미리 계산한다 */
  searchLabel: string;
  /** 공백을 지운 초성. 한글이 없는 라벨(YOASOBI, 米津玄師)은 빈 문자열이 된다 */
  choseong: string;
};

const createCandidateList = (): IndexedCandidate[] => {
  const list: IndexedCandidate[] = [];

  const pushCandidate = (label: string, value: string) => {
    list.push({
      label,
      value,
      searchLabel: label.toLowerCase(),
      choseong: removeSpaces(getChoseong(label)),
    });
  };

  Object.entries(artistAlias).forEach(([officialName, aliases]) => {
    // 공식 명칭 검색 후보에 추가
    pushCandidate(officialName, officialName);

    //  별명들 검색 후보에 추가
    aliases.forEach(alias => pushCandidate(alias, officialName));
  });

  return list;
};

// 전역 변수로 후보 리스트 생성 (메모리에 상주)
export const SEARCH_CANDIDATES = createCandidateList();

export const getAutoCompleteSuggestions = (query: string): SearchCandidate[] => {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase().trim(); // 대소문자 무시
  // 공백만 입력한 경우 — 빈 문자열은 모든 후보의 접두사라 후보 10개가 그대로 뜬다
  if (!normalizedQuery) return [];

  const choseongQuery = removeSpaces(normalizedQuery);

  // 배열 필터링 (여기가 핵심)
  // includes: 중간에 포함된 것도 찾음 ("라시" -> "아라시")
  // startsWith: 앞에서부터 일치하는 것만 찾음 ("아" -> "아라시") -> 보통 자동완성은 이걸 씀
  return SEARCH_CANDIDATES.filter(
    candidate =>
      candidate.searchLabel.startsWith(normalizedQuery) ||
      // 한글이 없는 라벨은 초성이 빈 문자열이라 아무 입력에나 걸리지 않도록 걸러낸다
      (candidate.choseong !== '' && candidate.choseong.startsWith(choseongQuery)),
  ).slice(0, 10); // 성능을 위해 상위 10개만 자름
};
