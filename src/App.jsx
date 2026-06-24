import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import AuthComingSoon from './Pages/AuthComingSoon.jsx';
import Profile from './Pages/Profile.jsx';
import ProductDetails from './Pages/ProductDetails.jsx';
import OrderSuccess from './Pages/OrderSuccess.jsx';
import OrderDetails from './Pages/OrderDetails.jsx';
import Orders from './Pages/Orders.jsx';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/verify-email"
              element={
                <AuthComingSoon
                  title="Email Verification"
                  message="Email verification is coming soon. Please sign in with your registered account or contact support@zivora.com for assistance."
                />
              }
            />
            <Route
              path="/resend-verification"
              element={
                <AuthComingSoon
                  title="Resend Verification"
                  message="Verification resend is coming soon. Please contact support@zivora.com if you need help accessing your account."
                />
              }
            />
            <Route
              path="/forget-password"
              element={
                <AuthComingSoon
                  title="Forgot Password"
                  message="Password reset is coming soon. Please contact support@zivora.com and our team will assist you."
                />
              }
            />
            <Route
              path="/forget-password/email"
              element={
                <AuthComingSoon
                  title="Forgot Password"
                  message="Password reset is coming soon. Please contact support@zivora.com and our team will assist you."
                />
              }
            />
            <Route
              path="/create-new-password"
              element={
                <AuthComingSoon
                  title="Create New Password"
                  message="Password reset is coming soon. Please contact support@zivora.com and our team will assist you."
                />
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
