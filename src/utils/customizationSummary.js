import {
  BIRTHSTONE_OPTIONS,
  FONT_OPTIONS,
  GIFT_OPTION_DEFAULTS,
  JEWELRY_COLOR_OPTIONS,
  SYMBOL_OPTIONS,
  mergeCustomizationOptions,
} from '../constants/customization.js';

const findLabel = (catalog, id, fallbackKey = 'label') => {
  if (!id) {
    return '';
  }

  const match = catalog.find((entry) => entry.id === id);
  return match?.[fallbackKey] || id;
};

export const buildCustomizationSummaryLines = (product, customization = {}) => {
  if (!customization) {
    return [];
  }

  const options = product?.customizationOptions
    ? mergeCustomizationOptions(product.customizationOptions)
    : null;
  const lines = [];

  const include = (key) => !options || options[key]?.enabled !== false;

  if (include('nameWord') && customization.nameWord) {
    lines.push({ label: 'Name / Word', value: customization.nameWord });
  }

  if (include('initials') && customization.initials) {
    lines.push({ label: 'Initials', value: customization.initials });
  }

  if (include('fontSelection') && customization.font) {
    lines.push({ label: 'Font', value: findLabel(FONT_OPTIONS, customization.font) });
  }

  if (include('materialSelection') && customization.material) {
    lines.push({ label: 'Material', value: customization.material });
  }

  if (include('jewelryColor') && customization.jewelryColor) {
    lines.push({
      label: 'Color',
      value: findLabel(JEWELRY_COLOR_OPTIONS, customization.jewelryColor),
    });
  }

  if (include('chainLength') && customization.chainLength) {
    lines.push({ label: 'Chain Length', value: customization.chainLength });
  }

  if (include('engraving')) {
    if (customization.engravingFront) {
      lines.push({ label: 'Front Engraving', value: customization.engravingFront });
    }

    if (customization.engravingBack) {
      lines.push({ label: 'Back Engraving', value: customization.engravingBack });
    }
  }

  if (include('uploadImage') && customization.uploadedImage) {
    lines.push({ label: 'Custom Image', value: 'Uploaded' });
  }

  if (include('birthstone') && customization.birthstone) {
    lines.push({ label: 'Birthstone', value: findLabel(BIRTHSTONE_OPTIONS, customization.birthstone) });
  }

  if (include('symbols') && customization.symbol) {
    lines.push({ label: 'Symbol', value: findLabel(SYMBOL_OPTIONS, customization.symbol) });
  }

  if (include('giftOptions') && customization.giftOptions?.length) {
    const giftCatalog = options?.giftOptions?.options || GIFT_OPTION_DEFAULTS;
    const giftLabels = customization.giftOptions
      .map((giftId) => findLabel(giftCatalog, giftId))
      .filter(Boolean);

    if (giftLabels.length) {
      lines.push({ label: 'Gift Options', value: giftLabels.join(', ') });
    }
  }

  if (include('specialInstructions') && customization.specialInstructions) {
    lines.push({ label: 'Instructions', value: customization.specialInstructions });
  }

  return lines;
};

export const formatCustomizationSummary = (product, customization = {}) =>
  buildCustomizationSummaryLines(product, customization)
    .map((line) => `${line.label}: ${line.value}`)
    .join(' · ');
