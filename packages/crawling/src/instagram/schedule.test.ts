import { describe, expect, it } from 'vitest';

import { formatPeriodLabel, getPeriod, isPostingDay } from './schedule';

describe('isPostingDay', () => {
  it('기준일과 그로부터 3일 간격의 날만 게시일이다', () => {
    expect(isPostingDay('2026-10-19', '2026-10-19', 3)).toBe(true);
    expect(isPostingDay('2026-10-20', '2026-10-19', 3)).toBe(false);
    expect(isPostingDay('2026-10-21', '2026-10-19', 3)).toBe(false);
    expect(isPostingDay('2026-10-22', '2026-10-19', 3)).toBe(true);
  });

  it('월말에도 간격이 깨지지 않는다 (cron의 */3과 다른 점)', () => {
    // 10/31 다음 게시일은 11/1이 아니라 11/3이다
    expect(isPostingDay('2026-10-31', '2026-10-19', 3)).toBe(true);
    expect(isPostingDay('2026-11-01', '2026-10-19', 3)).toBe(false);
    expect(isPostingDay('2026-11-02', '2026-10-19', 3)).toBe(false);
    expect(isPostingDay('2026-11-03', '2026-10-19', 3)).toBe(true);
  });

  it('기준일보다 앞선 날도 같은 간격으로 계산한다', () => {
    expect(isPostingDay('2026-10-16', '2026-10-19', 3)).toBe(true);
    expect(isPostingDay('2026-10-17', '2026-10-19', 3)).toBe(false);
  });
});

describe('getPeriod', () => {
  it('게시일 전날부터 3일 전까지다', () => {
    expect(getPeriod('2026-10-19', 3)).toEqual({ from: '2026-10-16', to: '2026-10-18' });
  });

  it('달이 바뀌어도 날짜를 올바르게 센다', () => {
    expect(getPeriod('2026-11-01', 3)).toEqual({ from: '2026-10-29', to: '2026-10-31' });
  });

  it('연속한 두 게시일의 기간은 겹치지 않고 빈틈이 없다', () => {
    const first = getPeriod('2026-10-19', 3);
    const second = getPeriod('2026-10-22', 3);

    expect(second.from).toBe('2026-10-19');
    expect(first.to).toBe('2026-10-18');
  });
});

describe('formatPeriodLabel', () => {
  it('같은 달이면 월을 한 번만 쓴다', () => {
    expect(formatPeriodLabel('2026-10-06', '2026-10-08')).toBe('10.6–8');
  });

  it('달이 다르면 양쪽에 월을 쓴다', () => {
    expect(formatPeriodLabel('2026-09-30', '2026-10-02')).toBe('9.30–10.2');
  });

  it('하루짜리 기간이면 날짜 하나만 쓴다', () => {
    expect(formatPeriodLabel('2026-10-08', '2026-10-08')).toBe('10.8');
  });
});
