const EMPTY_OPTION = '';

const RING_SIZE_ATTR_KEYS = ['ring size', 'ringsize', 'size'];
const METAL_COLOR_ATTR_KEYS = ['metal color', 'metalcolor', 'color', 'metal'];

export const normalizeInventoryOption = (value) => {
  if (value === undefined || value === null) {
    return EMPTY_OPTION;
  }

  return String(value).trim().toLowerCase();
};

const resolveVariantAttribute = (attributes = {}, keys = []) => {
  const entries = Object.entries(attributes || {});

  for (const [key, value] of entries) {
    const normalizedKey = normalizeInventoryOption(key);
    if (keys.includes(normalizedKey) && value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return EMPTY_OPTION;
};

/**
 * Backend stores stock on `stock` + `variants[]`, while the storefront
 * historically expected an `inventory[]` matrix. Derive a compatible matrix.
 */
export const getProductInventory = (product) => {
  if (!product) {
    return [];
  }

  if (Array.isArray(product.inventory) && product.inventory.length > 0) {
    return product.inventory.map((row) => ({
      ringSize: row?.ringSize ?? EMPTY_OPTION,
      metalColor: row?.metalColor ?? EMPTY_OPTION,
      quantity: Number(row?.quantity) || 0,
    }));
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((variant) => ({
      ringSize: resolveVariantAttribute(variant.attributes, RING_SIZE_ATTR_KEYS),
      metalColor: resolveVariantAttribute(variant.attributes, METAL_COLOR_ATTR_KEYS),
      quantity: Number(variant.stock) || 0,
    }));
  }

  const stock = Number(product.stock);
  if (!Number.isFinite(stock)) {
    return [];
  }

  const sizes =
    Array.isArray(product.ringSizes) && product.ringSizes.length > 0
      ? product.ringSizes
      : [EMPTY_OPTION];
  const colors =
    Array.isArray(product.metalColors) && product.metalColors.length > 0
      ? product.metalColors
      : [EMPTY_OPTION];

  const rows = [];
  sizes.forEach((ringSize) => {
    colors.forEach((metalColor) => {
      rows.push({
        ringSize: ringSize || EMPTY_OPTION,
        metalColor: metalColor || EMPTY_OPTION,
        quantity: Math.max(0, stock),
      });
    });
  });

  return rows;
};

export const inventoryCellKey = (ringSize, metalColor) =>
  `${normalizeInventoryOption(ringSize)}::${normalizeInventoryOption(metalColor)}`;

export const findInventoryCell = (inventory = [], ringSize, metalColor) => {
  if (!Array.isArray(inventory)) {
    return undefined;
  }

  const key = inventoryCellKey(ringSize, metalColor);
  return inventory.find((row) => inventoryCellKey(row.ringSize, row.metalColor) === key);
};

export const getCellQuantity = (inventory, ringSize, metalColor) => {
  const cell = findInventoryCell(inventory, ringSize, metalColor);
  const quantity = Number(cell?.quantity);
  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
};

export const firstAvailableSelection = (ringSizes = [], metalColors = [], inventory = []) => {
  const sizes = ringSizes.length ? ringSizes : [EMPTY_OPTION];
  const colors = metalColors.length ? metalColors : [EMPTY_OPTION];

  for (const ringSize of sizes) {
    for (const metalColor of colors) {
      if (getCellQuantity(inventory, ringSize, metalColor) > 0) {
        return { ringSize, metalColor, inStock: true };
      }
    }
  }

  return {
    ringSize: sizes[0] || EMPTY_OPTION,
    metalColor: colors[0] || EMPTY_OPTION,
    inStock: false,
  };
};

export const firstAvailableColorForSize = (ringSize, metalColors = [], inventory = []) => {
  const colors = metalColors.length ? metalColors : [EMPTY_OPTION];
  return colors.find((metalColor) => getCellQuantity(inventory, ringSize, metalColor) > 0);
};

export const firstAvailableSizeForColor = (metalColor, ringSizes = [], inventory = []) => {
  const sizes = ringSizes.length ? ringSizes : [EMPTY_OPTION];
  return sizes.find((ringSize) => getCellQuantity(inventory, ringSize, metalColor) > 0);
};

export const optionHasAnyStock = (inventory, { ringSize, metalColor, ringSizes = [], metalColors = [] }) => {
  if (ringSize !== undefined && metalColor === undefined) {
    const colors = metalColors.length ? metalColors : [EMPTY_OPTION];
    return colors.some((color) => getCellQuantity(inventory, ringSize, color) > 0);
  }

  if (metalColor !== undefined && ringSize === undefined) {
    const sizes = ringSizes.length ? ringSizes : [EMPTY_OPTION];
    return sizes.some((size) => getCellQuantity(inventory, size, metalColor) > 0);
  }

  return getCellQuantity(inventory, ringSize, metalColor) > 0;
};

export const syncSelection = ({
  ringSize,
  metalColor,
  ringSizes = [],
  metalColors = [],
  inventory = [],
  prefer = 'size',
}) => {
  const sizes = ringSizes.length ? ringSizes : [EMPTY_OPTION];
  const colors = metalColors.length ? metalColors : [EMPTY_OPTION];
  let nextSize = sizes.includes(ringSize) ? ringSize : sizes[0];
  let nextColor = colors.includes(metalColor) ? metalColor : colors[0];

  if (prefer === 'size') {
    if (getCellQuantity(inventory, nextSize, nextColor) <= 0) {
      nextColor = firstAvailableColorForSize(nextSize, colors, inventory) ?? nextColor;
    }
    if (getCellQuantity(inventory, nextSize, nextColor) <= 0) {
      return firstAvailableSelection(sizes, colors, inventory);
    }
    return { ringSize: nextSize, metalColor: nextColor, inStock: true };
  }

  if (getCellQuantity(inventory, nextSize, nextColor) <= 0) {
    nextSize = firstAvailableSizeForColor(nextColor, sizes, inventory) ?? nextSize;
  }
  if (getCellQuantity(inventory, nextSize, nextColor) <= 0) {
    return firstAvailableSelection(sizes, colors, inventory);
  }
  return { ringSize: nextSize, metalColor: nextColor, inStock: true };
};

export const listInStockCombinations = (product) => {
  const inventory = getProductInventory(product);
  const sizes =
    Array.isArray(product?.ringSizes) && product.ringSizes.length > 0
      ? product.ringSizes
      : [EMPTY_OPTION];
  const colors =
    Array.isArray(product?.metalColors) && product.metalColors.length > 0
      ? product.metalColors
      : [EMPTY_OPTION];

  const combinations = [];

  sizes.forEach((ringSize) => {
    colors.forEach((metalColor) => {
      if (getCellQuantity(inventory, ringSize, metalColor) > 0) {
        combinations.push({ ringSize, metalColor });
      }
    });
  });

  // Variant attribute labels may not perfectly align with ringSizes/metalColors lists;
  // fall back to any in-stock inventory rows so catalog/wishlist still work.
  if (combinations.length === 0) {
    inventory.forEach((row) => {
      if ((Number(row.quantity) || 0) > 0) {
        combinations.push({
          ringSize: row.ringSize || EMPTY_OPTION,
          metalColor: row.metalColor || EMPTY_OPTION,
        });
      }
    });
  }

  return combinations;
};

export const isCatalogOutOfStock = (product) => {
  const inventory = getProductInventory(product);

  if (inventory.length > 0) {
    return inventory.every((row) => (Number(row.quantity) || 0) <= 0);
  }

  if (typeof product?.stock === 'number') {
    return product.stock <= 0;
  }

  return false;
};
