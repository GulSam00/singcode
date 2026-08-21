// 쉼표, &(반각/전각), ×, ・, feat, with가 하나라도 들어있으면 다른 조건과 무관하게
// 이 곡의 artist 값 자체를 무효 처리한다(백필 대상에서 제외) — 애매하게 앞부분만
// 잘라 쓰는 것보다 아예 안 쓰는 게 안전하다.
// ×(가운뎃점 아님, 곱하기 기호)와 ・(가운뎃점)는 일본어 콘텐츠의 협업 표기에 흔히
// 쓰인다 — "絢香×コブクロ", "林原めぐみ・関智一"처럼. ・는 한 사람 이름 안에서
// 성·이름을 구분할 때도 쓰이긴 하지만(예: オノ・ヨーコ), 실측 데이터엔 전부
// 두 아티스트를 잇는 용도로만 나타나 무효 처리 대상에 포함했다.
const INVALID_ARTIST_PATTERN = /[,&＆×・]|\bfeat\b|\bwith\b/i;
// "지코 X 아이유"처럼 앞뒤로 다른 단어가 있을 때만 x를 콜라보 구분자로 본다.
// 이 제약이 없으면 "X JAPAN"처럼 이름 자체가 X로 시작하는 실존 아티스트까지 걸린다.
const X_JOIN_PATTERN = /\S\s+[xX]\s+\S/;

/**
 * songs.artist 원문이 무효 처리 대상인지 판별한다: 쉼표/&/＆/×/・/feat/with 포함,
 * 또는 " X "/" x " 형태의 콜라보 구분자가 있으면 true.
 */
export function isInvalidArtist(raw: string): boolean {
  return INVALID_ARTIST_PATTERN.test(raw) || X_JOIN_PATTERN.test(raw);
}

/**
 * songs.artist 원문에서 첫 괄호 앞부분만 남긴다(괄호 안 내용은 무엇이든 전부 버림 —
 * 누락을 감수하는 대신 규칙을 단순하게 유지). isInvalidArtist를 먼저 걸러낸 뒤에만
 * 호출한다는 전제라 쉼표/&/feat/with/x-조인은 여기서 신경 쓰지 않는다.
 *
 * 자른 결과가 빈 문자열이 되면(예: "(여자)아이들"처럼 이름 자체가 괄호로 시작하는
 * 경우) 잘라내지 않고 원문을 그대로 돌려준다.
 */
export function extractPrimaryArtist(raw: string): string {
  const s = raw.trim();

  const firstParenIdx = s.indexOf('(');
  if (firstParenIdx === -1 || firstParenIdx === 0) return s;

  return s.slice(0, firstParenIdx).trim() || s;
}
