import { useLocation } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import TrendingProducts from './components/TrendingProducts';
import FeaturedCategory from './components/FeaturedCategory';
import MakeItCustom from './components/MakeItCustom';
import PremiumBundles from './components/PremiumBundles';
import NewsletterOffer from './components/NewsletterOffer';
import Footer from './components/Footer';
import BrandQuote from './components/BrandQuote';
import LaunchTimer from './components/LaunchTimer';
import './components/landing/landing-tokens.css';
import './components/landing/landing-interactions.css';
import SearchResults from './search-results';
import ProductDetails from './Pages/ProductDetails.jsx';
import CartPage from './Pages/CartPage.jsx';
import NotFound from './Pages/NotFound.jsx';
import { usePageTitle } from './hooks/usePageTitle.js';

function resolveLegacyPage(pathname, search) {
  const params = new URLSearchParams(search);
  if (params.has('cart')) {
    return 'cart';
  }
  if (params.has('product') || pathname === '/product') {
    return 'product';
  }
  if (params.has('search')) {
    return 'search';
  }
  return 'home';
}

/**
 * Handles `/` (home + legacy query routes). Unknown paths render NotFound via App.
 */
export default function LegacyPages() {
  const location = useLocation();
  const page = resolveLegacyPage(location.pathname, location.search);
  const [isTimerEnded, setIsTimerEnded] = useState(false);

  // From incoming branch (kept for popstate handling if needed, though useLocation handles most)
  const [legacyPage, setLegacyPage] = useState('home');
  useEffect(() => {
    const resolvePage = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('cart')) {
        setLegacyPage('cart');
      } else if (params.has('product') || window.location.pathname === '/product') {
        setLegacyPage('product');
      } else if (params.has('search')) {
        setLegacyPage('search');
      } else {
        setLegacyPage('home');
      }
    };

    resolvePage();
    window.addEventListener('popstate', resolvePage);
    return () => window.removeEventListener('popstate', resolvePage);
  }, []);

  const pageTitle =
    page === 'home'
      ? 'Zivorah | Premium Jewelry'
      : page === 'search'
        ? 'Search | Zivorah'
        : page === 'cart'
          ? 'Shopping Cart | Zivorah'
          : 'Zivorah';

  usePageTitle(pageTitle);

  if (location.pathname !== '/' && location.pathname !== '/product') {
    return <NotFound />;
  }

  if (page === 'cart') {
    return <CartPage />;
  }

  if (page === 'product') {
    return <ProductDetails />;
  }

  if (page === 'search') {
    return <SearchResults />;
  }

  return (
    <>
      <Home />
      <div className="landing-page">
        <Navbar homeHref="/?home=true" />
        <main>
          <Hero />
          <LaunchTimer onTimerEnd={() => setIsTimerEnded(true)} />
          {isTimerEnded && (
            <>
              <TrendingProducts />
              <FeaturedCategory />
              <MakeItCustom />
              <PremiumBundles />
              <NewsletterOffer />
              <Testimonials />
            </>
          )}
        </main>
        {isTimerEnded && <Footer />}
      </div>
    </>
  );
}
