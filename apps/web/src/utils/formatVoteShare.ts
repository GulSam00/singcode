/**
 * 득표가 전체에서 차지하는 비중을 소수 첫째 자리까지 적는다.
 *
 * 순위표(ArtistRankingBoard)와 파이(ArtistRankingChart)는 같은 데이터를 다른 방식으로
 * 보여주는 한 쌍이라, 같은 득표에 대해 두 화면이 다른 숫자를 적으면 곧바로 오류로 읽힌다.
 * 자릿수 규칙을 한 곳에 둬야 그 어긋남이 생기지 않는다.
 */
export const formatVoteShare = (votes: number, total: number) =>
  total > 0 ? `${((votes / total) * 100).toFixed(1)}%` : '0%';
