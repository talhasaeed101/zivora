export const PLACEHOLDER_IMAGE = '/images/pp.svg';

export const MARKETING_IMAGE = '/images/features categoruy image 1.png';
export const AVATAR_PLACEHOLDER = PLACEHOLDER_IMAGE;

export function resolveImageSrc(src, fallback = PLACEHOLDER_IMAGE) {
  return src || fallback;
}
