/**
 * Frontend-only display helpers for loyalty tier progress.
 * Backend remains the source of truth for current tier.
 */

export const LOYALTY_TIER_THRESHOLDS = [
  { tier: 'Bronze', min: 0 },
  { tier: 'Silver', min: 1000 },
  { tier: 'Gold', min: 5000 },
  { tier: 'Platinum', min: 10000 },
];

/** Customer redemption limits — must match backend loyaltyConstants. */
export const REDEMPTION_MIN_POINTS = 100;
export const REDEMPTION_MAX_POINTS = 5000;
export const REDEMPTION_PKR_PER_POINT = 1;

export function formatLoyaltyPoints(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US').format(Math.trunc(amount));
}

export function formatLoyaltyPkr(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 'Rs.0';
  }

  return `Rs.${new Intl.NumberFormat('en-US').format(Math.max(0, Math.trunc(amount)))}`;
}

/**
 * Parse redeem input: empty → null; reject decimals/non-integers.
 * @returns {{ ok: true, points: number|null } | { ok: false, error: string }}
 */
export function parseLoyaltyRedeemInput(rawValue) {
  const trimmed = String(rawValue ?? '').trim();
  if (!trimmed) {
    return { ok: true, points: null };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Enter a whole number of points.' };
  }

  const points = Number(trimmed);
  if (!Number.isInteger(points) || points <= 0) {
    return { ok: false, error: 'Enter a whole number of points.' };
  }

  return { ok: true, points };
}

/**
 * Validate redeem amount against balance and backend limits.
 * @returns {string} empty string when valid
 */
export function getLoyaltyRedeemValidationError(points, balance) {
  const available = Math.max(0, Math.trunc(Number(balance) || 0));

  if (available < REDEMPTION_MIN_POINTS) {
    return 'You need at least 100 points to redeem.';
  }

  if (points == null) {
    return 'Enter the points you want to redeem.';
  }

  if (!Number.isInteger(points) || points <= 0) {
    return 'Enter a whole number of points.';
  }

  if (points < REDEMPTION_MIN_POINTS) {
    return 'Minimum redemption is 100 points.';
  }

  if (points > REDEMPTION_MAX_POINTS) {
    return 'Maximum redemption is 5,000 points.';
  }

  if (points > available) {
    return 'Insufficient points balance.';
  }

  return '';
}

export function createLoyaltyRedeemIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `loyalty-redeem:${crypto.randomUUID()}`;
  }

  return `loyalty-redeem:${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function formatLoyaltyDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLoyaltySource(source) {
  const labels = {
    order: 'Order',
    review: 'Review',
    referral: 'Referral',
    signup: 'Signup',
    birthday: 'Birthday',
    promotion: 'Promotion',
    admin: 'Adjustment',
    redemption: 'Redemption',
    customer_redemption: 'Redemption',
    expiry: 'Expiry',
  };

  return labels[source] || String(source || 'Activity');
}

/**
 * Progress toward the next tier using lifetimeEarned.
 */
export function getLoyaltyTierProgress(lifetimeEarned = 0, currentTier = 'Bronze') {
  const earned = Math.max(0, Number(lifetimeEarned) || 0);
  const tier = String(currentTier || 'Bronze');

  if (tier === 'Platinum' || earned >= 10000) {
    return {
      currentTierMin: 10000,
      nextTier: null,
      nextTierMin: null,
      pointsToNext: 0,
      progressPercent: 100,
      isMaxTier: true,
      message: "You're at the highest tier",
    };
  }

  const currentIndex = LOYALTY_TIER_THRESHOLDS.findIndex((entry) => entry.tier === tier);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const current = LOYALTY_TIER_THRESHOLDS[safeIndex];
  const next = LOYALTY_TIER_THRESHOLDS[safeIndex + 1];

  if (!next) {
    return {
      currentTierMin: current.min,
      nextTier: null,
      nextTierMin: null,
      pointsToNext: 0,
      progressPercent: 100,
      isMaxTier: true,
      message: "You're at the highest tier",
    };
  }

  const span = Math.max(1, next.min - current.min);
  const advanced = Math.min(span, Math.max(0, earned - current.min));
  const progressPercent = Math.min(100, Math.max(0, Math.round((advanced / span) * 100)));
  const pointsToNext = Math.max(0, next.min - earned);

  return {
    currentTierMin: current.min,
    nextTier: next.tier,
    nextTierMin: next.min,
    pointsToNext,
    progressPercent,
    isMaxTier: false,
    message:
      pointsToNext > 0
        ? `You're ${formatLoyaltyPoints(pointsToNext)} points away from ${next.tier}`
        : `You've reached ${next.tier}`,
  };
}
