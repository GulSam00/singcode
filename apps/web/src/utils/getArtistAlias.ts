import { artistAlias } from '@/constants/artistAlias';

export type SearchCandidate = { label: string; value: string };

const createCandidateList = (): SearchCandidate[] => {
  const list: SearchCandidate[] = [];

  Object.entries(artistAlias).forEach(([officialName, aliases]) => {
    // 공식 명칭 검색 후보에 추가
    list.push({ label: officialName, value: officialName });

    //  별명들 검색 후보에 추가
    aliases.forEach(alias => {
      list.push({ label: alias, value: officialName });
    });
  });

  return list;
};

// 전역 변수로 후보 리스트 생성 (메모리에 상주)
export const SEARCH_CANDIDATES = createCandidateList();

export const getAutoCompleteSuggestions = (query: string): SearchCandidate[] => {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase().trim(); // 대소문자 무시

  // 배열 필터링 (여기가 핵심)
  // includes: 중간에 포함된 것도 찾음 ("라시" -> "아라시")
  // startsWith: 앞에서부터 일치하는 것만 찾음 ("아" -> "아라시") -> 보통 자동완성은 이걸 씀
  return SEARCH_CANDIDATES.filter(candidate =>
    candidate.label.toLowerCase().startsWith(normalizedQuery),
  ).slice(0, 10); // 성능을 위해 상위 10개만 자름
};
