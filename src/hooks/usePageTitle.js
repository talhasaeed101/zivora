import { useEffect } from 'react';

const DEFAULT_TITLE = 'Zivorah | Premium Jewelry';

export function usePageTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? title : DEFAULT_TITLE;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
