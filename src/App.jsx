import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CampaignProvider } from './context/CampaignContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AnalyticsTracker from './components/AnalyticsTracker.jsx';
import CompareBar from './components/CompareBar.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import ForgetPassword from './Pages/ForgetPassword.jsx';
import ResetPassword from './Pages/ResetPassword.jsx';
import VerifyEmail from './Pages/VerifyEmail.jsx';
import LegacyPages from './LegacyPages.jsx';
import NotFound from './Pages/NotFound.jsx';
import ProductDetails from './Pages/ProductDetails.jsx';
import CartPage from './Pages/CartPage.jsx';
import SearchResults from './search-results.jsx';

const Profile = lazy(() => import('./Pages/Profile.jsx'));
const OrderSuccess = lazy(() => import('./Pages/OrderSuccess.jsx'));
const OrderDetails = lazy(() => import('./Pages/OrderDetails.jsx'));
const Orders = lazy(() => import('./Pages/Orders.jsx'));
const Notifications = lazy(() => import('./Pages/Notifications.jsx'));
const Tickets = lazy(() => import('./Pages/Tickets.jsx'));
const TicketDetail = lazy(() => import('./Pages/TicketDetail.jsx'));
const Wishlist = lazy(() => import('./Pages/Wishlist.jsx'));
const DashboardLoyalty = lazy(() => import('./Pages/account/sections/DashboardLoyalty.jsx'));
const PriceAlerts = lazy(() => import('./Pages/account/PriceAlerts.jsx'));
const SaveForLater = lazy(() => import('./Pages/account/SaveForLater.jsx'));
const PriceAlertUnsubscribe = lazy(() => import('./Pages/PriceAlertUnsubscribe.jsx'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy.jsx'));
const TermsOfUse = lazy(() => import('./Pages/TermsOfUse.jsx'));
const Collection = lazy(() => import('./Pages/Collection.jsx'));
const CategoryPage = lazy(() => import('./Pages/CategoryPage.jsx'));
const CampaignPage = lazy(() => import('./Pages/CampaignPage.jsx'));
const About = lazy(() => import('./Pages/About.jsx'));
const Contact = lazy(() => import('./Pages/Contact.jsx'));
const Compare = lazy(() => import('./Pages/Compare.jsx'));

function RouteFallback() {
  return (
    <div className="route-fallback" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="route-fallback-shell">
        <div className="route-fallback-bar" />
        <div className="route-fallback-grid">
          <div className="route-fallback-card" />
          <div className="route-fallback-card" />
          <div className="route-fallback-card" />
        </div>
      </div>
    </div>
  );
}

function SearchResultsRoute() {
  const { search } = useLocation();
  return <SearchResults key={search || 'search'} />;
}

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <SocketProvider>
          <CampaignProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
              <ToastProvider>
              <AnalyticsTracker />
              <CompareBar />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route
              path="/resend-verification"
              element={<Navigate to="/verify-email" replace />}
            />
            <Route
              path="/forget-password/email"
              element={<ForgetPassword />}
            />
            <Route
              path="/create-new-password"
              element={<Navigate to="/forget-password" replace />}
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support/tickets" element={<Tickets />} />
              <Route path="/support/tickets/:id" element={<TicketDetail />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account/loyalty" element={<DashboardLoyalty />} />
              <Route path="/account/price-alerts" element={<PriceAlerts />} />
              <Route path="/account/saved" element={<SaveForLater />} />
            </Route>
            <Route path="/price-alerts/unsubscribe/:token" element={<PriceAlertUnsubscribe />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/campaign/:slug" element={<CampaignPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/search" element={<SearchResultsRoute />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/" element={<LegacyPages />} />
            <Route path="/product" element={<LegacyPages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
              </ToastProvider>
              </CompareProvider>
          </WishlistProvider>
        </CartProvider>
          </CampaignProvider>
        </SocketProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
