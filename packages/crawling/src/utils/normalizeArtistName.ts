/**
 * 아티스트 이름 비교용 정규화.
 * NFKC로 전각·반각을 한 모양으로 접고, 대소문자와 공백·구두점을 지운다.
 * "BIGBANG"과 "Big Bang", "ＩＵ"와 "IU"는 같은 이름으로 봐야 하지만,
 * 여기서 더 느슨하게 풀면(예: 부분 일치) 엉뚱한 사람 사진이 조용히 들어온다.
 */
export const normalizeArtistName = (name: string) =>
  name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s.,'"·・&＆!?()[\]{}-]/g, '');
