import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/common/Toast.jsx';

let addToastGlobal = () => {};

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const toast = {
  success: (msg, duration) => addToastGlobal(msg, 'success', duration),
  error: (msg, duration) => addToastGlobal(msg, 'error', duration),
  info: (msg, duration) => addToastGlobal(msg, 'info', duration),
};
