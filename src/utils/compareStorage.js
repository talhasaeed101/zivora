const STORAGE_KEY = 'zivora_compare_ids';
export const COMPARE_MAX = 4;

const readRaw = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id)).filter(Boolean);
  } catch {
    return [];
  }
};

const writeRaw = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
  } catch {
    // quota / private mode — ignore
  }
};

export const getCompareIds = () => readRaw().slice(0, COMPARE_MAX);

/**
 * Add a product id. Dedupes. Returns { ids, added, reason }.
 * reason: 'added' | 'duplicate' | 'full' | 'invalid'
 */
export const addCompareId = (productId) => {
  const id = String(productId || '').trim();
  if (!id) {
    return { ids: readRaw(), added: false, reason: 'invalid' };
  }

  const current = readRaw();
  if (current.includes(id)) {
    return { ids: current, added: false, reason: 'duplicate' };
  }
  if (current.length >= COMPARE_MAX) {
    return { ids: current, added: false, reason: 'full' };
  }

  const ids = [...current, id].slice(0, COMPARE_MAX);
  writeRaw(ids);
  return { ids, added: true, reason: 'added' };
};

export const removeCompareId = (productId) => {
  const id = String(productId || '').trim();
  const ids = readRaw().filter((entry) => entry !== id);
  writeRaw(ids);
  return ids;
};

export const clearCompareIds = () => {
  writeRaw([]);
  return [];
};

export const toggleCompareId = (productId) => {
  const id = String(productId || '').trim();
  if (!id) {
    return { ids: readRaw(), active: false, changed: false, reason: 'invalid' };
  }

  const current = readRaw();
  if (current.includes(id)) {
    const ids = current.filter((entry) => entry !== id);
    writeRaw(ids);
    return { ids, active: false, changed: true, reason: 'removed' };
  }

  const result = addCompareId(id);
  return {
    ids: result.ids,
    active: result.added,
    changed: result.added,
    reason: result.reason,
  };
};

export const isInCompareList = (productId, ids = null) => {
  const id = String(productId || '').trim();
  if (!id) return false;
  const list = Array.isArray(ids) ? ids : readRaw();
  return list.includes(id);
};

/**
 * Build compare attribute rows from hydrated products.
 * Missing values become null (UI shows em dash).
 */
export const buildCompareRows = (products = []) => {
  const list = Array.isArray(products) ? products : [];

  const formatList = (values) => {
    if (!Array.isArray(values) || !values.length) return null;
    const cleaned = values.map((v) => String(v || '').trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(', ') : null;
  };

  const getCategory = (product) => {
    if (!product?.category) return null;
    if (typeof product.category === 'string') return product.category;
    return product.category.name || product.category.slug || null;
  };

  const rows = [
    {
      key: 'price',
      label: 'Price',
      values: list.map((p) => (p?.price != null ? p.price : null)),
      type: 'price',
    },
    {
      key: 'category',
      label: 'Category',
      values: list.map((p) => getCategory(p)),
      type: 'text',
    },
    {
      key: 'metalColors',
      label: 'Metal colors',
      values: list.map((p) => formatList(p?.metalColors)),
      type: 'text',
    },
    {
      key: 'ringSizes',
      label: 'Ring sizes',
      values: list.map((p) => formatList(p?.ringSizes)),
      type: 'text',
    },
    {
      key: 'material',
      label: 'Material',
      values: list.map((p) => (p?.material ? String(p.material).trim() : null) || null),
      type: 'text',
    },
    {
      key: 'sku',
      label: 'SKU',
      values: list.map((p) => (p?.sku ? String(p.sku).trim() : null) || null),
      type: 'text',
    },
    {
      key: 'stock',
      label: 'Availability',
      values: list.map((p) => {
        if (p?.stock == null && p?.totalStock == null) return null;
        const stock = Number(p.stock ?? p.totalStock);
        if (!Number.isFinite(stock)) return null;
        return stock > 0 ? 'In stock' : 'Out of stock';
      }),
      type: 'text',
    },
  ];

  // Hide rows where every product lacks the attribute
  return rows.filter((row) => row.values.some((value) => value != null && value !== ''));
};
