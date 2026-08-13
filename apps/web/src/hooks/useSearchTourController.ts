import { useCallback, useState } from 'react';

import useStableCallback from './useStableCallback';

interface UseSearchTourControllerParams {
  handleTabChange: (value: string) => void;
  /** 실제 검색 대신 가상의 예시 카드를 띄운다. */
  showExampleCard: () => void;
}

export default function useSearchTourController({
  handleTabChange,
  showExampleCard,
}: UseSearchTourControllerParams) {
  const [tourTriggerSignal, setTourTriggerSignal] = useState(0);

  // 투어의 예시 단계는 리렌더와 무관하게 항상 안정된 참조로 호출되어야 한다.
  const stableHandleTabChange = useStableCallback(handleTabChange);
  const stableShowExampleCard = useStableCallback(showExampleCard);

  // 실제 검색을 돌리면 곡 데이터가 바뀌거나 검색이 실패할 때 투어가 깨진다.
  // 네트워크와 무관하게 항상 같은 가상 카드를 띄운다.
  const handlePrepareExampleSearch = useCallback(() => {
    stableHandleTabChange('all');
    stableShowExampleCard();
  }, [stableHandleTabChange, stableShowExampleCard]);

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
