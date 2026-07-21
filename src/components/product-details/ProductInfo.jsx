import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import BuyNowCheckoutModal from './BuyNowCheckoutModal.jsx';
import CustomizationModal from './CustomizationModal.jsx';
import { formatPrice, hasSale, getCategoryName } from '../../utils/products.js';
import { getFilledStars } from '../../utils/reviews.js';
import { productNeedsRingSize } from '../../utils/categories.js';
import { trackAddToCart } from '../../utils/analytics.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const DEFAULT_RING_SIZES = ['4', '5', '6', '7', '8'];

const METAL_COLOR_MAP = {
  silver: { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  gold: { id: 'gold', label: 'Gold', color: '#c8815f' },
  'rose-gold': { id: 'rose-gold', label: 'Rose Gold', color: '#e8b4a8' },
};

const resolveMetalColors = (metalColors = []) => {
  if (!metalColors.length) {
    return Object.values(METAL_COLOR_MAP);
  }

  return metalColors.map((color) => {
    const normalized = String(color).toLowerCase();
    return (
      METAL_COLOR_MAP[normalized] || {
        id: normalized,
        label: color,
        color: '#c8815f',
      }
    );
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
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeError, setSizeError] = useState('');

  const isCustomizable = Boolean(product?.isCustomizable);
  const categoryName = getCategoryName(product?.category);
  const showSale = hasSale(product);

  useEffect(() => {
    if (showRingSize && ringSizes.length > 0) {
      setSize(ringSizes[0]);
    }
  }, [showRingSize, ringSizes.join(',')]);

  useEffect(() => {
    setQuantity(1);
    setCartMessage(null);
    setSizeError('');
  }, [product?._id]);

  const maxQuantity = product?.stock > 0 ? product.stock : 99;
  const inStock = product?.stock === undefined || product.stock > 0;
  const hasRealReviews =
    reviewSummary &&
    typeof reviewSummary.reviewCount === 'number' &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating != null;
  const averageRating = hasRealReviews ? reviewSummary.averageRating : null;
  const reviewCount = hasRealReviews ? reviewSummary.reviewCount : 0;
  const filledStars = hasRealReviews ? getFilledStars(averageRating) : 0;

  const handleColorSelect = (colorId) => {
    setColor(colorId);
    onColorChange?.(colorId);
  };

  const requireSize = () => {
    if (showRingSize && !size) {
      setSizeError('Please select a ring size.');
      return false;
    }
    setSizeError('');
    return true;
  };

  const handleAddToCart = async () => {
    setCartMessage(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!inStock) {
      setCartMessage({ type: 'error', text: 'This piece is currently out of stock.' });
      return;
    }

    if (!requireSize()) {
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
      trackAddToCart(product._id);
    } catch (error) {
      setCartMessage({ type: 'error', text: error.message || 'Failed to add item to cart.' });
    } finally {
      setAdding(false);
    }
  };

  const handleCustomizeNow = () => {
    setCartMessage(null);

    if (!inStock) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!requireSize()) {
      return;
    }

    if (!product?._id) {
      setCartMessage({ type: 'error', text: 'This product cannot be customized yet.' });
      return;
    }

    setCustomizeOpen(true);
  };

  const handleCustomizedAddToCart = async (payload) => {
    await addToCart(payload);
    setCartMessage({ type: 'success', text: 'Customized item added to cart successfully.' });
    trackAddToCart(product._id);
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

    if (!requireSize()) {
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
      {categoryName ? <p className="pd-info-category">{categoryName}</p> : null}

      <h1 className="pd-info-title">{product?.title || 'Product'}</h1>

      {(product?.shortDescription || product?.sku) && (
        <div className="pd-info-meta">
          {product?.shortDescription ? (
            <p className="pd-info-subtitle">{product.shortDescription}</p>
          ) : null}
          {product?.sku ? <p className="pd-info-sku">SKU: {product.sku}</p> : null}
        </div>
      )}

      {hasRealReviews && (
        <div className="pd-info-rating" aria-label={`${averageRating.toFixed(1)} out of 5 from ${reviewCount} reviews`}>
          <div className="pd-info-stars" aria-hidden="true">
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
            ({reviewCount.toLocaleString()} review{reviewCount === 1 ? '' : 's'})
          </span>
        </div>
      )}

      <div className="pd-info-price-row">
        <p className="pd-info-price">
          {formatPrice(product?.price ?? 0)}
          {product?.oldPrice ? (
            <span className="pd-info-price-old">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </p>
        {showSale ? <span className="pd-info-sale-badge">Sale</span> : null}
      </div>

      {product?.stock !== undefined && (
        <p className={`pd-info-stock${inStock ? '' : ' is-oos'}`}>
          {inStock ? 'In stock' : 'Out of stock'}
          {inStock && product.stock <= 5 ? ` · ${product.stock} left` : ''}
        </p>
      )}

      <hr className="pd-info-divider" />

      {showRingSize && ringSizes.length > 0 && (
        <div className="pd-info-field">
          <span className="pd-info-label" id="ring-size-label">
            Ring Size
          </span>
          <div className="pd-info-option-row" role="group" aria-labelledby="ring-size-label">
            {ringSizes.map((ringSize) => (
              <button
                key={ringSize}
                type="button"
                className={`pd-info-option-btn${size === ringSize ? ' is-selected' : ''}`}
                onClick={() => {
                  setSize(ringSize);
                  setSizeError('');
                }}
                aria-pressed={size === ringSize}
              >
                {ringSize}
              </button>
            ))}
          </div>
          {sizeError ? (
            <p className="pd-info-field-error" role="alert">
              {sizeError}
            </p>
          ) : null}
        </div>
      )}

      {metalColors.length > 0 && (
        <div className="pd-info-field">
          <span className="pd-info-label" id="metal-color-label">
            Metal Color
          </span>
          <div className="pd-info-swatches" role="group" aria-labelledby="metal-color-label">
            {metalColors.map((metal) => (
              <button
                key={metal.id}
                type="button"
                className={`pd-info-swatch${color === metal.id ? ' pd-info-swatch-active' : ''}`}
                style={{ '--swatch-color': metal.color }}
                onClick={() => handleColorSelect(metal.id)}
                aria-label={metal.label}
                aria-pressed={color === metal.id}
                title={metal.label}
              />
            ))}
          </div>
          <span className="pd-info-swatch-label">
            {metalColors.find((metal) => metal.id === color)?.label}
          </span>
        </div>
      )}

      {product?.sizeChart?.enabled && product?.sizeChart?.imageUrl && (
        <div className="pd-info-field">
          <span className="pd-info-label">Size Chart</span>
          <button type="button" className="pd-size-chart-link" onClick={() => setSizeChartOpen(true)}>
            View Size Chart
          </button>
        </div>
      )}

      {sizeChartOpen && product?.sizeChart?.imageUrl && (
        <div
          className="pd-size-chart-overlay"
          onClick={() => setSizeChartOpen(false)}
          role="presentation"
        >
          <div
            className="pd-size-chart-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Size chart"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pd-size-chart-close"
              onClick={() => setSizeChartOpen(false)}
              aria-label="Close size chart"
            >
              ×
            </button>
            <img src={product.sizeChart.imageUrl} alt="Product size chart" />
          </div>
        </div>
      )}

      {!isCustomizable && (
        <div className="pd-info-field">
          <span className="pd-info-label" id="quantity-label">
            Quantity
          </span>
          <div className="pd-info-quantity" role="group" aria-labelledby="quantity-label">
            <button
              type="button"
              className="pd-info-qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="pd-info-qty-value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="pd-info-qty-btn"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              aria-label="Increase quantity"
              disabled={!inStock || quantity >= maxQuantity}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="pd-cart-live" aria-live="polite">
        {cartMessage && (
          <p className={`pd-cart-message pd-cart-message-${cartMessage.type}`}>{cartMessage.text}</p>
        )}
      </div>

      <div className="pd-info-actions">
        {isCustomizable ? (
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={handleCustomizeNow}
            disabled={!inStock}
          >
            Customize Now
          </button>
        ) : (
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={handleAddToCart}
            disabled={!inStock || adding}
          >
            {adding ? 'Adding…' : 'Add To Cart'}
          </button>
        )}

        {!isCustomizable && (
          <button
            type="button"
            className="pd-btn pd-btn-secondary"
            onClick={handleBuyNow}
            disabled={!inStock}
          >
            Buy Now
          </button>
        )}

        <WishlistButton
          productId={product?._id}
          className="pd-btn pd-btn-wishlist"
          activeClassName="pd-btn-wishlist-active"
          showLabel
          stopPropagation={false}
        />
      </div>

      <ul className="pd-trust-list">
        <li>Secure checkout</li>
        <li>Carefully packaged</li>
        <li>Nationwide delivery</li>
        <li>Customer support</li>
      </ul>

      <BuyNowCheckoutModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        product={product}
        quantity={quantity}
        ringSize={showRingSize ? size : undefined}
        metalColor={color}
      />

      <CustomizationModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        product={product}
        ringSize={showRingSize ? size : undefined}
        onAddToCart={handleCustomizedAddToCart}
      />
    </div>
  );
}
