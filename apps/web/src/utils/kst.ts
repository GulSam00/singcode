import { addDays, addHours, format, startOfMonth, subMonths } from 'date-fns';

/** 오늘 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 (서버 타임존 무관) */
export function getTodayKST(): string {
  return addHours(new Date(), 9).toISOString().split('T')[0];
}

/**
 * 이전 달 1일을 'YYYY-MM-DD' 문자열로 반환 (KST 기준, 서버 타임존 무관)
 * 월 단위로 집계되는 차트의 기본 조회 월로 사용한다.
 */
export function getPrevMonthFirstDayKST(): string {
  const [year, month] = getTodayKST().split('-').map(Number);
  return format(startOfMonth(subMonths(new Date(year, month - 1, 1), 1)), 'yyyy-MM-dd');
}

/** 내일 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 */
export function getTomorrowKST(): string {
  return addDays(addHours(new Date(), 9), 1).toISOString().split('T')[0];
}

/** 내일 KST 날짜를 로컬 자정 기준 Date 객체로 반환 (Calendar disabled prop 등에 사용) */
export function getTomorrowKSTDate(): Date {
  const [y, m, d] = getTomorrowKST().split('-').map(Number);
  return new Date(y, m - 1, d);
}
