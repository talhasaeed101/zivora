export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'Name: A to Z' },
  { value: 'title_desc', label: 'Name: Z to A' },
];

export const PRICE_RANGES = [
  { id: '500-999', label: 'Rs. 500 to 999', minPrice: 500, maxPrice: 999 },
  { id: '1000-1499', label: 'Rs. 1,000 to 1,499', minPrice: 1000, maxPrice: 1499 },
  { id: '1500-1999', label: 'Rs. 1,500 to 1,999', minPrice: 1500, maxPrice: 1999 },
  { id: '2000-2499', label: 'Rs. 2,000 to 2,499', minPrice: 2000, maxPrice: 2499 },
  { id: '2500+', label: 'Rs. 2,500 and above', minPrice: 2500, maxPrice: null },
];

export const PRODUCT_FLAG_FILTERS = [
  { key: 'isFeatured', label: 'Featured' },
  { key: 'isTrending', label: 'Trending' },
  { key: 'isNewArrival', label: 'New Arrival' },
];

export function getSortLabel(value) {
  return SORT_OPTIONS.find((option) => option.value === value)?.label || 'Newest';
}

export function findPriceRangeId(minPrice, maxPrice) {
  if (minPrice == null && maxPrice == null) {
    return '';
  }

  const match = PRICE_RANGES.find(
    (range) => range.minPrice === minPrice && range.maxPrice === maxPrice
  );

  return match?.id || 'custom';
}
