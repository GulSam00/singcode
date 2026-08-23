import { artistAlias } from "./artistAlias";

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

// 콜라보 표기를 참여자 단위로 쪼갤 때 쓰는 구분자.
// INVALID_ARTIST_PATTERN과 같은 기호를 보지만 목적이 다르다 — 저쪽은 "버릴지"를 정하고
// 이쪽은 "어디까지가 맨 앞 아티스트인지"를 정한다. feat/with는 앞의 공백까지 함께 잘라
// "IU Feat.최백호"에서 뒤쪽 이름만 떨어져 나가게 한다.
const COLLAB_SEPARATOR_PATTERN = /[,&＆×・]|\s+(?:feat|with)\b\.?|\s+[xX]\s+/i;

// artistAlias: { [원어 공식 표기]: [한국어 표기 별칭들] }.
// 별칭이 songs.artist 값으로 등장하는 일은 드물지만, 등장하면 공식 표기로 접어준다.
const aliasToOfficial = new Map<string, string>();
for (const [officialName, aliases] of Object.entries(artistAlias)) {
  aliasToOfficial.set(officialName, officialName);
  aliases.forEach((alias) => aliasToOfficial.set(alias, officialName));
}

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

  const firstParenIdx = s.indexOf("(");
  if (firstParenIdx === -1 || firstParenIdx === 0) return s;

  return s.slice(0, firstParenIdx).trim() || s;
}

/**
 * songs.artist 원문에서 "맨 앞에 적힌 주 아티스트" 하나를 뽑아낸다.
 *
 * 백필(extractPrimaryArtist + isInvalidArtist)은 마스터 테이블에 올릴 이름을 고르는 쪽이라
 * 콜라보 표기를 통째로 버리지만, 화면 표시(예: 이달의 아티스트 배지)는 틀려도 비용이 작고
 * 반대로 안 붙는 누락이 훨씬 눈에 띈다. 그래서 버리는 대신 맨 앞 이름만 취한다.
 * 참여자 전원을 인정하지 않는 이유는 피처링으로 한 소절 부른 곡까지 주인공처럼 보이면
 * 배지가 흔해져 값어치를 잃기 때문이다.
 *
 * 괄호를 먼저 떼는 순서가 중요하다. "IU(Feat.최백호)"는 구분자를 먼저 보면 "IU(" 가 남는다.
 *
 * "IU(Feat.최백호)" → "IU" / "IU,나윤권" → "IU" / "DAOKO X 米津玄師" → "DAOKO"
 */
export function getPrimaryArtistName(raw: string): string {
  if (!raw) return "";

  const primary = extractPrimaryArtist(raw);
  const leading = primary.split(COLLAB_SEPARATOR_PATTERN)[0]?.trim() || primary;

  return aliasToOfficial.get(leading) ?? leading;
}
