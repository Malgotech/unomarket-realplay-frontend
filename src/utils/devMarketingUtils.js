// Developer utilities for testing marketing features
// This file should only be used in development

import { marketingUtils } from './marketingUtils';

export const devMarketingUtils = {
  // Reset and show the free credits dialog again
  resetAndShowFreeCreditsDialog: () => {
    if (process.env.NODE_ENV === 'development') {
      marketingUtils.resetFreeCreditsDialogState();
      return true;
    } else {
      return false;
    }
  },

  // Check current state
  checkMarketingState: () => {
    const state = {
      isLoggedOut: marketingUtils.isUserLoggedOut(),
      hasDialogBeenShown: marketingUtils.hasFreeCreditsDialogBeenShown(),
      shouldShowDialog: marketingUtils.shouldShowFreeCreditsDialog(),
      timeSinceLastDialog: marketingUtils.getTimeSinceLastDialog()
    };
    
    console.table(state);
    return state;
  },

  // Force show dialog (bypasses all checks)
  forceShowDialog: () => {
    if (process.env.NODE_ENV === 'development') {
      // Dispatch a custom event to force show the dialog
      window.dispatchEvent(new CustomEvent('dev-force-show-marketing-dialog'));
      return true;
    } else {
      console.warn('⚠️ forceShowDialog only works in development mode');
      return false;
    }
  }
};

// Add to window object for easy access in browser console
if (process.env.NODE_ENV === 'development') {
  window.devMarketingUtils = devMarketingUtils;
}

export default devMarketingUtils;