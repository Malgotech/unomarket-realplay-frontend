// Utility functions for authentication management

/**
 * Handles automatic logout when a 403 response is received
 * Clears all auth data and dispatches auth state change event
 */
export const handleAutoLogout = () => {
  // Clear user data and token from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Clear any cached user-specific data
  localStorage.removeItem("soundbetPortfolioValue");
  localStorage.removeItem("soundbetWalletBalance");
  localStorage.removeItem("soundbetFinancialTimestamp");
  
  // Dispatch auth state change event to update UI components
  window.dispatchEvent(
    new CustomEvent("auth-state-changed", {
      detail: { isLoggedIn: false, user: null },
    })
  );
  
  // Redirect to home page
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
  
};

/**
 * Checks if an error response indicates authentication failure (403)
 * @param {Error} error - The error object from API call
 * @returns {boolean} - True if it's a 403 authentication error
 */
export const isAuthenticationError = (error) => {
  return error?.response?.status === 403;
};
