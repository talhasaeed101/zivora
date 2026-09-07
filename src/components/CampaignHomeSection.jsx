import { useCallback } from 'react';
import { useCampaigns } from '../context/CampaignContext.jsx';
import {
  CampaignCtaLink,
  CampaignSaleBadge,
  useCampaignCountdown,
  useCampaignCtaHref,
} from './campaign/campaignUi.jsx';
import { trackCampaignClick } from '../utils/analytics.js';
import './CampaignHomeSection.css';

/**
 * Bold homepage sale banner — only when primary campaign enables showHomeSection.
 * Additive; does not replace Hero.
 */
export default function CampaignHomeSection() {
  const { primary, refresh } = useCampaigns();
  const merch = primary?.merchandising;
  const show = Boolean(primary && merch?.showHomeSection);
  const ctaHref = useCampaignCtaHref(merch, primary?.slug);
  const onExpire = useCallback(() => {
    refresh();
  }, [refresh]);
  const countdown = useCampaignCountdown(
    primary?.endAt,
    Boolean(show && merch?.showCountdown),
    onExpire
  );

  if (!show) {
    return null;
  }

  const title = merch.homeTitle || primary.name;
  const subtitle = merch.homeSubtitle;
  const badge = merch.badgeText || null;
  const cta = merch.homeCtaText || 'Shop Now';

  return (
    <section className="campaign-home-section" aria-label="Active promotion">
      <div className="campaign-home-banner">
        <div className="campaign-home-banner-accent" aria-hidden="true" />
        <div className="campaign-home-banner-inner">
          <div className="campaign-home-copy">
            <p className="campaign-home-kicker">Limited-time offer</p>
            <h2 className="campaign-home-title">{title}</h2>
            {subtitle ? <p className="campaign-home-subtitle">{subtitle}</p> : null}
            {countdown ? (
              <p className="campaign-home-countdown" aria-live="polite">
                Ends in <strong>{countdown}</strong>
              </p>
            ) : (
              <p className="campaign-home-note">While stocks last · Offer applies at checkout</p>
            )}
            <CampaignCtaLink
              to={ctaHref}
              className="campaign-home-cta"
              onClick={() =>
                trackCampaignClick({
                  campaignId: primary?._id,
                  campaignSlug: primary?.slug,
                  href: ctaHref,
                })
              }
            >
              {cta}
            </CampaignCtaLink>
          </div>

          {badge ? (
            <div className="campaign-home-stamp-wrap">
              <CampaignSaleBadge text={badge} className="campaign-home-stamp" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
