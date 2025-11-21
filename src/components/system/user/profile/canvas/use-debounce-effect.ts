import { useEffect, useRef, DependencyList } from 'react';

export function useDebounceEffect(fn: () => void, waitTime: number, deps?: DependencyList) {
  const fnRef = useRef(fn);

  // 保持 fnRef 始终是最新的 fn
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => {
      const t = setTimeout(() => {
        fnRef.current();
      }, waitTime);

      return () => {
        clearTimeout(t);
      };
    },
    deps ? [...deps, waitTime] : [waitTime]
  );
}
