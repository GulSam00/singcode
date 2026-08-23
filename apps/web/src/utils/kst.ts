import { addDays, addHours } from 'date-fns';

// 월 계산은 확정 배치(packages/crawling)와 같은 규칙을 써야 해 @repo/constants로 옮겼다.
// 기존 import 경로를 유지하려고 여기서 재수출한다.
export { getCurrentMonthFirstDayKST, getPrevMonthFirstDayKST, getTodayKST } from '@repo/constants';

/** 내일 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 */
export function getTomorrowKST(): string {
  return addDays(addHours(new Date(), 9), 1).toISOString().split('T')[0];
}

/** 내일 KST 날짜를 로컬 자정 기준 Date 객체로 반환 (Calendar disabled prop 등에 사용) */
export function getTomorrowKSTDate(): Date {
  const [y, m, d] = getTomorrowKST().split('-').map(Number);
  return new Date(y, m - 1, d);
}
