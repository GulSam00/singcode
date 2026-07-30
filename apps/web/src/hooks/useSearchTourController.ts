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

  const handleStartTour = useCallback(() => {
    setTourTriggerSignal(prev => prev + 1);
  }, []);

  return { tourTriggerSignal, handlePrepareExampleSearch, handleStartTour };
}
