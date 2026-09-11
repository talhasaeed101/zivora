import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import CatalogPagination from '../components/catalog/CatalogPagination.jsx';
import Reveal from '../components/Reveal.jsx';
import PageBreadcrumbs from '../components/seo/PageBreadcrumbs.jsx';
import {
  CampaignSaleBadge,
  useCampaignCountdown,
} from '../components/campaign/campaignUi.jsx';
import { useSeo } from '../hooks/useSEO.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useCampaigns } from '../context/CampaignContext.jsx';
import { publicCampaignApi } from '../services/api.js';
import { ROUTES, campaignPath } from '../utils/navigation';
import { ShimmerProductGrid } from '../components/Shimmer.jsx';
import './Collection.css';
import './CampaignPage.css';

const PAGE_SIZE = 12;

function formatDiscountLabel(campaign) {
  if (!campaign) return '';
  if (campaign.discountType === 'percentage') {
    return `${campaign.discountValue}% OFF`;
  }
  return `Rs. ${Number(campaign.discountValue || 0).toLocaleString('en-PK')} OFF`;
}

/**
 * Campaign landing page — /campaign/:slug
 * Reuses catalog grid/cards. Pricing remains PromotionEngine.
 *
 * Variant-target safety:
 * - API lists products that contain ≥1 targeted variant
 * - CatalogProductCard badges still fail-closed (all variants must be targeted)
 * - Soft note shown for variant campaigns so we do not imply product-wide % off
 */
export default function CampaignPage() {
  const { slug } = useParams();
  const isMobileCatalog = useMediaQuery('(max-width: 768px)');
  const { refresh: refreshActiveCampaigns } = useCampaigns();

  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [trackedSlug, setTrackedSlug] = useState(slug);

  if (slug !== trackedSlug) {
    setTrackedSlug(slug);
    setPage(1);
    setError('');
    setNotFound(false);
    setCampaign(null);
    setProducts([]);
  }

  const onExpire = useCallback(() => {
    refreshActiveCampaigns();
    setReloadToken((value) => value + 1);
  }, [refreshActiveCampaigns]);

  const merch = campaign?.merchandising;
  const countdown = useCampaignCountdown(
    campaign?.endAt,
    Boolean(campaign && merch?.showCountdown),
    onExpire
  );

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    setLoading(true);

    publicCampaignApi
      .getBySlug(slug, { page, limit: PAGE_SIZE, sort: 'newest' })
      .then((response) => {
        if (!isMounted) return;
        const data = response?.data || {};
        setCampaign(data.campaign || null);
        setProducts(Array.isArray(data.products) ? data.products : []);
        setPagination(data.pagination || null);
        setNotFound(!data.campaign);
        setError('');
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err?.message || '';
        const is404 =
          /not found/i.test(message) ||
          err?.status === 404 ||
          err?.statusCode === 404;

        setCampaign(null);
        setProducts([]);
        setPagination(null);

        if (is404) {
          setNotFound(true);
          setError('');
        } else {
          setNotFound(false);
          setError(message || 'Unable to load this campaign.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, page, reloadToken]);

  const title = merch?.homeTitle || campaign?.name || 'Sale';
  const subtitle = merch?.homeSubtitle || formatDiscountLabel(campaign);
  const badge = merch?.badgeText || formatDiscountLabel(campaign);
  const discountLabel = formatDiscountLabel(campaign);
  const productCount = pagination?.total ?? products.length;
  const isVariantTarget = campaign?.targetType === 'variants';

  useSeo({
    title: campaign?.name ? `${campaign.name} | Zivorah` : 'Campaign',
    description:
      merch?.homeSubtitle ||
      merch?.announcementText ||
      (campaign?.name
        ? `${campaign.name} — shop eligible pieces at Zivorah.`
        : 'Shop Zivorah campaign offers.'),
    path: slug ? campaignPath(slug) : '/collection',
    robots: campaign ? 'index, follow' : 'noindex, follow',
  });

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Jewelry', path: '/collection' },
    { name: campaign?.name || 'Campaign' },
  ];

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog-page campaign-landing-page">
      <Navbar activeLink="COLLECTION" homeHref={ROUTES.home} />

      <main id="main-content" className="catalog-main">
        <Reveal className="catalog-header" variant="fade-up">
          <PageBreadcrumbs items={crumbs} className="catalog-breadcrumbs" />
        </Reveal>

        {loading && !campaign && !notFound && !error ? (
          <div className="campaign-landing-loading" aria-busy="true">
            <span className="sr-only">Loading campaign</span>
            <div className="campaign-landing-hero campaign-landing-hero--skeleton" />
            <ShimmerProductGrid count={8} />
          </div>
        ) : null}

        {notFound && !loading ? (
          <div className="catalog-state">
            <h1 className="catalog-state-title">Campaign unavailable</h1>
            <p className="catalog-state-copy">
              This sale is not currently active. Browse the full collection instead.
            </p>
            <Link to={ROUTES.collection} className="catalog-state-link">
              Browse All Jewelry
            </Link>
          </div>
        ) : null}

        {error && !notFound && !loading ? (
          <div className="catalog-state catalog-state-error-panel" role="alert">
            <h1 className="catalog-state-title">We couldn’t load this campaign</h1>
            <p className="catalog-state-copy">Please try again in a moment.</p>
            <button
              type="button"
              className="catalog-state-btn"
              onClick={() => setReloadToken((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        ) : null}

        {campaign && !notFound ? (
          <>
            <Reveal className="campaign-landing-hero" variant="fade-up">
              <div className="campaign-landing-hero-inner">
                <div className="campaign-landing-copy">
                  <p className="campaign-landing-kicker">Limited-time offer</p>
                  <h1 className="campaign-landing-title">{title}</h1>
                  {subtitle ? (
                    <p className="campaign-landing-subtitle">{subtitle}</p>
                  ) : null}
                  {discountLabel ? (
                    <p className="campaign-landing-discount">{discountLabel}</p>
                  ) : null}
                  {merch?.announcementText &&
                  merch.announcementText !== subtitle &&
                  merch.announcementText !== title ? (
                    <p className="campaign-landing-message">{merch.announcementText}</p>
                  ) : null}
                  {countdown ? (
                    <p className="campaign-landing-countdown" aria-live="polite">
                      Ends in <strong>{countdown}</strong>
                    </p>
                  ) : (
                    <p className="campaign-landing-note">
                      While stocks last · Offer applies at checkout
                    </p>
                  )}
                  {isVariantTarget ? (
                    <p className="campaign-landing-variant-note">
                      Selected finishes only — discount applies to eligible options at
                      checkout.
                    </p>
                  ) : null}
                  <p className="catalog-page-count">
                    {loading
                      ? 'Loading products…'
                      : `${productCount} ${productCount === 1 ? 'piece' : 'pieces'}`}
                  </p>
                </div>
                {badge ? (
                  <div className="campaign-landing-stamp-wrap">
                    <CampaignSaleBadge text={badge} className="campaign-landing-stamp" />
                  </div>
                ) : null}
              </div>
            </Reveal>

            <div className="catalog-grid-wrap">
              <h2 className="campaign-landing-products-heading">Eligible products</h2>

              {loading ? (
                <div aria-busy="true" aria-live="polite">
                  <span className="sr-only">Loading products</span>
                  <ShimmerProductGrid count={8} />
                </div>
              ) : null}

              {!loading && products.length === 0 ? (
                <div className="catalog-state">
                  <h2 className="catalog-state-title">No eligible products right now</h2>
                  <p className="catalog-state-copy">
                    Explore the full collection while this offer is refreshed.
                  </p>
                  <Link to={ROUTES.collection} className="catalog-state-link">
                    Browse All Jewelry
                  </Link>
                </div>
              ) : null}

              {!loading && products.length > 0 ? (
                <div key={`${slug}-${page}`} className="catalog-results-fade">
                  <div
                    className={
                      isMobileCatalog ? 'catalog-product-grid-mobile' : 'catalog-product-grid'
                    }
                  >
                    {products.map((product, index) => (
                      <Reveal
                        key={product._id}
                        variant="fade-up"
                        delay={Math.min(index, 7) * 40}
                        className="catalog-card-reveal"
                      >
                        <CatalogProductCard
                          product={product}
                          variant={isMobileCatalog ? 'mobile' : 'desktop'}
                        />
                      </Reveal>
                    ))}
                  </div>
                </div>
              ) : null}

              {!loading && products.length > 0 ? (
                <CatalogPagination
                  pagination={pagination}
                  page={page}
                  onPageChange={handlePageChange}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
