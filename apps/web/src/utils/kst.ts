import { addDays, addHours } from 'date-fns';

/** 오늘 KST 날짜를 'YYYY-MM-DD' 문자열로 반환 (서버 타임존 무관) */
export function getTodayKST(): string {
  return addHours(new Date(), 9).toISOString().split('T')[0];
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
