import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveProductCustomizationOptions } from '../../constants/customization.js';
import { uploadApi } from '../../services/api.js';
import { calculateCustomizationPricing } from '../../utils/customizationPrice.js';
import {
  createInitialCustomizationState,
  getPreviewText,
  validateCustomizationForm,
} from '../../utils/customizationValidation.js';
import { formatPrice, getProductImage } from '../../utils/products.js';
import './CustomizationModal.css';

function SectionTitle({ children }) {
  return <h3 className="cm-section-title">{children}</h3>;
}

export default function CustomizationModal({
  isOpen,
  onClose,
  product,
  ringSize,
  onAddToCart,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [customization, setCustomization] = useState(() => createInitialCustomizationState(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const options = useMemo(
    () => resolveProductCustomizationOptions(product?.customizationOptions || {}),
    [product]
  );

  const pricing = useMemo(
    () => calculateCustomizationPricing(product, customization),
    [product, customization]
  );

  const previewText = getPreviewText(customization);
  const availableFonts = options.fontSelection?.enabled ? options.fontSelection.options || [] : [];
  const availableMaterials = options.materialSelection?.enabled
    ? options.materialSelection.options || []
    : [];
  const availableColors = options.jewelryColor?.enabled ? options.jewelryColor.options || [] : [];
  const availableChains = options.chainLength?.enabled ? options.chainLength.options || [] : [];
  const availableBirthstones = options.birthstone?.enabled ? options.birthstone.options || [] : [];
  const availableSymbols = options.symbols?.enabled ? options.symbols.options || [] : [];
  const giftCatalog = options.giftOptions?.enabled ? options.giftOptions.options || [] : [];
  const previewFont =
    availableFonts.find((font) => font.id === customization.font)?.previewClass ||
    'cm-font-luxury-serif';
  const productImage = getProductImage(product);

  useEffect(() => {
    if (isOpen) {
      setCustomization(createInitialCustomizationState(product));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product || typeof document === 'undefined') {
    return null;
  }

  const updateField = (field, value) => {
    setCustomization((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const toggleGiftOption = (giftId) => {
    setCustomization((current) => {
      const selected = new Set(current.giftOptions || []);
      if (selected.has(giftId)) {
        selected.delete(giftId);
      } else {
        selected.add(giftId);
      }
      return { ...current, giftOptions: Array.from(selected) };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        uploadedImage: 'Only JPG, PNG, WEBP, or HEIC images are allowed',
      }));
      return;
    }

    const maxSize = (options.uploadImage?.maxSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((current) => ({
        ...current,
        uploadedImage: `Image must be ${options.uploadImage?.maxSizeMB || 5}MB or smaller`,
      }));
      return;
    }

    setUploading(true);
    setErrors((current) => {
      const next = { ...current };
      delete next.uploadedImage;
      return next;
    });

    try {
      const response = await uploadApi.uploadCustomizationImage(file);
      updateField('uploadedImage', response.data?.url || '');
    } catch (error) {
      const reader = new FileReader();
      reader.onload = () => updateField('uploadedImage', reader.result);
      reader.onerror = () => {
        setErrors((current) => ({
          ...current,
          uploadedImage: error.message || 'Unable to upload image',
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    const validation = validateCustomizationForm(product, customization);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      await onAddToCart({
        productId: product._id,
        quantity: customization.quantity,
        ringSize,
        metalColor: customization.jewelryColor,
        customization: {
          ...customization,
          quantity: customization.quantity,
        },
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Unable to add customized item to cart.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnySection =
    options.nameWord?.enabled ||
    options.initials?.enabled ||
    (options.fontSelection?.enabled && availableFonts.length > 0) ||
    (options.materialSelection?.enabled && availableMaterials.length > 0) ||
    (options.jewelryColor?.enabled && availableColors.length > 0) ||
    (options.chainLength?.enabled && availableChains.length > 0) ||
    options.engraving?.enabled ||
    options.uploadImage?.enabled ||
    (options.birthstone?.enabled && availableBirthstones.length > 0) ||
    (options.symbols?.enabled && availableSymbols.length > 0) ||
    (options.giftOptions?.enabled && giftCatalog.length > 0) ||
    options.specialInstructions?.enabled ||
    options.quantity?.enabled;

  const selectedChainLabel =
    availableChains.find((length) => length.id === customization.chainLength)?.label ||
    customization.chainLength;

  return createPortal(
    <div className="cm-drawer-overlay" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="cm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cm-drawer-header">
          <div className="cm-drawer-header-copy">
            <p className="cm-drawer-eyebrow">Personalize</p>
            <h2 id={titleId} className="cm-drawer-title">
              Customize your piece
            </h2>
            <p className="cm-drawer-subtitle">{product.title}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="cm-drawer-close"
            onClick={onClose}
            aria-label="Close customization"
          >
            ×
          </button>
        </header>

        <div className="cm-drawer-preview">
          <div className="cm-drawer-preview-media">
            <img src={productImage} alt={product.title} className="cm-drawer-preview-image" />
            <span className={`cm-drawer-preview-text ${previewFont}`}>{previewText}</span>
          </div>
          <div className="cm-drawer-preview-meta">
            {options.chainLength?.enabled && selectedChainLabel ? (
              <span>{selectedChainLabel}</span>
            ) : null}
            <span>Updates as you choose</span>
          </div>
        </div>

        <div className="cm-drawer-body">
          {!hasAnySection ? (
            <p className="cm-drawer-empty">
              Customization options have not been configured for this product yet.
            </p>
          ) : null}

          {(options.nameWord?.enabled || options.initials?.enabled) && (
            <section className="cm-section">
              <SectionTitle>Personalization</SectionTitle>
              {options.nameWord?.enabled && (
                <div className="cm-field">
                  <label className="cm-label" htmlFor="cm-name-word">
                    Name / Word{options.nameWord.required ? ' *' : ''}
                  </label>
                  <input
                    id="cm-name-word"
                    className="cm-input"
                    value={customization.nameWord}
                    maxLength={options.nameWord.maxLength || 20}
                    placeholder="e.g. Sophia"
                    onChange={(event) => updateField('nameWord', event.target.value)}
                  />
                  <div className="cm-char-count">
                    {customization.nameWord.length}/{options.nameWord.maxLength || 20}
                  </div>
                  {errors.nameWord && <p className="cm-error">{errors.nameWord}</p>}
                </div>
              )}
              {options.initials?.enabled && (
                <div className="cm-field">
                  <label className="cm-label" htmlFor="cm-initials">
                    Initials{options.initials.required ? ' *' : ''}
                  </label>
                  <input
                    id="cm-initials"
                    className="cm-input"
                    value={customization.initials}
                    maxLength={options.initials.maxLength || 4}
                    placeholder="e.g. S.K."
                    onChange={(event) => updateField('initials', event.target.value)}
                  />
                  <div className="cm-char-count">
                    {customization.initials.length}/{options.initials.maxLength || 4}
                  </div>
                  {errors.initials && <p className="cm-error">{errors.initials}</p>}
                </div>
              )}
            </section>
          )}

          {options.fontSelection?.enabled && availableFonts.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Font</SectionTitle>
              <div className="cm-font-grid">
                {availableFonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`cm-font-card ${customization.font === font.id ? 'cm-font-card-active' : ''}`}
                    onClick={() => updateField('font', font.id)}
                  >
                    <div className={`cm-font-preview ${font.previewClass}`}>Zivorah</div>
                    <div className="cm-font-label">{font.label}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.materialSelection?.enabled && availableMaterials.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Material</SectionTitle>
              <div className="cm-pill-row">
                {availableMaterials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    className={`cm-pill ${customization.material === material.id || customization.material === material.label ? 'cm-pill-active' : ''}`}
                    onClick={() => updateField('material', material.id)}
                  >
                    {material.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.jewelryColor?.enabled && availableColors.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Jewelry color</SectionTitle>
              <div className="cm-color-row">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`cm-color-option ${customization.jewelryColor === color.id ? 'cm-color-option-active' : ''}`}
                    onClick={() => updateField('jewelryColor', color.id)}
                  >
                    <span
                      className="cm-color-swatch"
                      style={{ background: color.color || '#c8c8c8' }}
                    />
                    <span className="cm-font-label">{color.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.chainLength?.enabled && availableChains.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Chain length</SectionTitle>
              <div className="cm-chain-row">
                {availableChains.map((length) => (
                  <button
                    key={length.id}
                    type="button"
                    className={`cm-chain-btn ${customization.chainLength === length.id || customization.chainLength === length.label ? 'cm-chain-btn-active' : ''}`}
                    onClick={() => updateField('chainLength', length.id)}
                  >
                    {length.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.engraving?.enabled && (
            <section className="cm-section">
              <SectionTitle>Engraving</SectionTitle>
              <div className="cm-field">
                <label className="cm-label" htmlFor="cm-engraving-front">
                  Front side
                </label>
                <input
                  id="cm-engraving-front"
                  className="cm-input"
                  value={customization.engravingFront}
                  maxLength={options.engraving.frontMaxLength || 30}
                  onChange={(event) => updateField('engravingFront', event.target.value)}
                />
                <div className="cm-char-count">
                  {customization.engravingFront.length}/{options.engraving.frontMaxLength || 30}
                </div>
                {errors.engravingFront && <p className="cm-error">{errors.engravingFront}</p>}
              </div>
              <div className="cm-field">
                <label className="cm-label" htmlFor="cm-engraving-back">
                  Back side
                </label>
                <input
                  id="cm-engraving-back"
                  className="cm-input"
                  value={customization.engravingBack}
                  maxLength={options.engraving.backMaxLength || 30}
                  onChange={(event) => updateField('engravingBack', event.target.value)}
                />
                <div className="cm-char-count">
                  {customization.engravingBack.length}/{options.engraving.backMaxLength || 30}
                </div>
                {errors.engravingBack && <p className="cm-error">{errors.engravingBack}</p>}
              </div>
            </section>
          )}

          {options.uploadImage?.enabled && (
            <section className="cm-section">
              <SectionTitle>Upload image</SectionTitle>
              <button
                type="button"
                className="cm-upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                  onChange={handleImageUpload}
                />
                <div className="cm-upload-icon">↑</div>
                <div>{uploading ? 'Uploading…' : 'Drop or click to upload'}</div>
                <div className="cm-preview-note">JPG · PNG · WEBP · HEIC</div>
              </button>
              {customization.uploadedImage && (
                <img
                  src={customization.uploadedImage}
                  alt="Uploaded customization"
                  className="cm-upload-preview"
                />
              )}
              {errors.uploadedImage && <p className="cm-error">{errors.uploadedImage}</p>}
            </section>
          )}

          {options.birthstone?.enabled && availableBirthstones.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Birthstone</SectionTitle>
              <div className="cm-birthstone-grid">
                {availableBirthstones.map((stone) => (
                  <button
                    key={stone.id}
                    type="button"
                    className={`cm-birthstone-card ${customization.birthstone === stone.id ? 'cm-birthstone-card-active' : ''}`}
                    onClick={() => updateField('birthstone', stone.id)}
                  >
                    <div className="cm-birthstone-dot" style={{ background: stone.color }} />
                    <div className="cm-birthstone-label">{stone.label}</div>
                    <span className="cm-birthstone-month">{stone.month}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.symbols?.enabled && availableSymbols.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Symbols</SectionTitle>
              <div className="cm-symbol-row">
                {availableSymbols.map((symbol) => (
                  <button
                    key={symbol.id}
                    type="button"
                    className={`cm-symbol-card ${customization.symbol === symbol.id ? 'cm-symbol-card-active' : ''}`}
                    onClick={() => updateField('symbol', symbol.id)}
                  >
                    <div className="cm-symbol-icon">{symbol.icon}</div>
                    <div className="cm-symbol-label">{symbol.label}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {options.giftOptions?.enabled && giftCatalog.length > 0 && (
            <section className="cm-section">
              <SectionTitle>Gift options</SectionTitle>
              {giftCatalog.map((gift) => (
                <div key={gift.id} className="cm-gift-row">
                  <label htmlFor={`gift-${gift.id}`}>
                    <input
                      id={`gift-${gift.id}`}
                      type="checkbox"
                      checked={customization.giftOptions.includes(gift.id)}
                      onChange={() => toggleGiftOption(gift.id)}
                    />
                    {gift.label}
                  </label>
                  <span className="cm-gift-price">+{formatPrice(gift.price)}</span>
                </div>
              ))}
            </section>
          )}

          {options.specialInstructions?.enabled && (
            <section className="cm-section">
              <SectionTitle>Special instructions</SectionTitle>
              <textarea
                className="cm-textarea"
                value={customization.specialInstructions}
                maxLength={options.specialInstructions.maxLength || 500}
                placeholder="Any extra requests for this piece."
                onChange={(event) => updateField('specialInstructions', event.target.value)}
              />
              <div className="cm-char-count">
                {customization.specialInstructions.length}/{options.specialInstructions.maxLength || 500}
              </div>
              {errors.specialInstructions && <p className="cm-error">{errors.specialInstructions}</p>}
            </section>
          )}

          {options.quantity?.enabled && (
            <section className="cm-section">
              <SectionTitle>Quantity</SectionTitle>
              <div className="cm-qty-stepper">
                <button
                  type="button"
                  onClick={() =>
                    updateField('quantity', Math.max(options.quantity.min || 1, customization.quantity - 1))
                  }
                >
                  −
                </button>
                <span>{customization.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'quantity',
                      Math.min(options.quantity.max || 99, customization.quantity + 1)
                    )
                  }
                >
                  +
                </button>
              </div>
              {errors.quantity && <p className="cm-error">{errors.quantity}</p>}
            </section>
          )}
        </div>

        <footer className="cm-drawer-footer">
          <div className="cm-drawer-footer-price">
            <span className="cm-footer-total-label">Total</span>
            <strong className="cm-footer-total-value">{formatPrice(pricing.lineTotal)}</strong>
            {pricing.extraPrice > 0 ? (
              <span className="cm-footer-extras">Includes {formatPrice(pricing.extraPrice)} extras</span>
            ) : null}
            {submitError ? <p className="cm-error">{submitError}</p> : null}
          </div>
          <button
            type="button"
            className="cm-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || uploading || !hasAnySection}
          >
            {submitting ? 'Adding…' : 'Add customized item'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
