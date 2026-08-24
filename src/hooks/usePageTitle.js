import { useSeo } from './useSeo.js';

export function usePageTitle(title) {
  useSeo({ title });
}
