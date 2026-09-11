import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import CompareButton from '../CompareButton.jsx';
import BuyNowCheckoutModal from './BuyNowCheckoutModal.jsx';
import CustomizationModal from './CustomizationModal.jsx';
import NotifyMeModal from './NotifyMeModal.jsx';
import '../CompareButton.css';
import { formatPrice, hasSale, getCategoryName } from '../../utils/products.js';
import { getFilledStars } from '../../utils/reviews.js';
import { trackAddToCart, trackPersonalizationStart } from '../../utils/analytics.js';
import {
  findInventoryCell,
  firstAvailableSelection,
  findUniqueVariantId,
  getCellQuantity,
  getProductInventory,
  inventoryCellKey,
  optionHasAnyStock,
  syncSelection,
} from '../../utils/inventory.js';
import { backInStockApi, priceAlertApi, socialProofApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useCampaigns } from '../../context/CampaignContext.jsx';
import { toast } from '../../context/ToastContext.jsx';
import { pickEligibleCampaign } from '../../utils/campaignEligibility.js';
import { PDP_TRUST_ITEMS } from '../../constants/storefrontCopy.js';
import {
  CampaignSaleBadge,
  useCampaignCountdown,
} from '../campaign/campaignUi.jsx';

const METAL_COLOR_MAP = {
  silver: { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  gold: { id: 'gold', label: 'Gold', color: '#c8815f' },
};

const resolveMetalColors = (metalColors = []) =>
  (metalColors || [])
    .map((color) => {
      const value = String(color).trim();
      const normalized = value.toLowerCase();
      const mapped = METAL_COLOR_MAP[normalized];
      if (!mapped) {
        return null;
      }

      return {
        id: mapped.id,
        // Canonical labels so cart/inventory keys stay Gold/Silver
        value: mapped.label,
        label: mapped.label,
        color: mapped.color,
      };
    })
    .filter(Boolean)
    .filter((metal, index, arr) => arr.findIndex((item) => item.value === metal.value) === index);

export default function ProductInfo({ product, reviewSummary, onColorChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, customer } = useAuth();
  const { addToCart } = useCart();
  const { active: activeCampaigns, refresh: refreshCampaigns } = useCampaigns();

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
  const [subscribedCells, setSubscribedCells] = useState(() => new Set());
  const [notifying, setNotifying] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [priceAlertCells, setPriceAlertCells] = useState(() => new Set());
  const [priceAlerting, setPriceAlerting] = useState(false);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [purchaseActivity, setPurchaseActivity] = useState(null);
  const [wishlistActivity, setWishlistActivity] = useState(null);

  const isCustomizable = Boolean(product?.isCustomizable);
  const categoryName = getCategoryName(product?.category);
  const showSale = hasSale(product);
  const showRingSize = ringSizes.length > 0;
  const showMetalColors = metalColors.length > 0;

  const selectedRingSize = showRingSize ? size : '';
  const selectedMetalColor = showMetalColors ? color : '';
  const selectedCell = findInventoryCell(inventory, selectedRingSize, selectedMetalColor);
  const cellQuantity = getCellQuantity(inventory, selectedRingSize, selectedMetalColor);
  const inStock = cellQuantity > 0;
  const maxQuantity = inStock ? cellQuantity : 1;
  const selectionComplete = (!showRingSize || Boolean(size)) && (!showMetalColors || Boolean(color));
  const selectionKey = inventoryCellKey(selectedRingSize, selectedMetalColor);
  const isNotifySubscribed = subscribedCells.has(selectionKey);
  const isPriceAlertSubscribed = priceAlertCells.has(selectionKey);
  const showNotifyMe =
    Boolean(product?._id) &&
    selectionComplete &&
    selectedCell != null &&
    Number(selectedCell.quantity) === 0;
  const showPriceAlert =
    Boolean(product?._id) &&
    selectionComplete &&
    inStock;

  const selectedVariantId = findUniqueVariantId(product, {
    ringSize: selectedRingSize,
    metalColor: selectedMetalColor,
  });

  const campaignForSelection = pickEligibleCampaign(activeCampaigns, product, {
    variantId: selectedVariantId,
  });
  const campaignPdpText =
    campaignForSelection?.merchandising?.showPdpMessage &&
    campaignForSelection?.merchandising?.pdpText
      ? campaignForSelection.merchandising.pdpText
      : null;
  const campaignBadge =
    campaignForSelection?.merchandising?.showBadge &&
    campaignForSelection?.merchandising?.badgeText
      ? campaignForSelection.merchandising.badgeText
      : null;
  const onCampaignExpire = useCallback(() => {
    refreshCampaigns?.();
  }, [refreshCampaigns]);
  const campaignCountdown = useCampaignCountdown(
    campaignForSelection?.endAt,
    Boolean(campaignForSelection?.merchandising?.showCountdown && campaignForSelection?.endAt),
    onCampaignExpire
  );

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
    setSubscribedCells(new Set());
    setNotifyModalOpen(false);
    setNotifying(false);
    setPriceAlertCells(new Set());
    setPriceAlertModalOpen(false);
    setPriceAlerting(false);
  }, [product?._id]);

  useEffect(() => {
    if (!inStock) {
      setQuantity(1);
      return;
    }

    setQuantity((current) => Math.min(Math.max(1, current), cellQuantity));
  }, [cellQuantity, inStock, selectedRingSize, selectedMetalColor]);

  useEffect(() => {
    const slug = String(product?.slug || '').trim();
    if (!slug) {
      setPurchaseActivity(null);
      setWishlistActivity(null);
      return undefined;
    }

    let cancelled = false;
    setPurchaseActivity(null);
    setWishlistActivity(null);

    socialProofApi
      .getProduct(slug)
      .then((response) => {
        if (cancelled) {
          return;
        }
        const data = response?.data || {};
        const activity = data.purchaseActivity;
        if (activity && Number(activity.count) > 0 && activity.message) {
          setPurchaseActivity(activity);
        } else {
          setPurchaseActivity(null);
        }

        const wishlist = data.wishlistActivity;
        if (wishlist && Number(wishlist.count) > 0 && wishlist.message) {
          setWishlistActivity(wishlist);
        } else {
          setWishlistActivity(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPurchaseActivity(null);
          setWishlistActivity(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product?.slug]);

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
      const variantId = findUniqueVariantId(product, {
        ringSize: showRingSize ? size : '',
        metalColor: showMetalColors ? color : '',
      });

      await addToCart({
        productId: product._id,
        quantity,
        ringSize: showRingSize ? size : undefined,
        metalColor: showMetalColors ? color : undefined,
        ...(variantId ? { variantId } : {}),
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
    trackPersonalizationStart({
      productId: product._id,
      productSlug: product.slug,
    });
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

  const markCellSubscribed = useCallback((ringSize, metalColor) => {
    const key = inventoryCellKey(ringSize, metalColor);
    setSubscribedCells((prev) => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const submitBackInStock = useCallback(
    async (email) => {
      if (!product?._id || notifying) {
        return;
      }

      const ringSize = showRingSize ? size : '';
      const metalColor = showMetalColors ? color : '';

      setNotifying(true);

      try {
        await backInStockApi.subscribe({
          productId: product._id,
          ringSize,
          metalColor,
          email,
        });

        markCellSubscribed(ringSize, metalColor);
        setNotifyModalOpen(false);
        toast.success("You'll be notified when this item is back in stock.");
      } catch (error) {
        if (error?.status === 409) {
          markCellSubscribed(ringSize, metalColor);
          setNotifyModalOpen(false);
          toast.info('You already requested a notification.');
          return;
        }

        toast.error(error?.message || 'Unable to save your notification request. Please try again.');
      } finally {
        setNotifying(false);
      }
    },
    [product?._id, notifying, showRingSize, size, showMetalColors, color, markCellSubscribed]
  );

  const handleNotifyMeClick = () => {
    if (!showNotifyMe || isNotifySubscribed || notifying) {
      return;
    }

    if (isAuthenticated) {
      const email = String(customer?.email || '')
        .trim()
        .toLowerCase();

      if (!email) {
        toast.error('Unable to find your account email. Please update your profile and try again.');
        return;
      }

      submitBackInStock(email);
      return;
    }

    setNotifyModalOpen(true);
  };

  const markPriceAlertSubscribed = useCallback((ringSize, metalColor) => {
    const key = inventoryCellKey(ringSize, metalColor);
    setPriceAlertCells((prev) => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const submitPriceAlert = useCallback(
    async (email) => {
      if (!product?._id || priceAlerting) {
        return;
      }

      const ringSize = showRingSize ? size : '';
      const metalColor = showMetalColors ? color : '';

      setPriceAlerting(true);

      try {
        await priceAlertApi.subscribe({
          productId: product._id,
          ringSize,
          metalColor,
          variantId: selectedVariantId || undefined,
          email,
        });

        markPriceAlertSubscribed(ringSize, metalColor);
        setPriceAlertModalOpen(false);
        toast.success("You'll be notified if the price drops.");
      } catch (error) {
        if (error?.status === 409) {
          markPriceAlertSubscribed(ringSize, metalColor);
          setPriceAlertModalOpen(false);
          toast.info('You already have a price alert for this item.');
          return;
        }

        toast.error(error?.message || 'Unable to save your price alert. Please try again.');
      } finally {
        setPriceAlerting(false);
      }
    },
    [
      product?._id,
      priceAlerting,
      showRingSize,
      size,
      showMetalColors,
      color,
      selectedVariantId,
      markPriceAlertSubscribed,
    ]
  );

  const handlePriceAlertClick = () => {
    if (!showPriceAlert || isPriceAlertSubscribed || priceAlerting) {
      return;
    }

    if (isAuthenticated) {
      const email = String(customer?.email || '')
        .trim()
        .toLowerCase();

      if (!email) {
        toast.error('Unable to find your account email. Please update your profile and try again.');
        return;
      }

      submitPriceAlert(email);
      return;
    }

    setPriceAlertModalOpen(true);
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
        <button
          type="button"
          className="pd-info-rating pd-info-rating-link"
          aria-label={`${averageRating.toFixed(1)} out of 5 from ${reviewCount} reviews. Jump to reviews.`}
          onClick={() => {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
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
        </button>
      )}

      <div className="pd-info-price-row">
        <p className="pd-info-price">
          {formatPrice(product?.price ?? 0)}
          {product?.oldPrice ? (
            <span className="pd-info-price-old">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </p>
        {campaignBadge ? <CampaignSaleBadge text={campaignBadge} className="pd-info-campaign-badge" /> : null}
        {!campaignBadge && showSale ? <span className="pd-info-sale-badge">Sale</span> : null}
      </div>

      {(campaignPdpText || campaignCountdown) && (
        <div className="pd-info-campaign-panel" role="status">
          {campaignPdpText ? <p className="pd-info-campaign-msg">{campaignPdpText}</p> : null}
          {campaignCountdown ? (
            <p className="pd-info-campaign-ends">
              Offer ends in <strong>{campaignCountdown}</strong>
            </p>
          ) : null}
        </div>
      )}

      <p className={`pd-info-stock${inStock ? '' : ' is-oos'}`}>{stockLabel}</p>

      {purchaseActivity?.message ? (
        <p className="pd-info-purchase-activity" role="status">
          <span aria-hidden="true">🔥 </span>
          {purchaseActivity.message}
        </p>
      ) : null}

      {wishlistActivity?.message ? (
        <p className="pd-info-wishlist-activity" role="status">
          <span aria-hidden="true">❤️ </span>
          {wishlistActivity.message}
        </p>
      ) : null}

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

        <CompareButton
          productId={product?._id}
          className="pd-btn pd-btn-wishlist-icon pd-btn-compare-icon"
          activeClassName="pd-btn-wishlist-icon-active pd-btn-compare-icon-active"
          showLabel={false}
          stopPropagation={false}
        />

        <WishlistButton
          productId={product?._id}
          className="pd-btn pd-btn-wishlist-icon"
          activeClassName="pd-btn-wishlist-icon-active"
          showLabel={false}
          stopPropagation={false}
        />

        {showNotifyMe ? (
          <button
            type="button"
            className={`pd-btn pd-btn-secondary pd-btn-notify-me${
              isNotifySubscribed ? ' is-subscribed' : ''
            }`}
            onClick={handleNotifyMeClick}
            disabled={isNotifySubscribed || notifying}
            aria-live="polite"
          >
            {notifying ? 'Submitting…' : isNotifySubscribed ? 'Subscribed' : 'Notify Me When Available'}
          </button>
        ) : null}

        {showPriceAlert ? (
          <button
            type="button"
            className={`pd-btn pd-btn-secondary pd-btn-notify-me pd-btn-price-alert${
              isPriceAlertSubscribed ? ' is-subscribed' : ''
            }`}
            onClick={handlePriceAlertClick}
            disabled={isPriceAlertSubscribed || priceAlerting}
            aria-live="polite"
          >
            {priceAlerting
              ? 'Submitting…'
              : isPriceAlertSubscribed
                ? 'Price alert on'
                : 'Notify me when price drops'}
          </button>
        ) : null}
      </div>

      <ul className="pd-trust-list" aria-label="Purchase reassurance">
        {isCustomizable ? <li>Personalized options available</li> : null}
        {showMetalColors ? (
          <li>
            Available finishes: {metalColors.map((metal) => metal.label).join(', ')}
          </li>
        ) : null}
        {PDP_TRUST_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <BuyNowCheckoutModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        product={product}
        quantity={quantity}
        ringSize={showRingSize ? size : undefined}
        metalColor={showMetalColors ? color : undefined}
        variantId={
          findUniqueVariantId(product, {
            ringSize: showRingSize ? size : '',
            metalColor: showMetalColors ? color : '',
          }) || undefined
        }
      />

      <CustomizationModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        product={product}
        ringSize={showRingSize ? size : undefined}
        metalColor={showMetalColors ? color : undefined}
        onAddToCart={handleCustomizedAddToCart}
      />

      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => {
          if (!notifying) {
            setNotifyModalOpen(false);
          }
        }}
        onSubmit={submitBackInStock}
        submitting={notifying}
        ringSize={showRingSize ? size : undefined}
        metalColor={showMetalColors ? color : undefined}
      />

      <NotifyMeModal
        isOpen={priceAlertModalOpen}
        onClose={() => {
          if (!priceAlerting) {
            setPriceAlertModalOpen(false);
          }
        }}
        onSubmit={submitPriceAlert}
        submitting={priceAlerting}
        ringSize={showRingSize ? size : undefined}
        metalColor={showMetalColors ? color : undefined}
        title="Notify me when price drops"
        copy={`Enter your email and we’ll let you know if the price of ${
          [showRingSize ? size : null, showMetalColors ? color : null].filter(Boolean).join(' · ') ||
          'this item'
        } drops below today’s price.`}
        submitLabel="Watch price"
        submittingLabel="Submitting…"
      />
    </div>
  );
}
