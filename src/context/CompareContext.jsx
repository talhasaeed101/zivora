import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import {
  COMPARE_MAX,
  addCompareId,
  clearCompareIds,
  getCompareIds,
  isInCompareList,
  removeCompareId,
  toggleCompareId,
} from '../utils/compareStorage.js';
import { toast } from './ToastContext.jsx';

const CompareContext = createContext(null);

let listeners = new Set();
const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === 'zivora_compare_ids') {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const getSnapshot = () => getCompareIds().join(',');

export function CompareProvider({ children }) {
  // Re-render when local compare list changes (same tab via emit, cross-tab via storage)
  const idsKey = useSyncExternalStore(subscribe, getSnapshot, () => '');
  const ids = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);
  const [bump, setBump] = useState(0);

  const refresh = useCallback(() => {
    emit();
    setBump((n) => n + 1);
  }, []);

  const isInCompare = useCallback((productId) => isInCompareList(productId, ids), [ids]);

  const add = useCallback(
    (productId) => {
      const result = addCompareId(productId);
      refresh();
      if (result.reason === 'full') {
        toast.info(`You can compare up to ${COMPARE_MAX} products.`);
      } else if (result.reason === 'duplicate') {
        toast.info('This product is already in Compare.');
      } else if (result.added) {
        toast.success('Added to Compare.');
      }
      return result;
    },
    [refresh]
  );

  const remove = useCallback(
    (productId) => {
      const next = removeCompareId(productId);
      refresh();
      return next;
    },
    [refresh]
  );

  const clear = useCallback(() => {
    clearCompareIds();
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    (productId) => {
      const result = toggleCompareId(productId);
      refresh();
      if (result.reason === 'full') {
        toast.info(`You can compare up to ${COMPARE_MAX} products.`);
      } else if (result.reason === 'removed') {
        toast.info('Removed from Compare.');
      } else if (result.reason === 'added') {
        toast.success('Added to Compare.');
      }
      return result;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      max: COMPARE_MAX,
      isInCompare,
      add,
      remove,
      clear,
      toggle,
      // bump reserved for future forced remounts
      _bump: bump,
    }),
    [ids, isInCompare, add, remove, clear, toggle, bump]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}
