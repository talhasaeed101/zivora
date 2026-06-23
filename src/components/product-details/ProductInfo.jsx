import { useState } from 'react';
import { HeartIcon, StarIcon } from '../icons';
import { ROUTES } from '../../utils/navigation';

const RING_SIZES = ['4', '5', '6', '7', '8'];

const METAL_COLORS = [
  { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  { id: 'gold', label: 'Gold', color: '#c8815f' },
  { id: 'rose-gold', label: 'Rose Gold', color: '#e8b4a8' },
];

export default function ProductInfo({ onColorChange }) {
  const [size, setSize] = useState('6');
  const [color, setColor] = useState('gold');
  const [quantity, setQuantity] = useState(2);
  const [wishlisted, setWishlisted] = useState(false);

  const handleColorSelect = (colorId) => {
    setColor(colorId);
    onColorChange?.(colorId);
  };

  return (
    <div className="pd-info">
      <h1 className="pd-info-title">Minimal Stacked Rings</h1>
      <p className="pd-info-subtitle">
        Delicately crafted minimal stacked rings designed to blend subtle elegance with modern
        sophistication. Perfect for effortless everyday luxury.
      </p>

      <div className="pd-info-rating">
        <div className="pd-info-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= 4}
              className={`w-4 h-4 ${star <= 4 ? 'pd-star-filled' : 'pd-star-empty'}`}
            />
          ))}
        </div>
        <span className="pd-info-rating-value">4.0</span>
        <span className="pd-info-review-count">(1015 Reviews)</span>
      </div>

      <p className="pd-info-price">Rs. 999</p>
      <hr className="pd-info-divider" />

      <div className="pd-info-field">
        <label htmlFor="ring-size" className="pd-info-label">Ring Size</label>
        <div className="pd-info-select-wrap">
          <select
            id="ring-size"
            className="pd-info-select"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            {RING_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pd-info-field">
        <span className="pd-info-label">Metal Color</span>
        <div className="pd-info-swatches">
          {METAL_COLORS.map((metal) => (
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
          {METAL_COLORS.find((m) => m.id === color)?.label}
        </span>
      </div>

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
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="pd-info-actions">
        <a href={ROUTES.cart} className="pd-btn pd-btn-primary">Buy Now</a>
        <a href={ROUTES.cart} className="pd-btn pd-btn-secondary">Add To Cart</a>
        <button
          type="button"
          className={`pd-btn pd-btn-wishlist ${wishlisted ? 'pd-btn-wishlist-active' : ''}`}
          onClick={() => setWishlisted(!wishlisted)}
        >
          <HeartIcon className="w-4 h-4" />
          Wishlist
        </button>
      </div>
    </div>
  );
}
