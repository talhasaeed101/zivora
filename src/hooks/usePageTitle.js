import { useSeo } from './useSEO.js';

export function usePageTitle(title) {
  useSeo({ title });
}
