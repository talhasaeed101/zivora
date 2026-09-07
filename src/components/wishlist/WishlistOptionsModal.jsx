import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SafeImage from '../SafeImage.jsx';
import {
  firstAvailableSelection,
  getCellQuantity,
  getProductInventory,
  optionHasAnyStock,
  syncSelection,
} from '../../utils/inventory.js';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';
import './WishlistOptionsModal.css';

/**
 * Lightweight ring-size / metal-color picker for wishlist Add to Cart.
 * Reuses inventory helpers — does not bypass cart validation.
 */
export default function WishlistOptionsModal({
  isOpen,
  product,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const ringSizes = useMemo(
    () => (Array.isArray(product?.ringSizes) ? product.ringSizes.filter(Boolean) : []),
    [product?.ringSizes]
  );
  const metalColors = useMemo(
    () => (Array.isArray(product?.metalColors) ? product.metalColors.filter(Boolean) : []),
    [product?.metalColors]
  );
  const showRingSize = ringSizes.length > 0;
  const showMetalColors = metalColors.length > 0;
  const inventory = useMemo(() => getProductInventory(product), [product]);

  const [ringSize, setRingSize] = useState('');
  const [metalColor, setMetalColor] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [colorError, setColorError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen || !product) {
      return;
    }

    const next = firstAvailableSelection(ringSizes, metalColors, inventory);
    setRingSize(showRingSize ? next.ringSize : '');
    setMetalColor(showMetalColors ? next.metalColor : '');
    setSizeError('');
    setColorError('');
    setFormError('');
  }, [isOpen, product, ringSizes, metalColors, inventory, showRingSize, showMetalColors]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) {
        event.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, submitting]);

  if (!isOpen || !product) {
    return null;
  }

  const applySelection = (nextSize, nextColor, prefer) => {
    const synced = syncSelection({
      ringSize: nextSize,
      metalColor: nextColor,
      ringSizes,
      metalColors,
      inventory,
      prefer,
    });
    setRingSize(showRingSize ? synced.ringSize : '');
    setMetalColor(showMetalColors ? synced.metalColor : '');
  };

  const handleConfirm = () => {
    setFormError('');
    setSizeError('');
    setColorError('');

    if (showRingSize && !ringSize) {
      setSizeError('Please select a ring size.');
      return;
    }
    if (showMetalColors && !metalColor) {
      setColorError('Please select a metal color.');
      return;
    }

    const qty = getCellQuantity(
      inventory,
      showRingSize ? ringSize : '',
      showMetalColors ? metalColor : ''
    );

    if (qty <= 0) {
      setFormError('This combination is out of stock. Choose another option.');
      return;
    }

    onConfirm?.({
      ringSize: showRingSize ? ringSize : '',
      metalColor: showMetalColors ? metalColor : '',
    });
  };

  const image = getProductImage(product);
  const onSale = hasSale(product);

  return createPortal(
    <div className="wl-options-overlay" role="presentation" onClick={() => !submitting && onClose?.()}>
      <div
        ref={panelRef}
        className="wl-options-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wl-options-header">
          <h2 id={titleId} className="wl-options-title">
            Choose options
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="wl-options-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="wl-options-product">
          <SafeImage src={image} alt="" className="wl-options-image" loading="lazy" />
          <div className="wl-options-product-copy">
            <p className="wl-options-product-name">{product.title}</p>
            <p className="wl-options-product-price">
              {formatPrice(product.price)}
              {onSale && product.oldPrice ? (
                <span className="wl-options-product-old">{formatPrice(product.oldPrice)}</span>
              ) : null}
            </p>
          </div>
        </div>

        {showRingSize ? (
          <fieldset className="wl-options-fieldset">
            <legend className="wl-options-legend">Ring size</legend>
            <div className="wl-options-chips">
              {ringSizes.map((size) => {
                const available = optionHasAnyStock(inventory, {
                  ringSize: size,
                  metalColors,
                });
                const selected = ringSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`wl-options-chip${selected ? ' is-selected' : ''}${
                      !available ? ' is-disabled' : ''
                    }`}
                    disabled={!available || submitting}
                    aria-pressed={selected}
                    onClick={() => {
                      setSizeError('');
                      applySelection(size, metalColor, 'size');
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {sizeError ? <p className="wl-options-error">{sizeError}</p> : null}
          </fieldset>
        ) : null}

        {showMetalColors ? (
          <fieldset className="wl-options-fieldset">
            <legend className="wl-options-legend">Metal color</legend>
            <div className="wl-options-chips">
              {metalColors.map((color) => {
                const available = optionHasAnyStock(inventory, {
                  metalColor: color,
                  ringSizes,
                });
                const selected = metalColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`wl-options-chip${selected ? ' is-selected' : ''}${
                      !available ? ' is-disabled' : ''
                    }`}
                    disabled={!available || submitting}
                    aria-pressed={selected}
                    onClick={() => {
                      setColorError('');
                      applySelection(ringSize, color, 'color');
                    }}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
            {colorError ? <p className="wl-options-error">{colorError}</p> : null}
          </fieldset>
        ) : null}

        {formError ? (
          <p className="wl-options-error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="wl-options-actions">
          <button
            type="button"
            className="wl-options-btn wl-options-btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="wl-options-btn wl-options-btn-primary"
            onClick={handleConfirm}
            disabled={submitting}
            aria-busy={submitting || undefined}
          >
            {submitting ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
