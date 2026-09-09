import { campaignPath, categoryPath, ROUTES } from './navigation.js';

/**
 * Resolve merchandising CTA href.
 * - category → /category/:slug (unchanged)
 * - campaign | collection (legacy) → /campaign/:slug when slug known
 * - otherwise → collection
 */
export function resolveCampaignCtaHref(merch, campaignSlug) {
  if (!merch) return ROUTES.collection;

  if (merch.ctaDestination === 'category' && merch.ctaCategorySlug) {
    return categoryPath(merch.ctaCategorySlug);
  }

  const slug = campaignSlug || merch.ctaCampaignSlug || null;
  const dest = merch.ctaDestination || 'campaign';

  if (slug && (dest === 'campaign' || dest === 'collection')) {
    return campaignPath(slug);
  }

  return ROUTES.collection;
}
