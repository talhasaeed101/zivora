import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { publicCampaignApi } from '../services/api.js';

const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const [primary, setPrimary] = useState(null);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const response = await publicCampaignApi.getActive();
      const data = response?.data || {};
      setPrimary(data.primary || null);
      setActive(Array.isArray(data.active) ? data.active : []);
      setError(null);
    } catch (err) {
      // Fail open for storefront — merchandising is optional.
      setPrimary(null);
      setActive([]);
      setError(err?.message || 'campaign_unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await publicCampaignApi.getActive();
        if (!mounted) return;
        const data = response?.data || {};
        setPrimary(data.primary || null);
        setActive(Array.isArray(data.active) ? data.active : []);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setPrimary(null);
        setActive([]);
        setError(err?.message || 'campaign_unavailable');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      primary,
      active,
      loading,
      error,
      refresh,
    }),
    [primary, active, loading, error, refresh]
  );

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    return {
      primary: null,
      active: [],
      loading: false,
      error: null,
      refresh: async () => {},
    };
  }
  return ctx;
}
