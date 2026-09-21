import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls every new page open to the top.
 * Skips when a hash is present so in-page section links (e.g. #bundles) still work.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}
