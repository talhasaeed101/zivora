import { useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../utils/images.js';

export default function SafeImage(props) {
  // Remount on src/fallback change so load state resets without syncing in an effect.
  return <SafeImageInner key={`${props.src || ''}:${props.fallback || ''}`} {...props} />;
}

function SafeImageInner({
  src,
  alt = '',
  fallback = PLACEHOLDER_IMAGE,
  className,
  eager = false,
  loading,
  decoding,
  width = 800,
  height = 1000,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(() => resolveInitialSrc(src, fallback));
  const [loaded, setLoaded] = useState(eager);

  const imageClassName = [
    className,
    'safe-image',
    loaded || eager ? 'safe-image--loaded' : '',
    eager ? 'safe-image--instant' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      loading={eager ? 'eager' : loading || 'lazy'}
      decoding={decoding || 'async'}
      fetchPriority={eager ? props.fetchPriority || 'high' : props.fetchPriority || 'auto'}
      onLoad={(event) => {
        setLoaded(true);
        props.onLoad?.(event);
      }}
      onError={(event) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
          setLoaded(false);
        } else {
          setLoaded(true);
        }
        props.onError?.(event);
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
