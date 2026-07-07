import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BIRTHSTONE_OPTIONS,
  CHAIN_LENGTH_OPTIONS,
  FONT_OPTIONS,
  JEWELRY_COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  SYMBOL_OPTIONS,
  mergeCustomizationOptions,
} from '../../constants/customization.js';
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
  const fileInputRef = useRef(null);
  const [customization, setCustomization] = useState(() => createInitialCustomizationState(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const options = useMemo(
    () => mergeCustomizationOptions(product?.customizationOptions || {}),
    [product]
  );

  const pricing = useMemo(
    () => calculateCustomizationPricing(product, customization),
    [product, customization]
  );

  const previewText = getPreviewText(customization);
  const previewFont = FONT_OPTIONS.find((font) => font.id === customization.font)?.previewClass || 'cm-font-luxury-serif';
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

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
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

  const availableFonts = FONT_OPTIONS.filter((font) =>
    options.fontSelection?.options?.includes(font.id)
  );
  const availableMaterials = MATERIAL_OPTIONS.filter((material) =>
    options.materialSelection?.options?.includes(material)
  );
  const availableColors = JEWELRY_COLOR_OPTIONS.filter((color) =>
    options.jewelryColor?.options?.includes(color.id)
  );
  const availableChains = CHAIN_LENGTH_OPTIONS.filter((length) =>
    options.chainLength?.options?.includes(length)
  );
  const availableBirthstones = BIRTHSTONE_OPTIONS.filter((stone) =>
    options.birthstone?.options?.includes(stone.id)
  );
  const availableSymbols = SYMBOL_OPTIONS.filter((symbol) =>
    options.symbols?.options?.includes(symbol.id)
  );
  const giftCatalog = options.giftOptions?.options || [];

  return (
    <div className="customization-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="customization-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customization-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="customization-modal-header">
          <div>
            <h2 id="customization-modal-title" className="customization-modal-title">
              Customize Your Piece
            </h2>
            <p className="customization-modal-subtitle">{product.title}</p>
          </div>
          <button type="button" className="customization-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="customization-modal-body">
          <div className="customization-modal-form">
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
                <SectionTitle>Font Selection</SectionTitle>
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
                      key={material}
                      type="button"
                      className={`cm-pill ${customization.material === material ? 'cm-pill-active' : ''}`}
                      onClick={() => updateField('material', material)}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {options.jewelryColor?.enabled && availableColors.length > 0 && (
              <section className="cm-section">
                <SectionTitle>Jewelry Color</SectionTitle>
                <div className="cm-color-row">
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`cm-color-option ${customization.jewelryColor === color.id ? 'cm-color-option-active' : ''}`}
                      onClick={() => updateField('jewelryColor', color.id)}
                    >
                      <span className="cm-color-swatch" style={{ background: color.color }} />
                      <span className="cm-font-label">{color.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {options.chainLength?.enabled && availableChains.length > 0 && (
              <section className="cm-section">
                <SectionTitle>Chain Length</SectionTitle>
                <div className="cm-chain-row">
                  {availableChains.map((length) => (
                    <button
                      key={length}
                      type="button"
                      className={`cm-chain-btn ${customization.chainLength === length ? 'cm-chain-btn-active' : ''}`}
                      onClick={() => updateField('chainLength', length)}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {options.engraving?.enabled && (
              <section className="cm-section">
                <SectionTitle>Engraving</SectionTitle>
                <div className="cm-field">
                  <label className="cm-label" htmlFor="cm-engraving-front">Front Side Text</label>
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
                  <label className="cm-label" htmlFor="cm-engraving-back">Back Side Text</label>
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
                <SectionTitle>Upload Image</SectionTitle>
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
                  <div>{uploading ? 'Uploading...' : 'Drop or click to upload'}</div>
                  <div className="cm-preview-note">JPG · PNG · WEBP · HEIC</div>
                </button>
                {customization.uploadedImage && (
                  <img src={customization.uploadedImage} alt="Uploaded customization" className="cm-upload-preview" />
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
                <SectionTitle>Symbols &amp; Icons</SectionTitle>
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
                <SectionTitle>Gift Options</SectionTitle>
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
                <SectionTitle>Special Instructions</SectionTitle>
                <textarea
                  className="cm-textarea"
                  value={customization.specialInstructions}
                  maxLength={options.specialInstructions.maxLength || 500}
                  placeholder="Please share any additional customization requests."
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

          <aside className="customization-modal-sidebar">
            <div className="cm-preview-card">
              <div className="cm-preview-image-wrap">
                <img src={productImage} alt={product.title} className="cm-preview-image" />
                <span className={`cm-preview-engraving ${previewFont}`}>{previewText}</span>
              </div>
              {options.chainLength?.enabled && (
                <p className="cm-preview-meta">{customization.chainLength} chain</p>
              )}
              <p className="cm-preview-note">Updates in real time</p>
            </div>

            <div className="cm-price-card">
              <SectionTitle>Price Summary</SectionTitle>
              <div className="cm-price-row">
                <span>Base Price</span>
                <strong>{formatPrice(pricing.basePrice)}</strong>
              </div>
              {pricing.extraPrice > 0 && (
                <div className="cm-price-row">
                  <span>Extras</span>
                  <strong>{formatPrice(pricing.extraPrice)}</strong>
                </div>
              )}
              <div className="cm-price-row cm-price-row-total">
                <span>Total</span>
                <strong>{formatPrice(pricing.lineTotal)}</strong>
              </div>
              <div className="cm-trust-list">
                <span>◷ 3–5 days production</span>
                <span>↗ 2–4 days shipping</span>
                <span>◇ Handcrafted with care</span>
              </div>
            </div>
          </aside>
        </div>

        <footer className="customization-modal-footer">
          <div>
            <div className="cm-footer-total-label">Total</div>
            <div className="cm-footer-total-value">{formatPrice(pricing.lineTotal)}</div>
            {submitError && <p className="cm-error">{submitError}</p>}
          </div>
          <button
            type="button"
            className="cm-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || uploading}
          >
            {submitting ? 'Adding to Cart...' : 'Customize & Add to Cart'}
          </button>
        </footer>
      </div>
    </div>
  );
}
