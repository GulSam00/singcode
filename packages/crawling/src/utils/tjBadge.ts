import * as cheerio from 'cheerio';

import { TjChartItem } from '@/types';

// TJ 곡 검색 페이지가 뱃지를 그릴 때 쓰는 클래스 → DB 저장용 코드
// 예: <p class="ico mv">MV</p>
// 한글 문구("60이상 반주기 전용곡")는 바뀔 수 있으므로 클래스를 기준으로 삼는다.
const CLASS_TO_BADGE: Record<string, string> = {
  mv: 'MV',
  mr: 'MR',
  live: 'LV',
  exclusive: '60',
};

// 저장 순서를 고정해야 검색 페이지로 채운 값과 차트 API로 채운 값이 문자열 단위로 일치한다.
export const BADGE_ORDER = ['MV', 'MR', 'LV', '60'];

export interface TjBadgeRow {
  numTj: string;
  title: string;
  artist: string;
  badges: string[];
}

// 이상 상황을 호출부가 로그 파일에 기록할 수 있도록 사유를 구분해 돌려준다.
// (유틸에서 직접 파일을 쓰지 않는 것은 이 패키지의 다른 크롤러와 같은 방식이다)
export type ParseBadgeResult =
  | { status: 'ok'; row: TjBadgeRow; unknownBadges: string[] }
  | { status: 'not_found' }
  | { status: 'num_mismatch'; foundNumTj: string };

// 조회 자체가 실패한 경우. "TJ에 없다"와 반드시 구분해야 한다.
// 이걸 뭉뚱그리면 일시적 네트워크 오류를 곡이 사라진 것으로 오인한다.
export type FetchBadgeResult = ParseBadgeResult | { status: 'fetch_failed'; message: string };

const REQUEST_TIMEOUT = 10000;
const MAX_RETRY = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** 번호 하나를 TJ에서 조회해 뱃지를 파싱한다. 일시적 실패는 지수 백오프로 3회까지 재시도한다. */
export async function fetchBadgeRow(numTj: string): Promise<FetchBadgeResult> {
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const response = await fetch(buildBadgeSearchUrl(numTj), {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return parseBadgeRow(await response.text(), numTj);
    } catch (error) {
      if (attempt === MAX_RETRY) {
        return { status: 'fetch_failed', message: (error as Error).message };
      }
      await sleep(500 * 2 ** (attempt - 1)); // 0.5s → 1s → 2s
    }
  }

  return { status: 'fetch_failed', message: 'unreachable' };
}

/** strType=16은 곡 번호 검색이다. 요청한 번호와 정확히 일치하는 행 하나만 돌아온다. */
export function buildBadgeSearchUrl(numTj: string) {
  return (
    'https://www.tjmedia.com/song/accompaniment_search' +
    `?pageNo=1&pageRowCnt=15&strSotrGubun=ASC&strSortType=&nationType=&strType=16` +
    `&searchTxt=${encodeURIComponent(numTj)}&strWord=Y`
  );
}

/** BADGE_ORDER 순으로 정렬한다. 목록에 없는 값(신규 뱃지)은 뒤로 밀되 순서는 유지한다. */
export function sortBadges(badges: string[]) {
  const rank = (badge: string) => {
    const index = BADGE_ORDER.indexOf(badge);
    return index === -1 ? BADGE_ORDER.length : index;
  };

  return [...badges].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/**
 * 곡 번호 검색 결과 HTML에서 뱃지를 추출한다.
 * TJ에 없는 번호(not_found), 다른 번호가 온 경우(num_mismatch)를 구분해 돌려준다.
 * 매핑에 없는 뱃지 클래스는 원문 그대로 배열에 담고 unknownBadges에도 따로 실어 보낸다.
 */
export function parseBadgeRow(html: string, expectedNumTj: string): ParseBadgeResult {
  const $ = cheerio.load(html);

  const row = $('.grid-container.list.ico').first();
  if (!row.length) return { status: 'not_found' };

  const numTj = row.find('.grid-item.pos-type .num2').text().trim();
  if (numTj !== expectedNumTj) return { status: 'num_mismatch', foundNumTj: numTj };

  const unknownBadges: string[] = [];

  const badges = row
    .find('.grid-item.title3 p.ico')
    .map((_, element) => {
      // class="ico mv" 형태이므로 공용 클래스 'ico'를 걷어내면 뱃지 종류만 남는다.
      const kind = ($(element).attr('class') ?? '')
        .split(/\s+/)
        .filter(token => token && token !== 'ico')
        .join(' ');

      const badge = CLASS_TO_BADGE[kind];
      // 매핑에 없어도 원문을 남겨야 나중에 로그를 보고 추가할 수 있다.
      if (!badge && kind) unknownBadges.push(kind);

      return badge ?? kind;
    })
    .get()
    .filter(Boolean);

  return {
    status: 'ok',
    unknownBadges,
    row: {
      numTj,
      // title3 안에는 뱃지 <ul>이 함께 들어 있어 직계 경로로 제목만 집는다.
      title: row.find('.grid-item.title3 > .flex-box > p > span').first().text().trim(),
      artist: row.find('.grid-item.title4 span').first().text().trim(),
      badges: sortBadges(badges),
    },
  };
}

/**
 * 차트 API 응답으로 같은 뱃지 배열을 만든다. (추가 요청 없이 icongubun/mv_yn만 사용)
 * mv_yn은 뮤직비디오 유무, icongubun은 버전 구분('MR' | 'LV' | '60' | '')으로 서로 독립이다.
 */
export function badgesFromChartItem(item: TjChartItem) {
  const badges: string[] = [];

  if (item.mv_yn === 'Y') badges.push('MV');
  if (item.icongubun) badges.push(item.icongubun);

  return sortBadges(badges);
}
