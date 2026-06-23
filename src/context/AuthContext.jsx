import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { customerAuthApi, getStoredToken, setStoredToken } from '../services/api.js';

const CUSTOMER_KEY = 'zivora_customer_data';

const AuthContext = createContext(null);

const getStoredCustomer = () => {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredCustomer = (customer) => {
  if (customer) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  } else {
    localStorage.removeItem(CUSTOMER_KEY);
  }
};

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(getStoredCustomer);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredCustomer(null);
    setToken(null);
    setCustomer(null);
  }, []);

  const persistSession = useCallback((customerData, authToken) => {
    setStoredToken(authToken);
    setStoredCustomer(customerData);
    setToken(authToken);
    setCustomer(customerData);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await customerAuthApi.login(email, password);
    const { customer: customerData, token: authToken } = response.data;
    persistSession(customerData, authToken);
    return customerData;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await customerAuthApi.register(payload);
    const { customer: customerData, token: authToken } = response.data;
    persistSession(customerData, authToken);
    return customerData;
  }, [persistSession]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      const storedCustomer = getStoredCustomer();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setCustomer(storedCustomer);

      try {
        const response = await customerAuthApi.getProfile();
        setCustomer(response.data);
        setStoredCustomer(response.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const value = useMemo(
    () => ({
      customer,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [customer, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
