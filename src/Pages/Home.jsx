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
import { usePageTitle } from '../hooks/usePageTitle.js';

/**
 * Customer storefront Home / landing page.
 * Also used by LegacyPages for the `/` home view.
 */
const Home = () => {
  usePageTitle('Zivorah | Premium Jewelry');

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
    </div>
  );
};

export default Home;
