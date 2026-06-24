export const PLACEHOLDER_IMAGE = '/images/pp.svg';

export const MARKETING_IMAGE = PLACEHOLDER_IMAGE;

export const AVATAR_PLACEHOLDER = PLACEHOLDER_IMAGE;

export function resolveImageSrc(src, fallback = PLACEHOLDER_IMAGE) {
  return src || fallback;
}
