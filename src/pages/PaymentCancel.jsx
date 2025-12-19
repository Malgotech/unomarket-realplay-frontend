import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";
  
  const [transactionId, setTransactionId] = useState("");
  
  useEffect(() => {
    // Extract the maxelpay transaction ID from URL parameters
    const txnId = searchParams.get('maxelpay_txn');
    if (txnId) {
      setTransactionId(txnId);
    }
  }, [searchParams]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    // You can navigate back to the portfolio or deposit dialog
    navigate('/dashboard');
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-[#0A0B0D]' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg p-8 text-center ${
        isDark ? 'bg-[#1A1B1E] border border-zinc-800' : 'bg-white border border-gray-200'
      }`}>
        {/* Cancel Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Payment Canceled
        </h1>

        {/* Description */}
        <p className={`text-base mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your payment was canceled and no funds were charged. You can return to your portfolio or try again.
        </p>

        {/* Transaction ID (if available) */}
        {transactionId && (
          <div className={`mb-6 p-3 rounded-md ${
            isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Transaction ID
            </p>
            <p className={`text-sm font-mono break-all ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {transactionId}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={handleReturnHome}
            className={`w-full px-6 py-3 rounded-md font-medium transition-colors ${
              isDark 
                ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Return to Home
          </button>
        </div>

        {/* Help Text */}
        <p className={`text-xs mt-6 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
