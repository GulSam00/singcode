import { useCallback, useRef } from 'react';

// 리렌더와 무관하게 항상 최신 콜백을 가리키는 안정된 함수 참조를 반환한다.
// deps 배열을 관리하지 않고도 useCallback/useMemo 의존성에 안전하게 넣을 수 있다.
export default function useStableCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Args) => callbackRef.current(...args), []);
}
