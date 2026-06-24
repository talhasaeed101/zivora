import { PLACEHOLDER_IMAGE } from './images.js';

export { PLACEHOLDER_IMAGE };

export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) {
    return '';
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getProductImage = (product) => {
  if (product?.images?.length) {
    return product.images[0];
  }

  return PLACEHOLDER_IMAGE;
};

export const hasSale = (product) => {
  return Boolean(product?.oldPrice && product.oldPrice > product.price);
};

export const getCategoryName = (category) => {
  if (!category) {
    return '';
  }

  if (typeof category === 'object') {
    return category.name || '';
  }

  return '';
};

export const mapProductForCard = (product) => ({
  id: product._id,
  slug: product.slug,
  image: getProductImage(product),
  name: product.title,
  price: formatPrice(product.price),
  originalPrice: product.oldPrice ? formatPrice(product.oldPrice) : null,
  showSale: hasSale(product),
  categoryName: getCategoryName(product.category),
});

export const mapCartItemForUi = (item) => {
  const product = item.product;

  return {
    id: item._id,
    productId: typeof product === 'object' ? product?._id : product,
    slug: typeof product === 'object' ? product?.slug : undefined,
    image: item.image || PLACEHOLDER_IMAGE,
    title: item.title,
    material: item.material || item.metalColor || '—',
    quantity: item.quantity,
    unitPrice: item.price,
    deliveryDate: '10 Jun, 2026',
    returnPolicy: '7 days return available',
  };
};

export const LEGACY_STATIC_PRODUCT = {
  title: 'Minimal Stacked Rings',
  slug: 'minimal-stacked-rings',
  shortDescription:
    'Delicately crafted minimal stacked rings designed to blend subtle elegance with modern sophistication. Perfect for effortless everyday luxury.',
  description:
    'Crafted with meticulous attention to detail, our Minimal Stacked Rings embody the essence of understated luxury. Each ring is individually handmade using premium materials, designed to be worn alone or layered for a personalized look. The sleek silhouette and refined finish make these rings a timeless addition to any jewelry collection.',
  images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  price: 1999,
  oldPrice: 2499,
  sku: 'ZIV-LEGACY-001',
  stock: 10,
  ringSizes: ['4', '5', '6', '7', '8'],
  metalColors: ['silver', 'gold', 'rose-gold'],
  material: 'Premium craftsmanship',
  tags: ['rings', 'minimal', 'stacked'],
  category: { name: 'Rings', slug: 'rings' },
};
