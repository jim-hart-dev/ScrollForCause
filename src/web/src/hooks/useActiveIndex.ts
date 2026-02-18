import { useEffect, useRef, useState, useCallback } from 'react';

export function useActiveIndex() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setItemRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
    setItemCount(itemRefs.current.size);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        }
      },
      { threshold: 0.5 },
    );

    const observer = observerRef.current;
    for (const el of itemRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [itemCount]);

  return { activeIndex, setItemRef };
}
