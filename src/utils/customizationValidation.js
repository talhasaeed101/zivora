import { mergeCustomizationOptions } from '../constants/customization.js';

const normalizeText = (value) => (value ?? '').toString().trim();

export const createInitialCustomizationState = (product) => {
  const options = mergeCustomizationOptions(product?.customizationOptions || {});

  return {
    nameWord: '',
    initials: '',
    font: options.fontSelection?.options?.[0] || 'luxury-serif',
    material: options.materialSelection?.options?.[2] || options.materialSelection?.options?.[0] || '',
    jewelryColor: options.jewelryColor?.options?.[0] || 'gold',
    chainLength: options.chainLength?.options?.[1] || options.chainLength?.options?.[0] || '45 cm',
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
  const options = mergeCustomizationOptions(product?.customizationOptions || {});
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
