import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { customerAuthApi, getStoredToken, setOnUnauthorized, setStoredToken } from '../services/api.js';

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

  const googleLogin = useCallback(async (tokenPayload) => {
    const response = await customerAuthApi.googleLogin(tokenPayload);
    const { customer: customerData, token: authToken } = response.data;
    persistSession(customerData, authToken);
    return customerData;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await customerAuthApi.register(payload);
    const { customer: customerData, emailVerification } = response.data || {};
    // We intentionally do not persist the session here so the user has to log in
    return {
      customer: customerData,
      emailVerification: emailVerification || null,
      message: response.message,
    };
  }, []);

  const refreshCustomer = useCallback(async () => {
    const response = await customerAuthApi.getProfile();
    setCustomer(response.data);
    setStoredCustomer(response.data);
    return response.data;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await customerAuthApi.updateProfile(payload);
    const customerData = response.data;
    setCustomer(customerData);
    setStoredCustomer(customerData);
    return {
      customer: customerData,
      message: response.message,
      emailChanged: Boolean(customerData?.pendingEmail),
    };
  }, []);

  const changePassword = useCallback(async (payload) => {
    const response = await customerAuthApi.changePassword(payload);
    if (response.data) {
      setCustomer(response.data);
      setStoredCustomer(response.data);
    } else {
      await refreshCustomer();
    }
    return { message: response.message };
  }, [refreshCustomer]);

  const cancelEmailChange = useCallback(async () => {
    const response = await customerAuthApi.cancelEmailChange();
    setCustomer(response.data);
    setStoredCustomer(response.data);
    return { customer: response.data, message: response.message };
  }, []);

  const resendEmailChange = useCallback(async () => {
    const response = await customerAuthApi.resendEmailChange();
    setCustomer(response.data);
    setStoredCustomer(response.data);
    return { customer: response.data, message: response.message };
  }, []);

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

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      customer,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      googleLogin,
      register,
      logout,
      refreshCustomer,
      updateProfile,
      changePassword,
      cancelEmailChange,
      resendEmailChange,
    }),
    [
      customer,
      token,
      loading,
      login,
      googleLogin,
      register,
      logout,
      refreshCustomer,
      updateProfile,
      changePassword,
      cancelEmailChange,
      resendEmailChange,
    ]
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
