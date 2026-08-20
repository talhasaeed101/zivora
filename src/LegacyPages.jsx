import { useLocation } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import SearchResults from './search-results';
import ProductDetails from './Pages/ProductDetails.jsx';
import CartPage from './Pages/CartPage.jsx';
import NotFound from './Pages/NotFound.jsx';

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

  return <Home />;
}
