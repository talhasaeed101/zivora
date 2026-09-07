import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEndsIn } from '../../utils/campaignEligibility.js';
import { resolveCampaignCtaHref } from '../../utils/campaignCta.js';
import './campaignUi.css';

export { resolveCampaignCtaHref };

/**
 * Shared campaign CTA path for storefront merchandising.
 */
export function useCampaignCtaHref(merch, campaignSlug) {
  return useMemo(
    () => resolveCampaignCtaHref(merch, campaignSlug),
    [merch, campaignSlug]
  );
}

/**
 * Visual-only countdown for merchandising. Does not decide campaign status.
 */
export function useCampaignCountdown(endAt, enabled, onExpire) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || !endAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (new Date(endAt).getTime() <= t) {
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [enabled, endAt, onExpire]);

  if (!enabled || !endAt) {
    return null;
  }

  return formatEndsIn(endAt, now);
}

export function CampaignSaleBadge({ text, className = '' }) {
  if (!text) return null;
  return <span className={`campaign-sale-stamp ${className}`.trim()}>{text}</span>;
}

export function CampaignCtaLink({ to, children, className = '', onClick }) {
  if (!to) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }

  if (String(to).startsWith('http')) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} prefetch="intent" onClick={onClick}>
      {children}
    </Link>
  );
}
