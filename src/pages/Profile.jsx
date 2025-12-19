import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
// Navbar removed - now handled globally in App.jsx
import { useToast } from "../context/ToastContext";
import { fetchData, postData } from "../services/apiServices";
import { Slider } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DepositDialog from "../components/payments/DepositDialog";
import WithdrawDialog from "../components/payments/WithdrawDialog";
import ProfitLossChart from "../components/ProfitLossChart";
import HowPlay from "../components/HowPlay";

// API functions that use apiServices directly
const fetchUserProfile = async () => {
  try {
    return await fetchData("api/event/user");
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return { success: false, message: error.message };
  }
};

const fetchPositions = async (page = 1, limit = 10) => {
  try {
    const response = await fetchData(
      `api/event/positions?page=${page}&limit=${limit}`
    );
    return response; // Return the entire response which now has positions and pagination
  } catch (error) {
    console.error("Error in fetchPositions:", error);
    return {
      success: false,
      positions: [],
      pagination: { totalPositions: 0, currentPage: 1, totalPages: 1 },
    };
  }
};

const fetchOpenOrders = async (page = 1, limit = 10) => {
  try {
    const response = await fetchData(
      `api/event/orders/open?page=${page}&limit=${limit}`
    );
    return response; // Return the entire response which now has openOrders and pagination
  } catch (error) {
    console.error("Error in fetchOpenOrders:", error);
    return {
      success: false,
      openOrders: [],
      pagination: { totalOrders: 0, currentPage: 1, totalPages: 1 },
    };
  }
};

const fetchTradeHistory = async (page = 1, limit = 10) => {
  try {
    return await fetchData(
      `api/event/trades/history?page=${page}&limit=${limit}`
    );
  } catch (error) {
    console.error("Error in fetchTradeHistory:", error);
    return {
      success: false,
      history: [],
      pagination: { totalContracts: 0, currentPage: 1, totalPages: 1 },
    };
  }
};

const fetchActivity = async (page = 1, limit = 10) => {
  try {
    return await fetchData(
      `api/event/user/activity?page=${page}&limit=${limit}`
    );
  } catch (error) {
    console.error("Error in fetchActivity:", error);
    return {
      success: false,
      activity: [],
      pagination: { totalTransactions: 0, currentPage: 1, totalPages: 1 },
    };
  }
};

const cancelOrder = async (orderId) => {
  try {
    return await postData(`api/event/orders/${orderId}/cancel`, {});
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return { success: false, message: error.message };
  }
};

const sellPosition = async (position, quantity) => {
  try {
    // Call the sell API endpoint
    const response = await fetch(
      "https://unoapi.unitythink.com/orders/market/sell",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: position.eventId,
          market_id: position.marketId,
          side: position.side,
          shares: quantity,
        }),
      }
    );

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Position sold successfully",
      data,
    };
  } catch (error) {
    console.error("Error in sellPosition:", error);
    return {
      success: false,
      message: error.message || "Failed to sell position",
    };
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  const [showMethod, setShowMethod] = useState(false);

  const [playModal, setPlayModal] = useState(false);

  const handlePlayModal = () => {
    setPlayModal(!playModal);
    setShowMethod(true);
  };

  const [userData, setUserData] = useState({
    username: "@username",
    joinDate: "Mar 2025",
    profileImage: "",
  });

  const [stats, setStats] = useState({
    portfolio: 0,
    profitLoss: 0,
    volumeTraded: 0,
    wallet: 0,
    profitLossGraph: [],
  });
  const [positions, setPositions] = useState([]);
  const [positionsPagination, setPositionsPagination] = useState({
    totalPositions: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loadingMorePositions, setLoadingMorePositions] = useState(false);
  const [hasMorePositions, setHasMorePositions] = useState(true);
  const [openOrders, setOpenOrders] = useState([]);
  const [openOrdersPagination, setOpenOrdersPagination] = useState({
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loadingMoreOpenOrders, setLoadingMoreOpenOrders] = useState(false);
  const [hasMoreOpenOrders, setHasMoreOpenOrders] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    totalContracts: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityPagination, setActivityPagination] = useState({
    totalTransactions: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loadingMoreActivity, setLoadingMoreActivity] = useState(false);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Positions");
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isHeaderContentVisible, setIsHeaderContentVisible] = useState(false);

  // Confirmation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Sell dialog state
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(150);
  const [sellLoading, setSellLoading] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(93);
  const sliderRef = useRef(null);
  const sellDialogRef = useRef(null);
  const MAX_QUANTITY = 4000;

  // Liquidity error dialog state
  const [showLiquidityErrorDialog, setShowLiquidityErrorDialog] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [remainingShares, setRemainingShares] = useState(0);

  // Global toast
  const { showSuccessToast, showErrorToast } = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Handler for withdraw action
  const handleWithdraw = async (address, amount) => {
    setWithdrawLoading(true);
    try {
      // TODO: Replace with your actual withdraw API call
      // Example:
      // const response = await postData('withdraw', { address, amount });
      // if (response.success) {
      //   showSuccessToast('Withdrawal request submitted!');
      //   setWithdrawOpen(false);
      // } else {
      //   showErrorToast(response.message || 'Withdrawal failed');
      // }
      showSuccessToast("Withdrawal request submitted!");
      setWithdrawOpen(false);
    } catch (error) {
      showErrorToast("Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const tabs = [
    { name: "Positions", width: "76px", indicatorWidth: "76px" },
    { name: "Open Orders", width: "107px", indicatorWidth: "107px" },
    { name: "History", width: "59px", indicatorWidth: "59px" },
    { name: "Activity", width: "63px", indicatorWidth: "63px" },
  ];

  // Calculate indicator position based on active tab
  const getIndicatorPosition = () => {
    let position = 0;
    for (let i = 0; i < tabs.findIndex((tab) => tab.name === activeTab); i++) {
      position += parseInt(tabs[i].width.replace("px", "")) + 22; // Add width + spacing
    }
    return position;
  };

  // Skeleton loader for Positions tab
  const renderPositionsSkeleton = () => (
    <div>
      {/* Header row for desktop */}
      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6 mb-2">
        <div
          className={`text-left ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Market
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Latest
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Initial Value
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Current Avg
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Action
        </div>
      </div>

      {/* Skeleton rows */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`py-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
          } animate-pulse`}>
          {/* Mobile view skeleton */}
          <div className="block md:hidden">
            <div className="mb-2">
              <div className="flex">
                <div
                  className={`w-12 h-12 rounded-md mr-3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex flex-col flex-1">
                  <div
                    className={`h-4 w-3/4 rounded mb-2 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div className="flex gap-2">
                    <div
                      className={`h-5 w-12 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                    <div
                      className={`h-5 w-16 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-3 w-12 rounded mb-1 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-4 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              ))}
            </div>
            <div
              className={`h-8 w-16 rounded ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-200"
              }`}></div>
          </div>

          {/* Desktop view skeleton */}
          <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6">
            <div className="flex items-center text-left">
              <div
                className={`w-12 h-12 rounded-md mr-3 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div className="flex flex-col flex-1">
                <div
                  className={`h-4 w-48 rounded mb-2 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex gap-2">
                  <div
                    className={`h-5 w-12 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-5 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`h-4 w-12 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`h-4 w-16 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`h-4 w-20 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`h-8 w-16 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for Open Orders tab
  const renderOpenOrdersSkeleton = () => (
    <div>
      {/* Header row for desktop */}
      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6 mb-2">
        <div
          className={`text-left ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Market
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Price
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Pending
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Total
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Expiration
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Action
        </div>
      </div>

      {/* Skeleton rows */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`py-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
          } animate-pulse`}>
          {/* Mobile view skeleton */}
          <div className="block md:hidden">
            <div className="mb-2">
              <div className="flex">
                <div
                  className={`w-12 h-12 rounded-md mr-3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex flex-col flex-1">
                  <div
                    className={`h-4 w-3/4 rounded mb-2 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div className="flex gap-2">
                    <div
                      className={`h-5 w-12 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                    <div
                      className={`h-5 w-16 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-3 w-12 rounded mb-1 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-4 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              ))}
            </div>
            <div
              className={`h-8 w-16 rounded ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-200"
              }`}></div>
          </div>

          {/* Desktop view skeleton */}
          <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6">
            <div className="flex items-center text-left">
              <div
                className={`w-12 h-12 rounded-md mr-3 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div className="flex flex-col flex-1">
                <div
                  className={`h-4 w-48 rounded mb-2 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex gap-2">
                  <div
                    className={`h-5 w-12 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-5 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className={`h-4 w-16 rounded ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for History tab
  const renderHistorySkeleton = () => (
    <div>
      {/* Header row for desktop */}
      <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_minmax(60px,auto)_minmax(60px,auto)_minmax(70px,auto)_minmax(70px,auto)] gap-1 md:gap-3 mb-2">
        <div
          className={`text-left ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Market
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Type
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Buy
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Amount
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Date
        </div>
      </div>

      {/* Skeleton rows */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`py-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
          } animate-pulse`}>
          {/* Mobile view skeleton */}
          <div className="block md:hidden">
            <div className="mb-2">
              <div className="flex">
                <div
                  className={`w-12 h-12 rounded-md mr-3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex flex-col flex-1">
                  <div
                    className={`h-4 w-3/4 rounded mb-2 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div className="flex gap-2">
                    <div
                      className={`h-5 w-12 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                    <div
                      className={`h-5 w-16 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                    <div
                      className={`h-5 w-20 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-3 w-12 rounded mb-1 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-4 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop view skeleton */}
          <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_minmax(60px,auto)_minmax(60px,auto)_minmax(70px,auto)_minmax(70px,auto)] gap-1 md:gap-3">
            <div className="flex items-center text-left">
              <div
                className={`w-12 h-12 rounded-md mr-3 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div className="flex flex-col flex-1">
                <div
                  className={`h-4 w-48 rounded mb-2 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex gap-2">
                  <div
                    className={`h-5 w-12 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-5 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-5 w-20 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className={`h-4 w-16 rounded ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for Activity tab
  const renderActivitySkeleton = () => (
    <div>
      {/* Header row for desktop */}
      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(120px,auto)_minmax(120px,auto)_minmax(120px,auto)] gap-2 md:gap-6 mb-2">
        <div
          className={`text-left ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Market
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Type
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Amount
        </div>
        <div
          className={`text-center ${
            isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
          } text-base font-normal`}>
          Date
        </div>
      </div>

      {/* Skeleton rows */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`py-4 border-b ${
            isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
          } animate-pulse`}>
          {/* Mobile view skeleton */}
          <div className="block md:hidden">
            <div className="mb-2">
              <div className="flex">
                <div
                  className={`w-12 h-12 rounded-md mr-3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex flex-col flex-1">
                  <div
                    className={`h-4 w-3/4 rounded mb-2 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div className="flex gap-2">
                    <div
                      className={`h-5 w-12 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                    <div
                      className={`h-5 w-16 rounded ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      }`}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-3 w-12 rounded mb-1 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-4 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop view skeleton */}
          <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(120px,auto)_minmax(120px,auto)_minmax(120px,auto)] gap-2 md:gap-6">
            <div className="flex items-center text-left">
              <div
                className={`w-12 h-12 rounded-md mr-3 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div className="flex flex-col flex-1">
                <div
                  className={`h-4 w-48 rounded mb-2 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
                <div className="flex gap-2">
                  <div
                    className={`h-5 w-12 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                  <div
                    className={`h-5 w-16 rounded ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    }`}></div>
                </div>
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className={`h-4 w-16 rounded ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  }`}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for Profile Header and Stats
  const renderProfileHeaderSkeleton = () => (
    <div className="animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
        {/* Profile Image and Info Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div
            className={`w-24 h-24 sm:w-[108px] sm:h-[108px] ${
              isDarkMode ? "bg-zinc-800" : "bg-gray-200"
            } rounded-full`}></div>

          {/* User Info Skeleton */}
          <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
            <div
              className={`h-8 sm:h-10 w-48 rounded ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-200"
              }`}></div>
            <div
              className={`h-5 sm:h-6 w-32 rounded ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-200"
              }`}></div>
            {/* Buttons Skeleton */}
            <div className="flex gap-2">
              <div
                className={`h-10 w-20 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div
                className={`h-10 w-24 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button Skeleton */}
        <div
          className={`h-10 w-28 rounded ${
            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
          } mt-2 sm:mt-0`}></div>
      </div>

      {/* Stats Boxes Skeleton */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`rounded-xl ${
              isDarkMode
                ? "border-zinc-800 bg-[#1A1B1E]"
                : "border-[#2b2d2e]/50 bg-[#f7f7f7]"
            } border p-4 flex flex-col justify-between ${
              isDarkMode
                ? "shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                : "shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
            }`}>
            <div
              className={`w-9 h-9 ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-200"
              } rounded-full`}></div>
            <div>
              <div
                className={`h-3 w-16 rounded mt-3 mb-2 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
              <div
                className={`h-5 w-20 rounded ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setIsHeaderContentVisible(false);

      try {
        const response = await fetchUserProfile();
        if (response.success) {
          const { user, stats } = response;

          setUserData({
            username: user.name || user.username || "username",
            joinDate: user.joinDate || "Unknown",
            profileImage: user.profileImage || "",
          });

          setStats({
            portfolio: stats.portfolio || 0,
            profitLoss: stats.profitLoss || 0,
            volumeTraded: stats.volumeTraded || 0,
            wallet: stats.wallet || 0,
            profitLossGraph: stats.profitLossGraph || [],
          });
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setIsHeaderContentVisible(true);
        }, 50);
      }
    };

    fetchUserData();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchTabData = async () => {
      setTabLoading(true);
      setIsContentVisible(false);
      try {
        switch (activeTab) {
          case "Positions":
            const positionsData = await fetchPositions(1, 10); // Reset to first page
            if (positionsData.success) {
              setPositions(positionsData.positions || []);
              setPositionsPagination(
                positionsData.pagination || {
                  totalPositions: 0,
                  currentPage: 1,
                  totalPages: 1,
                }
              );
              setHasMorePositions(
                positionsData.pagination?.currentPage <
                  positionsData.pagination?.totalPages
              );
            }
            break;

          case "Open Orders":
            const ordersData = await fetchOpenOrders(1, 10); // Reset to first page
            if (ordersData.success) {
              setOpenOrders(ordersData.openOrders || []);
              setOpenOrdersPagination(
                ordersData.pagination || {
                  totalOrders: 0,
                  currentPage: 1,
                  totalPages: 1,
                }
              );
              setHasMoreOpenOrders(
                ordersData.pagination?.currentPage <
                  ordersData.pagination?.totalPages
              );
            }
            break;

          case "History":
            const historyData = await fetchTradeHistory(1, 10); // Reset to first page
            if (historyData.success) {
              setHistory(historyData.history || []);
              setHistoryPagination(
                historyData.pagination || {
                  totalContracts: 0,
                  currentPage: 1,
                  totalPages: 1,
                }
              );
              setHasMoreHistory(
                historyData.pagination?.currentPage <
                  historyData.pagination?.totalPages
              );
            }
            break;

          case "Activity":
            const activityData = await fetchActivity(1, 10); // Reset to first page
            if (activityData.success) {
              setActivity(activityData.activity || []);
              setActivityPagination(
                activityData.pagination || {
                  totalTransactions: 0,
                  currentPage: 1,
                  totalPages: 1,
                }
              );
              setHasMoreActivity(
                activityData.pagination?.currentPage <
                  activityData.pagination?.totalPages
              );
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setTabLoading(false);
        // Add fade-in delay after data loads
        setTimeout(() => {
          setIsContentVisible(true);
        }, 50);
      }
    };

    fetchTabData();
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  // Function to load more positions
  const loadMorePositions = async () => {
    if (loadingMorePositions || !hasMorePositions) return;

    setLoadingMorePositions(true);
    try {
      const nextPage = positionsPagination.currentPage + 1;
      const positionsData = await fetchPositions(nextPage, 10);

      if (positionsData.success) {
        // Append new positions to existing ones
        setPositions((prevPositions) => [
          ...prevPositions,
          ...(positionsData.positions || []),
        ]);
        setPositionsPagination(positionsData.pagination || positionsPagination);
        setHasMorePositions(
          positionsData.pagination?.currentPage <
            positionsData.pagination?.totalPages
        );
      }
    } catch (error) {
      console.error("Error loading more positions:", error);
      showErrorToast("Failed to load more positions");
    } finally {
      setLoadingMorePositions(false);
    }
  };

  // Function to load more open orders
  const loadMoreOpenOrders = async () => {
    if (loadingMoreOpenOrders || !hasMoreOpenOrders) return;

    setLoadingMoreOpenOrders(true);
    try {
      const nextPage = openOrdersPagination.currentPage + 1;
      const ordersData = await fetchOpenOrders(nextPage, 10);

      if (ordersData.success) {
        // Append new orders to existing ones
        setOpenOrders((prevOrders) => [
          ...prevOrders,
          ...(ordersData.openOrders || []),
        ]);
        setOpenOrdersPagination(ordersData.pagination || openOrdersPagination);
        setHasMoreOpenOrders(
          ordersData.pagination?.currentPage < ordersData.pagination?.totalPages
        );
      }
    } catch (error) {
      console.error("Error loading more open orders:", error);
      showErrorToast("Failed to load more open orders");
    } finally {
      setLoadingMoreOpenOrders(false);
    }
  };

  // Function to load more history
  const loadMoreHistory = async () => {
    if (loadingMoreHistory || !hasMoreHistory) return;

    setLoadingMoreHistory(true);
    try {
      const nextPage = historyPagination.currentPage + 1;
      const historyData = await fetchTradeHistory(nextPage, 10);

      if (historyData.success) {
        // Append new history to existing ones
        setHistory((prevHistory) => [
          ...prevHistory,
          ...(historyData.history || []),
        ]);
        setHistoryPagination(historyData.pagination || historyPagination);
        setHasMoreHistory(
          historyData.pagination?.currentPage <
            historyData.pagination?.totalPages
        );
      }
    } catch (error) {
      console.error("Error loading more history:", error);
      showErrorToast("Failed to load more history");
    } finally {
      setLoadingMoreHistory(false);
    }
  };

  // Function to load more activity
  const loadMoreActivity = async () => {
    if (loadingMoreActivity || !hasMoreActivity) return;

    setLoadingMoreActivity(true);
    try {
      const nextPage = activityPagination.currentPage + 1;
      const activityData = await fetchActivity(nextPage, 10);

      if (activityData.success) {
        // Append new activity to existing ones
        setActivity((prevActivity) => [
          ...prevActivity,
          ...(activityData.activity || []),
        ]);
        setActivityPagination(activityData.pagination || activityPagination);
        setHasMoreActivity(
          activityData.pagination?.currentPage <
            activityData.pagination?.totalPages
        );
      }
    } catch (error) {
      console.error("Error loading more activity:", error);
      showErrorToast("Failed to load more activity");
    } finally {
      setLoadingMoreActivity(false);
    }
  };

  // Main page scroll handler for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200; // Trigger 200px before bottom

      if (isNearBottom) {
        if (
          activeTab === "Positions" &&
          hasMorePositions &&
          !loadingMorePositions
        ) {
          loadMorePositions();
        } else if (
          activeTab === "Open Orders" &&
          hasMoreOpenOrders &&
          !loadingMoreOpenOrders
        ) {
          loadMoreOpenOrders();
        } else if (
          activeTab === "History" &&
          hasMoreHistory &&
          !loadingMoreHistory
        ) {
          loadMoreHistory();
        } else if (
          activeTab === "Activity" &&
          hasMoreActivity &&
          !loadingMoreActivity
        ) {
          loadMoreActivity();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    hasMorePositions,
    loadingMorePositions,
    hasMoreOpenOrders,
    loadingMoreOpenOrders,
    hasMoreHistory,
    loadingMoreHistory,
    hasMoreActivity,
    loadingMoreActivity,
  ]);

  // Handle navigation to market details page with proper URL structure
  const handleMarketNavigation = (e, position) => {
    // If clicking the Sell button, don't navigate to market page
    if (e.target.closest(".bg-\\[\\#4169e1\\]")) {
      e.stopPropagation();
      return;
    }

    // Prevent default behavior
    e.preventDefault();

    // Extract needed data from position
    const eventId = position.eventId;
    const marketId = position.marketId;
    const selection = position.side.toLowerCase();

    // Format: /market/details/eventId?marketId=marketId&selection=yes
    navigate(
      `/market/details/${eventId}?marketId=${marketId}&selection=${selection}`
    );
  };

  // Handle navigation to market details page from order rows
  const handleOrderNavigation = (e, order) => {
    // If clicking the Cancel button, don't navigate to market page
    if (e.target.closest(".bg-\\[\\#d82525\\]")) {
      e.stopPropagation();
      return;
    }

    // Prevent default behavior
    e.preventDefault();

    // Extract needed data from order
    const eventId = order.eventId;
    const marketId = order.marketId;
    const selection = order.side.toLowerCase();

    // Format: /market/details/eventId?marketId=marketId&selection=yes/no
    navigate(
      `/market/details/${eventId}?marketId=${marketId}&selection=${selection}`
    );
  };

  // Handle cancel order button click
  const handleCancelOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelDialog(true);
  };

  // Handle cancel order confirmation
  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;

    setCancelLoading(true);
    const response = await cancelOrder(selectedOrderId);
    setCancelLoading(false);

    if (response.success) {
      // Remove the cancelled order from the UI
      setOpenOrders(openOrders.filter((order) => order.id !== selectedOrderId));
      setShowCancelDialog(false);
      setSelectedOrderId(null);

      // Show success toast
      showSuccessToast("Order canceled successfully");
    } else {
      // Handle error - show error toast
      showErrorToast(response.message || "Failed to cancel order");
    }
  };

  // Handle cancel dialog close
  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setSelectedOrderId(null);
  };

  // Handle sell button click
  const handleSellClick = (e, position) => {
    // Prevent event bubbling to parent (the row click handler)
    e.stopPropagation();

    setSelectedPosition(position);
    // Set default quantity to half of the owned shares or 150, whichever is less
    const defaultQuantity = Math.min(Math.floor(position.shares / 2), 150);
    setSellQuantity(defaultQuantity);
    setShowSellDialog(true);
  };

  // Handle click outside of sell dialog
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sellDialogRef.current &&
        !sellDialogRef.current.contains(event.target) &&
        showSellDialog
      ) {
        handleSellDialogClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSellDialog]);

  // Handle escape key for sell dialog
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showSellDialog) {
        handleSellDialogClose();
      }
    };

    if (showSellDialog) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showSellDialog]);

  // Handle escape key for cancel order dialog
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showCancelDialog) {
        handleCancelDialogClose();
      }
    };

    if (showCancelDialog) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showCancelDialog]);

  // Handle sell quantity change
  const handleQuantityIncrease = () => {
    const maxShares = selectedPosition?.shares || MAX_QUANTITY;
    setSellQuantity((prevQuantity) => Math.min(maxShares, prevQuantity + 10));
  };

  const handleQuantityDecrease = () => {
    setSellQuantity((prevQuantity) => Math.max(10, prevQuantity - 10));
  };

  // Handle sell confirmation
  const handleConfirmSell = async () => {
    if (!selectedPosition) return;

    setSellLoading(true);

    try {
      const response = await postData("api/event/orders/market/sell", {
        event_id: selectedPosition.eventId,
        market_id: selectedPosition.marketId,
        side: selectedPosition.side,
        shares: sellQuantity,
      });

      if (response.success) {
        // Update positions by reducing shares or removing position
        const updatedPositions = positions
          .map((pos) => {
            if (pos.id === selectedPosition.id) {
              // If all shares were sold, remove position
              if (pos.shares <= sellQuantity) {
                return null;
              }
              // Otherwise reduce the shares count
              return {
                ...pos,
                shares: pos.shares - sellQuantity,
              };
            }
            return pos;
          })
          .filter(Boolean); // Remove null entries

        setPositions(updatedPositions);

        // Update pagination count if a position was completely removed
        if (updatedPositions.length < positions.length) {
          setPositionsPagination((prev) => ({
            ...prev,
            totalPositions: Math.max(0, prev.totalPositions - 1),
          }));
        }

        // Show success toast
        showSuccessToast("Position sold successfully");

        // Close the dialog
        setShowSellDialog(false);
        setSelectedPosition(null);
      } else {
        // Check for the specific liquidity error case
        if (
          response.message?.includes("Market order could only sell 0") ||
          (response.soldShares === 0 && response.remainingShares > 0)
        ) {
          // Show error message in toast
          showErrorToast(response.message);

          // Also show the liquidity error dialog
          setShowLiquidityErrorDialog(true);
          setErrorMessage(
            response.message ||
              "Insufficient market liquidity to execute your sell order."
          );
          setRemainingShares(response.remainingShares || sellQuantity);
        } else {
          // Show regular error toast for other types of errors
          showErrorToast(response.message || "Failed to sell position");

          // Close the dialog
          setShowSellDialog(false);
          setSelectedPosition(null);
        }
      }
    } catch (error) {
      console.error("Error selling position:", error);

      // Check if the error has a response with data
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Show the error message from the API in toast
        showErrorToast(errorData.message || "Failed to sell position");

        // Check for the specific liquidity error case from the API error response
        if (
          errorData.message?.includes("Market order could only sell 0") ||
          (errorData.soldShares === 0 && errorData.remainingShares > 0)
        ) {
          // Show the liquidity error dialog
          setErrorMessage(errorData.message);
          setRemainingShares(errorData.remainingShares || sellQuantity);
        } else {
          // Close the dialog for other errors
          setShowSellDialog(false);
          setSelectedPosition(null);
        }
      } else {
        // Fallback to a generic message if we can't extract a specific one
        showErrorToast("Error selling position. Please try again later.");

        // Close the dialog
        setShowSellDialog(false);
        setSelectedPosition(null);
      }
    } finally {
      setSellLoading(false);
    }
  };

  // Handle navigation to limit order page
  const handleNavigateToLimitOrder = (e) => {
    e.stopPropagation();
    if (!selectedPosition) return;

    const eventId = selectedPosition.eventId;
    const marketId = selectedPosition.marketId;
    const selection = selectedPosition.side.toLowerCase();

    // Close the dialog
    setShowSellDialog(false);
    setSelectedPosition(null);

    // Navigate to market detail page
    navigate(
      `/market/details/${eventId}?marketId=${marketId}&selection=${selection}`
    );
  };

  // Handle sell dialog close
  const handleSellDialogClose = () => {
    setShowSellDialog(false);
    setSelectedPosition(null);
  };

  // Handle slider drag
  const handleSliderChange = (e) => {
    if (!sliderRef.current || !selectedPosition) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const clickPosition = e.clientX - sliderRect.left;

    // Ensure position is within bounds
    const clampedPosition = Math.max(0, Math.min(clickPosition, sliderWidth));
    const percentage = clampedPosition / sliderWidth;

    // Use position shares as max quantity
    const maxShares = selectedPosition.shares;

    // Calculate new quantity (between 10 and maxShares)
    const newQuantity = Math.max(
      10,
      Math.min(maxShares, Math.round((percentage * maxShares) / 10) * 10)
    );
    setSellQuantity(newQuantity);

    // Update slider visual width
    setSliderWidth(clampedPosition);
  };

  // Update slider position when quantity changes
  useEffect(() => {
    if (sliderRef.current && showSellDialog && selectedPosition) {
      const sliderFullWidth = sliderRef.current.getBoundingClientRect().width;
      const maxShares = selectedPosition.shares;
      const newWidth = (sellQuantity / maxShares) * sliderFullWidth;
      setSliderWidth(newWidth);
    }
  }, [sellQuantity, showSellDialog, selectedPosition]);

  // Mouse move handler for dragging
  const handleMouseMove = (e) => {
    if (isSliderDragging) {
      handleSliderChange(e);
    }
  };

  // Mouse up handler to stop dragging
  const handleMouseUp = () => {
    setIsSliderDragging(false);
  };

  // State to track if slider is being dragged
  const [isSliderDragging, setIsSliderDragging] = useState(false);

  // Add and remove event listeners
  useEffect(() => {
    if (isSliderDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSliderDragging]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleEvent = () => {
    navigate("/events");
  };

  return (
    <div
      className={`  w-full min-h-screen mt-4  ${
        isDarkMode ? "bg-[#121212]" : " "
      }`}>
      <main className="container   mx-auto px-4 pt-20 md:pt-30 pb-24 max-w-[1000px] 2xl:max-w-[1330px] overflow-y-auto scrollbar-hide">
        <div className="mx-4 max-w-full">
          {/* Profile Header */}
          {isLoading ? (
            renderProfileHeaderSkeleton()
          ) : (
            <div
              className={`transition-opacity duration-600 ease-in-out ${
                isHeaderContentVisible ? "opacity-100" : "opacity-0"
              }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                {/* Profile Image and Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                  <div
                    className={`w-24 h-24 sm:w-[108px] sm:h-[108px] ${
                      isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                    } rounded-full overflow-hidden flex items-center justify-center`}>
                    <div className="w-full h-full rounded-full relative">
                      {!isImageLoaded && (
                        <div
                          className={`absolute inset-0 rounded-full ${
                            isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                          } animate-pulse`}
                        />
                      )}
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        style={{ display: isImageLoaded ? "block" : "none" }}
                        onLoad={() => setIsImageLoaded(true)}
                      />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                    <div
                      className={`${
                        isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-2xl sm:text-4xl font-semibold`}>
                      {userData.username}
                    </div>
                    <div
                      className={`${
                        isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                      } text-base sm:text-lg font-semibold`}>
                      {`Joined ${userData.joinDate}`}
                    </div>
                    {/* Add Deposit and withdraw buttons */}
                    <div className="flex gap-2">
                      {/* <div
                        className="rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#4169e1] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer bg-[#4169E1] hover:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)] transition-colors duration-300 ease-in-out hover:text-white"
                        onClick={() => setDepositOpen(true)}
                      >
                        <div className="px-[18px] py-[8px] justify-center text-white text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white">
                          Deposit
                        </div>
                      </div>
                      <div
                        className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#4169E1] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                          isDarkMode
                            ? "hover:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]"
                            : "hover:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]"
                        } transition-colors duration-300 ease-in-out hover:text-white`}
                        onClick={() => setWithdrawOpen(true)}
                      >
                        <div className="px-[18px] py-[8px] justify-center text-[#4169e1] text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white">
                          Withdraw
                        </div>
                      </div> */}



                           <div
                        className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#FF532A] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                          isDarkMode
                            ? "hover:bg-[#FF532A]"
                            : "hover:bg-[#FF532A]"
                        } transition-colors duration-300 ease-in-out hover:text-white`}
                      onClick={() => setDepositOpen(true)}>
                        <div
                          className={`px-[18px] py-[8px] justify-center  text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white ${
                            isDarkMode ? "text-[#fff]" : "text-[#000]"
                          }`}>
                        Deposit
                        </div>
                      </div>


                        <div
                        className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#FF532A] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                          isDarkMode
                            ? "hover:bg-[#FF532A]"
                            : "hover:bg-[#FF532A]"
                        } transition-colors duration-300 ease-in-out hover:text-white`}
                       onClick={() => setWithdrawOpen(true)}>
                        <div
                          className={`px-[18px] py-[8px] justify-center  text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white ${
                            isDarkMode ? "text-[#fff]" : "text-[#000]"
                          }`}>
                       Withdraw
                        </div>
                      </div>


                      <div
                        className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#FF532A] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                          isDarkMode
                            ? "hover:bg-[#FF532A]"
                            : "hover:bg-[#FF532A]"
                        } transition-colors duration-300 ease-in-out hover:text-white`}
                        onClick={handleEvent}>
                        <div
                          className={`px-[18px] py-[8px] justify-center  text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white ${
                            isDarkMode ? "text-[#fff]" : "text-[#000]"
                          }`}>
                          Events
                        </div>
                      </div>

                      <div
                        className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#FF532A] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                          isDarkMode
                            ? "hover:bg-[#FF532A]"
                            : "hover:bg-[#FF532A]"
                        } transition-colors duration-300 ease-in-out hover:text-white`}
                        onClick={handlePlayModal}>
                        <div
                          className={`px-[18px] py-[8px] justify-center  text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white ${
                            isDarkMode ? "text-[#fff]" : "text-[#000]"
                          }`}>
                          Change Mode
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div
                  onClick={handleEditProfile}
                  className={`rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#FF532A] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer ${
                    isDarkMode ? "hover:bg-[#FF532A]" : "hover:bg-[#FF532A]"
                  } transition-colors duration-300 ease-in-out hover:text-white`}>
                  <div
                    className={`px-[18px] py-[8px] justify-center  text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white ${
                      isDarkMode ? "text-[#fff]" : "text-[#000]"
                    }`}>
                    Edit Profile
                  </div>
                </div>
              </div>

              {/* Stats Boxes */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Box 1 - Dashboard */}
                <div
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer transform 
      ${isDarkMode ? "bg-[#1a1a1a] " : "bg-[#fff)] "} 
      shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
      hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]`}>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 
  bg-gradient-to-r from-[#FFAE35] via-[#FF532A] to-[#FF161A]`}>
                    <img
                      src="/soundbet Signal Graph Stats.svg"
                      alt="Signal Graph Stats"
                      width="22"
                      height="22"
                      className="filter invert brightness-0 contrast-100"
                    />
                  </div>
                  <div className="mt-4">
                    <div
                      className={`text-xs font-normal tracking-wide ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                      Dashboard
                    </div>
                    <div
                      className={`mt-1 text-xl font-semibold ${
                        isDarkMode ? "text-white" : "text-[#4169E1]"
                      }`}>
                      {`$${stats.portfolio.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Box 2 - Profit/Loss */}
                <div
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer transform 
      ${isDarkMode ? "bg-[#1a1a1a] " : "bg-[#fff)] "} 
      shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
      hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]`}>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 
  bg-gradient-to-r from-[#FFAE35] via-[#FF532A] to-[#FF161A]`}>
                    <img
                      src="/soundbet Trade Up.svg"
                      alt="Trade Up"
                      width="22"
                      height="22"
                      className="filter invert brightness-0 contrast-100"
                    />
                  </div>
                  <div className="mt-4">
                    <div
                      className={`text-xs font-normal tracking-wide ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                      Profit/Loss
                    </div>
                    <div
                      className={`mt-1 text-xl font-semibold ${
                        stats.profitLoss >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}>
                      {`$${stats.profitLoss.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Box 3 - Volume Traded */}
                <div
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer transform 
      ${isDarkMode ? "bg-[#1a1a1a] " : "bg-[#fff)] "} 
      shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
      hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]`}>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 
  bg-gradient-to-r from-[#FFAE35] via-[#FF532A] to-[#FF161A]`}>
                    <img
                      src="/Market Analysis Icon.svg"
                      alt="Market Analysis"
                      width="22"
                      height="22"
                      className="filter invert brightness-0 contrast-100"
                    />
                  </div>
                  <div className="mt-4">
                    <div
                      className={`text-xs font-normal tracking-wide ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                      Volume traded
                    </div>
                    <div
                      className={`mt-1 text-xl font-semibold ${
                        isDarkMode ? "text-white" : "text-[#4169E1]"
                      }`}>
                      {`$${stats.volumeTraded.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Box 4 - Wallet */}
                <div
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer transform 
      ${isDarkMode ? "bg-[#1a1a1a] " : "bg-[#fff)] "} 
      shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
      hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]`}>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 
  bg-gradient-to-r from-[#FFAE35] via-[#FF532A] to-[#FF161A]`}>
                    <img
                      src="/Solar Wallet.svg"
                      alt="Wallet"
                      width="22"
                      height="22"
                      className="filter invert brightness-0 contrast-100"
                    />
                  </div>

                  <div className="mt-4">
                    <div
                      className={`text-xs font-normal tracking-wide ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                      Wallet
                    </div>
                    <div
                      className={`mt-1 text-xl font-semibold ${
                        isDarkMode ? "text-white" : "text-[#4169E1]"
                      }`}>
                      {`$${stats.wallet.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs section */}
          <div className="mt-10">
            {/* Mobile tabs dropdown for small screens */}
            <div className="block md:hidden">
              <select
                className={`w-full p-2 ${
                  isDarkMode
                    ? "border-zinc-800 bg-[#1A1B1E] text-[#C5C5C5]"
                    : "border-[#2b2d2e]/30 bg-white text-[#2b2d2e]"
                } border rounded text-base font-medium`}
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}>
                {tabs.map((tab) => (
                  <option key={tab.name} value={tab.name}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop tabs */}
            <div className="hidden md:block mt-4">
              <div className="flex items-center gap-3">
                {tabs.map((tab) => (
                  <div
                    key={tab.name}
                    onClick={() => handleTabChange(tab.name)}
                    className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-300
            ${
              activeTab === tab.name
                ? "bg-gradient-to-r from-[#FFAE35] via-[#FF532A] to-[#FF161A] text-white shadow-md transform -translate-y-[1px]"
                : isDarkMode
                ? "text-[#C5C5C5]/70 hover:text-[#C5C5C5] hover:bg-zinc-800"
                : "text-[#2b2d2e]/70 hover:text-[#2b2d2e] hover:bg-gray-100"
            }`}>
                    {tab.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-4 md:mt-[12px]">
            {tabLoading && (
              <div>
                {activeTab === "Positions" && renderPositionsSkeleton()}
                {activeTab === "Open Orders" && renderOpenOrdersSkeleton()}
                {activeTab === "History" && renderHistorySkeleton()}
                {activeTab === "Activity" && renderActivitySkeleton()}
              </div>
            )}

            {!tabLoading && activeTab === "Positions" && (
              <div
                className={`transition-opacity duration-600 ease-in-out ${
                  isContentVisible ? "opacity-100" : "opacity-0"
                }`}>
                {/* Position header row */}
                <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6 mb-2">
                  {/* Market header (left aligned) */}
                  <div
                    className={`text-left ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Market
                  </div>
                  {/* Centered headers with moderate spacing */}
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Latest
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Initial Value
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Current Avg
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Action
                  </div>
                </div>

                {positions.length === 0 ? (
                  <div
                    className={`py-4 text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    No active positions
                  </div>
                ) : (
                  positions.map((position) => (
                    <div
                      key={position.id}
                      className={`py-4 border-b ${
                        isDarkMode
                          ? "border-zinc-800 hover:bg-zinc-800/50"
                          : "border-[#2b2d2e]/10 hover:bg-gray-100"
                      } cursor-pointer`}
                      onClick={(e) => handleMarketNavigation(e, position)}>
                      {/* Mobile view - card style */}
                      <div className="block md:hidden">
                        <div className="mb-2">
                          <div className="flex">
                            {/* Larger image that spans both rows */}
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                              {position.has_sub_markets &&
                              position.marketImageUrl ? (
                                <img
                                  src={position.marketImageUrl}
                                  alt={position.marketName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : position.eventImageUrl ? (
                                <img
                                  src={position.eventImageUrl}
                                  alt={position.eventName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : (
                                <div
                                  className={`w-full h-full ${
                                    isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                                  } flex items-center justify-center`}>
                                  <img
                                    src="/soundbet-mini-logo.png"
                                    alt="Default"
                                    className="w-6 h-6"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Content column */}
                            <div className="flex flex-col">
                              <div
                                className={`${
                                  isDarkMode
                                    ? "text-[#C5C5C5]"
                                    : "text-[#2b2d2e]"
                                } text-base font-medium`}>
                                {position.eventName}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {position.has_sub_markets && (
                                  <div
                                    className={`text-sm ${
                                      isDarkMode
                                        ? "text-[#C5C5C5]/70"
                                        : "text-[#2b2d2e]/70"
                                    }`}>
                                    {position.marketName}
                                  </div>
                                )}
                                <div
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    position.side === position.side_1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {position.side}
                                </div>
                                <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {position.shares} Units
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Latest
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {position.currentPricePerShare.toFixed(0)}¢
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Initial Value
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              ${position?.initialTotalPrice?.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Current Avg
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              <span
                                className={
                                  position.percentageChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }>
                                ${position.currentTotalPrice.toFixed(2)}
                                <br />(
                                {position.percentageChange >= 0 ? "+" : ""}
                                {position.percentageChange.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div
                            onClick={(e) => handleSellClick(e, position)}
                            className="px-[18px] py-[5px] bg-[#FF161A] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer hover:cursor-pointer">
                            <div className="justify-center text-white text-sm font-medium">
                              Sell
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop view - table style */}
                      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6">
                        <div className="flex items-center text-left">
                          {/* Larger image that spans both rows */}
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                            {position.has_sub_markets &&
                            position.marketImageUrl ? (
                              <img
                                src={position.marketImageUrl}
                                alt={position.marketName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            ) : position.eventImageUrl ? (
                              <img
                                src={position.eventImageUrl}
                                alt={position.eventName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            ) : (
                              <div
                                className={`w-full h-full ${
                                  isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                                } flex items-center justify-center`}>
                                <img
                                  src="/soundbet-mini-logo.png"
                                  alt="Default"
                                  className="w-6 h-6"
                                />
                              </div>
                            )}
                          </div>
                          {/* Content column that contains both the event name and chips */}
                          <div className="flex flex-col">
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-base font-medium`}>
                              {position.eventName}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {position.has_sub_markets && (
                                <div
                                  className={`text-sm ${
                                    isDarkMode
                                      ? "text-[#C5C5C5]/70"
                                      : "text-[#2b2d2e]/70"
                                  }`}>
                                  {position.marketName}
                                </div>
                              )}
                              <div
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  position.side === position.side_1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {position.side}
                              </div>
                              <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {position.shares} Units
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                          <div
                            className={`${
                              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            } text-base font-normal`}>
                            {position?.currentPricePerShare?.toFixed(0)}¢
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                          <div
                            className={`${
                              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            } text-base font-normal`}>
                            ${position?.initialTotalPrice?.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                          <div
                            className={`${
                              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            } text-base font-normal`}>
                            ${position?.currentTotalPrice.toFixed(2)}
                            <br />
                            <span
                              className={
                                position?.percentageChange >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }>
                              ({position?.percentageChange >= 0 ? "+" : ""}
                              {position?.percentageChange.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div
                            onClick={(e) => handleSellClick(e, position)}
                            className="px-[18px] h-[30px] py-[3px] bg-[#FF161A] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer hover:cursor-pointer  ">
                            <div className="justify-center text-white text-sm font-medium">
                              Sell
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator for more positions */}
                {loadingMorePositions && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!tabLoading && activeTab === "Open Orders" && (
              <div
                className={`transition-opacity duration-600 ease-in-out ${
                  isContentVisible ? "opacity-100" : "opacity-0"
                }`}>
                {/* Open Orders header row */}
                <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6 mb-2">
                  {/* Market header */}
                  <div
                    className={`text-left ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Market
                  </div>
                  {/* Centered headers */}
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Price
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Pending
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Total
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Expiration
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Action
                  </div>
                </div>

                {openOrders.length === 0 ? (
                  <div
                    className={`py-4 text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    No open orders
                  </div>
                ) : (
                  openOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`py-4 border-b ${
                        isDarkMode
                          ? "border-zinc-800 hover:bg-zinc-800/50"
                          : "border-[#2b2d2e]/10 hover:bg-gray-100"
                      } cursor-pointer`}
                      onClick={(e) => handleOrderNavigation(e, order)}>
                      {/* Mobile view - card style */}
                      <div className="block md:hidden">
                        <div className="mb-2">
                          <div className="flex">
                            {/* Larger image that spans both rows */}
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                              {order.has_sub_markets && order.marketImageUrl ? (
                                <img
                                  src={order.marketImageUrl}
                                  alt={order.marketName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : order.eventImageUrl ? (
                                <img
                                  src={order.eventImageUrl}
                                  alt={order.eventName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : (
                                <div
                                  className={`w-full h-full ${
                                    isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                                  } flex items-center justify-center`}>
                                  <img
                                    src="/soundbet-mini-logo.png"
                                    alt="Default"
                                    className="w-6 h-6"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Content column */}
                            <div className="flex flex-col">
                              <div
                                className={`${
                                  isDarkMode
                                    ? "text-[#C5C5C5]"
                                    : "text-[#2b2d2e]"
                                } text-base font-medium`}>
                                {order.eventName}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {order.has_sub_markets && (
                                  <div
                                    className={`text-sm ${
                                      isDarkMode
                                        ? "text-[#C5C5C5]/70"
                                        : "text-[#2b2d2e]/70"
                                    }`}>
                                    {order.marketName}
                                  </div>
                                )}
                                <div
                                  className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                                  {order.side}
                                </div>
                                <div
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    order.outcome === order.side_1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {order.outcome}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Price
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {order.price?.toFixed(0)}¢
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Pending
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {order.filled}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Total
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              ${order.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the row's onClick
                              handleCancelOrderClick(order.id);
                            }}
                            className="px-[18px] py-[3px] bg-[#d82525] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer hover:cursor-pointer hover:bg-red-700">
                            <div className="justify-center text-white text-sm font-medium">
                              Cancel
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop view - table style */}
                      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)_minmax(100px,auto)] gap-2 md:gap-6">
                        <div className="flex items-center text-left">
                          {/* Larger image that spans both rows */}
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                            {order.has_sub_markets && order.marketImageUrl ? (
                              <img
                                src={order.marketImageUrl}
                                alt={order.marketName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            ) : order.eventImageUrl ? (
                              <img
                                src={order.eventImageUrl}
                                alt={order.eventName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            ) : (
                              <div
                                className={`w-full h-full ${
                                  isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                                } flex items-center justify-center`}>
                                <img
                                  src="/soundbet-mini-logo.png"
                                  alt="Default"
                                  className="w-6 h-6"
                                />
                              </div>
                            )}
                          </div>
                          {/* Content column that contains both the event name and chips */}
                          <div className="flex flex-col">
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-base font-medium`}>
                              {order.eventName}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {order.has_sub_markets && (
                                <div
                                  className={`text-sm ${
                                    isDarkMode
                                      ? "text-[#C5C5C5]/70"
                                      : "text-[#2b2d2e]/70"
                                  }`}>
                                  {order.marketName}
                                </div>
                              )}
                              <div
                                className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                                {order.side}
                              </div>
                              <div
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  order.outcome === order.side_1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {order.outcome}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          }`}>
                          {order.price.toFixed(0)}¢
                        </div>
                        <div
                          className={`text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          }`}>
                          {order.filled}
                        </div>
                        <div
                          className={`text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          }`}>
                          ${order.total.toFixed(2)}
                        </div>
                        <div
                          className={`text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          }`}>
                          <div className="relative group">
                            <div
                              className={`cursor-default ${
                                isDarkMode ? "text-[#C5C5C5]" : ""
                              }`}>
                              {(() => {
                                // Handle "No Expiration" case
                                if (
                                  order.expiration === "No Expiration" ||
                                  !order.expiration ||
                                  !order.expirationTimestamp
                                ) {
                                  return "No Expiration";
                                }

                                // Handle time-based expiration values
                                try {
                                  const expirationDate = new Date(
                                    order.expirationTimestamp
                                  );
                                  const now = new Date();
                                  const diffMs = expirationDate - now;
                                  const diffMinutes = Math.floor(
                                    diffMs / (1000 * 60)
                                  );

                                  if (diffMinutes <= 0) {
                                    return "Expired";
                                  } else if (diffMinutes < 60) {
                                    return `in ${diffMinutes} minute${
                                      diffMinutes !== 1 ? "s" : ""
                                    }`;
                                  } else if (diffMinutes < 24 * 60) {
                                    const hours = Math.floor(diffMinutes / 60);
                                    return `in ${hours} hour${
                                      hours !== 1 ? "s" : ""
                                    }`;
                                  } else {
                                    const days = Math.floor(
                                      diffMinutes / (24 * 60)
                                    );
                                    return `in ${days} day${
                                      days !== 1 ? "s" : ""
                                    }`;
                                  }
                                } catch (e) {
                                  // If date parsing fails, return original value
                                  return order.expiration;
                                }
                              })()}
                            </div>

                            {/* Tooltip showing full datetime */}
                            {order.expiration &&
                              order.expiration !== "No Expiration" && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                  {order.expiration}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the row's onClick
                              handleCancelOrderClick(order.id);
                            }}
                            className="px-[18px] py-[3px] h-[30px] bg-[#d82525] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer hover:cursor-pointer hover:bg-red-700">
                            <div className="justify-center text-white text-sm font-medium">
                              Cancel
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator for more open orders */}
                {loadingMoreOpenOrders && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!tabLoading && activeTab === "History" && (
              <div
                className={`transition-opacity duration-600 ease-in-out ${
                  isContentVisible ? "opacity-100" : "opacity-0"
                }`}>
                {/* History header row */}
                <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_minmax(60px,auto)_minmax(60px,auto)_minmax(70px,auto)_minmax(70px,auto)] gap-1 md:gap-3 mb-2">
                  <div
                    className={`text-left ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Market
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Type
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Buy
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Amount
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Date
                  </div>
                </div>

                {history.length === 0 ? (
                  <div
                    className={`py-4 text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    No history found
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={item.id}
                      className={`py-4 border-b ${
                        isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
                      }`}>
                      {/* Desktop view - table style */}
                      <div className="hidden md:grid md:grid-cols-[minmax(180px,1fr)_minmax(60px,auto)_minmax(60px,auto)_minmax(70px,auto)_minmax(70px,auto)] gap-1 md:gap-3">
                        {/* Market info left side */}
                        <div className="flex items-center text-left">
                          {item.action === "Deposit" ||
                          item.action === "Withdraw" ? (
                            <div
                              className={`w-12 h-12 rounded-md flex items-center justify-center mr-3 ${
                                item.action === "Deposit"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}>
                              <span className="text-white text-3xl font-bold">
                                $
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                              <img
                                src={
                                  item.hasSubMarkets && item.marketImageUrl
                                    ? item.marketImageUrl
                                    : item.eventImageUrl ||
                                      "/soundbet-mini-logo.png"
                                }
                                alt={item.eventName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-base font-medium`}
                              title={item.eventName}>
                              {item.eventName}
                            </div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/70"
                                  : "text-[#2b2d2e]/70"
                              } text-xs`}
                              title={item.marketName}>
                              {item.marketName}
                            </div>
                            {/* Chips for side, shares, and outcome */}
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {item.side && (
                                <div
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    item.side === item.side_1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {item.side}
                                </div>
                              )}
                              {item.shares && (
                                <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {item.shares} Units
                                </div>
                              )}
                              {item.Outcome && (
                                <div className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                  Outcome: {item.Outcome}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Type */}
                        <div
                          className={`flex items-center justify-center text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {item.type}
                        </div>
                        {/* Buy Price */}
                        <div
                          className={`flex items-center justify-center text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {item.buy_price
                            ? `${item.buy_price.toFixed(0)}¢`
                            : "-"}
                        </div>
                        {/* Amount */}
                        <div
                          className={`flex items-center justify-center text-center relative group ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {(() => {
                            const amountValid =
                              typeof item.amount === "number" &&
                              !isNaN(item.amount);
                            const hasPL =
                              typeof item.buy_price === "number" &&
                              typeof item.sell_price === "number" &&
                              typeof item.shares === "number";
                            const pnl = hasPL
                              ? ((item.sell_price - item.buy_price) *
                                  item.shares) /
                                100
                              : 0;
                            const pnlClass =
                              pnl > 0
                                ? "text-green-600"
                                : pnl < 0
                                ? "text-red-600"
                                : isDarkMode
                                ? "text-[#C5C5C5]/70"
                                : "text-[#2b2d2e]/70";
                            return (
                              <div className="flex flex-col items-center leading-tight whitespace-normal">
                                <div>
                                  ${amountValid ? item.amount.toFixed(2) : "-"}
                                </div>
                                {hasPL && (
                                  <div className={`${pnlClass} mt-0.5`}>
                                    ({pnl >= 0 ? "+" : ""}${pnl.toFixed(2)})
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          {/* Tooltip for amount breakdown */}
                          {typeof item.amount === "number" &&
                            !isNaN(item.amount) && (
                              <div
                                className={`absolute ${
                                  index === 0
                                    ? "top-full mt-2"
                                    : "bottom-full mb-2"
                                } left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max`}>
                                {index === 0 ? (
                                  <div
                                    className={`w-2 h-2 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 ${
                                      isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                    }`}></div>
                                ) : (
                                  <div
                                    className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                                      isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                    }`}></div>
                                )}
                                <div
                                  className={`rounded p-3 text-xs ${
                                    isDarkMode
                                      ? "bg-zinc-800 text-zinc-100"
                                      : "bg-zinc-700 text-white"
                                  } shadow-lg`}>
                                  <table className="w-full text-xs">
                                    <tbody>
                                      <tr>
                                        <td className="text-left pr-4 pb-1">
                                          Amount:
                                        </td>
                                        <td className="text-right pb-1">
                                          ${item.amount.toFixed(2)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="text-left pr-4 pb-1">
                                          Fees:
                                        </td>
                                        <td className="text-right pb-1">
                                          ${(item.fees || 0).toFixed(2)}
                                        </td>
                                      </tr>
                                      <tr className="border-t border-zinc-600">
                                        <td className="text-left pr-4 pt-1 font-medium">
                                          Total:
                                        </td>
                                        <td className="text-right pt-1 font-medium">
                                          $
                                          {(
                                            item.fullamount || item.amount
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                      {typeof item.buy_price === "number" &&
                                        typeof item.sell_price === "number" &&
                                        typeof item.shares === "number" && (
                                          <tr>
                                            <td className="text-left pr-4 pt-1">
                                              P/L:
                                            </td>
                                            <td className="text-right pt-1">
                                              $
                                              {(
                                                ((item.sell_price -
                                                  item.buy_price) *
                                                  item.shares) /
                                                100
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                        </div>
                        {/* Date with tooltip */}
                        <div
                          className={`flex items-center justify-center text-center relative group ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {item.date}
                          {item.fullDate && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max max-w-xs whitespace-normal break-words">
                              <div
                                className={`rounded p-2 text-xs ${
                                  isDarkMode
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "bg-zinc-700 text-white"
                                } shadow-lg`}
                                style={{
                                  maxWidth: "220px",
                                  wordBreak: "break-word",
                                  whiteSpace: "normal",
                                }}>
                                {item.fullDate}
                              </div>
                              <div
                                className={`w-2 h-2 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1 ${
                                  isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                }`}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Mobile view - card style */}
                      <div className="block md:hidden">
                        <div className="mb-2">
                          <div className="flex">
                            {/* Larger image that spans both rows */}
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                              {item.hasSubMarkets && item.marketImageUrl ? (
                                <img
                                  src={item.marketImageUrl}
                                  alt={item.marketName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : (
                                <img
                                  src={item.eventImageUrl}
                                  alt={item.eventName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              )}
                            </div>

                            {/* Content column */}
                            <div className="flex flex-col">
                              <div
                                className={`${
                                  isDarkMode
                                    ? "text-[#C5C5C5]"
                                    : "text-[#2b2d2e]"
                                } text-base font-medium`}>
                                {item.eventName}
                              </div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {item.side && (
                                  <div
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      item.side === item.side_1
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                    {item.side}
                                  </div>
                                )}
                                {item.shares && (
                                  <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {item.shares} Units
                                  </div>
                                )}
                                {item.Outcome && (
                                  <div className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                    Outcome: {item.Outcome}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Type
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {item.type}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Buy
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {item.buy_price
                                ? `${item.buy_price.toFixed(0)}¢`
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Amount
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal relative group`}>
                              {(() => {
                                const amountValid =
                                  typeof item.amount === "number" &&
                                  !isNaN(item.amount);
                                const hasPL =
                                  typeof item.buy_price === "number" &&
                                  typeof item.sell_price === "number" &&
                                  typeof item.shares === "number";
                                const pnl = hasPL
                                  ? ((item.sell_price - item.buy_price) *
                                      item.shares) /
                                    100
                                  : 0;
                                const pnlClass =
                                  pnl > 0
                                    ? "text-green-600"
                                    : pnl < 0
                                    ? "text-red-600"
                                    : isDarkMode
                                    ? "text-[#C5C5C5]/70"
                                    : "text-[#2b2d2e]/70";
                                return (
                                  <div className="flex flex-col items-center leading-tight whitespace-normal">
                                    <div>
                                      $
                                      {amountValid
                                        ? item.amount.toFixed(2)
                                        : "-"}
                                    </div>
                                    {hasPL && (
                                      <div className={`${pnlClass} mt-0.5`}>
                                        ({pnl >= 0 ? "+" : ""}${pnl.toFixed(2)})
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                              {/* Tooltip for amount breakdown */}
                              {typeof item.amount === "number" &&
                                !isNaN(item.amount) && (
                                  <div
                                    className={`absolute ${
                                      index === 0
                                        ? "top-full mt-2"
                                        : "bottom-full mb-2"
                                    } left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max`}>
                                    {index === 0 ? (
                                      <div
                                        className={`w-2 h-2 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 ${
                                          isDarkMode
                                            ? "bg-zinc-800"
                                            : "bg-zinc-700"
                                        }`}></div>
                                    ) : (
                                      <div
                                        className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                                          isDarkMode
                                            ? "bg-zinc-800"
                                            : "bg-zinc-700"
                                        }`}></div>
                                    )}
                                    <div
                                      className={`rounded p-3 text-xs ${
                                        isDarkMode
                                          ? "bg-zinc-800 text-zinc-100"
                                          : "bg-zinc-700 text-white"
                                      } shadow-lg`}>
                                      <table className="w-full text-xs">
                                        <tbody>
                                          <tr>
                                            <td className="text-left pr-4 pb-1">
                                              Amount:
                                            </td>
                                            <td className="text-right pb-1">
                                              ${item.amount.toFixed(2)}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td className="text-left pr-4 pb-1">
                                              Fees:
                                            </td>
                                            <td className="text-right pb-1">
                                              ${(item.fees || 0).toFixed(2)}
                                            </td>
                                          </tr>
                                          <tr className="border-t border-zinc-600">
                                            <td className="text-left pr-4 pt-1 font-medium">
                                              Total:
                                            </td>
                                            <td className="text-right pt-1 font-medium">
                                              $
                                              {(
                                                item.fullamount || item.amount
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                          {typeof item.buy_price === "number" &&
                                            typeof item.sell_price ===
                                              "number" &&
                                            typeof item.shares === "number" && (
                                              <tr>
                                                <td className="text-left pr-4 pt-1">
                                                  P/L:
                                                </td>
                                                <td className="text-right pt-1">
                                                  $
                                                  {(
                                                    ((item.sell_price -
                                                      item.buy_price) *
                                                      item.shares) /
                                                    100
                                                  ).toFixed(2)}
                                                </td>
                                              </tr>
                                            )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Date
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {item.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator for more history */}
                {loadingMoreHistory && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!tabLoading && activeTab === "Activity" && (
              <div
                className={`transition-opacity duration-600 ease-in-out ${
                  isContentVisible ? "opacity-100" : "opacity-0"
                }`}>
                {/* Activity header row */}
                <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(120px,auto)_minmax(120px,auto)_minmax(120px,auto)] gap-2 md:gap-6 mb-2">
                  <div
                    className={`text-left ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Market
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Type
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Amount
                  </div>
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    Date
                  </div>
                </div>

                {activity.length === 0 ? (
                  <div
                    className={`py-4 text-center ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-normal`}>
                    No activity found
                  </div>
                ) : (
                  activity.map((item, index) => (
                    <div
                      key={item.id}
                      className={`py-4 border-b ${
                        isDarkMode ? "border-zinc-800" : "border-[#2b2d2e]/10"
                      }`}>
                      {/* Desktop view - table style */}
                      <div className="hidden md:grid md:grid-cols-[minmax(280px,1fr)_minmax(120px,auto)_minmax(120px,auto)_minmax(120px,auto)] gap-2 md:gap-6">
                        {/* Market info left side */}
                        <div className="flex items-center text-left">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                            {item.type === "Deposit" ||
                            item.type === "Withdraw Request" ||
                            item.type === "Withdraw Success" ||
                            item.type === "Refund" ||
                            item.type === "Withdraw" ? (
                              <div
                                className={`w-12 h-12 rounded-md flex items-center justify-center ${
                                  item.type === "Deposit" ||
                                  item.type === "Refund"
                                    ? "bg-[#009689]"
                                    : "bg-[#8d1f17]"
                                }`}>
                                <span className="text-white text-3xl font-bold">
                                  $
                                </span>
                              </div>
                            ) : (
                              <img
                                src={
                                  item.hasSubMarkets && item.marketImageUrl
                                    ? item.marketImageUrl
                                    : item.eventImageUrl ||
                                      "/soundbet-mini-logo.png"
                                }
                                alt={item.eventName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/soundbet-mini-logo.png";
                                  e.target.onerror = null;
                                }}
                              />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-base font-medium `}
                              title={item.eventName}>
                              {item.eventName}
                            </div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/70"
                                  : "text-[#2b2d2e]/70"
                              } text-xs`}
                              title={item.marketName}>
                              {item.marketName}
                            </div>
                          </div>
                        </div>
                        {/* Type */}
                        <div
                          className={`flex items-center justify-center text-center ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {item.type}
                        </div>
                        {/* Amount */}
                        <div
                          className={`flex items-center justify-center text-center relative group ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          ${item.amount.toFixed(2)}
                          {/* Tooltip for amount breakdown */}
                          {(item.fees !== undefined ||
                            item.total_amount !== undefined) && (
                            <div
                              className={`absolute ${
                                index === 0
                                  ? "top-full mt-2"
                                  : "bottom-full mb-2"
                              } left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max`}>
                              {index === 0 ? (
                                <div
                                  className={`w-2 h-2 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 ${
                                    isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                  }`}></div>
                              ) : (
                                <div
                                  className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                                    isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                  }`}></div>
                              )}
                              <div
                                className={`rounded p-3 text-xs ${
                                  isDarkMode
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "bg-zinc-700 text-white"
                                } shadow-lg`}>
                                <table className="w-full text-xs">
                                  <tbody>
                                    <tr>
                                      <td className="text-left pr-4 pb-1">
                                        Amount:
                                      </td>
                                      <td className="text-right pb-1">
                                        ${(item.amount || 0).toFixed(2)}
                                      </td>
                                    </tr>
                                    {item.fees !== undefined && (
                                      <tr>
                                        <td className="text-left pr-4 pb-1">
                                          Fees:
                                        </td>
                                        <td className="text-right pb-1">
                                          ${(item.fees || 0).toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                    {item.total_amount !== undefined && (
                                      <tr className="border-t border-zinc-600">
                                        <td className="text-left pr-4 pt-1 font-medium">
                                          Total:
                                        </td>
                                        <td className="text-right pt-1 font-medium">
                                          ${(item.total_amount || 0).toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Date with tooltip */}
                        <div
                          className={`flex items-center justify-center text-center relative group ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } text-base font-normal`}>
                          {item.date}
                          {item.fullDate && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max max-w-xs whitespace-normal break-words">
                              <div
                                className={`rounded p-2 text-xs ${
                                  isDarkMode
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "bg-zinc-700 text-white"
                                } shadow-lg`}
                                style={{
                                  maxWidth: "220px",
                                  wordBreak: "break-word",
                                  whiteSpace: "normal",
                                }}>
                                {item.fullDate}
                              </div>
                              <div
                                className={`w-2 h-2 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1 ${
                                  isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                                }`}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Mobile view - card style (unchanged) */}
                      <div className="block md:hidden">
                        <div className="mb-2">
                          <div className="flex">
                            {/* Larger image that spans both rows */}
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                              {item.hasSubMarkets && item.marketImageUrl ? (
                                <img
                                  src={item.marketImageUrl}
                                  alt={item.marketName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : (
                                <img
                                  src={item.eventImageUrl}
                                  alt={item.eventName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/soundbet-mini-logo.png";
                                    e.target.onerror = null;
                                  }}
                                />
                              )}
                            </div>

                            {/* Content column */}
                            <div className="flex flex-col">
                              <div
                                className={`${
                                  isDarkMode
                                    ? "text-[#C5C5C5]"
                                    : "text-[#2b2d2e]"
                                } text-base font-medium`}>
                                {item.eventName}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <div
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    item.side === "Yes"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {item.side}
                                </div>
                                <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {item.amount} Units
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Price
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal relative group`}>
                              ${(item.amount || 0).toFixed(2)}
                              {/* Tooltip for amount breakdown in mobile */}
                              {(item.fees !== undefined ||
                                item.total_amount !== undefined) && (
                                <div
                                  className={`absolute ${
                                    index === 0
                                      ? "top-full mt-2"
                                      : "bottom-full mb-2"
                                  } left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max`}>
                                  {index === 0 ? (
                                    <div
                                      className={`w-2 h-2 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 ${
                                        isDarkMode
                                          ? "bg-zinc-800"
                                          : "bg-zinc-700"
                                      }`}></div>
                                  ) : (
                                    <div
                                      className={`w-2 h-2 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 ${
                                        isDarkMode
                                          ? "bg-zinc-800"
                                          : "bg-zinc-700"
                                      }`}></div>
                                  )}
                                  <div
                                    className={`rounded p-3 text-xs ${
                                      isDarkMode
                                        ? "bg-zinc-800 text-zinc-100"
                                        : "bg-zinc-700 text-white"
                                    } shadow-lg`}>
                                    <table className="w-full text-xs">
                                      <tbody>
                                        <tr>
                                          <td className="text-left pr-4 pb-1">
                                            Amount:
                                          </td>
                                          <td className="text-right pb-1">
                                            ${(item.amount || 0).toFixed(2)}
                                          </td>
                                        </tr>
                                        {item.fees !== undefined && (
                                          <tr>
                                            <td className="text-left pr-4 pb-1">
                                              Fees:
                                            </td>
                                            <td className="text-right pb-1">
                                              ${(item.fees || 0).toFixed(2)}
                                            </td>
                                          </tr>
                                        )}
                                        {item.total_amount !== undefined && (
                                          <tr className="border-t border-zinc-600">
                                            <td className="text-left pr-4 pt-1 font-medium">
                                              Total:
                                            </td>
                                            <td className="text-right pt-1 font-medium">
                                              $
                                              {(item.total_amount || 0).toFixed(
                                                2
                                              )}
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-xs font-normal`}>
                              Date
                            </div>
                            <div
                              className={`${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-sm font-normal`}>
                              {item.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator for more activity */}
                {loadingMoreActivity && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-400"
                        }`}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cancel Order Confirmation Dialog */}
          {showCancelDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#2b2d2e]/70 z-[9999]">
              <div
                className={`${
                  isDarkMode
                    ? "bg-[#1A1B1E] text-[#C5C5C5]"
                    : "bg-white text-[#2b2d2e]"
                } rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative z-[10000]`}>
                <div className="flex flex-col gap-4">
                  {/* Warning Icon and Text */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-[#d82525]/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d82525"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <div
                      className={`${
                        isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-xl font-semibold text-center`}>
                      Cancel Order
                    </div>
                  </div>

                  <div
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]/80" : "text-[#2b2d2e]/80"
                    } text-base font-normal text-center`}>
                    Are you sure you want to cancel this order? This action
                    cannot be undone.
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleCancelDialogClose}
                      className={`flex-1 px-4 py-2 border ${
                        isDarkMode
                          ? "border-zinc-700 text-[#C5C5C5] hover:bg-zinc-800"
                          : "border-[#2b2d2e]/30 text-[#2b2d2e] hover:bg-[#2b2d2e]/5"
                      } rounded text-sm font-medium transition-colors duration-200`}>
                      Keep Order
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={cancelLoading}
                      className="flex-1 px-4 py-2 bg-[#d82525] rounded text-white text-sm font-medium hover:bg-[#c02020] transition-colors duration-200 flex items-center justify-center">
                      {cancelLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : null}
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Error Dialog */}
          {showLiquidityErrorDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#2b2d2e]/70 z-[10000]">
              <div
                className={`${
                  isDarkMode
                    ? "bg-[#1A1B1E] text-[#C5C5C5]"
                    : "bg-white text-[#2b2d2e]"
                } rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative`}>
                <div className="flex flex-col gap-4">
                  {/* Info Icon and Text */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-[#4169e1]/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4169e1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </div>
                    <div
                      className={`${
                        isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-xl font-semibold text-center`}>
                      Market Liquidity Issue
                    </div>
                  </div>

                  <div
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]/80" : "text-[#2b2d2e]/80"
                    } text-base font-normal text-center`}>
                    {errorMessage}
                  </div>

                  {/* Shares info */}
                  <div
                    className={`${
                      isDarkMode ? "bg-[#292A2D]" : "bg-[#f7f7f7]"
                    } p-4 rounded-md`}>
                    <div className="flex justify-between items-center">
                      <div
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                        } text-sm font-medium`}>
                        Remaining Units:
                      </div>
                      <div
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                        } text-sm font-semibold`}>
                        {remainingShares}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]/80" : "text-[#2b2d2e]/80"
                    } text-sm font-normal text-center`}>
                    Consider using a limit order to sell your position at your
                    desired price.
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setShowLiquidityErrorDialog(false)}
                      className={`flex-1 px-4 py-2 border ${
                        isDarkMode
                          ? "border-zinc-700 text-[#C5C5C5] hover:bg-zinc-800"
                          : "border-[#2b2d2e]/30 text-[#2b2d2e] hover:bg-[#2b2d2e]/5"
                      } rounded text-sm font-medium transition-colors duration-200`}>
                      Cancel
                    </button>
                    <button
                      onClick={handleNavigateToLimitOrder}
                      className="flex-1 px-4 py-2 bg-[#4169e1] rounded text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                      Place Limit Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sell Position Dialog */}
          {showSellDialog && (
            <div className="fixed inset-0   flex items-center justify-center bg-[#2b2d2e]/70 z-[9999]">
              <div
                ref={sellDialogRef}
                className={`w-[532px] relative ${
                  isDarkMode
                    ? "bg-[#1A1B1E] text-[#C5C5C5]"
                    : "bg-[#f7f7f7] text-[#2b2d2e]"
                } rounded-[18px] overflow-hidden z-[10000] p-6`}>
                {/* Close button */}
                <button
                  onClick={handleSellDialogClose}
                  className={`absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700"
                      : "bg-[#2b2d2e]/10 hover:bg-[#2b2d2e]/20"
                  } transition-colors`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {/* Market image and name row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {selectedPosition?.has_sub_markets &&
                    selectedPosition?.marketImageUrl ? (
                      <img
                        src={selectedPosition.marketImageUrl}
                        alt={selectedPosition.marketName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/soundbet-mini-logo.png";
                          e.target.onerror = null;
                        }}
                      />
                    ) : selectedPosition?.eventImageUrl ? (
                      <img
                        src={selectedPosition.eventImageUrl}
                        alt={selectedPosition.eventName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/soundbet-mini-logo.png";
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${
                          isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                        } flex items-center justify-center`}>
                        <img
                          src="/soundbet-mini-logo.png"
                          alt="Default"
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`${
                        isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-[18px] font-medium`}>
                      {selectedPosition?.eventName || ""}
                    </div>
                    {selectedPosition?.has_sub_markets && (
                      <div className="flex items-center">
                        <div
                          className={`${
                            isDarkMode
                              ? "text-[#C5C5C5]/70"
                              : "text-[#2b2d2e]/70"
                          } text-[14px] font-medium`}>
                          {selectedPosition?.marketName || ""}
                        </div>
                        <div
                          className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            selectedPosition?.side === "Yes"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {selectedPosition?.side || ""}
                        </div>
                      </div>
                    )}
                    {!selectedPosition?.has_sub_markets && (
                      <div
                        className={`mt-1 px-2 py-0.5 rounded text-xs font-medium inline-block ${
                          selectedPosition?.side === "Yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {selectedPosition?.side || ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Available stocks row */}
                <div className="flex justify-between items-center mt-4">
                  <div
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    } text-base font-medium`}>
                    Available Units
                  </div>
                  <div
                    className={`text-center justify-center ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    } text-base font-medium`}>
                    {selectedPosition?.shares || 0}
                  </div>
                </div>

                {/* Quantity selector and slider row */}
                <div className="flex justify-between items-center mt-4 gap-4">
                  {/* Quantity selector */}
                  <div className="h-[54px] pl-4 pr-2.5 py-3 bg-[#FF532A] rounded-[5px] inline-flex justify-start items-center gap-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-16 text-white border-0 outline-none focus:outline-none focus:ring-0"
                      value={sellQuantity}
                      onChange={(e) => {
                        const max = selectedPosition?.shares || 0;
                        const val = Number(e.target.value) || 0;
                        setSellQuantity(val > max ? max : val);
                      }}
                    />
                    <div
                      className={`p-[9px] ${
                        isDarkMode ? "bg-zinc-200" : "bg-white"
                      } rounded-[5px] flex justify-center items-center gap-2.5 cursor-pointer`}
                      onClick={handleQuantityDecrease}>
                      <div className="justify-center text-[#2b2d2e] text-xs font-normal">
                        -10
                      </div>
                    </div>
                    <div
                      className={`p-[9px] ${
                        isDarkMode ? "bg-zinc-200" : "bg-white"
                      } rounded-[5px] flex justify-center items-center gap-2.5 cursor-pointer`}
                      onClick={handleQuantityIncrease}>
                      <div className="justify-center text-[#2b2d2e] text-xs font-normal">
                        +10
                      </div>
                    </div>
                  </div>

                  {/* Material UI Slider */}
                  <div className="relative flex-1">
                    <ThemeProvider
                      theme={createTheme({
                        components: {
                          MuiSlider: {
                            styleOverrides: {
                              root: {
                                color: "#4169e1",
                                height: 9,
                                padding: "13px 0",
                              },
                              thumb: {
                                height: 18,
                                width: 18,
                                backgroundColor: "#4169e1",
                                "&:hover, &.Mui-focusVisible": {
                                  boxShadow:
                                    "0 0 0 8px rgba(65, 105, 225, 0.16)",
                                },
                              },
                              track: {
                                height: 9,
                                borderRadius: 9,
                              },
                              rail: {
                                height: 9,
                                borderRadius: 9,
                                backgroundColor: isDarkMode
                                  ? "#333"
                                  : "#d9d9d9",
                              },
                            },
                          },
                        },
                      })}>
                      <Slider
                        min={1}
                        max={selectedPosition?.shares || MAX_QUANTITY}
                        step={1}
                        value={sellQuantity}
                        onChange={(event, newValue) =>
                          setSellQuantity(newValue)
                        }
                        aria-labelledby="quantity-slider"
                        valueLabelDisplay="off"
                        sx={{
                          color: "#3b82f6", // tailwind: bg-blue-500
                          "& .MuiSlider-thumb": {
                            backgroundColor: "#FF532A",
                            border: "2px solid white",
                          },
                          "& .MuiSlider-track": {
                            backgroundColor: "#FF532A",
                          },
                          "& .MuiSlider-rail": {
                            backgroundColor: "#FF532A", // tailwind: blue-300
                          },
                        }}
                      />
                    </ThemeProvider>
                  </div>
                </div>

                {/* Total value */}
                <div className="flex justify-between items-center mt-4">
                  <div
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    } text-base font-medium`}>
                    Total Value
                  </div>
                  <div
                    className={`text-center justify-center ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    } text-base font-medium`}>
                    $
                    {(
                      (selectedPosition?.currentPricePerShare || 0) *
                      sellQuantity
                    ).toFixed(2)}
                  </div>
                </div>

                {/* Sell button */}
                <div
                  onClick={handleConfirmSell}
                  className={`w-full h-12 px-4 py-2 bg-[#FF532A] rounded-[5px] inline-flex flex-col justify-center items-center gap-1 cursor-pointer mt-4 ${
                    sellLoading ? "opacity-70" : "hover:[#FF532A]"
                  }`}>
                  {sellLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="justify-center text-white text-xl font-semibold">
                      Sell
                    </div>
                  )}
                </div>

                {/* Sell on limit link */}
                <div className="mt-2 text-center">
                  <button
                    onClick={handleNavigateToLimitOrder}
                    className="text-[#FF532A] text-sm font-medium underline hover:[#FF532A] transition-colors">
                    Sell on limit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Deposit Dialog */}
          <DepositDialog
            open={depositOpen}
            onClose={() => setDepositOpen(false)}
            balance={stats.wallet}
          />
          {/* Render Withdraw Dialog */}
          <WithdrawDialog
            open={withdrawOpen}
            onClose={() => setWithdrawOpen(false)}
            onWithdraw={handleWithdraw}
            loading={withdrawLoading}
          />

          <HowPlay
            open={playModal}
            handleClose={() => setPlayModal(false)}
            showMethod={showMethod}
            setShowMethod={setShowMethod}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;
