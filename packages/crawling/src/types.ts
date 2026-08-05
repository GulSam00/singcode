export interface ArgList {
  url: string;
  artist: string;
  titleIndex: number;
  tjIndex: number;
  kyIndex: number;
}

export interface Song {
  id?: string;
  title: string;
  artist: string;
  num_tj: string | null;
  num_ky: string | null;
  release?: string | null;
}

export interface TransSong extends Song {
  isTitleJp: boolean;
  isArtistJp: boolean;
  type?: 'title' | 'artist';
}

export interface LogData<T> {
  success: T[];
  failed: { item: T; error: any }[];
}

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

// TJ topAndHot100 API가 요구하는 strType 파라미터 값 (숫자 문자열)
export const STR_TYPE_API_PARAM: Record<StrType, string> = {
  [StrType.All]: '',
  [StrType.Kpop]: '1',
  [StrType.Pop]: '2',
  [StrType.Jpop]: '3',
  [StrType.Ballad]: '4',
  [StrType.Dance]: '5',
  [StrType.Trot]: '6',
  [StrType.Folk]: '7',
  [StrType.Ost]: '8',
  [StrType.RockMetal]: '9',
  [StrType.RapHiphop]: '10',
  [StrType.RnbUrban]: '11',
};

export interface TjChartItem {
  rank: string;
  pro: number;
  indexTitle: string;
  indexSong: string;
  word: string;
  com: string;
  mv_yn: string;
  imgthumb_path: string;
  icongubun: string;
}

export interface TjChartApiResponse {
  resultCode: string;
  resultMsg: string;
  resultData: {
    itemsTotalCount: number;
    items: TjChartItem[];
  };
}

export interface TjChartRankingInsert {
  chart_month: string;
  type: StrType;
  rank: number;
  song_id: string;
}
