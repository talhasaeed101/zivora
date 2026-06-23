import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteBanner from './components/QuoteBanner';
import TrendingProducts from './components/TrendingProducts';
import FeaturedCategory from './components/FeaturedCategory';
import MakeItCustom from './components/MakeItCustom';
import PremiumBundles from './components/PremiumBundles';
import NewsletterOffer from './components/NewsletterOffer';
import Footer from './components/Footer';
import BrandQuote from './components/BrandQuote';
import SearchResults from './search-results';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';

export default function LegacyPages() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    const resolvePage = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('cart') || window.location.pathname === '/cart') {
        setPage('cart');
      } else if (params.has('product') || window.location.pathname === '/product') {
        setPage('product');
      } else if (params.has('search') || window.location.pathname === '/search') {
        setPage('search');
      } else {
        setPage('home');
      }
    };

    resolvePage();
    window.addEventListener('popstate', resolvePage);
    return () => window.removeEventListener('popstate', resolvePage);
  }, []);

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
      <Navbar />
      <main>
        <Hero />
        <BrandQuote />
        <TrendingProducts />
        <FeaturedCategory />
        <MakeItCustom />
        <PremiumBundles />
        <NewsletterOffer />
        <QuoteBanner />
      </main>
      <Footer />
    </>
  );
}
