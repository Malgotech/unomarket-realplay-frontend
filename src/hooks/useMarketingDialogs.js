import { useState, useEffect, useCallback } from 'react';
import { marketingUtils } from '../utils/marketingUtils';

const SHOW_DELAY_MS = 5000; // Show dialog after 5 seconds

export const useMarketingDialogs = (onRegisterClick) => {
  const [showFreeCreditsDialog, setShowFreeCreditsDialog] = useState(false);

  // Check if we should show marketing dialogs
  const checkAndShowDialogs = useCallback(() => {
    // Only proceed if user is logged out and dialog hasn't been shown
    if (!marketingUtils.shouldShowFreeCreditsDialog()) {
      return;
    }

    // Set a timer to show the dialog after delay
    const timer = setTimeout(() => {
      setShowFreeCreditsDialog(true);
      // Mark as shown immediately when we decide to show it
      marketingUtils.markFreeCreditsDialogAsShown();
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const cleanup = checkAndShowDialogs();
    return cleanup;
  }, [checkAndShowDialogs]);

  // Listen for auth state changes and dev events
  useEffect(() => {
    const handleAuthStateChange = (event) => {
      const { isLoggedIn } = event.detail;
      
      // If user logs in, hide any open marketing dialogs
      if (isLoggedIn) {
        setShowFreeCreditsDialog(false);
      }
    };

    const handleDevForceShow = () => {
      if (process.env.NODE_ENV === 'development') {
        setShowFreeCreditsDialog(true);
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);
    window.addEventListener('dev-force-show-marketing-dialog', handleDevForceShow);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('dev-force-show-marketing-dialog', handleDevForceShow);
    };
  }, []);

  // Handle dialog close
  const handleCloseFreeCreditsDialog = useCallback(() => {
    setShowFreeCreditsDialog(false);
  }, []);

  // Handle register button click
  const handleRegisterClick = useCallback(() => {
    setShowFreeCreditsDialog(false);
    if (onRegisterClick) {
      onRegisterClick();
    }
  }, [onRegisterClick]);

  return {
    showFreeCreditsDialog,
    handleCloseFreeCreditsDialog,
    handleRegisterClick,
  };
};

export default useMarketingDialogs;