import React, { useState, useEffect } from 'react';

const Toast = ({ message, show, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsLeaving(false);
      setIsVisible(true);
      const timer = setTimeout(() => {
        // Start exit animation
        setIsLeaving(true);
        
        // Wait for animation to complete before removing from DOM
        const exitTimer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, 500); // Exit animation duration
        
        return () => clearTimeout(exitTimer);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-[#FF532A]' : 'bg-[#ef4444]';
  const animationClass = isLeaving 
    ? 'animate-slideOutUp opacity-0' 
    : 'animate-slideInDown opacity-100';

  return (
    <div className={`fixed top-7 left-1/2 transform -translate-x-1/2 z-[10000] ${bgColor} text-white px-4 py-2 rounded-md shadow-md flex items-center transition-all duration-500 ${animationClass}`}>
      {type === 'success' && <i className="ri-check-line mr-2"></i>}
      {type === 'error' && <i className="ri-error-warning-line mr-2"></i>}
      <span className=" ">{message}</span>
    </div>
  );
};

export default Toast;