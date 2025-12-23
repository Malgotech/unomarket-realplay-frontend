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

import GenerateEvent from "./GenerateEvent";

import NewEventComponent from "./EventsForm";

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
    return await postData(`api/event/orders/${orderId}/cancel`);
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return { success: false, message: error.message };
  }
};

const sellPosition = async (position, quantity) => {
  try {
    // Call the sell API endpoint
    const response = await fetch("http://localhost:3007/orders/market/sell", {
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
    });

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

const CreateEvent = () => {
  const navigate = useNavigate();

  const [grokPreviewIdx, setGrokPreviewIdx] = useState(null);
  const [grokResults, setGrokResults] = useState([]);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  const [userData, setUserData] = useState({
    username: "@username",
    joinDate: "Mar 2025",
    profileImage: "",
  });
  const [stats, setStats] = useState({
    portfolio: 0,
    portfolioProfitLoss: 0,
    profitLoss: 0,
    volumeTraded: 0,
    wallet: 0,
    profitLossGraph: [],
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
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
  const [generateOpen, setGenerateOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(false);

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
          Current
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

  // Handle timeframe change
  const handleTimeframeChange = async (timeframe) => {
    setSelectedTimeframe(timeframe);
    try {
      const response = await fetchUserProfile(timeframe);
      if (response.success) {
        const { stats } = response;
        setStats((prevStats) => ({
          ...prevStats,
          portfolio: stats.portfolio || 0,
          portfolioProfitLoss: stats.portfolioProfitLoss || 0,
          profitLoss: stats.profitLoss || 0,
          volumeTraded: stats.volumeTraded || 0,
          wallet: stats.wallet || 0,
          profitLossGraph: stats.profitLossGraph || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching timeframe data:", error);
    }
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setIsHeaderContentVisible(false);
      try {
        const response = await fetchUserProfile(selectedTimeframe);

        if (response.success) {
          const { user, stats } = response;

          setUserData({
            username: `@${user.username || "username"}`,
            joinDate: user.joinDate || "Unknown",
            profileImage: user.profileImage || "",
          });

          setStats({
            portfolio: stats.portfolio || 0,
            portfolioProfitLoss: stats.portfolioProfitLoss || 0,
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
        // Add fade-in delay after profile data loads
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
    if (e.target.closest(".bg-\\[\\#9945ff\\]")) {
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

  const handleNavigateEvent = () => {
    navigate("/events");
  };

  return (
    <>
      <div
        className={`profile-page min-h-screen ${
          isDarkMode ? "bg-[#121212]" : ""
        }`}>
        <NewEventComponent
          grokEvent={
            grokPreviewIdx !== null ? grokResults[grokPreviewIdx] : null
          }
          onBack={() => setActiveButton(false)}
          onClick={() => setGenerateOpen(true)}
        />

        <GenerateEvent
          open={generateOpen}
          onClose={() => setGenerateOpen(false)}
          setActiveButton={setActiveButton}
          setGrokPreviewIdx={setGrokPreviewIdx}
          grokPreviewIdx={grokPreviewIdx}
          grokResults={grokResults}
          setGrokResults={setGrokResults}
        />
      </div>
    </>
  );
};

export default CreateEvent;
