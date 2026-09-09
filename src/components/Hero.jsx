import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';
import { useCampaigns } from '../context/CampaignContext.jsx';
import {
  CampaignCtaLink,
  CampaignSaleBadge,
  useCampaignCountdown,
  useCampaignCtaHref,
} from './campaign/campaignUi.jsx';

const HERO_ARCH_IMAGE = '/images/hero00.png';
const HERO_PILL_IMAGE = '/images/hero111.png';

const HERO_TAGLINE =
  'From everyday elegance to unforgettable celebrations, discover jewelry crafted with exceptional artistry.';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function useHeroTaglineTypewriter(text) {
  const reducedMotion = prefersReducedMotion();
  const [displayed, setDisplayed] = useState(reducedMotion ? text : '');
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return undefined;
    }

    let index = 0;
    let intervalId;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(intervalId);
          setDone(true);
        }
      }, 28);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [text]);

  return { displayed, done };
}

function HeroTagline({ displayed, done }) {
  return (
    <h1 className="hero-tagline-text" aria-label={HERO_TAGLINE}>
      <span className="sr-only">{HERO_TAGLINE}</span>
      <span aria-hidden="true">{displayed}</span>
      {!done && <span className="hero-tagline-caret" aria-hidden="true" />}
    </h1>
  );
}

function HeroShopBadge({ label = 'SHOP THE COLLECTION', pathId = 'heroCirclePath' }) {
  const text = `${label} • ${label} • `;
  return (
    <>
      <svg viewBox="0 0 100 100" className="hero-circular-rotating-svg" aria-hidden="true">
        <defs>
          <path id={pathId} d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
        </defs>
        <text fontSize="8" fontWeight="600" letterSpacing="1px" fill="#000">
          <textPath href={`#${pathId}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="hero-circular-inner-button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 18L15 12L9 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}

function CollectionRow() {
  return (
    <div className="hero-collection-row-container">
      <div className="hero-collection-text-arrow-wrapper">
        <p className="hero-collection-title-text">COLLECTION</p>
        <div className="hero-collection-separator-line" />
        <div className="hero-collection-arrow-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="hero-collection-thumbnails-container">
        <SafeImage
          src="/images/collection.svg"
          alt="Collection preview"
          className="hero-collection-thumbnail-single"
        />
      </div>
    </div>
  );
}

function HeroCampaignPanel({ campaign, ctaHref, countdown }) {
  const merch = campaign.merchandising;
  return (
    <div className="hero-campaign-panel" role="region" aria-label="Active sale">
      <div className="hero-campaign-panel-top">
        <span className="hero-campaign-kicker">Sale now on</span>
        {merch.badgeText ? (
          <CampaignSaleBadge text={merch.badgeText} className="hero-campaign-mini-stamp" />
        ) : null}
      </div>
      <p className="hero-campaign-title">{merch.homeTitle || campaign.name}</p>
      {merch.homeSubtitle ? (
        <p className="hero-campaign-subtitle">{merch.homeSubtitle}</p>
      ) : null}
      {countdown ? (
        <p className="hero-campaign-countdown" aria-live="polite">
          Ends in {countdown}
        </p>
      ) : null}
      <CampaignCtaLink to={ctaHref} className="hero-campaign-cta">
        {merch.homeCtaText || 'Shop Sale'}
      </CampaignCtaLink>
    </div>
  );
}

export default function Hero() {
  const { displayed, done } = useHeroTaglineTypewriter(HERO_TAGLINE);
  const { primary, refresh } = useCampaigns();
  const merch = primary?.merchandising;
  const showCampaign = Boolean(primary && merch?.showHomeSection);
  const ctaHref = useCampaignCtaHref(showCampaign ? merch : null, primary?.slug);
  const onExpire = useCallback(() => {
    refresh();
  }, [refresh]);
  const countdown = useCampaignCountdown(
    primary?.endAt,
    Boolean(showCampaign && merch?.showCountdown),
    onExpire
  );

  const shopLabel = showCampaign ? 'SHOP THE SALE' : 'SHOP THE COLLECTION';
  const shopHref = showCampaign ? ctaHref : ROUTES.collection;

  return (
    <section className={`hero-section${showCampaign ? ' hero-section--campaign' : ''}`}>
      {showCampaign ? (
        <div className="hero-campaign-ribbon">
          <CampaignCtaLink to={ctaHref} className="hero-campaign-ribbon-link">
            {merch.badgeText ? <span className="hero-campaign-ribbon-chip">{merch.badgeText}</span> : null}
            <span className="hero-campaign-ribbon-text">
              {merch.homeTitle || primary.name}
              {merch.homeSubtitle ? ` — ${merch.homeSubtitle}` : ''}
            </span>
            <span className="hero-campaign-ribbon-cta">{merch.homeCtaText || 'Shop Now'}</span>
          </CampaignCtaLink>
        </div>
      ) : null}

      <div className="hero-main-wrapper">
        <div className="hero-left-zone-container">
          <div className="hero-left-column-1">
            <div className="hero-pill-image-wrapper">
              <SafeImage
                src={HERO_PILL_IMAGE}
                alt="Zivorah jewelry collection"
                className="hero-pill-image"
                eager
                fetchPriority="high"
                width={420}
                height={640}
              />
            </div>
            <div className="hero-vertical-text-container">
              <p className="hero-vertical-text">PERFECT</p>
            </div>
          </div>

          <div className="hero-left-column-2">
            <div className="hero-vertical-text-container">
              <p className="hero-vertical-text">{showCampaign ? 'SALE' : 'COLLECTIONS'}</p>
            </div>
          </div>
        </div>

        <div className="hero-content-column">
          {showCampaign ? (
            <HeroCampaignPanel campaign={primary} ctaHref={ctaHref} countdown={countdown} />
          ) : (
            <HeroTagline displayed={displayed} done={done} />
          )}

          <CollectionRow />
        </div>

        <div className="hero-right-zone-container">
          <div className="hero-arch-image-wrapper">
            <SafeImage
              src={HERO_ARCH_IMAGE}
              alt="Featured jewelry"
              className="hero-arch-image"
              eager
              fetchPriority="high"
              width={720}
              height={900}
            />
          </div>
          {showCampaign && merch.badgeText ? (
            <CampaignSaleBadge text={merch.badgeText} className="hero-arch-sale-stamp" />
          ) : null}

          <Link
            to={shopHref}
            className="hero-circular-badge-container"
            aria-label={showCampaign ? 'Shop the sale' : 'Shop the collection'}
            prefetch="intent"
          >
            <HeroShopBadge label={shopLabel} pathId="heroCirclePathDesktop" />
          </Link>
        </div>
      </div>

      <div className="mobile-hero-container">
        {showCampaign ? (
          <div className="hero-campaign-ribbon hero-campaign-ribbon--mobile">
            <CampaignCtaLink to={ctaHref} className="hero-campaign-ribbon-link">
              {merch.badgeText ? (
                <span className="hero-campaign-ribbon-chip">{merch.badgeText}</span>
              ) : null}
              <span className="hero-campaign-ribbon-text">
                {merch.homeTitle || primary.name}
              </span>
            </CampaignCtaLink>
          </div>
        ) : null}

        <div className="mobile-hero-top">
          <div className="hero-left-zone-container">
            <div className="hero-left-column-1">
              <div className="hero-pill-image-wrapper">
                <SafeImage
                  src={HERO_PILL_IMAGE}
                  alt="Zivorah jewelry collection"
                  className="hero-pill-image"
                  eager
                  fetchPriority="high"
                  width={420}
                  height={640}
                />
              </div>
              <div className="hero-vertical-text-container">
                <p className="hero-vertical-text">PERFECT</p>
              </div>
            </div>

            <div className="hero-left-column-2">
              <div className="hero-vertical-text-container">
                <p className="hero-vertical-text">{showCampaign ? 'SALE' : 'COLLECTIONS'}</p>
              </div>
            </div>
          </div>

          <div className="mobile-hero-copy-block">
            {showCampaign ? (
              <HeroCampaignPanel campaign={primary} ctaHref={ctaHref} countdown={countdown} />
            ) : (
              <HeroTagline displayed={displayed} done={done} />
            )}

            <Link
              to={shopHref}
              className="hero-circular-badge-container mobile-hero-badge"
              aria-label={showCampaign ? 'Shop the sale' : 'Shop the collection'}
              prefetch="intent"
            >
              <HeroShopBadge label={shopLabel} pathId="heroCirclePathMobile" />
            </Link>

            <div className="mobile-collection-row">
              <CollectionRow />
            </div>
          </div>
        </div>

        <div className="mobile-hero-arch">
          <div className="hero-arch-image-wrapper">
            <SafeImage
              src={HERO_ARCH_IMAGE}
              alt="Featured jewelry"
              className="hero-arch-image"
              eager
              fetchPriority="high"
              width={720}
              height={900}
            />
          </div>
          {showCampaign && merch.badgeText ? (
            <CampaignSaleBadge text={merch.badgeText} className="hero-arch-sale-stamp" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
