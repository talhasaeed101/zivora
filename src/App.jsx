import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteBanner from './components/QuoteBanner';
import TrendingProducts from './components/TrendingProducts';
import FeaturedCategory from './components/FeaturedCategory';
import MakeItCustom from './components/MakeItCustom';
import PremiumBundles from './components/PremiumBundles';
import NewsletterOffer from './components/NewsletterOffer';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import BrandQuote from './components/BrandQuote';

function App() {
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
        {/* <Testimonials /> */}
      </main>
      <Footer />
    </>
  );
}

export default App;
