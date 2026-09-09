/**
 * Lightweight storefront campaign eligibility unit checks (no DOM).
 * Run: node src/utils/campaignEligibility.test.js
 */
import assert from 'assert';
import {
  isProductCardEligibleForCampaign,
  isProductEligibleForCampaignListing,
  isSelectionEligibleForCampaign,
  pickEligibleCampaign,
} from './campaignEligibility.js';
import { resolveCampaignCtaHref } from './campaignCta.js';
import { campaignPath, categoryPath, ROUTES } from './navigation.js';

const product = {
  _id: 'p1',
  category: { _id: 'c1', name: 'Birth Flower' },
  variants: [
    { _id: 'v1', attributes: { Color: 'Gold' } },
    { _id: 'v2', attributes: { Color: 'Silver' } },
  ],
};

assert.strictEqual(
  isProductCardEligibleForCampaign(product, { targetType: 'all', merchandising: { showBadge: true } }),
  true
);

assert.strictEqual(
  isProductCardEligibleForCampaign(product, {
    targetType: 'categories',
    targetCategoryIds: ['c1'],
  }),
  true
);

assert.strictEqual(
  isProductCardEligibleForCampaign(product, {
    targetType: 'categories',
    targetCategoryIds: ['c2'],
  }),
  false
);

// Variant-targeted: only one variant → fail closed on product card
assert.strictEqual(
  isProductCardEligibleForCampaign(product, {
    targetType: 'variants',
    targetVariantIds: ['v1'],
  }),
  false
);

// Listing may still include the product when any variant is targeted
assert.strictEqual(
  isProductEligibleForCampaignListing(product, {
    targetType: 'variants',
    targetVariantIds: ['v1'],
  }),
  true
);

// All variants targeted → safe to show badge
assert.strictEqual(
  isProductCardEligibleForCampaign(product, {
    targetType: 'variants',
    targetVariantIds: ['v1', 'v2'],
  }),
  true
);

assert.strictEqual(
  isSelectionEligibleForCampaign(product, { targetType: 'variants', targetVariantIds: ['v1'] }, {
    variantId: 'v1',
  }),
  true
);

assert.strictEqual(
  isSelectionEligibleForCampaign(product, { targetType: 'variants', targetVariantIds: ['v1'] }, {
    variantId: 'v2',
  }),
  false
);

assert.strictEqual(
  isSelectionEligibleForCampaign(product, { targetType: 'variants', targetVariantIds: ['v1'] }, {
    variantId: null,
  }),
  false
);

const picked = pickEligibleCampaign(
  [
    { campaignId: 'a', discountType: 'percentage', discountValue: 10, targetType: 'all' },
    { campaignId: 'b', discountType: 'percentage', discountValue: 20, targetType: 'all' },
  ],
  product,
  { forCard: true }
);
assert.strictEqual(picked.campaignId, 'b');

// CTA: campaign / collection → campaign page
assert.strictEqual(
  resolveCampaignCtaHref(
    { ctaDestination: 'campaign', ctaCampaignSlug: '11-11-sale' },
    '11-11-sale'
  ),
  campaignPath('11-11-sale')
);

assert.strictEqual(
  resolveCampaignCtaHref({ ctaDestination: 'collection' }, 'azadi-sale'),
  campaignPath('azadi-sale')
);

// CTA: category unchanged
assert.strictEqual(
  resolveCampaignCtaHref({
    ctaDestination: 'category',
    ctaCategorySlug: 'rings',
  }),
  categoryPath('rings')
);

// Missing merch / slug fails soft to collection
assert.strictEqual(resolveCampaignCtaHref(null), ROUTES.collection);
assert.strictEqual(resolveCampaignCtaHref({ ctaDestination: 'campaign' }), ROUTES.collection);

console.log('campaignEligibility unit checks passed.');
