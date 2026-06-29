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
import SearchResults from './search-results';
import ProductDetails from './Pages/ProductDetails.jsx';
import CartPage from './Pages/CartPage.jsx';
import { usePageTitle } from './hooks/usePageTitle.js';

export default function LegacyPages() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    const resolvePage = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('cart')) {
        setPage('cart');
      } else if (params.has('product') || window.location.pathname === '/product') {
        setPage('product');
      } else if (params.has('search')) {
        setPage('search');
      } else {
        setPage('home');
      }
    };

    resolvePage();
    window.addEventListener('popstate', resolvePage);
    return () => window.removeEventListener('popstate', resolvePage);
  }, []);

  const pageTitle =
    page === 'home'
      ? 'Zivora | Premium Jewelry'
      : page === 'search'
        ? 'Search | Zivora'
        : page === 'cart'
          ? 'Shopping Cart | Zivora'
          : 'Zivora';

  usePageTitle(pageTitle);

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
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
