const getCategoryText = (category) => {
  if (!category) {
    return '';
  }

  if (typeof category === 'object') {
    return `${category.slug || ''} ${category.name || ''}`.trim();
  }

  return String(category);
};

export const isRingCategory = (category) => {
  const text = getCategoryText(category).toLowerCase();
  return text.includes('ring');
};

export const productNeedsRingSize = (product) => {
  if (product?.ringSizes?.length > 0) {
    return true;
  }

  return isRingCategory(product?.category);
};

export const categoryNeedsRingSize = (category) => isRingCategory(category);
