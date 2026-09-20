import { useEffect, useState } from 'react';

import { type SearchCandidate } from '@/utils/getArtistAlias';

// 입력창(aria-activedescendant)과 옵션(id)이 같은 규칙으로 id를 만들어야
// 스크린리더가 "지금 읽어야 할 후보"를 찾을 수 있다.
export const getAutocompleteOptionId = (listboxId: string, index: number) =>
  `${listboxId}-option-${index}`;

interface Params {
  /** 드롭다운 ul 의 id. 화면마다 달라야 한다 */
  listboxId: string;
  /**
   * 후보 목록. 참조가 매 렌더 바뀌면 활성 후보가 계속 초기화되므로
   * 호출부에서 useMemo 로 감싸 넘긴다.
   */
  candidates: SearchCandidate[];
  isOpen: boolean;
  /** Esc 로 닫을 때 */
  onClose: () => void;
}

/**
 * 자동완성 드롭다운의 키보드 내비게이션(↑/↓/Esc)과 ARIA 속성을 담당한다.
 *
 * 엔터 처리는 화면마다 의미가 달라(검색 실행 / 목록에 담기) 여기서 하지 않는다.
 * 호출부가 activeCandidate 를 보고 직접 정한다.
 */
export default function useAutocompleteNavigation({
  listboxId,
  candidates,
  isOpen,
  onClose,
}: Params) {
  // 키보드로 이동 중인 후보. 아무것도 고르지 않은 상태는 -1
  const [activeIndex, setActiveIndex] = useState(-1);

  // 후보 목록이 바뀌거나 드롭다운이 닫히면 활성 후보를 되돌린다.
  // 남겨두면 목록이 줄어든 뒤 엉뚱한 후보가 엔터로 선택된다.
  useEffect(() => {
    setActiveIndex(-1);
  }, [candidates, isOpen]);

  const activeCandidate = isOpen && activeIndex >= 0 ? (candidates[activeIndex] ?? null) : null;

  // ↑/↓/Esc 는 keydown 에서 처리한다. keyup 은 이미 커서가 움직인 뒤라 늦다.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 한글 조합 중의 방향키는 IME 의 몫이다.
    if (e.nativeEvent.isComposing || !isOpen || candidates.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // 커서가 입력 끝으로 튀는 기본 동작을 막는다
      setActiveIndex(prev => (prev + 1) % candidates.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? candidates.length - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // 입력창에 그대로 펼쳐 넣는다 (WAI-ARIA combobox 패턴)
  const inputAriaProps = {
    role: 'combobox' as const,
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? listboxId : undefined,
    'aria-activedescendant':
      activeIndex >= 0 && isOpen ? getAutocompleteOptionId(listboxId, activeIndex) : undefined,
    'aria-autocomplete': 'list' as const,
  };

  // SearchAutocomplete 에 그대로 펼쳐 넣는다
  const listboxProps = {
    listboxId,
    activeIndex,
    onActiveIndexChange: setActiveIndex,
  };

  return {
    activeIndex,
    setActiveIndex,
    activeCandidate,
    handleKeyDown,
    inputAriaProps,
    listboxProps,
  };
}
