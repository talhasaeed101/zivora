import { useEffect, useState } from 'react';

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Observes an element and returns whether it has entered the viewport.
 * Animates once by default. Respects prefers-reduced-motion.
 */
export function useRevealOnScroll(
  ref,
  {
    once = true,
    threshold = 0.12,
    rootMargin = '0px 0px -48px 0px',
  } = {}
) {
  const [visible, setVisible] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, threshold, rootMargin, visible]);

  return visible;
}
