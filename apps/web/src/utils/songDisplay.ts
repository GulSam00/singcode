/**
 * 곡 제목·아티스트를 화면에 그릴 때의 표시 우선순위.
 *
 * 번역(`title_ko`/`artist_ko`)이 있으면 그쪽을 큰 줄로 올리고 원어를 작은 줄로 내린다.
 * 검색 화면만 한국어 우선이고 부를곡·즐겨찾기·홍보는 원어 우선이라, 검색에서
 * "요네즈 켄시"로 보고 담은 곡이 부를곡 목록에선 "米津玄師"로 떠 같은 곡을 눈으로
 * 못 찾는 문제가 있었다. 화면마다 복붙돼 있던 규칙을 여기 한 곳으로 모았으니
 * 우선순위를 바꿀 일이 생기면 이 함수만 고치면 된다.
 *
 * 번역이 없거나 원어와 같으면 `secondary`는 null이다 — 한국곡은 `title_ko`가
 * 비어 있어 지금과 똑같이 한 줄로만 그려진다.
 */
export function splitDisplay(
  translated: string | null | undefined,
  original: string,
): { primary: string; secondary: string | null } {
  if (translated && translated !== original) {
    return { primary: translated, secondary: original };
  }
  return { primary: original, secondary: null };
}
