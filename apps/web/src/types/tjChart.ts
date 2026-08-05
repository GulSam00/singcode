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

export interface TjChartRankingSong extends Song {
  rank: number;
}

export interface TjChartResponse {
  month: string;
  genre: StrType;
  availableMonths: string[];
  items: TjChartRankingSong[];
}
