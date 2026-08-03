import { useSEO } from './useSEO.js';

export function usePageTitle(title) {
  useSEO({ title });
}
