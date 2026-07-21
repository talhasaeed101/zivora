import { useRef } from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';

/**
 * Lightweight scroll-reveal wrapper for landing / catalog sections.
 * Variants: fade-up | fade-in | scale-in | slide-left | slide-right
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  once = true,
  threshold,
  rootMargin,
  ...props
}) {
  const ref = useRef(null);
  const visible = useRevealOnScroll(ref, { once, threshold, rootMargin });

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant}${visible ? ' is-revealed' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
