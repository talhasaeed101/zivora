import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrendingProducts from '../components/TrendingProducts';
import FeaturedCategory from '../components/FeaturedCategory';
import MakeItCustom from '../components/MakeItCustom';
import PremiumBundles from '../components/PremiumBundles';
import NewsletterOffer from '../components/NewsletterOffer';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import BrandQuote from '../components/BrandQuote';
import CampaignHomeSection from '../components/CampaignHomeSection';
import LaunchTimer, { isLaunchTimerActive } from '../components/LaunchTimer';
import '../components/landing/landing-tokens.css';
import '../components/landing/landing-interactions.css';
import '../components/landing/landing-motion.css';
import GiftIdeasSection from '../components/GiftIdeasSection';
import SocialProofHomeSections from '../components/SocialProofHomeSections.jsx';
import JsonLd from '../components/seo/JsonLd.jsx';
import { useSeo } from '../hooks/useSEO.js';
import { SEO_DEFAULT_DESCRIPTION, SEO_DEFAULT_TITLE } from '../constants/seo.js';
import { organizationJsonLd, websiteJsonLd } from '../utils/structuredData.js';

/**
 * Customer storefront Home / landing page (canonical composition reference).
 * Live "/" currently mounts LegacyPages which mirrors this home structure
 * (including CampaignHomeSection). Keep in sync when changing homepage sections.
 */
const Home = () => {
  const [timerActive, setTimerActive] = useState(isLaunchTimerActive);

  useSeo({
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    path: '/',
    prefetch: ['/collection', '/about', '/contact'],
  });

  if (timerActive) {
    return (
      <div className="landing-page landing-page--timer-only">
        <Navbar homeHref="/?home=true" locked={true} />
        <main id="main-content">
          <Hero />
          <LaunchTimer onTimerEnd={() => setTimerActive(false)} />
        </main>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar homeHref="/?home=true" />
      <main id="main-content">
        <Hero />
        <CampaignHomeSection />
        <LaunchTimer />
        <BrandQuote />
        <TrendingProducts />
        <SocialProofHomeSections />
        <GiftIdeasSection />
        <FeaturedCategory />
        <MakeItCustom />
        <PremiumBundles />
        <NewsletterOffer />
        <Testimonials />
      </main>
      <Footer />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </div>
  );
};

export default Home;
