// Marketing dialog utilities for tracking user interactions

const MARKETING_STORAGE_KEYS = {
  FREE_CREDITS_DIALOG_SHOWN: 'soundbet_free_credits_dialog_shown',
  LAST_DIALOG_TIMESTAMP: 'soundbet_last_marketing_dialog_timestamp'
};

export const marketingUtils = {
  // Check if free credits dialog has been shown before
  hasFreeCreditsDialogBeenShown: () => {
    try {
      return localStorage.getItem(MARKETING_STORAGE_KEYS.FREE_CREDITS_DIALOG_SHOWN) === 'true';
    } catch (error) {
      console.error('Error checking free credits dialog status:', error);
      return false;
    }
  },

  // Mark free credits dialog as shown
  markFreeCreditsDialogAsShown: () => {
    try {
      localStorage.setItem(MARKETING_STORAGE_KEYS.FREE_CREDITS_DIALOG_SHOWN, 'true');
      localStorage.setItem(MARKETING_STORAGE_KEYS.LAST_DIALOG_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error marking free credits dialog as shown:', error);
    }
  },

  // Check if user is logged out
  isUserLoggedOut: () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      return !token || !user;
    } catch (error) {
      console.error('Error checking user login status:', error);
      return true; // Assume logged out if there's an error
    }
  },

  // Check if we should show the marketing dialog
  shouldShowFreeCreditsDialog: () => {
    const isLoggedOut = marketingUtils.isUserLoggedOut();
    const hasBeenShown = marketingUtils.hasFreeCreditsDialogBeenShown();
    
    return isLoggedOut && !hasBeenShown;
  },

  // Reset marketing dialog state (for testing purposes)
  resetFreeCreditsDialogState: () => {
    try {
      localStorage.removeItem(MARKETING_STORAGE_KEYS.FREE_CREDITS_DIALOG_SHOWN);
      localStorage.removeItem(MARKETING_STORAGE_KEYS.LAST_DIALOG_TIMESTAMP);
    } catch (error) {
      console.error('Error resetting free credits dialog state:', error);
    }
  },

  // Get time elapsed since last dialog shown (in milliseconds)
  getTimeSinceLastDialog: () => {
    try {
      const timestamp = localStorage.getItem(MARKETING_STORAGE_KEYS.LAST_DIALOG_TIMESTAMP);
      if (!timestamp) return null;
      return Date.now() - parseInt(timestamp);
    } catch (error) {
      console.error('Error getting time since last dialog:', error);
      return null;
    }
  }
};

export default marketingUtils;