import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import BuyNowCheckoutModal from './BuyNowCheckoutModal.jsx';
import { formatPrice } from '../../utils/products.js';
import { getFilledStars } from '../../utils/reviews.js';
import { productNeedsRingSize } from '../../utils/categories.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const DEFAULT_RING_SIZES = ['4', '5', '6', '7', '8'];

const METAL_COLOR_MAP = {
  silver: { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  gold: { id: 'gold', label: 'Gold', color: '#c8815f' },
  'rose-gold': { id: 'rose-gold', label: 'Rose Gold', color: '#e8b4a8' },
};

const DEFAULT_METAL_COLORS = Object.values(METAL_COLOR_MAP);

const resolveMetalColors = (metalColors = []) => {
  if (!metalColors.length) {
    return DEFAULT_METAL_COLORS;
  }

  return metalColors.map((color) => {
    const normalized = String(color).toLowerCase();
    return METAL_COLOR_MAP[normalized] || {
      id: normalized,
      label: color,
      color: '#c8815f',
    };
  });
};

export default function ProductInfo({ product, reviewSummary, onColorChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const showRingSize = productNeedsRingSize(product);
  const ringSizes = useMemo(() => {
    if (!showRingSize) {
      return [];
    }

    return product?.ringSizes?.length ? product.ringSizes : DEFAULT_RING_SIZES;
  }, [product?.ringSizes, showRingSize]);

  const metalColors = resolveMetalColors(product?.metalColors);
  const [size, setSize] = useState(ringSizes[0] || '');
  const [color, setColor] = useState(metalColors[0]?.id || 'gold');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  useEffect(() => {
    if (showRingSize && ringSizes.length > 0) {
      setSize(ringSizes[0]);
    }
  }, [showRingSize, ringSizes.join(',')]);

  const maxQuantity = product?.stock > 0 ? product.stock : 99;
  const inStock = product?.stock === undefined || product.stock > 0;
  const averageRating = reviewSummary?.averageRating ?? product?.averageRating ?? 4;
  const reviewCount = reviewSummary?.reviewCount ?? product?.reviewCount ?? 1015;
  const filledStars = getFilledStars(averageRating);

  const handleColorSelect = (colorId) => {
    setColor(colorId);
    onColorChange?.(colorId);
  };

  const handleAddToCart = async () => {
    setCartMessage(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!product?._id) {
      setCartMessage({ type: 'error', text: 'This product cannot be added to cart yet.' });
      return;
    }

    setAdding(true);

    try {
      await addToCart({
        productId: product._id,
        quantity,
        ringSize: showRingSize ? size : undefined,
        metalColor: color,
      });
      setCartMessage({ type: 'success', text: 'Added to cart successfully.' });
    } catch (error) {
      setCartMessage({ type: 'error', text: error.message || 'Failed to add item to cart.' });
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    setCartMessage(null);

    if (!inStock) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!product?._id) {
      setCartMessage({ type: 'error', text: 'This product cannot be purchased yet.' });
      return;
    }

    setBuyNowOpen(true);
  };

  return (
    <div className="pd-info">
      <h1 className="pd-info-title">{product?.title || 'Minimal Stacked Rings'}</h1>
      <p className="pd-info-subtitle">
        {product?.shortDescription ||
          'Delicately crafted minimal stacked rings designed to blend subtle elegance with modern sophistication. Perfect for effortless everyday luxury.'}
      </p>

      <div className="pd-info-rating">
        <div className="pd-info-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= filledStars}
              className={`w-4 h-4 ${star <= filledStars ? 'pd-star-filled' : 'pd-star-empty'}`}
            />
          ))}
        </div>
        <span className="pd-info-rating-value">{averageRating.toFixed(1)}</span>
        <span className="pd-info-review-count">
          ({reviewCount.toLocaleString()} Review{reviewCount === 1 ? '' : 's'})
        </span>
      </div>

      <p className="pd-info-price">
        {formatPrice(product?.price ?? 999)}
        {product?.oldPrice && (
          <span className="pd-info-price-old">{formatPrice(product.oldPrice)}</span>
        )}
      </p>
      {product?.stock !== undefined && (
        <p className="pd-info-stock">{inStock ? `${product.stock} in stock` : 'Out of stock'}</p>
      )}
      <hr className="pd-info-divider" />

      {showRingSize && ringSizes.length > 0 && (
        <div className="pd-info-field">
          <label htmlFor="ring-size" className="pd-info-label">Ring Size</label>
          <div className="pd-info-select-wrap">
            <select
              id="ring-size"
              className="pd-info-select"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {ringSizes.map((ringSize) => (
                <option key={ringSize} value={ringSize}>{ringSize}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {metalColors.length > 0 && (
        <div className="pd-info-field">
          <span className="pd-info-label">Metal Color</span>
          <div className="pd-info-swatches">
            {metalColors.map((metal) => (
              <button
                key={metal.id}
                type="button"
                className={`pd-info-swatch ${color === metal.id ? 'pd-info-swatch-active' : ''}`}
                style={{ '--swatch-color': metal.color }}
                onClick={() => handleColorSelect(metal.id)}
                aria-label={metal.label}
                title={metal.label}
              />
            ))}
          </div>
          <span className="pd-info-swatch-label">
            {metalColors.find((metal) => metal.id === color)?.label}
          </span>
        </div>
      )}

      <div className="pd-info-field">
        <span className="pd-info-label">Quantity</span>
        <div className="pd-info-quantity">
          <button
            type="button"
            className="pd-info-qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="pd-info-qty-value">{quantity}</span>
          <button
            type="button"
            className="pd-info-qty-btn"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            aria-label="Increase quantity"
            disabled={!inStock}
          >
            +
          </button>
        </div>
      </div>

      {cartMessage && (
        <p className={`pd-cart-message pd-cart-message-${cartMessage.type}`}>
          {cartMessage.text}
        </p>
      )}

      <div className="pd-info-actions">
        <button
          type="button"
          className="pd-btn pd-btn-primary"
          onClick={handleBuyNow}
          disabled={!inStock}
        >
          Buy Now
        </button>
        <button
          type="button"
          className="pd-btn pd-btn-secondary"
          onClick={handleAddToCart}
          disabled={!inStock || adding}
        >
          {adding ? 'Adding...' : 'Add To Cart'}
        </button>
        <WishlistButton
          productId={product?._id}
          className="pd-btn pd-btn-wishlist"
          activeClassName="pd-btn-wishlist-active"
          showLabel
          stopPropagation={false}
        />
      </div>

      <BuyNowCheckoutModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        product={product}
        quantity={quantity}
        ringSize={showRingSize ? size : undefined}
        metalColor={color}
      />
    </div>
  );
}
