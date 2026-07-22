import {
  getOptionLabel,
  resolveProductCustomizationOptions,
} from '../constants/customization.js';

const findOptionLabel = (entries = [], value) => {
  if (!value) return '';
  const match = entries.find(
    (entry) => entry.id === value || entry.label === value || entry === value
  );
  return getOptionLabel(match || value);
};

export const buildCustomizationSummaryLines = (product, customization = {}) => {
  if (!customization) {
    return [];
  }

  const options = product?.customizationOptions
    ? resolveProductCustomizationOptions(product.customizationOptions)
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
    lines.push({
      label: 'Font',
      value: findOptionLabel(options?.fontSelection?.options || [], customization.font),
    });
  }

  if (include('materialSelection') && customization.material) {
    lines.push({
      label: 'Material',
      value: findOptionLabel(options?.materialSelection?.options || [], customization.material),
    });
  }

  if (include('jewelryColor') && customization.jewelryColor) {
    lines.push({
      label: 'Color',
      value: findOptionLabel(options?.jewelryColor?.options || [], customization.jewelryColor),
    });
  }

  if (include('chainLength') && customization.chainLength) {
    lines.push({
      label: 'Chain Length',
      value: findOptionLabel(options?.chainLength?.options || [], customization.chainLength),
    });
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
    lines.push({
      label: 'Birthstone',
      value: findOptionLabel(options?.birthstone?.options || [], customization.birthstone),
    });
  }

  if (include('symbols') && customization.symbol) {
    lines.push({
      label: 'Symbol',
      value: findOptionLabel(options?.symbols?.options || [], customization.symbol),
    });
  }

  if (include('giftOptions') && customization.giftOptions?.length) {
    const giftCatalog = options?.giftOptions?.options || [];
    const giftLabels = customization.giftOptions
      .map((giftId) => findOptionLabel(giftCatalog, giftId))
      .filter(Boolean);
    if (giftLabels.length) {
      lines.push({ label: 'Gift Options', value: giftLabels.join(', ') });
    }
  }

  if (include('specialInstructions') && customization.specialInstructions) {
    lines.push({ label: 'Notes', value: customization.specialInstructions });
  }

  return lines;
};
