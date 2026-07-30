import { useCallback, useState } from 'react';

import { SearchType } from '@/types/song';

import useStableCallback from './useStableCallback';

const EXAMPLE_SEARCH_TERM = '아이유';

interface UseSearchTourControllerParams {
  handleTabChange: (value: string) => void;
  handleSearch: (termOverride?: string, typeOverride?: SearchType) => void;
}

export default function useSearchTourController({
  handleTabChange,
  handleSearch,
}: UseSearchTourControllerParams) {
  const [tourTriggerSignal, setTourTriggerSignal] = useState(0);

  // 투어의 예시 검색 단계는 리렌더와 무관하게 항상 안정된 참조로 호출되어야 한다.
  const stableHandleTabChange = useStableCallback(handleTabChange);
  const stableHandleSearch = useStableCallback(handleSearch);

  const handlePrepareExampleSearch = useCallback(() => {
    stableHandleTabChange('all');
    stableHandleSearch(EXAMPLE_SEARCH_TERM, 'all');
  }, [stableHandleTabChange, stableHandleSearch]);

  // 투어가 참조하는 요소(언어 필터 등)는 '전체' 탭에서만 존재하므로,
  // 투어를 시작하기 전에 항상 탭 상태부터 정규화한다.
  const handleTourNormalizeState = useCallback(() => {
    stableHandleTabChange('all');
  }, [stableHandleTabChange]);

  const handleStartTour = useCallback(() => {
    setTourTriggerSignal(prev => prev + 1);
  }, []);

  return {
    tourTriggerSignal,
    handlePrepareExampleSearch,
    handleTourNormalizeState,
    handleStartTour,
  };
}
