import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrendingProducts from '../components/TrendingProducts';
import FeaturedCategory from '../components/FeaturedCategory';
import MakeItCustom from '../components/MakeItCustom';
import PremiumBundles from '../components/PremiumBundles';
import NewsletterOffer from '../components/NewsletterOffer';
import Footer from '../components/Footer';
import BrandQuote from '../components/BrandQuote';
import '../components/landing/landing-tokens.css';
import '../components/landing/landing-interactions.css';
import '../components/landing/landing-motion.css';
<<<<<<< HEAD
import JsonLd from '../components/seo/JsonLd.jsx';
import { useSeo } from '../hooks/useSeo.js';
import { SEO_DEFAULT_DESCRIPTION, SEO_DEFAULT_TITLE } from '../constants/seo.js';
import { organizationJsonLd, websiteJsonLd } from '../utils/structuredData.js';
=======
import { useSEO } from '../hooks/useSEO.js';
>>>>>>> origin/main

/**
 * Customer storefront Home / landing page.
 * Also used by LegacyPages for the `/` home view.
 */
const Home = () => {
<<<<<<< HEAD
  useSeo({
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    path: '/',
    prefetch: ['/collection', '/about', '/contact'],
=======
  useSEO({
    title: 'Zivorah Pakistan | Premium Jewelry',
    url: 'https://zivorah.store/',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Zivorah',
          alternateName: 'Zivorah Pakistan',
          url: 'https://zivorah.store/',
        },
        {
          '@type': 'Organization',
          name: 'Zivorah',
          url: 'https://zivorah.store/',
          logo: 'https://zivorah.store/favicon.ico',
        },
      ],
    },
>>>>>>> origin/main
  });

  return (
    <div className="landing-page">
      <Navbar homeHref="/?home=true" />
      <main id="main-content">
        <Hero />
        <BrandQuote />
        <TrendingProducts />
        <FeaturedCategory />
        <MakeItCustom />
        <PremiumBundles />
        <NewsletterOffer />
      </main>
      <Footer />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </div>
  );
};

export default Home;
