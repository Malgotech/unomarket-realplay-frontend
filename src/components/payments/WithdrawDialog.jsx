import React, { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import { useSelector } from "react-redux";
import { FiChevronDown } from "react-icons/fi";
import { postData, fetchData } from "../../services/apiServices";
import logoDark from "../../images/unologo.svg";
import logoLight from "../../images/unologo-dark.svg";
import unoCoin from "../../images/uno-coin.svg";


const fetchUserProfile = async () => {
  try {
    return await fetchData("api/event/user");
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return { success: false, message: error.message };
  }
};
const WithdrawDialog = ({
  open,
  onClose,
  onWithdraw,
  loading: loadingProp,
}) => {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [networkdropdownOpen, networksetDropdownOpen] = useState(false);
  const [cryptodropdownOpen, cryptosetDropdownOpen] = useState(false);

  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawLimit, setWithdrawLimit] = useState({
    min_withdraw_amount: 10,
    reason: "Standard minimum withdraw limit",
    free_funds_claimed: false,
    has_previous_withdraws: false,
  });
  const [loadingLimit, setLoadingLimit] = useState(false);

  const gatewayDropdownRef = useRef(null);
  const cryptoDropdownRef = useRef(null);
  const networkDropdownRef = useRef(null);
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";

  // Payment gateway options for withdrawal
  const withdrawalGateways = [
    {
      id: "UNOMARKET",
      name: "UNOMARKET",
      description: "Direct crypto withdrawal from your wallet",
      logo: unoCoin,
    },
  ];
  const withdrawalChains = [
    {
      id: "bsc",
      name: "BSC",
      logo: "/bnblogo.png",
    },
    {
      id: "eth",
      name: "ETH",
      logo: "/ethlogo.svg",
    },
    {
      id: "pol",
      name: "POL",
      logo: "/pollogo.webp",
    },
    {
      id: "sol",
      name: "SOL",
      logo: "/sollogo.png",
    },
  ];
  const withdrawalcrypto = [
    {
      id: "usdt",
      name: "USDT",
      logo: "/usdtlogo.png",
    },
    {
      id: "usdc",
      name: "USDC",
      logo: "/usdclogo.png",
    },
  ];
  const [selectedGateway, setSelectedGateway] = useState(withdrawalGateways[0]);
  const [selectedcrypto, setselectedCrypto] = useState(withdrawalcrypto[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(withdrawalChains[0]);

  // Fetch withdraw limit when dialog opens
  useEffect(() => {
    if (open) {
      fetchWithdrawLimit();
    }
  }, [open]);

  const fetchWithdrawLimit = async () => {
    setLoadingLimit(true);
    try {
      const response = await fetchData("api/event/marketing/withdraw-limit");
      if (response.success && response.data) {
        setWithdrawLimit(response.data);
      }
    } catch (error) {
      console.error("Error fetching withdraw limit:", error);
    } finally {
      setLoadingLimit(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        gatewayDropdownRef.current &&
        !gatewayDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        cryptoDropdownRef.current &&
        !cryptoDropdownRef.current.contains(event.target)
      ) {
        cryptosetDropdownOpen(false);
      }
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target)
      ) {
        networksetDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [gatewayDropdownRef, cryptoDropdownRef, networkDropdownRef]);

  // const handleWithdraw = async () => {
  //   if (!address || !amount) return;
  //   setLoading(true);
  //   setWithdrawalError("");

  //   try {
  //     let endpoint;
  //     let payload = {
  //       address: address,
  //       amount: parseFloat(amount),
  //     };

  //     // Select the appropriate API endpoint based on the selected gateway
  //     switch (selectedGateway.id) {
  //       case "mileston":
  //         endpoint = "withdrawals/mileston";
  //         break;
  //       case "plisio":
  //         endpoint = "withdrawals/plisio";
  //         break;
  //       default:
  //         endpoint = "withdrawals/mileston";
  //     }

  //     const data = await postData(endpoint, payload);

  //     if (data.success) {
  //       if (onWithdraw) onWithdraw(address, amount, data.withdrawal);
  //       handleClose();
  //     } else {
  //       throw new Error(data.message || "Withdrawal failed");
  //     }
  //   } catch (error) {
  //     console.error("Withdrawal error:", error);
  //     setWithdrawalError(
  //       error.message || "Withdrawal failed. Please try again."
  //     );
  //     setShowRetryDialog(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleWithdraw = async () => {
    if (!address || !amount) return;

    // Validate minimum withdraw amount
    const amountNum = parseFloat(amount);
    if (amountNum < withdrawLimit.min_withdraw_amount) {
      setWithdrawalError(
        `Minimum withdrawal amount is $${withdrawLimit.min_withdraw_amount}. ${withdrawLimit.reason}`
      );
      return;
    }

    setWithdrawalError("");
    try {
      setLoading(true);
      const payload = {
        address: address,
        amount: amountNum,
        crypto: selectedcrypto.id,
        chain: selectedNetwork.id,
      };
      const response = await postData("api/wallet/withdraws", payload);
      if (response.success) {
        setShowRetryDialog(false);
        handleClose();
        // For example: showSuccessToast("Withdrawal request scheduled successfully");
      } else {
        console.log("response.message :>> ", response.message);
        setWithdrawalError(response.message || "Failed to withdrawal");
      }
    } catch (error) {
      console.error("Error scheduling withdrawal:", error);
      setWithdrawalError(
        error.message || "Failed to schedule withdrawal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAddress("");
    setAmount("");
    setShowRetryDialog(false);
    setWithdrawalError("");
    setWithdrawLimit({
      min_withdraw_amount: 10,
      reason: "Standard minimum withdraw limit",
      free_funds_claimed: false,
      has_previous_withdraws: false,
    });
    onClose();
  };

  // Helper for number input (prevents non-numeric, clamps to min/max)
  const handleNumberInput = (value, setter, min = 0, max = Infinity) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setter("");
    } else {
      setter(Math.max(min, Math.min(max, numValue)));
    }
  };
  const handleIncrement = (increment) => {
    setAmount((prev) => {
      const val = parseFloat(prev) || 0;
      return Math.max(0, val + increment);
    });
  };
  const [userData, setUserData] = useState({});
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUserProfile();
        console.log("response :>> ", response);
        if (response.success) {
          console.log("response :>> ", response);
          const { user } = response;
          setUserData({
            username: `@${user.username || "username"}`,
            joinDate: user.joinDate || "Unknown",
            profileImage: user.profileImage || "",
            Balance: response.stats.usable_wallet || 0,
          });
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          style: {
            borderRadius: "16px",
            padding: "12px",
            backgroundColor: isDark ? "#1A1B1E" : "#F5F5F5",
            width: "500px",
          },
        }}>
        <div className="relative px-3 py-1">
          {/* Logo and Title Section */}
          <div className="flex flex-col items-center mb-3">
            <img
              src={
                isDark
                  ? logoLight
                  : logoDark
              }
              alt="UNOMARKET"
              className="h-7"
            />
            <div
              className={`w-full h-px mt-3 ${isDark ? "bg-zinc-700" : "bg-gray-300"
                }`}></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gateway Selector */}
              <div>
                <div
                  className="text-base font-medium mb-1"
                  style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                  Select Gateway
                </div>
                <div ref={gatewayDropdownRef} className="relative w-full">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-[5px] ${isDark
                      ? "bg-zinc-800 text-white"
                      : "bg-white border border-gray-300 text-zinc-800"
                      }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-transparent">
                        {selectedGateway.logo ? (
                          <img
                            src={selectedGateway.logo}
                            alt={selectedGateway.name}
                            className={`w-7 h-7 ${selectedGateway.id === "mileston" ||
                              selectedGateway.id === "UNOMARKET"
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
                    className={`absolute left-0 right-0 mt-1 w-full overflow-hidden rounded-[5px] shadow-lg z-10 transition-all duration-300 ease-in-out ${isDark
                      ? "bg-zinc-800 text-white"
                      : "bg-white border border-gray-300 text-zinc-800"
                      } ${dropdownOpen
                        ? "max-h-60 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 translate-y-[-8px] pointer-events-none"
                      }`}>
                    <div
                      className={`transition-opacity duration-200 ${dropdownOpen ? "opacity-100" : "opacity-0"
                        }`}>
                      {/* Primary gateway(s) first (UNOMARKET) */}
                      {withdrawalGateways
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
                            <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-transparent">
                              {gateway.logo ? (
                                <img
                                  src={gateway.logo}
                                  alt={gateway.name}
                                  className={`w-7 h-7 ${gateway.id === "mileston" ||
                                    gateway.id === "UNOMARKET"
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
                                {gateway.name}
                              </div>
                              <div className="text-xs opacity-70">
                                {gateway.description}
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Divider + small title for third-party gateways */}
                      {withdrawalGateways.some((g) => g.id !== "UNOMARKET") && (
                        <div className="px-3 pt-2">
                          <div
                            className={`h-px ${isDark ? "bg-zinc-700" : "bg-gray-200"
                              } mb-2`}
                          />
                          <div
                            className={`text-[11px] font-medium mb-2 ${isDark ? "text-zinc-400" : "text-zinc-600"
                              }`}>
                            Third-party gateways (additional fees may apply)
                          </div>
                        </div>
                      )}

                      {/* Render other gateways */}
                      {withdrawalGateways
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
                            <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-transparent">
                              {gateway.logo ? (
                                <img
                                  src={gateway.logo}
                                  alt={gateway.name}
                                  className={`w-7 h-7 ${gateway.id === "mileston" ||
                                    gateway.id === "UNOMARKET"
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
                                {gateway.name}
                              </div>
                              <div className="text-xs opacity-70">
                                {gateway.description}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="text-base font-medium mb-1"
                  style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                  Address
                </div>
                <div
                  className={`w-full rounded-[5px] px-3 py-2 flex items-center ${isDark
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "bg-white border border-gray-300 text-zinc-800"
                    }`}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full bg-transparent outline-none text-base [appearance:textfield] ${isDark ? "text-white" : "text-zinc-800"
                      }`}
                    placeholder="0x1234..."
                    style={{ border: "none" }}
                  />
                </div>
              </div>

              {/* Show crypto and network fields only for UNOMARKET Gateway */}
              {selectedGateway.id === "UNOMARKET" && (
                <>
                  {/* cryptoselect Field */}
                  <div>
                    <div
                      className="text-base font-medium mb-1"
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                      Avaialble Tokens
                    </div>
                    <div ref={cryptoDropdownRef} className="relative w-full">
                      <button
                        onClick={() =>
                          cryptosetDropdownOpen(!cryptodropdownOpen)
                        }
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-[5px] ${isDark
                          ? "bg-zinc-800 text-white"
                          : "bg-white border border-gray-300 text-zinc-800"
                          }`}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
                            {selectedcrypto.logo ? (
                              <img
                                src={selectedcrypto.logo}
                                alt={selectedcrypto.name}
                                className="w-7 h-7 object-contain"
                              />
                            ) : (
                              <div
                                className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"
                                  } rounded`}></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {selectedcrypto.name}
                            </div>
                            <div className="text-xs opacity-70">
                              {selectedcrypto.description}
                            </div>
                          </div>
                        </div>
                        <FiChevronDown
                          className={`transition-transform duration-300 ${cryptodropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      <div
                        className={`absolute left-0 right-0 mt-1 w-full overflow-hidden rounded-[5px] shadow-lg z-10 transition-all duration-300 ease-in-out ${isDark
                          ? "bg-zinc-800 text-white"
                          : "bg-white border border-gray-300 text-zinc-800"
                          } ${cryptodropdownOpen
                            ? "max-h-60 opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 translate-y-[-8px] pointer-events-none"
                          }`}>
                        <div
                          className={`transition-opacity duration-200 ${cryptodropdownOpen ? "opacity-100" : "opacity-0"
                            }`}>
                          {withdrawalcrypto.map((crypto) => (
                            <div
                              key={crypto.id}
                              onClick={() => {
                                setselectedCrypto(crypto);
                                cryptosetDropdownOpen(false);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedcrypto.id === crypto.id
                                ? isDark
                                  ? "bg-zinc-700"
                                  : "bg-gray-100"
                                : isDark
                                  ? "hover:bg-zinc-700"
                                  : "hover:bg-gray-100"
                                }`}>
                              <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
                                {crypto.logo ? (
                                  <img
                                    src={crypto.logo}
                                    alt={crypto.name}
                                    className="w-7 h-7 object-contain"
                                  />
                                ) : (
                                  <div
                                    className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"
                                      } rounded`}></div>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm">
                                  {crypto.name}
                                </div>
                                <div className="text-xs opacity-70">
                                  {crypto.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* network Field */}
                  <div>
                    <div
                      className="text-base font-medium mb-1"
                      style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                      Available Chains
                    </div>
                    <div ref={networkDropdownRef} className="relative w-full">
                      <button
                        onClick={() =>
                          networksetDropdownOpen(!networkdropdownOpen)
                        }
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-[5px] ${isDark
                          ? "bg-zinc-800 text-white"
                          : "bg-white border border-gray-300 text-zinc-800"
                          }`}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-transparent">
                            {selectedNetwork.logo ? (
                              <img
                                src={selectedNetwork.logo}
                                alt={selectedNetwork.name}
                                className="w-7 h-7 object-contain"
                              />
                            ) : (
                              <div
                                className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"
                                  } rounded`}></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {selectedNetwork.name}
                            </div>
                            <div className="text-xs opacity-70">
                              {selectedNetwork.description}
                            </div>
                          </div>
                        </div>
                        <FiChevronDown
                          className={`transition-transform duration-300 ${networkdropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      <div
                        className={`absolute left-0 right-0 mt-1 w-full overflow-hidden rounded-[5px] shadow-lg z-10 transition-all duration-300 ease-in-out ${isDark
                          ? "bg-zinc-800 text-white"
                          : "bg-white border border-gray-300 text-zinc-800"
                          } ${networkdropdownOpen
                            ? "max-h-60 opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 translate-y-[-8px] pointer-events-none"
                          }`}>
                        <div
                          className={`transition-opacity duration-200 ${networkdropdownOpen ? "opacity-100" : "opacity-0"
                            }`}>
                          {withdrawalChains.map((network) => (
                            <div
                              key={network.id}
                              onClick={() => {
                                setSelectedNetwork(network);
                                networksetDropdownOpen(false);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedNetwork.id === network.id
                                ? isDark
                                  ? "bg-zinc-700"
                                  : "bg-gray-100"
                                : isDark
                                  ? "hover:bg-zinc-700"
                                  : "hover:bg-gray-100"
                                }`}>
                              <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-transparent">
                                {network.logo ? (
                                  <img
                                    src={network.logo}
                                    alt={network.name}
                                    className="w-7 h-7 object-contain"
                                  />
                                ) : (
                                  <div
                                    className={`w-5 h-5 ${isDark ? "bg-zinc-700" : "bg-gray-200"
                                      } rounded`}></div>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm">
                                  {network.name}
                                </div>
                                <div className="text-xs opacity-70">
                                  {network.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Amount Field */}
              <div>
                <div
                  className="flex justify-between items-center text-base font-medium mb-1"
                  style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                  <span>Enter Amount</span>
                  <span>
                    Avl Balance: {Number(userData?.Balance).toFixed(2)}
                  </span>
                </div>

                {/* Minimum withdrawal info */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}>
                    Minimum withdrawal: ${withdrawLimit.min_withdraw_amount}
                  </span>
                  {loadingLimit && (
                    <span className="w-4 h-4 border border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                  )}
                </div>

                <div
                  className={`w-full rounded-[5px] px-3 py-2 flex items-center ${isDark
                    ? "bg-zinc-800 text-white border border-zinc-700"
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
                    onChange={(e) =>
                      handleNumberInput(e.target.value, setAmount, 0)
                    }
                    className={`w-full bg-transparent outline-none text-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isDark ? "text-white" : "text-zinc-800"
                      }`}
                    placeholder="0.00"
                    style={{ border: "none" }}
                    min="0"
                    step="1"
                  />
                </div>

                {/* Show additional info if user has claimed free funds */}
                {withdrawLimit.free_funds_claimed && (
                  <div
                    className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}>
                    {withdrawLimit.reason}
                  </div>
                )}
              </div>
              {withdrawalError && (
                <p className="text-red-600">{withdrawalError}</p>
              )}

              {/* Withdraw Button */}
              <div className="pt-2">
                <button
                  onClick={handleWithdraw}
                  disabled={
                    loading ||
                    !address ||
                    !amount ||
                    parseFloat(amount) < withdrawLimit.min_withdraw_amount
                  }
                  className={`w-full px-3 py-2.5 text-lg font-semibold rounded-[5px] bg-[#FF532A]  text-white hover:bg-[#FF532A]  transition-colors cursor-pointer ${loading ||
                    !address ||
                    !amount ||
                    parseFloat(amount) < withdrawLimit.min_withdraw_amount
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                    }`}>
                  {loading ? "Processing...":parseFloat(amount) < withdrawLimit.min_withdraw_amount?`Minimum ${withdrawLimit.min_withdraw_amount}$ `: "Withdraw"}
                </button>
                <div className="text-right mt-1">
                  <span
                    className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"
                      }`}>
                    Terms & Conditions Apply
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Retry Dialog */}
      <Dialog
        open={showRetryDialog}
        onClose={() => setShowRetryDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: "16px",
            padding: "16px",
            backgroundColor: isDark ? "#1A1B1E" : "#F5F5F5",
            width: "400px",
          },
        }}>
        <div className="relative px-3 py-1">
          <div className="flex flex-col items-center mb-4">
            <img
              src={
                isDark
                  ? "/UNOMARKET-new-logo-dark.png"
                  : "/UNOMARKET-new-logo-light.png"
              }
              alt="UNOMARKET"
              className="h-7 mb-3"
            />
            <div
              className={`w-full h-px ${isDark ? "bg-zinc-700" : "bg-gray-300"
                }`}></div>
          </div>

          <div className="text-center space-y-4">
            <div
              className="text-lg font-semibold"
              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
              Withdrawal Failed
            </div>

            <div
              className="text-sm"
              style={{ color: isDark ? "#CCCCCC" : "#666666" }}>
              Would you like to try again later or schedule this withdrawal for
              processing?
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRetryDialog(false)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-[5px] border transition-colors ${isDark
                  ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}>
                Try Later
              </button>

              {/* <button
                onClick={handleScheduleForLater}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-[5px] bg-[#4169E1] text-white hover:bg-blue-700 transition-colors">
                {loading ? "Scheduling..." : "Schedule for Later"}
              </button> */}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WithdrawDialog;
