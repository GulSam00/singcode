import { addHours, format, startOfMonth, subMonths } from 'date-fns';

/**
 * KST 기준 월 계산.
 *
 * 웹(기본 조회 월 표시)과 백필/확정 스크립트(집계 대상 월)가 같은 답을 내야 한다.
 * 한쪽만 고치면 "화면이 기본으로 보여주는 달"과 "실제로 확정된 달"이 어긋나, 사용자에게는
 * 결과가 통째로 사라진 것처럼 보인다. 그래서 규칙을 공유 패키지에 둔다.
 *
 * 서버 타임존이 무엇이든 같은 값을 내도록 UTC에 9시간을 더해 KST 벽시계를 만든 뒤 자른다.
 */

/** 오늘 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 */
export function getTodayKST(): string {
  return addHours(new Date(), 9).toISOString().split('T')[0];
}

/** 이전 달 1일 'YYYY-MM-DD' (KST 기준). 월 단위 집계의 대상 월이다. */
export function getPrevMonthFirstDayKST(): string {
  const [year, month] = getTodayKST().split('-').map(Number);
  return format(startOfMonth(subMonths(new Date(year, month - 1, 1), 1)), 'yyyy-MM-dd');
}

/** 이번 달 1일 'YYYY-MM-DD' (KST 기준). 아티스트 투표는 이 달에만 수정할 수 있다. */
export function getCurrentMonthFirstDayKST(): string {
  const [year, month] = getTodayKST().split('-').map(Number);
  return format(startOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd');
}
