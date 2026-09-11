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
  useSeo({
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    path: '/',
    prefetch: ['/collection', '/about', '/contact'],
  });

  return (
    <div className="landing-page">
      <Navbar homeHref="/?home=true" />
      <main id="main-content">
        <Hero />
        <CampaignHomeSection />
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
