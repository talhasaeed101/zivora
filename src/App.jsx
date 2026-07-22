import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AnalyticsTracker from './components/AnalyticsTracker.jsx';
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
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy.jsx'));
const TermsOfUse = lazy(() => import('./Pages/TermsOfUse.jsx'));
const Collection = lazy(() => import('./Pages/Collection.jsx'));
const CategoryPage = lazy(() => import('./Pages/CategoryPage.jsx'));
const About = lazy(() => import('./Pages/About.jsx'));
const Contact = lazy(() => import('./Pages/Contact.jsx'));

function RouteFallback() {
  return (
    <div className="route-fallback" aria-busy="true" aria-live="polite">
      <p>Loading…</p>
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
          <CartProvider>
            <WishlistProvider>
              <AnalyticsTracker />
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
            </Route>
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
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
          </WishlistProvider>
        </CartProvider>
        </SocketProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
