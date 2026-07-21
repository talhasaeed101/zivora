import { ROUTES } from './navigation.js';

const AUTH_PATH_PREFIXES = [
  '/login',
  '/register',
  '/forget-password',
  '/reset-password',
  '/verify-email',
  '/create-new-password',
  '/resend-verification',
];

/**
 * Only allow same-origin relative paths for post-login redirects.
 */
export function getSafeReturnPath(from, fallback = ROUTES.home) {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return fallback;
  }

  const pathOnly = from.split('?')[0].split('#')[0];
  if (AUTH_PATH_PREFIXES.some((prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`))) {
    return fallback;
  }

  return from;
}

export function friendlyAuthError(error, fallback = 'Something went wrong. Please try again.') {
  const code = error?.data?.errorCode || error?.errorCode || '';
  const raw = (error?.message || '').trim();
  const lower = raw.toLowerCase();

  if (code === 'EMAIL_NOT_VERIFIED' || lower.includes('email not verified')) {
    return 'Please verify your email before signing in.';
  }

  if (
    lower.includes('invalid credentials') ||
    lower.includes('incorrect password') ||
    lower.includes('wrong password') ||
    lower.includes('invalid email or password') ||
    lower.includes('authentication failed')
  ) {
    return 'Unable to sign in with those details. Please check and try again.';
  }

  if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('duplicate')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (lower.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Unable to connect. Check your connection and try again.';
  }

  if (lower.includes('expired') || lower.includes('invalid token') || lower.includes('invalid or expired')) {
    return 'This link is invalid or has expired. Please request a new one.';
  }

  if (!raw || raw.length > 140 || lower.includes('stack') || lower.includes('mongo')) {
    return fallback;
  }

  return raw;
}
