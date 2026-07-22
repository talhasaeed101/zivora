import {
  getOptionId,
  getOptionLabel,
  resolveProductCustomizationOptions,
} from '../constants/customization.js';

const normalizeText = (value) => (value ?? '').toString().trim();

const firstOptionId = (entries = []) => getOptionId(entries[0]) || '';

const isAllowedOption = (entries = [], value) => {
  if (!value) return false;
  return entries.some(
    (entry) => getOptionId(entry) === value || getOptionLabel(entry) === value
  );
};

export const createInitialCustomizationState = (product) => {
  const options = resolveProductCustomizationOptions(product?.customizationOptions || {});

  return {
    nameWord: '',
    initials: '',
    font: firstOptionId(options.fontSelection?.options),
    material: firstOptionId(options.materialSelection?.options),
    jewelryColor: firstOptionId(options.jewelryColor?.options),
    chainLength: firstOptionId(options.chainLength?.options),
    engravingFront: '',
    engravingBack: '',
    uploadedImage: '',
    birthstone: '',
    symbol: '',
    giftOptions: [],
    specialInstructions: '',
    quantity: options.quantity?.min || 1,
  };
};

export const validateCustomizationForm = (product, customization = {}) => {
  const options = resolveProductCustomizationOptions(product?.customizationOptions || {});
  const errors = {};

  if (options.nameWord?.enabled) {
    const value = normalizeText(customization.nameWord);

    if (options.nameWord.required && !value) {
      errors.nameWord = 'Name / word is required';
    } else if (value.length > (options.nameWord.maxLength || 20)) {
      errors.nameWord = `Maximum ${options.nameWord.maxLength} characters`;
    }
  }

  if (options.initials?.enabled) {
    const value = normalizeText(customization.initials);

    if (options.initials.required && !value) {
      errors.initials = 'Initials are required';
    } else if (value.length > (options.initials.maxLength || 4)) {
      errors.initials = `Maximum ${options.initials.maxLength} characters`;
    }
  }

  if (options.fontSelection?.enabled && customization.font) {
    if (!isAllowedOption(options.fontSelection.options, customization.font)) {
      errors.font = 'Selected font is not available';
    }
  }

  if (options.materialSelection?.enabled && customization.material) {
    if (!isAllowedOption(options.materialSelection.options, customization.material)) {
      errors.material = 'Selected material is not available';
    }
  }

  if (options.jewelryColor?.enabled && customization.jewelryColor) {
    if (!isAllowedOption(options.jewelryColor.options, customization.jewelryColor)) {
      errors.jewelryColor = 'Selected color is not available';
    }
  }

  if (options.chainLength?.enabled && customization.chainLength) {
    if (!isAllowedOption(options.chainLength.options, customization.chainLength)) {
      errors.chainLength = 'Selected chain length is not available';
    }
  }

  if (options.engraving?.enabled) {
    if ((customization.engravingFront || '').length > (options.engraving.frontMaxLength || 30)) {
      errors.engravingFront = `Maximum ${options.engraving.frontMaxLength} characters`;
    }

    if ((customization.engravingBack || '').length > (options.engraving.backMaxLength || 30)) {
      errors.engravingBack = `Maximum ${options.engraving.backMaxLength} characters`;
    }
  }

  if (options.specialInstructions?.enabled) {
    if ((customization.specialInstructions || '').length > (options.specialInstructions.maxLength || 500)) {
      errors.specialInstructions = `Maximum ${options.specialInstructions.maxLength} characters`;
    }
  }

  const quantity = Number(customization.quantity) || 1;

  if (quantity < (options.quantity?.min || 1)) {
    errors.quantity = 'Quantity must be at least 1';
  }

  if (quantity > (options.quantity?.max || 99)) {
    errors.quantity = `Maximum quantity is ${options.quantity.max}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getPreviewText = (customization = {}) =>
  normalizeText(customization.nameWord) ||
  normalizeText(customization.initials) ||
  'Zivora';
