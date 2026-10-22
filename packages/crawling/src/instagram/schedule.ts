import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

const DATE_FORMAT = 'yyyy-MM-dd';

/** TJ·KY 이미지를 몇 일마다 올리는지. 두 종류를 같은 날 함께 올린다. */
export const DEFAULT_CYCLE_DAYS = 3;
/**
 * 게시일을 세는 기준일. 이 날부터 CYCLE_DAYS 간격으로 게시한다.
 * GitHub Actions cron은 "3일마다"를 표현하지 못한다(*\/3은 매달 1일에 다시 시작해 월말에 간격이 깨진다).
 * 그래서 워크플로우는 매일 돌리고, 오늘이 게시일인지는 이 기준일로 계산해 판단한다.
 */
export const DEFAULT_CYCLE_ANCHOR = '2026-10-19';

/** 기준일로부터 cycleDays의 배수만큼 떨어진 날이면 게시일이다. */
export function isPostingDay(
  postDate: string,
  anchor = DEFAULT_CYCLE_ANCHOR,
  cycleDays = DEFAULT_CYCLE_DAYS,
): boolean {
  const diff = differenceInCalendarDays(parseISO(postDate), parseISO(anchor));
  return ((diff % cycleDays) + cycleDays) % cycleDays === 0;
}

/**
 * 게시일에 올릴 신곡의 기간. 게시일 전날부터 cycleDays일 전까지다.
 * 게시일 당일은 넣지 않는다 — 당일 신곡은 그날 밤 크롤링이 돌아야 들어오기 때문이다.
 */
export function getPeriod(postDate: string, cycleDays = DEFAULT_CYCLE_DAYS) {
  const base = parseISO(postDate);
  return {
    from: format(addDays(base, -cycleDays), DATE_FORMAT),
    to: format(addDays(base, -1), DATE_FORMAT),
  };
}

/** 이미지 상단에 크게 쓰는 기간 문구. 예: 10.6–8, 9.30–10.2, 10.8 */
export function formatPeriodLabel(from: string, to: string): string {
  const [, fromMonth, fromDay] = from.split('-').map(Number);
  const [, toMonth, toDay] = to.split('-').map(Number);

  if (from === to) return `${fromMonth}.${fromDay}`;
  if (fromMonth === toMonth) return `${fromMonth}.${fromDay}–${toDay}`;
  return `${fromMonth}.${fromDay}–${toMonth}.${toDay}`;
}
