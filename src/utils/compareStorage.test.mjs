/**
 * Compare storage unit checks.
 * Run: node src/utils/compareStorage.test.mjs
 */
import assert from 'assert';
import {
  COMPARE_MAX,
  addCompareId,
  buildCompareRows,
  clearCompareIds,
  getCompareIds,
  removeCompareId,
  toggleCompareId,
} from './compareStorage.js';

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => {
    memory.set(key, String(value));
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};

clearCompareIds();
assert.deepStrictEqual(getCompareIds(), []);

assert.strictEqual(addCompareId('a').reason, 'added');
assert.strictEqual(addCompareId('a').reason, 'duplicate');
assert.strictEqual(addCompareId('b').reason, 'added');
assert.strictEqual(addCompareId('c').reason, 'added');
assert.strictEqual(addCompareId('d').reason, 'added');
assert.strictEqual(addCompareId('e').reason, 'full');
assert.deepStrictEqual(getCompareIds(), ['a', 'b', 'c', 'd']);
assert.strictEqual(getCompareIds().length, COMPARE_MAX);

assert.deepStrictEqual(removeCompareId('b'), ['a', 'c', 'd']);
assert.strictEqual(toggleCompareId('b').reason, 'added');
assert.strictEqual(toggleCompareId('b').reason, 'removed');

clearCompareIds();
assert.deepStrictEqual(getCompareIds(), []);

const rows = buildCompareRows([
  {
    price: 1000,
    category: { name: 'Rings' },
    metalColors: ['Gold'],
    ringSizes: ['6', '7'],
    material: 'Gold-tone',
    sku: 'SKU-1',
    stock: 2,
  },
  {
    price: 1200,
    category: { name: 'Necklaces' },
    metalColors: ['Silver'],
    // no ringSizes
    material: null,
    sku: 'SKU-2',
    stock: 0,
  },
]);

assert.ok(rows.some((row) => row.key === 'price'));
assert.ok(rows.some((row) => row.key === 'metalColors'));
const sizes = rows.find((row) => row.key === 'ringSizes');
assert.ok(sizes);
assert.strictEqual(sizes.values[0], '6, 7');
assert.strictEqual(sizes.values[1], null);

console.log('compareStorage checks passed.');
