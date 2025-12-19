import React from 'react';
import Toast from '../components/Toast';
import { useToast } from '../context/ToastContext';

const ToastContainer = () => {
  const { showToast, toastMessage, toastType, hideToast } = useToast();

  return (
    <Toast
      message={toastMessage}
      show={showToast}
      type={toastType}
      onClose={hideToast}
    />
  );
};

export default ToastContainer;
