import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import RecommendedProducts from '../components/cart/RecommendedProducts';
import DeliveryAddressSection from '../components/cart/DeliveryAddressSection';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import RemoveFromBagModal from '../components/cart/RemoveFromBagModal';
import { ChevronDownIcon } from '../components/icons';
import { ROUTES } from '../utils/navigation';
import './CartPage.css';

const DEFAULT_ADDRESS = {
  name: 'Robert Fox',
  email: 'robert.fox@example.com',
  phone: '(704) 555-0127',
  province: 'Illinois',
  city: 'Santa Ana',
  street: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
  postalCode: '85486',
};

const INITIAL_ITEMS = [
  {
    id: 1,
    image: '/images/stack1.png',
    title: 'Minimal Stacked Rings',
    material: 'Golden',
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
    quantity: 2,
    unitPrice: 999,
  },
  {
    id: 2,
    image: '/images/stack2.png',
    title: 'Minimal Stacked Rings',
    material: 'Golden',
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
    quantity: 1,
    unitPrice: 999,
  },
  {
    id: 3,
    image: '/images/stack3.png',
    title: 'Minimal Stacked Rings',
    material: 'Golden',
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
    quantity: 1,
    unitPrice: 2999,
  },
  {
    id: 4,
    image: '/images/stack4.png',
    title: 'Minimal Stacked Rings',
    material: 'Silver',
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
    quantity: 2,
    unitPrice: 999,
  },
  {
    id: 5,
    image: '/images/stack5.png',
    title: 'Minimal Stacked Rings',
    material: 'Rose Gold',
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
    quantity: 1,
    unitPrice: 3005,
  },
];

const DISCOUNT = 999;

export default function CartPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [sortBy, setSortBy] = useState('latest');
  const [deliveryAddress, setDeliveryAddress] = useState(DEFAULT_ADDRESS);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - DISCOUNT);

  const sortedItems = useMemo(() => {
    const list = [...items];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.unitPrice - b.unitPrice);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.unitPrice - a.unitPrice);
    }
    return list;
  }, [items, sortBy]);

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveRequest = (item) => {
    setItemToRemove(item);
  };

  const handleRemoveConfirm = () => {
    if (!itemToRemove) return;
    setItems((prev) => prev.filter((item) => item.id !== itemToRemove.id));
    setItemToRemove(null);
  };

  const handleMoveToWishlist = () => {
    if (!itemToRemove) return;
    setItems((prev) => prev.filter((item) => item.id !== itemToRemove.id));
    setItemToRemove(null);
  };

  const handleSaveAddress = (updated) => {
    setDeliveryAddress(updated);
  };

  const handleClearCart = () => {
    setItems([]);
  };

  return (
    <div className="cart-page">
      <Navbar activeLink="HOME" homeHref="/?home=true" />

      <main className="cart-main">
        <div className="cart-container">
          <div className="cart-header">
            <div className="cart-title-row">
              <h1 className="cart-title">Shopping Cart</h1>
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount}</span>
              )}
            </div>
            <div className="cart-sort-wrap">
              <label htmlFor="cart-sort" className="cart-sort-label">Sort by:</label>
              <div className="cart-sort-select-wrap">
                <select
                  id="cart-sort"
                  className="cart-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Latest added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDownIcon className="cart-sort-chevron w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="cart-body">
            <div className="cart-items-section">
              {items.length > 0 && (
                <DeliveryAddressSection
                  address={deliveryAddress}
                  onChangeClick={() => setAddressModalOpen(true)}
                />
              )}

              {items.length > 0 && (
                <div className="cart-table-header">
                  <span className="cart-col-product">PRODUCT</span>
                  <span className="cart-col-count">COUNT</span>
                  <span className="cart-col-price">PRICE</span>
                  <button type="button" className="cart-clear-btn" onClick={handleClearCart}>
                    ✕ CLEAR CART
                  </button>
                </div>
              )}

              {items.length === 0 ? (
                <div className="cart-empty">
                  <p>Your cart is empty.</p>
                  <a href={ROUTES.search} className="cart-empty-link">Continue shopping</a>
                </div>
              ) : (
                <div className="cart-items-list">
                  {sortedItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveRequest}
                    />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <OrderSummary
                itemCount={itemCount}
                subtotal={subtotal}
                discount={DISCOUNT}
                total={total}
              />
            )}
          </div>
        </div>

        <RecommendedProducts />
      </main>

      <Footer />

      <DeliveryAddressModal
        isOpen={addressModalOpen}
        address={deliveryAddress}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
      />

      {itemToRemove && (
        <RemoveFromBagModal
          item={itemToRemove}
          onClose={() => setItemToRemove(null)}
          onRemove={handleRemoveConfirm}
          onMoveToWishlist={handleMoveToWishlist}
        />
      )}
    </div>
  );
}
