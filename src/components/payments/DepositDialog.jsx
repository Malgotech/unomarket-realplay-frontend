import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { useSelector } from "react-redux";
import { RiCloseLine } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";

import Loader from "../Loader";
import { fetchData, postData } from "../../services/apiServices";
import DepositWalletDialog from "./DepositWalletDialog";
import logoDark from "../../images/unologo.svg";
import logoLight from "../../images/unologo-dark.svg";
import unoCoin from "../../images/uno-coin.svg";


const DepositDialog = ({ open, onClose, balance }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("50.00");
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const dropdownRef = useRef(null);
  const cryptoDropdownRef = useRef(null);
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";

  // Supported cryptocurrencies for Plisio
  const [supportedCryptos, setSupportedCryptos] = useState([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);

  // Payment gateway options
  const paymentGateways = [
    {
      id: "UNOMARKET",
      name: "UNOMARKET",
      description: "Direct crypto transfer to our wallet",
      logo: unoCoin,
    },
    // {
    //   id: "maxelpay",
    //   name: "MaxelPay",
    //   description: "Easiest, Connect your wallet and pay",
    //   logo: "/maxel-pay-logo.jpeg",
    // },
    // {
    //   id: "mileston",
    //   name: "Mileston",
    //   description: "Fast and secure payments",
    //   logo: "/mileston_new.png",
    // },
    // {
    //   id: "plisio",
    //   name: "Plisio",
    //   description: "Pay without connecting your wallet",
    //   logo: "/plisio-logo.webp",
    // },
  ];

  // Set default payment gateway
  const [selectedGateway, setSelectedGateway] = useState(paymentGateways[0]);

  // Get user data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      try {
        const userDataStr = localStorage.getItem("user");
        if (userDataStr) {
          const parsedUserData = JSON.parse(userDataStr);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        cryptoDropdownRef.current &&
        !cryptoDropdownRef.current.contains(event.target)
      ) {
        setCryptoDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, cryptoDropdownRef]);

  // Get user data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    }
  }, [open]);

  // Fetch supported cryptocurrencies when Plisio is selected
  useEffect(() => {
    if (selectedGateway.id === "plisio") {
      fetchPlisioCurrencies();
    }
  }, [selectedGateway.id]);

  // Reposition dropdown on scroll or resize
  useEffect(() => {
    if (!cryptoDropdownOpen) return;

    const updateDropdownPosition = () => {
      const dropdownElement = document.querySelector(".crypto-dropdown-menu");
      if (!dropdownElement || !cryptoDropdownRef.current) return;

      const rect = cryptoDropdownRef.current.getBoundingClientRect();
      dropdownElement.style.width = `${rect.width}px`;
      dropdownElement.style.left = `${rect.left}px`;
      dropdownElement.style.top = `${rect.bottom + window.scrollY}px`;
    };

    window.addEventListener("scroll", updateDropdownPosition);
    window.addEventListener("resize", updateDropdownPosition);

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [cryptoDropdownOpen]);

  // Function to fetch supported cryptocurrencies from Plisio API
  const fetchPlisioCurrencies = async () => {
    try {
      setLoadingCryptos(true);
      const data = await fetchData("payments/plisio/currencies");

      if (data && data.success && Array.isArray(data.currencies)) {
        // Transform the currencies data to the format we need
        const currencies = data.currencies
          .filter((curr) => curr.available !== false) // Only include available currencies
          .map((curr) => ({
            symbol: curr.code,
            name: curr.name,
            icon: curr.icon,
            minAmount: curr.minAmount,
          }));

        if (currencies.length > 0) {
          setSupportedCryptos(currencies);
          // Set the first currency as selected by default
          setSelectedCrypto(currencies[0].symbol);
        } else {
          // If no available currencies, use all currencies
          const allCurrencies = data.currencies.map((curr) => ({
            symbol: curr.code,
            name: curr.name,
            icon: curr.icon,
            minAmount: curr.minAmount,
          }));

          if (allCurrencies.length > 0) {
            setSupportedCryptos(allCurrencies);
            setSelectedCrypto(allCurrencies[0].symbol);
          }
        }
      } else {
        console.error(
          "Failed to fetch Plisio currencies or invalid format",
          data
        );
      }
    } catch (error) {
      console.error("Error fetching Plisio cryptocurrencies:", error);
    } finally {
      setLoadingCryptos(false);
    }
  };

  const handlePayment = async () => {
    if (!amount) return;

    // Get user data for the API call
    const userEmail = userData?.email || "user@example.com";
    const userName = userData?.name || userData?.username || "User";

    try {
      setLoading(true);

      // Common payload for all payment gateways
      const basePayload = {
        amount: amount,
        currency: "USD",
        userEmail: userEmail,
        userName: userName,
        siteName: "UNOMARKET",
      };

      let endpoint;
      let payload = basePayload;

      // Select the appropriate API endpoint based on the selected gateway
      switch (selectedGateway.id) {
        case "maxelpay":
          endpoint = "payments/maxelpay/checkout";
          break;
        case "plisio":
          endpoint = "payments/plisio/create-invoice";
          payload = {
            amount: amount,
            currency: "USD",
            crypto_currency: selectedCrypto,
            email: userEmail,
            order_name: "Wallet Recharge",
            description: "Payment for wallet recharge in UNOMARKET platform",
          };
          break;
        case "mileston":
          endpoint = "payments/mileston/create-payment";
          payload = {
            amount: parseFloat(amount),
            email: userEmail,
            customerName: userName,
            description: "Wallet recharge",
          };
          break;
        default:
          endpoint = "payments/maxelpay/checkout";
      }

      const data = await postData(endpoint, payload);

      // Handle different response formats based on the payment gateway
      if (selectedGateway.id === "plisio") {
        if (data.success && data.invoice && data.invoice.invoice_url) {
          // New response format with invoice property
          window.open(data.invoice.invoice_url, "_blank");
        } else if (data.success && data.data && data.data.invoice_url) {
          // Legacy response format
          window.open(data.data.invoice_url, "_blank");
        } else if (data.success && data.invoiceUrl) {
          // Alternative response format
          window.open(data.invoiceUrl, "_blank");
        } else {
          console.error("Plisio checkout creation failed", data);
        }
      } else if (selectedGateway.id === "mileston") {
        // For Mileston gateway, handle the new response format
        if (data.success && data.paymentData && data.paymentData.paymentLink) {
          window.open(data.paymentData.paymentLink, "_blank");
        } else if (data.success && data.paymentUrl) {
          // Fallback to previous format if needed
          window.open(data.paymentUrl, "_blank");
        } else {
          console.error("Mileston payment creation failed", data);
        }
      } else {
        // Handle standard checkout response format
        if (data.success && data.checkout?.checkoutUrl) {
          window.open(data.checkout.checkoutUrl, "_blank");
        } else {
          console.error("Checkout creation failed", data);
        }
      }
    } catch (error) {
      console.error("Error creating checkout", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove handleCopyAddress since we no longer have deposit address

  // const selectedCurrencyData = currencies.find(c => c.currency === selectedToken) || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: "16px",
          padding: "12px",
          backgroundColor: isDark ? "#1A1B1E" : "#F5F5F5",
          width: "450px",
        },
      }}>
      <div className="relative px-3 py-1">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-3">
          <img
            src={isDark ? logoLight : logoDark}
            alt="UNOMARKET"
            className="h-7"
          />
          <div
            className={`w-full h-px mt-3 ${isDark ? "bg-zinc-700" : "bg-gray-300"
              }`}></div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader size="small" />
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Available Balance */}
            <div className="flex justify-between items-center">
              <div
                className="text-sm"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Available Balance
              </div>
              <div
                className="text-sm"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                ${balance.toFixed(2)}
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <div className="mt-3">
              <div
                className="text-base font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Select Gateway
              </div>
              <div ref={dropdownRef} className="relative w-full">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-[5px] ${isDark
                      ? "bg-zinc-800 text-white"
                      : "bg-white border border-gray-300 text-zinc-800"
                    }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-white">
                      {selectedGateway.logo ? (
                        <img
                          src={selectedGateway.logo}
                          alt={selectedGateway.name}
                          className={`w-7 h-7 ${selectedGateway.id === "mileston" || selectedGateway.id === "UNOMARKET"
                              ? "object-cover"
                              : "object-contain"
                            }`}
                        />
                      ) : (
                        <div
                          className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"
                            } rounded`}></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {selectedGateway.name}
                      </div>
                      <div className="text-xs opacity-70">
                        {selectedGateway.description}
                      </div>
                    </div>
                  </div>
                  <FiChevronDown
                    className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`absolute left-0 right-0 mt-1 w-full rounded-[5px] shadow-lg z-10 transition-all duration-300 ease-in-out ${isDark
                      ? "bg-zinc-800 text-white"
                      : "bg-white border border-gray-300 text-zinc-800"
                    } ${dropdownOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-[-8px] pointer-events-none"
                    }`}>
                  <div className={`max-h-96 transition-opacity duration-200 ${dropdownOpen ? "opacity-100" : "opacity-0"}`}>
                    {/* Show primary gateway(s) first (UNOMARKET) */}
                    {paymentGateways
                      .filter((g) => g.id === "UNOMARKET")
                      .map((gateway) => (
                        <div
                          key={gateway.id}
                          onClick={() => {
                            setSelectedGateway(gateway);
                            setDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedGateway.id === gateway.id
                              ? isDark
                                ? "bg-zinc-700"
                                : "bg-gray-100"
                              : isDark
                                ? "hover:bg-zinc-700"
                                : "hover:bg-gray-100"
                            }`}>
                          <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-white">
                            {gateway.logo ? (
                              <img
                                src={gateway.logo}
                                alt={gateway.name}
                                className={`w-7 h-7 ${gateway.id === "mileston" || gateway.id === "UNOMARKET" ? "object-cover" : "object-contain"}`}
                              />
                            ) : (
                              <div className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"} rounded`}></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{gateway.name}</div>
                            <div className="text-xs opacity-70">{gateway.description}</div>
                          </div>
                        </div>
                      ))}

                    {/* Divider + small title for third-party gateways */}
                    {paymentGateways.some((g) => g.id !== "UNOMARKET") && (
                      <div className="px-3 pt-2 sticky top-0 bg-transparent">
                        <div className={`h-px ${isDark ? "bg-zinc-700" : "bg-gray-200"} mb-2`} />
                        <div className={`text-[11px] font-medium mb-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          Third-party gateways (additional fees may apply)
                        </div>
                      </div>
                    )}

                    {/* Render other gateways */}
                    {paymentGateways
                      .filter((g) => g.id !== "UNOMARKET")
                      .map((gateway) => (
                        <div
                          key={gateway.id}
                          onClick={() => {
                            setSelectedGateway(gateway);
                            setDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedGateway.id === gateway.id
                              ? isDark
                                ? "bg-zinc-700"
                                : "bg-gray-100"
                              : isDark
                                ? "hover:bg-zinc-700"
                                : "hover:bg-gray-100"
                            }`}>
                          <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-white">
                            {gateway.logo ? (
                              <img
                                src={gateway.logo}
                                alt={gateway.name}
                                className={`w-7 h-7 ${gateway.id === "mileston" || gateway.id === "UNOMARKET" ? "object-cover" : "object-contain"}`}
                              />
                            ) : (
                              <div className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"} rounded`}></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{gateway.name}</div>
                            <div className="text-xs opacity-70">{gateway.description}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Show crypto interface when UNOMARKET Gateway is selected */}
            {selectedGateway.id === "UNOMARKET" ? (
              <DepositWalletDialog />
            ) : (
              <>
                {/* Add Balance */}
                <div className="flex justify-between items-center gap-3 mt-3">
                  <div
                    className="text-base font-medium"
                    style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                    Add Funds
                  </div>
                  <div
                    className={`w-[90px] rounded-[5px] px-3 py-2 flex items-center ${isDark
                        ? "bg-zinc-800 text-white"
                        : "bg-white border border-gray-300 text-zinc-800"
                      }`}>
                    <span
                      className={`mr-1 ${isDark ? "text-white" : "text-zinc-800"
                        }`}>
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full bg-transparent outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-zinc-800"
                        }`}
                      placeholder="0.00"
                      style={{ border: "none" }}
                    />
                  </div>
                </div>

                {/* Cryptocurrency Selector (For Plisio) */}
                {selectedGateway.id === "plisio" && (
                  <div className="mt-3">
                    <div
                      className="text-base font-medium mb-1"
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                      Select Token
                    </div>
                    <div ref={cryptoDropdownRef} className="relative w-full">
                      <button
                        onClick={() => {
                          // Toggle dropdown state
                          setCryptoDropdownOpen(!cryptoDropdownOpen);

                          // If opening the dropdown, position it after a short delay to ensure DOM updates
                          if (!cryptoDropdownOpen) {
                            setTimeout(() => {
                              const dropdownElement = document.querySelector(
                                ".crypto-dropdown-menu"
                              );
                              if (
                                !dropdownElement ||
                                !cryptoDropdownRef.current
                              )
                                return;

                              const rect =
                                cryptoDropdownRef.current.getBoundingClientRect();
                              dropdownElement.style.width = `${rect.width}px`;
                              dropdownElement.style.left = `${rect.left}px`;
                              dropdownElement.style.top = `${rect.bottom + window.scrollY
                                }px`;
                            }, 10);
                          }
                        }}
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-[5px] ${isDark
                            ? "bg-zinc-800 text-white"
                            : "bg-white border border-gray-300 text-zinc-800"
                          }`}
                        disabled={loadingCryptos}>
                        {loadingCryptos ? (
                          <div className="font-medium text-sm flex items-center">
                            <span className="mr-2">Loading currencies...</span>
                            <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="font-medium text-sm flex items-center">
                            {selectedGateway.id === "plisio" &&
                              supportedCryptos.find(
                                (c) => c.symbol === selectedCrypto
                              )?.icon && (
                                <img
                                  src={
                                    supportedCryptos.find(
                                      (c) => c.symbol === selectedCrypto
                                    )?.icon
                                  }
                                  alt={selectedCrypto}
                                  className="w-5 h-5 mr-2 rounded-full"
                                />
                              )}
                            {selectedCrypto}
                          </div>
                        )}
                        <FiChevronDown
                          className={`transition-transform duration-300 ${cryptoDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      <div
                        className={`crypto-dropdown-menu fixed mt-1 rounded-[5px] shadow-lg z-50 transition-all duration-300 ease-in-out ${isDark
                            ? "bg-zinc-800 text-white"
                            : "bg-white border border-gray-300 text-zinc-800"
                          } ${cryptoDropdownOpen
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-[-8px] pointer-events-none"
                          }`}
                        style={{
                          maxHeight: cryptoDropdownOpen ? "200px" : "0",
                          overflowY: "auto",
                          width: cryptoDropdownRef.current?.offsetWidth + "px",
                          left:
                            cryptoDropdownRef.current?.getBoundingClientRect()
                              .left + "px",
                          top: cryptoDropdownRef.current
                            ? cryptoDropdownRef.current.getBoundingClientRect()
                              .bottom +
                            window.scrollY +
                            "px"
                            : "0",
                          position: "fixed",
                        }}>
                        <div
                          className={`transition-opacity duration-200 ${cryptoDropdownOpen ? "opacity-100" : "opacity-0"
                            }`}>
                          {loadingCryptos ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></div>
                              <span>Loading currencies...</span>
                            </div>
                          ) : (
                            supportedCryptos.map((crypto) => (
                              <div
                                key={crypto.symbol}
                                onClick={() => {
                                  setSelectedCrypto(crypto.symbol);
                                  setCryptoDropdownOpen(false);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedCrypto === crypto.symbol
                                    ? isDark
                                      ? "bg-zinc-700"
                                      : "bg-gray-100"
                                    : isDark
                                      ? "hover:bg-zinc-700"
                                      : "hover:bg-gray-100"
                                  }`}>
                                <div className="font-medium text-sm flex items-center">
                                  {selectedGateway.id === "plisio" &&
                                    crypto.icon && (
                                      <img
                                        src={crypto.icon}
                                        alt={crypto.symbol}
                                        className="w-5 h-5 mr-2 rounded-full"
                                      />
                                    )}
                                  {crypto.symbol}
                                  {selectedGateway.id === "plisio" &&
                                    crypto.minAmount && (
                                      <span className="ml-2 text-xs opacity-70">
                                        (Min: ${crypto.minAmount.toFixed(2)})
                                      </span>
                                    )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfer Button */}
                <div className="pt-3">
                  <button
                    onClick={handlePayment}
                    className="w-full px-3 py-2.5 text-lg font-semibold rounded-[5px] bg-[#4169E1] text-white hover:bg-blue-700 transition-colors cursor-pointer">
                    Transfer Securely
                  </button>
                  <div className="text-right mt-1">
                    <span
                      className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"
                        }`}>
                      Terms & Conditions Apply
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DepositDialog;
