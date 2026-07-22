import { resolveProductCustomizationOptions } from '../constants/customization.js';

export const calculateCustomizationPricing = (product, customization = {}) => {
  const options = resolveProductCustomizationOptions(product?.customizationOptions || {});
  const basePrice = Number(product?.price) || 0;
  let extraPrice = 0;

  if (options.giftOptions?.enabled) {
    const selectedGifts = Array.isArray(customization.giftOptions) ? customization.giftOptions : [];
    const giftCatalog = options.giftOptions.options || [];

    selectedGifts.forEach((giftId) => {
      const gift = giftCatalog.find((entry) => entry.id === giftId);
      if (gift) {
        extraPrice += Number(gift.price) || 0;
      }
    });
  }

  const unitPrice = basePrice + extraPrice;
  const quantity = Math.max(1, Number(customization.quantity) || 1);

  return {
    basePrice,
    extraPrice,
    unitPrice,
    quantity,
    lineTotal: unitPrice * quantity,
  };
};
