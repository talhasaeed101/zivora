import { useEffect, useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../utils/images.js';

export default function SafeImage({
  src,
  alt = '',
  fallback = PLACEHOLDER_IMAGE,
  className,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(resolveInitialSrc(src, fallback));

  useEffect(() => {
    setCurrentSrc(resolveInitialSrc(src, fallback));
  }, [src, fallback]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}

function resolveInitialSrc(src, fallback) {
  if (!src || src === 'null' || src === 'undefined') {
    return fallback;
  }

  return src;
}
