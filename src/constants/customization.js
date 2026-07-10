export const FONT_OPTIONS = [
  { id: 'elegant-script', label: 'Elegant Script', previewClass: 'cm-font-elegant-script' },
  { id: 'luxury-serif', label: 'Luxury Serif', previewClass: 'cm-font-luxury-serif' },
  { id: 'modern-sans', label: 'Modern Sans', previewClass: 'cm-font-modern-sans' },
  { id: 'classic-roman', label: 'Classic Roman', previewClass: 'cm-font-classic-roman' },
  { id: 'minimal-line', label: 'Minimal Line', previewClass: 'cm-font-minimal-line' },
  { id: 'bold-signature', label: 'Bold Signature', previewClass: 'cm-font-bold-signature' },
];

export const MATERIAL_OPTIONS = [
  'Stainless Steel',
  'Sterling Silver',
  'Gold Plated',
  'Rose Gold',
  '18K Gold',
];

export const JEWELRY_COLOR_OPTIONS = [
  { id: 'gold', label: 'Gold', color: '#c8815f' },
  { id: 'silver', label: 'Silver', color: '#c8c8c8' },
  { id: 'rose-gold', label: 'Rose Gold', color: '#e8b4a8' },
  { id: 'black', label: 'Black', color: '#2a2a2a' },
];

export const CHAIN_LENGTH_OPTIONS = ['40 cm', '45 cm', '50 cm', '55 cm', '60 cm'];

export const BIRTHSTONE_OPTIONS = [
  { id: 'garnet', label: 'Garnet', month: 'Jan', color: '#8b1a1a' },
  { id: 'amethyst', label: 'Amethyst', month: 'Feb', color: '#9966cc' },
  { id: 'aquamarine', label: 'Aquamarine', month: 'Mar', color: '#7fffd4' },
  { id: 'diamond', label: 'Diamond', month: 'Apr', color: '#e8e8e8' },
  { id: 'emerald', label: 'Emerald', month: 'May', color: '#50c878' },
  { id: 'pearl', label: 'Pearl', month: 'Jun', color: '#f5f0e8' },
  { id: 'ruby', label: 'Ruby', month: 'Jul', color: '#e0115f' },
  { id: 'peridot', label: 'Peridot', month: 'Aug', color: '#9acd32' },
  { id: 'sapphire', label: 'Sapphire', month: 'Sep', color: '#0f52ba' },
  { id: 'opal', label: 'Opal', month: 'Oct', color: '#d4c4a8' },
  { id: 'topaz', label: 'Topaz', month: 'Nov', color: '#ffc87c' },
  { id: 'turquoise', label: 'Turquoise', month: 'Dec', color: '#40e0d0' },
];

export const SYMBOL_OPTIONS = [
  { id: 'heart', label: 'Heart', icon: '♥' },
  { id: 'infinity', label: 'Infinity', icon: '∞' },
  { id: 'star', label: 'Star', icon: '★' },
  { id: 'moon', label: 'Moon', icon: '☾' },
  { id: 'cross', label: 'Cross', icon: '✝' },
  { id: 'butterfly', label: 'Butterfly', icon: '🦋' },
];

export const GIFT_OPTION_DEFAULTS = [
  { id: 'premium-gift-box', label: 'Premium Gift Box', price: 299 },
  { id: 'greeting-card', label: 'Greeting Card', price: 99 },
  { id: 'luxury-packaging', label: 'Luxury Packaging', price: 199 },
];

export const getDefaultCustomizationOptions = () => ({
  nameWord: { enabled: true, maxLength: 20, required: false },
  initials: { enabled: true, maxLength: 4, required: false },
  fontSelection: { enabled: true, options: FONT_OPTIONS.map((font) => font.id) },
  materialSelection: { enabled: true, options: [...MATERIAL_OPTIONS] },
  jewelryColor: { enabled: true, options: JEWELRY_COLOR_OPTIONS.map((color) => color.id) },
  chainLength: { enabled: true, options: [...CHAIN_LENGTH_OPTIONS] },
  engraving: { enabled: true, frontMaxLength: 30, backMaxLength: 30 },
  uploadImage: { enabled: true, maxSizeMB: 5 },
  birthstone: { enabled: true, options: BIRTHSTONE_OPTIONS.map((stone) => stone.id) },
  symbols: { enabled: true, options: SYMBOL_OPTIONS.map((symbol) => symbol.id) },
  giftOptions: { enabled: true, options: GIFT_OPTION_DEFAULTS.map((gift) => ({ ...gift })) },
  specialInstructions: { enabled: true, maxLength: 500 },
  quantity: { enabled: true, min: 1, max: 99 },
});

export const mergeCustomizationOptions = (options = {}) => {
  const defaults = getDefaultCustomizationOptions();
  const merged = { ...defaults, ...options };

  Object.keys(defaults).forEach((key) => {
    if (defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      merged[key] = { ...defaults[key], ...(options[key] || {}) };
    }
  });

  if (options.giftOptions?.options) {
    merged.giftOptions = {
      ...merged.giftOptions,
      options: options.giftOptions.options,
    };
  }

  return merged;
};
