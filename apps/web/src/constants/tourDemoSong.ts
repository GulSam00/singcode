import { SearchSong } from '@/types/song';

/**
 * 검색 페이지 가이드 전용 가상 곡.
 *
 * 실제 검색 결과로 투어를 진행하면 곡 데이터가 바뀌거나 검색이 실패할 때 투어가 깨진다.
 * 네트워크 없이 항상 같은 카드를 보여주도록 고정값을 쓴다.
 */
export const TOUR_DEMO_SEARCH_TERM = '밤이 깊었나';

export const TOUR_DEMO_SONG: SearchSong = {
  id: 'tour-demo-song',
  title: '밤이 깊었나',
  artist: '스판텍스',
  num_tj: '10101',
  num_ky: '20202',
  badges: [],
  thumb: 0,
  isToSing: false,
  isLike: false,
  isSave: false,
};
