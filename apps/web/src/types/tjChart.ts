import { Song } from './song';

// TJ 공식 차트(topAndHot100) 장르 구분값 (DB 저장용, 영어)
// 참고: https://www.tjmedia.com/chart/top100
export enum StrType {
  All = 'all',
  Kpop = 'kpop',
  Pop = 'pop',
  Jpop = 'jpop',
  Ballad = 'ballad',
  Dance = 'dance',
  Trot = 'trot',
  Folk = 'folk',
  Ost = 'ost',
  RockMetal = 'rock_metal',
  RapHiphop = 'rap_hiphop',
  RnbUrban = 'rnb_urban',
}

export const STR_TYPE_LABEL: Record<StrType, string> = {
  [StrType.All]: '종합',
  [StrType.Kpop]: '가요',
  [StrType.Pop]: 'POP',
  [StrType.Jpop]: 'JPOP',
  [StrType.Ballad]: '발라드',
  [StrType.Dance]: '댄스',
  [StrType.Trot]: '트로트',
  [StrType.Folk]: '포크',
  [StrType.Ost]: 'OST',
  [StrType.RockMetal]: '락/메탈',
  [StrType.RapHiphop]: '랩/힙합',
  [StrType.RnbUrban]: 'R&B/어반',
};

// 장르 뱃지 앞에 붙는 아이콘. Windows에서 두부(tofu)로 깨지지 않도록
// 국기(regional indicator)와 Unicode 14 이후 이모지는 쓰지 않는다.
export const STR_TYPE_EMOJI: Record<StrType, string> = {
  [StrType.All]: '🏆',
  [StrType.Kpop]: '🎤',
  [StrType.Pop]: '🌍',
  [StrType.Jpop]: '🌸',
  [StrType.Ballad]: '💗',
  [StrType.Dance]: '💃',
  [StrType.Trot]: '🎺',
  [StrType.Folk]: '🎸',
  [StrType.Ost]: '🎬',
  [StrType.RockMetal]: '🤘',
  [StrType.RapHiphop]: '🧢',
  [StrType.RnbUrban]: '🎷',
};

// TJ는 한 곡에 반주를 여러 버전으로 등록한다. 차트에도 버전별로 따로 오르므로
// 같은 곡이 여러 순위에 보이는데, 무엇이 다른지 알려면 이 뱃지가 필요하다.
//
// 'MV'(뮤직비디오 유무)는 어느 버전을 부를지 고르는 데 도움이 안 되므로 노출하지 않는다.
// '60'은 구형 반주기에서 재생되지 않는다는 뜻이라 실사용에 중요하다.
export const VERSION_BADGES = ['MR', 'LV', '60'] as const;

export const BADGE_LABEL: Record<string, string> = {
  MR: 'MR',
  LV: 'LIVE',
  '60': '60↑',
};

export const BADGE_DESCRIPTION: Record<string, string> = {
  MR: '가이드 보컬이 없는 MR 버전',
  LV: '라이브 버전',
  '60': '60 이상 반주기 전용곡',
};

/** 화면에 표시할 버전 뱃지만 걸러낸다. */
export function toVisibleBadges(badges: string[] | null | undefined) {
  if (!badges) return [];
  return VERSION_BADGES.filter(badge => badges.includes(badge));
}

export interface TjChartRankingSong extends Song {
  rank: number;
}

export interface TjChartResponse {
  month: string;
  genre: StrType;
  availableMonths: string[];
  items: TjChartRankingSong[];
}
