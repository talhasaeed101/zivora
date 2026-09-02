import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import BuyNowCheckoutModal from './BuyNowCheckoutModal.jsx';
import CustomizationModal from './CustomizationModal.jsx';
import { formatPrice, hasSale, getCategoryName } from '../../utils/products.js';
import { getFilledStars } from '../../utils/reviews.js';
import { trackAddToCart } from '../../utils/analytics.js';
import { firstAvailableSelection, getCellQuantity, getProductInventory, optionHasAnyStock, syncSelection } from '../../utils/inventory.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const METAL_COLOR_MAP = {
  silver: { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  gold: { id: 'gold', label: 'Gold', color: '#c8815f' },
  'rose-gold': { id: 'rose-gold', label: 'Rose Gold', color: '#e8b4a8' },
};

const resolveMetalColors = (metalColors = []) =>
  (metalColors || []).map((color) => {
    const value = String(color).trim();
    const normalized = value.toLowerCase();
    const mapped = METAL_COLOR_MAP[normalized];

    return {
      id: mapped?.id || normalized,
      value,
      label: mapped?.label || value,
      color: mapped?.color || '#c8815f',
    };
  });

export default function ProductInfo({ product, reviewSummary, onColorChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const inventory = getProductInventory(product);
  const ringSizes = useMemo(
    () => (Array.isArray(product?.ringSizes) ? product.ringSizes.filter(Boolean) : []),
    [product?.ringSizes]
  );
  const metalColors = useMemo(
    () => resolveMetalColors(product?.metalColors),
    [product?.metalColors]
  );
  const metalColorValues = useMemo(
    () => metalColors.map((metal) => metal.value),
    [metalColors]
  );

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeError, setSizeError] = useState('');
  const [colorError, setColorError] = useState('');

  const isCustomizable = Boolean(product?.isCustomizable);
  const categoryName = getCategoryName(product?.category);
  const showSale = hasSale(product);
  const showRingSize = ringSizes.length > 0;
  const showMetalColors = metalColors.length > 0;

  const selectedRingSize = showRingSize ? size : '';
  const selectedMetalColor = showMetalColors ? color : '';
  const cellQuantity = getCellQuantity(inventory, selectedRingSize, selectedMetalColor);
  const inStock = cellQuantity > 0;
  const maxQuantity = inStock ? cellQuantity : 1;

  const hasRealReviews =
    reviewSummary &&
    typeof reviewSummary.reviewCount === 'number' &&
    reviewSummary.reviewCount > 0 &&
    reviewSummary.averageRating != null;
  const averageRating = hasRealReviews ? reviewSummary.averageRating : null;
  const reviewCount = hasRealReviews ? reviewSummary.reviewCount : 0;
  const filledStars = hasRealReviews ? getFilledStars(averageRating) : 0;

  const applySelection = (nextSize, nextColor) => {
    const synced = syncSelection({
      ringSize: nextSize,
      metalColor: nextColor,
      ringSizes,
      metalColors: metalColorValues,
      inventory,
      prefer: nextSize !== size ? 'size' : 'color',
    });

    setSize(showRingSize ? synced.ringSize : '');
    setColor(showMetalColors ? synced.metalColor : '');
    onColorChange?.(showMetalColors ? synced.metalColor : undefined);
    setSizeError('');
    setColorError('');
  };

  useEffect(() => {
    const next = firstAvailableSelection(ringSizes, metalColorValues, inventory);
    setSize(showRingSize ? next.ringSize : '');
    setColor(showMetalColors ? next.metalColor : '');
    onColorChange?.(showMetalColors ? next.metalColor : undefined);
    setQuantity(1);
    setCartMessage(null);
    setSizeError('');
    setColorError('');
  }, [product?._id]);

  useEffect(() => {
    if (!inStock) {
      setQuantity(1);
      return;
    }

    setQuantity((current) => Math.min(Math.max(1, current), cellQuantity));
  }, [cellQuantity, inStock, selectedRingSize, selectedMetalColor]);

  const handleColorSelect = (colorValue) => {
    if (
      !optionHasAnyStock(inventory, {
        metalColor: colorValue,
        ringSizes,
        metalColors: metalColorValues,
      })
    ) {
      return;
    }

    applySelection(selectedRingSize, colorValue);
  };

  const handleSizeSelect = (ringSize) => {
    if (
      !optionHasAnyStock(inventory, {
        ringSize,
        ringSizes,
        metalColors: metalColorValues,
      })
    ) {
      return;
    }

    applySelection(ringSize, selectedMetalColor);
  };

  const validateSelection = () => {
    if (showRingSize && !size) {
      setSizeError('Please select a ring size.');
      return false;
    }

    if (showMetalColors && !color) {
      setColorError('Please select a metal color.');
      return false;
    }

    if (!inStock) {
      setCartMessage({ type: 'error', text: 'This combination is currently out of stock.' });
      return false;
    }

    if (quantity > cellQuantity) {
      setCartMessage({
        type: 'error',
        text: `Only ${cellQuantity} available for this size and color.`,
      });
      return false;
    }

    setSizeError('');
    setColorError('');
    return true;
  };

  const handleAddToCart = async () => {
    setCartMessage(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!validateSelection()) {
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
        metalColor: showMetalColors ? color : undefined,
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

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!validateSelection()) {
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

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!validateSelection()) {
      return;
    }

    if (!product?._id) {
      setCartMessage({ type: 'error', text: 'This product cannot be purchased yet.' });
      return;
    }

    setBuyNowOpen(true);
  };

  const stockLabel = !inStock
    ? 'Out of stock'
    : cellQuantity <= 5
      ? `In stock · Only ${cellQuantity} left`
      : 'In stock';

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

      <p className={`pd-info-stock${inStock ? '' : ' is-oos'}`}>{stockLabel}</p>

      <hr className="pd-info-divider" />

      {showRingSize ? (
        <div className="pd-info-field">
          <span className="pd-info-label" id="ring-size-label">
            Ring Size
          </span>
          <div className="pd-info-option-row" role="group" aria-labelledby="ring-size-label">
            {ringSizes.map((ringSize) => {
              const hasStock = optionHasAnyStock(inventory, {
                ringSize,
                ringSizes,
                metalColors: metalColorValues,
              });
              const pairingAvailable = getCellQuantity(inventory, ringSize, selectedMetalColor) > 0;
              return (
                <button
                  key={ringSize}
                  type="button"
                  className={`pd-info-option-btn${size === ringSize ? ' is-selected' : ''}${
                    pairingAvailable ? '' : ' is-unavailable'
                  }`}
                  onClick={() => handleSizeSelect(ringSize)}
                  disabled={!hasStock}
                  aria-pressed={size === ringSize}
                  aria-disabled={!hasStock}
                >
                  {ringSize}
                </button>
              );
            })}
          </div>
          {sizeError ? (
            <p className="pd-info-field-error" role="alert">
              {sizeError}
            </p>
          ) : null}
        </div>
      ) : null}

      {showMetalColors ? (
        <div className="pd-info-field">
          <span className="pd-info-label" id="metal-color-label">
            Metal Color
          </span>
          <div className="pd-info-swatches" role="group" aria-labelledby="metal-color-label">
            {metalColors.map((metal) => {
              const hasStock = optionHasAnyStock(inventory, {
                metalColor: metal.value,
                ringSizes,
                metalColors: metalColorValues,
              });
              const pairingAvailable = getCellQuantity(inventory, selectedRingSize, metal.value) > 0;
              return (
                <button
                  key={metal.value}
                  type="button"
                  className={`pd-info-swatch${color === metal.value ? ' pd-info-swatch-active' : ''}${
                    pairingAvailable ? '' : ' is-unavailable'
                  }`}
                  style={{ '--swatch-color': metal.color }}
                  onClick={() => handleColorSelect(metal.value)}
                  disabled={!hasStock}
                  aria-label={metal.label}
                  aria-pressed={color === metal.value}
                  aria-disabled={!hasStock}
                  title={hasStock ? metal.label : `${metal.label} (out of stock)`}
                />
              );
            })}
          </div>
          <span className="pd-info-swatch-label">
            {metalColors.find((metal) => metal.value === color)?.label}
          </span>
          {colorError ? (
            <p className="pd-info-field-error" role="alert">
              {colorError}
            </p>
          ) : null}
        </div>
      ) : null}

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
            <img
              src={product.sizeChart.imageUrl}
              alt={`${product.title || 'Product'} size chart`}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
            />
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
              disabled={quantity <= 1 || !inStock}
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
        {isCustomizable && (
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            style={{ flex: 1, padding: '16px 12px' }}
            onClick={handleCustomizeNow}
            disabled={!inStock}
          >
            Customize now
          </button>
        )}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-btn-add-to-cart"
          style={{ flex: 1, padding: '16px 12px' }}
          onClick={handleAddToCart}
          disabled={!inStock || adding}
        >
          {adding ? 'Adding…' : 'Add to cart'}
        </button>

        <button
          type="button"
          className="pd-btn pd-btn-accent pd-btn-buy-now"
          style={{ flex: 1, padding: '16px 12px' }}
          onClick={handleBuyNow}
          disabled={!inStock}
        >
          Buy it now
        </button>

        <WishlistButton
          productId={product?._id}
          className="pd-btn pd-btn-wishlist-icon"
          activeClassName="pd-btn-wishlist-icon-active"
          showLabel={false}
          stopPropagation={false}
        />
      </div>

      <BuyNowCheckoutModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        product={product}
        quantity={quantity}
        ringSize={showRingSize ? size : undefined}
        metalColor={showMetalColors ? color : undefined}
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
