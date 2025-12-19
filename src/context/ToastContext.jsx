import React, { createContext, useState, useContext, useEffect } from 'react';

const ToastContext = createContext({
  showToast: false,
  toastMessage: '',
  toastType: 'success',
  showSuccessToast: () => {},
  showErrorToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  // Function to show an error toast
  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  // Function to hide the toast
  const hideToast = () => {
    setShowToast(false);
  };

  // Provide the toast context to all children
  return (
    <ToastContext.Provider
      value={{
        showToast,
        toastMessage,
        toastType,
        showSuccessToast,
        showErrorToast,
        hideToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
