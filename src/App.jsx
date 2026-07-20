import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import ForgetPassword from './Pages/ForgetPassword.jsx';
import ResetPassword from './Pages/ResetPassword.jsx';
import VerifyEmail from './Pages/VerifyEmail.jsx';
import Profile from './Pages/Profile.jsx';
import ProductDetails from './Pages/ProductDetails.jsx';
import OrderSuccess from './Pages/OrderSuccess.jsx';
import OrderDetails from './Pages/OrderDetails.jsx';
import Orders from './Pages/Orders.jsx';
import Notifications from './Pages/Notifications.jsx';
import Tickets from './Pages/Tickets.jsx';
import TicketDetail from './Pages/TicketDetail.jsx';
import Wishlist from './Pages/Wishlist.jsx';
import PrivacyPolicy from './Pages/PrivacyPolicy.jsx';
import TermsOfUse from './Pages/TermsOfUse.jsx';
import Collection from './Pages/Collection.jsx';
import CategoryPage from './Pages/CategoryPage.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/Contact.jsx';
import CartPage from './Pages/CartPage.jsx';
import SearchResults from './search-results.jsx';
import LegacyPages from './LegacyPages.jsx';
import AnalyticsTracker from './components/AnalyticsTracker.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <WishlistProvider>
              <AnalyticsTracker />
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
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="*" element={<LegacyPages />} />
          </Routes>
          </WishlistProvider>
        </CartProvider>
        </SocketProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
