import { addDays, addHours, addMonths, format, parseISO, startOfMonth } from 'date-fns';

import { getTodayKST, toKSTDateString } from '@repo/constants';

// 월 계산은 확정 배치(packages/crawling)와 같은 규칙을 써야 해 @repo/constants로 옮겼다.
// 기존 import 경로를 유지하려고 여기서 재수출한다.
export {
  getCurrentMonthFirstDayKST,
  getPrevMonthFirstDayKST,
  getTodayKST,
  toKSTDateString,
} from '@repo/constants';

/** 내일 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 */
export function getTomorrowKST(): string {
  return addDays(addHours(new Date(), 9), 1).toISOString().split('T')[0];
}

/** 내일 KST 날짜를 로컬 자정 기준 Date 객체로 반환 (Calendar disabled prop 등에 사용) */
export function getTomorrowKSTDate(): Date {
  const [y, m, d] = getTomorrowKST().split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'yyyy-MM-dd' 월 첫날 문자열을 delta개월 이동한 월 첫날 문자열로 반환 */
export function shiftMonth(month: string, delta: number): string {
  return format(startOfMonth(addMonths(parseISO(month), delta)), 'yyyy-MM-dd');
}

/** 서버가 준 last_check_in이 KST 기준 오늘이면 true. 출석 판정은 서버(daily_check_in)와 같은 KST 날짜로 한다. */
export function isCheckedInTodayKST(lastCheckIn: Date | string | null | undefined): boolean {
  if (!lastCheckIn) return false;
  return toKSTDateString(lastCheckIn) >= getTodayKST();
}
