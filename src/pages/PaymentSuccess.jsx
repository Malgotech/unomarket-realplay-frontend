import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";
  
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  
  useEffect(() => {
    // Extract transaction details from URL parameters
    const txnId = searchParams.get('maxelpay_txn') || searchParams.get('transaction_id');
    const paymentAmount = searchParams.get('amount');
    
    if (txnId) {
      setTransactionId(txnId);
    }
    if (paymentAmount) {
      setAmount(paymentAmount);
    }
  }, [searchParams]);

  const handleContinueToPortfolio = () => {
    navigate('/dashboard');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-[#0A0B0D]' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg p-8 text-center ${
        isDark ? 'bg-[#1A1B1E] border border-zinc-800' : 'bg-white border border-gray-200'
      }`}>
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Payment Successful!
        </h1>

        {/* Description */}
        <p className={`text-base mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your payment has been processed successfully. The funds will be added to your account shortly.
        </p>

        {/* Payment Details */}
        <div className={`mb-6 p-4 rounded-md ${
          isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'
        }`}>
          {amount && (
            <div className="mb-3">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Amount
              </p>
              <p className={`text-lg font-semibold ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                ${amount} USD
              </p>
            </div>
          )}
          
          {transactionId && (
            <div>
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
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinueToPortfolio}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            View Dashboard
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

        {/* Info Text */}
        <p className={`text-xs mt-6 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          You will receive a confirmation email shortly with the transaction details.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
