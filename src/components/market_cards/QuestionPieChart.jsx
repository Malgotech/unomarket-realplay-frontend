import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import { postData, fetchData } from "../../services/apiServices"; // Import fetchData
import { useDispatch, useSelector } from "react-redux"; // Import useSelector to access theme state
import { Slider, ThemeProvider, createTheme } from "@mui/material"; // Import Material UI components
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import Toast from "../Toast"; // Import Toast component
import bookmarkFilled from "/soundbet Bookmark Light (2).svg";
import bookmark from "/soundbet Bookmark Light (1).svg";
import { transformOrderBookData } from "../../utils/orderBookUtils";
import { useToast } from "../../context/ToastContext";
import { IoPlayCircleOutline } from "react-icons/io5";
import { FaRegCheckCircle, FaSquare, FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { userDataAPI } from "../../store/reducers/movieSlice";
import { IoMdAddCircleOutline } from "react-icons/io";
import BetDialog from "./BetDialog";

const QuestionPieChart = ({
  showLimit,
  setShowLimit,
  res,
  GetEvents,
  addBookmark,
  setAddBookMark,
  setAddPositon,
  addPosition,
}) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(10); // Initial quantity
  console.log("purchaseQuantity  :>> ", purchaseQuantity);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  // REMOVE const MAX_QUANTITY = 100;
  const [showCopied, setShowCopied] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();
  // New states for order book, tiered pricing, and approx. value
  const [orderBookAsks, setOrderBookAsks] = useState([]);
  const [totalAvailableShares, setTotalAvailableShares] = useState(0);
  const [approxDollarValue, setApproxDollarValue] = useState("--");
  const [isFetchingOrderBook, setIsFetchingOrderBook] = useState(false);
  const dispatch = useDispatch();
  // Animation variants for jelly-like effect
  const [marketData, setMarketData] = useState();
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [marketPrices, setMarketPrices] = useState(null);
  const [userPositions, setUserPositions] = useState([]);
  const [subMarket, setSubmarket] = useState();
  const [selectedMarkets, setSelectedMarkets] = useState({});
  const [activeMarket, setActiveMarket] = useState(null);

  const jellyVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1.0,
        duration: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Set initial bookmarked state from res data when component mounts
  useEffect(() => {
    if (res && res.isBookmarked !== undefined) {
      setIsBookmarked(res.isBookmarked);
    }
    // Set initial purchase quantity to 0 or a small default if no shares initially known
    setPurchaseQuantity(0);
  }, [res]);

  const data = {
    event_title: res.event_title,
    trump: {
      yes: 42,
      no: 58,
    },
    last_traded_yes:
      res.sub_markets && res.sub_markets[0]
        ? res.sub_markets[0].lastTradedSide1Price
        : 50,
    side_1: res.sub_markets[0].side_1,
    side_2: res.sub_markets[0].side_2,
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (isBookmarkProcessing) return;

    try {
      setIsBookmarkProcessing(true);

      // Call the API to toggle bookmark status with the correct payload structure
      const response = await postData("api/user/bookmarks", {
        type: "event",
        content_id: res._id,
      });

      if (response.status) {
        setIsBookmarked(!isBookmarked);
        showSuccessToast(
          isBookmarked
            ? "Market removed from bookmarks"
            : "Market added to bookmarks"
        );

        setAddBookMark(!addBookmark);

        GetEvents();
      } else {
        showErrorToast("failed to Bookmark event");
        console.error("Failed to toggle bookmark:", response.message);
      }
    } catch (error) {
      showErrorToast("login to bookmark events");
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("UnomarketToken");
    if (!token) setIsBookmarked(false);
  }, []);

  const majorityValue =
    data.trump.yes > data.trump.no
      ? { value: data.trump.yes, color: "#C6DFD3" }
      : { value: data.trump.no, color: "#EDC4CE" };

  const chartOptions = {
    chart: {
      type: "donut",
      background: "transparent",
    },
    labels: ["Yes", "No"],
    colors: ["#C6DFD3", "#EDC4CE"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%", // Increased from 70% to 85% to make the donut ring thinner
          labels: {
            show: false,
          },
          background: "transparent",
        },
        startAngle: -90,
        endAngle: 90,
        strokeWidth: 0, // Remove the stroke/border around chart segments
      },
    },
    stroke: {
      width: 0, // Remove any stroke lines
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const chartSeries = [data.last_traded_yes, 100 - data.last_traded_yes];
  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showSuccessToast("URL Copied to clipboard!");
  };
  // Handle Yes button click
  const handleYesClick = (e) => {
    e.stopPropagation(); // Prevent card click event from triggering

    // Check if market is settled
    const firstMarket = res.sub_markets && res.sub_markets[0];
    if (firstMarket && firstMarket.result && firstMarket.status === "settled") {
      return; // Don't allow clicking on settled markets
    }

    setSelectedOption("yes");
    setShowTradingPanel(true); // Show trading panel instead of navigating
  };

  // Handle No button click
  const handleNoClick = (e) => {
    e.stopPropagation(); // Prevent card click event from triggering

    // Check if market is settled
    const firstMarket = res.sub_markets && res.sub_markets[0];
    if (firstMarket && firstMarket.result && firstMarket.status === "settled") {
      return; // Don't allow clicking on settled markets
    }

    setSelectedOption("no");
    setShowTradingPanel(true); // Show trading panel instead of navigating
  };

  // Handle closing the trading panel
  const handleCloseTradingPanel = (e) => {
    e.stopPropagation(); // Prevent card click event from triggering
    setShowTradingPanel(false);
    setSelectedOption(null);
  };

  // Handle quantity decrease
  const handleQuantityDecrease = (e) => {
    e.stopPropagation();
    setPurchaseQuantity(Math.max(purchaseQuantity - 10, 10)); // Minimum 10
  };

  // Handle quantity increase by 1 (replaces former decrease)
  const handleQuantityIncreaseByOne = (e) => {
    e.stopPropagation();
    setPurchaseQuantity((pq) => Math.max(pq - 1, 0));
  };

  // Handle quantity increase by 10
  const handleQuantityIncrease = (e) => {
    e.stopPropagation();
    setPurchaseQuantity((pq) =>
      Math.min(pq + 10, totalAvailableShares > 0 ? totalAvailableShares : 0)
    );
  };

  // Handle buy action
  const handleBuy = async (e) => {
    e.stopPropagation();

    if (purchaseLoading) return;

    try {
      setPurchaseLoading(true);

      // Call the API for market buy
      const response = await postData(`api/event/orders/market/buy`, {
        event_id: res._id,
        market_id: res.sub_markets[0]._id,
        side: selectedOption === "yes" ? "Yes" : "No", // Capitalized
        shares: purchaseQuantity, // Number of shares to buy
      });

      if (response.success) {
        // Handle successful purchase
        setShowTradingPanel(false);
        setToastMessage("Purchase successful!");
        setShowToast(true);
      } else {
        setToastMessage(
          response.message || "Failed to complete purchase. Please try again."
        );
        setShowToast(true);
      }
      dispatch(userDataAPI());
    } catch (error) {
      setToastMessage("An error occurred. Please try again.");
      setShowToast(true);
      console.error("Error completing purchase:", error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Helper to render volume/age logic
  const renderVolume = () => {
    const pool = res.total_pool_in_usd;
    const startDate = res.sub_markets?.[0]?.start_date || res.createdAt;
    const daysOld = startDate
      ? Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 0;
    if (pool < 10000) {
      if (daysOld < 7) {
        return (
          <img
            src="/soundbet Vector.svg"
            alt="soundbet"
            style={{ display: "inline", height: 18, verticalAlign: "middle" }}
          />
        );
      } else {
        return <span>$&lt;10K Vol.</span>;
      }
    } else {
      return <span>${pool.toLocaleString()} Vol.</span>;
    }
  };

  // Handle card click (default to Yes for first submarket)
  const handleCardClick = () => {
    if (!showTradingPanel) {
      // Only navigate if trading panel is not showing
      if (res.sub_markets && res.sub_markets.length > 0) {
        const firstMarketId = res.sub_markets[0]._id;
        const firstMarket = res.sub_markets[0];
        let defaultSelection = selectedOption;
        if (!defaultSelection) {
          defaultSelection = firstMarket.side_1;
        } else {
          defaultSelection =
            defaultSelection === "yes"
              ? firstMarket.side_1
              : firstMarket.side_2;
        }
        navigate(
          `/market/details/${res._id}?marketId=${firstMarketId}&selection=${defaultSelection}`
        );
      } else {
        navigate(`/market/details/${res._id}`);
      }
    }
  };

  // Effect to fetch order book data and set available shares
  useEffect(() => {
    if (
      showTradingPanel &&
      selectedOption &&
      res &&
      res.sub_markets &&
      res.sub_markets[0]
    ) {
      const fetchOrderBook = async () => {
        setIsFetchingOrderBook(true);
        setOrderBookAsks([]);
        setTotalAvailableShares(0);
        try {
          const marketId = res.sub_markets[0]._id;
          const data = await fetchData(
            `api/event/orderbook?market_id=${marketId}`
          );

          // Get dynamic side names for this market
          const side1 = res.sub_markets[0].side_1 || "Yes";
          const side2 = res.sub_markets[0].side_2 || "No";
          const optionKey = selectedOption === "yes" ? side1 : side2;

          let asks = [];

          // Handle new format (only bids, dynamic keys)
          if (data && data.orderbook && data.orderbook[optionKey]) {
            // Transform the new format
            const transformedOrderBook = transformOrderBookData(
              data,
              side1,
              side2
            );
            asks = transformedOrderBook[optionKey]?.asks || [];
          }
          // Handle old format (fallback)
          else if (
            data &&
            data.orderBook &&
            data.orderBook[optionKey] &&
            data.orderBook[optionKey].asks
          ) {
            asks = data.orderBook[optionKey].asks;
          }

          if (asks.length > 0) {
            const sortedAsks = [...asks].sort((a, b) => a.price - b.price); // Sort asks by price ascending
            setOrderBookAsks(sortedAsks);
            const sumOfShares = sortedAsks.reduce(
              (sum, level) => sum + level.shares,
              0
            );
            setTotalAvailableShares(sumOfShares);
          } else {
            console.warn(
              `No asks available for market ${marketId} - ${selectedOption}`
            );
            setOrderBookAsks([]);
            setTotalAvailableShares(0);
          }
        } catch (error) {
          console.error("Error fetching order book data:", error);
          setOrderBookAsks([]);
          setTotalAvailableShares(0);
        } finally {
          setIsFetchingOrderBook(false);
        }
      };
      fetchOrderBook();
    } else {
      setOrderBookAsks([]);
      setTotalAvailableShares(0);
      setPurchaseQuantity(0); // Reset quantity if panel is closed or no selection
    }
  }, [showTradingPanel, selectedOption, res]);

  // Effect to adjust purchaseQuantity when totalAvailableShares changes or panel opens
  useEffect(() => {
    if (showTradingPanel) {
      // When panel opens or shares update, set to 0 or min(current, newMax)
      // For this component, let's default to 0 when panel opens with new data.
      const newMax = totalAvailableShares > 0 ? totalAvailableShares : 0;
      if (
        purchaseQuantity > newMax ||
        (purchaseQuantity === 0 && newMax > 0 && orderBookAsks.length > 0)
      ) {
        // If current quantity exceeds new max, or if it's 0 but shares are available, reset or cap it.
        // Let's set to a small default like 10 if available, or 0 if not.
        setPurchaseQuantity(newMax > 0 ? Math.min(10, newMax) : 0);
      } else if (purchaseQuantity > newMax) {
        setPurchaseQuantity(newMax);
      }
    } else {
      setPurchaseQuantity(0); // Reset to 0 when panel is not shown
    }
  }, [totalAvailableShares, showTradingPanel, orderBookAsks]);

  // Effect to calculate approximate dollar value based on tiered pricing
  useEffect(() => {
    if (orderBookAsks.length === 0 || purchaseQuantity === 0) {
      setApproxDollarValue("--");
      return;
    }
    let calculatedValue = 0;
    let quantityToFulfill = purchaseQuantity;
    for (const level of orderBookAsks) {
      if (quantityToFulfill <= 0) break;
      const sharesFromThisLevel = Math.min(quantityToFulfill, level.shares);
      calculatedValue += sharesFromThisLevel * level.price;
      quantityToFulfill -= sharesFromThisLevel;
    }
    if (quantityToFulfill > 0) {
      setApproxDollarValue("--");
      console.warn(
        "Could not fulfill entire purchase quantity from order book for PieChart."
      );
    } else {
      setApproxDollarValue((calculatedValue / 100).toFixed(2));
    }
  }, [purchaseQuantity, orderBookAsks]);

  // Read user's wallet balance and disable buy if cost exceeds wallet balance
  const walletBalance =
    parseFloat(localStorage.getItem("SoundbetWalletBalance")) || 0;
  const totalCost =
    approxDollarValue === "--" ? 0 : parseFloat(approxDollarValue);
  const exceedsWallet = !isFetchingOrderBook && totalCost > walletBalance;

  // Add escape key handler to close trading panel
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showTradingPanel) {
        setShowTradingPanel(false);
        setSelectedOption(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showTradingPanel]);

  const handleSelection = (e, marketId, selection, marketdata) => {
    e.stopPropagation(); // Prevent the card click event from triggering

    // Store the selection in state
    setSelectedMarkets((prev) => ({
      ...prev,
      [marketId]: selection,
    }));

    // Find the market data from res
    const market = res.sub_markets.find((m) => m._id === marketId);

    // Set the active market and selected option for trading panel
    setActiveMarket(market);
    setSelectedOption(selection);

    // Show the trading panel instead of navigating
    setShowTradingPanel(true);
    setMarketData(market);
  };

  const handleShowDialog = (marketId, option, subMarketItem) => {
    setShowDialog(true);
    setSelectedOption(option);
    setSelectedMarketId(marketId);
    setSubmarket(subMarketItem);
    setShowLimit(true);
  };

  const fetchUserPositions = async (eventId) => {
    if (!eventId) {
      setUserPositions([]);
      return { success: false, positions: [] };
    }
    try {
      const response = await fetchData(
        `api/event/positions?eventId=${eventId}`
      );
      if (response.success) {
        console.log("Market: Fetched positions data:", response.positions);
        setUserPositions(response.positions);
      }
      return response;
    } catch (error) {
      console.error("Error in fetchUserPositions:", error);
      return {
        success: false,
        positions: [],
        pagination: { totalPositions: 0, currentPage: 1, totalPages: 1 },
      };
    }
  };

  const handleOptionSelect = async (marketId, option, subMarketItem) => {
    setSelectedMarketId(marketId);
    setSelectedOption(option);
    setSubmarket(subMarketItem);

    // Open the OrderBook for this market when Yes/No button is clicked with animation
    const prevState = { ...openSubmarkets };
    const isCurrentlyOpen = prevState[marketId];

    // First close any currently open submarket with animation
    const closeCurrentlyOpenSubmarket = () => {
      // Find which submarket is currently open
      const openSubmarketId = Object.keys(prevState).find(
        (id) => prevState[id]
      );

      if (openSubmarketId && openSubmarketId !== marketId) {
        const openEl = submarketRefs.current[openSubmarketId];
        if (openEl) {
          // First set exact height before transitioning to 0
          const height = openEl.scrollHeight;
          openEl.style.height = `${height}px`;

          // Force a reflow
          openEl.offsetHeight;

          // Transition to 0 height
          openEl.style.height = "0px";
        }
      }
    };

    // Always close any other open submarkets first
    closeCurrentlyOpenSubmarket();

    // If this submarket is already open, just update the state silently
    if (isCurrentlyOpen) {
      // Update URL with the selected market and option
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("marketId", marketId);
      searchParams.set("selection", option);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${searchParams.toString()}`
      );
      return;
    }

    // Update state to open this submarket and close others
    setOpenSubmarkets((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [marketId]: true, // Open this submarket
    }));

    // After the state update, animate the opening
    requestAnimationFrame(() => {
      const submarketEl = submarketRefs.current[marketId];
      if (submarketEl) {
        // Set initial height to 0
        submarketEl.style.height = "0px";

        // Force reflow
        submarketEl.offsetHeight;

        // Get the final height and animate to it
        const height = submarketEl.scrollHeight;
        submarketEl.style.height = `${height}px`;

        // Reset to auto after animation completes
        setTimeout(() => {
          submarketEl.style.height = "auto";
        }, 500);
      }
    });

    // Update URL with the selected market and option
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("marketId", marketId);
    searchParams.set("selection", option);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className={`w-full rounded-xl p-4 relative hover:cursor-pointer h-[228px] flex flex-col justify-between transition-all duration-300 overflow-hidden
          
          ${
            isDarkMode
              ? "  bg-[#1a1a1a] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_10px_-2px_rgba(0,0,0,0.55),0_14px_34px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_6px_14px_-2px_rgba(0,0,0,0.65),0_20px_46px_-8px_rgba(0,0,0,0.75)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.08)_inset,0_0_36px_-10px_rgba(255,255,255,0.10)_inset]"
              : "bg-[#fff)] swiper-slide-container  hover:shadow-[0_0_0_1px_rgba(0,0,0,0.16),0_6px_16px_-2px_rgba(0,0,0,0.14),0_22px_52px_-10px_rgba(0,0,0,0.18)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.85)_inset,0_0_36px_-12px_rgba(0,0,0,0.06)_inset]"
          }
        `}>
      {/* Section 1: Title and image - fixed height */}
      <div className="w-full flex justify-between h-auto min-h-[60px] items-center relative">
        <img
          src={res.event_image || ""}
          alt="Event"
          className="rounded w-[54px] h-[54px] flex-shrink-0"
        />
        <div className="w-[95%] relative group  ml-2">
          <h1
            className={`text-[14px] font-semibold   hover:decoration-[2px] line-clamp-2 ${
              isDarkMode ? "text-[#C5C5C5]" : ""
            }`}>
            {res.event_title || ""}
          </h1>
          <div
            className={`absolute top-0 left-0 w-full z-20 bg-${
              isDarkMode ? "[#1A1B1E]" : "[rgb(247,247,247)]"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            <h1
              className={`text-[14px] font-semibold  hover:decoration-[2px] ${
                isDarkMode ? "text-[#C5C5C5]" : ""
              }`}>
              {res.event_title || ""}
            </h1>
          </div>
        </div>
      </div>

      {/* Section 2: Yes/No options and chart - flexible height */}
      <div className="flex-grow flex flex-col justify-center">
        {/* Mobile percentage display */}
        {data.last_traded_yes && (
          <div className="sm:hidden mb-3 text-left ml-1">
            <span className={`text-[14px] font-medium text-[#0d9488]`}>
              {data.last_traded_yes}1% Chance
            </span>
          </div>
        )}

        {/* Chart - visible on web screens only for unsettled markets */}
        {data.last_traded_yes &&
        !(() => {
          const firstMarket = res.sub_markets && res.sub_markets[0];
          return (
            firstMarket &&
            firstMarket.result &&
            firstMarket.status === "settled"
          );
        })() ? (
          // <div className="hidden sm:block w-[120px] sm:w-[90px] h-[70px] relative pointer-events-none ml-2 flex-shrink-0">
          //   <div className="w-full h-[60px] overflow-visible">
          //     <Chart
          //       options={{
          //         ...chartOptions,
          //         chart: {
          //           ...chartOptions.chart,
          //           width: "100%",
          //         },
          //         responsive: [
          //           {
          //             breakpoint: 470,
          //             options: {
          //               chart: {
          //                 width: "140%",
          //               },
          //             },
          //           },
          //         ],
          //       }}
          //       series={chartSeries}
          //       type="donut"
          //       width="100%"
          //       height="120px"
          //     />
          //   </div>

          //   <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 text-center">
          //     {data.last_traded_yes ? (
          //       <span className="text-[18px] font-medium text-[#0d9488]">
          //         {data.last_traded_yes}%
          //       </span>
          //     ) : null}
          //   </div>

          //   {/* Yes/No labels */}
          //   <div className="absolute top-[50px] left-0 right-0 flex justify-between text-[12px] px-1 mt-3 md:mt-0">
          //     <span className="text-[#0d9488]">{data.side_1}</span>
          //     <span className="text-[#8d1f17]">{data.side_2}</span>
          //   </div>
          // </div>

          <div className="hidden sm:block w-full  h-[70px] relative pointer-events-none ml-2 flex-shrink-0">
            {/* Progress bar container */}
            <div
              className={`w-full h-[10px] bg-[#8D1F17]  rounded-full overflow-hidden mt-8 ${
                isDarkMode ? "bg-[#FF161A]" : "bg-[#FF161A]"
              }`}>
              <div
                className={`h-full ${
                  isDarkMode ? "bg-[#009443]" : "bg-[#009443]"
                } transition-all duration-500`}
                style={{ width: `${data.last_traded_yes || 0}%` }}></div>
            </div>

            {/* Center percentage */}
            <div className="absolute top-[2px] left-0  text-center">
              {data.last_traded_yes ? (
                <span
                  className={`mochi-fam text-[10px] font-bold ${
                    isDarkMode ? "text-[#A2FFF7]" : "text-[#028C80]"
                  }`}>
                  {data.side_1} {data.last_traded_yes}%
                </span>
              ) : null}
            </div>

            {/* Yes/No labels */}
            <div className="absolute top-[2px] right-0  text-center">
              {/* <span className="text-[#0d9488]">{data.side_1}</span> */}
              <span
                className={`mochi-fam text-[10px] font-bold ${
                  isDarkMode ? "text-[#FF483B]" : "text-[#8D1F17]"
                } `}>
                {data.side_2}
              </span>
            </div>
          </div>
        ) : null}

        {/* Yes/No buttons and chart container */}
        <div className="flex items-center justify-between">
          {/* Yes/No buttons container */}
          <div className="flex items-center space-x-3 w-full">
            {(() => {
              const firstMarket = res.sub_markets && res.sub_markets[0];
              const isSettled =
                firstMarket &&
                firstMarket.result &&
                firstMarket.status === "settled";

              if (isSettled) {
                // Show result for settled markets - "Result" on left, outcome on right
                return (
                  <div className="w-full flex justify-between items-center">
                    <span
                      className={`text-[14px] font-medium ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      Outcome
                    </span>
                    <span
                      className={`text-[14px] font-semibold ${
                        firstMarket.result === "yes"
                          ? "text-[#0d9488]"
                          : "text-[#8d1f17]"
                      }`}>
                      {firstMarket.result === "yes" ? data.side_1 : data.side_2}
                    </span>
                  </div>
                );
              } else {
                // Show Yes/No buttons for unsettled markets
                return (
                  <>
                    <div className="w-1/2 ">
                      <div
                        onClick={(e) =>
                          handleSelection(e, firstMarket._id, "yes")
                        }
                        className={`group ${
                          selectedOption === "yes"
                            ? "bg-[#009443] text-[#fff]"
                            : "bg-[#009443] text-[#fff]"
                        } ${
                          isDarkMode
                            ? "bg-[#009443] text-[#fff]"
                            : "bg-[#009443] text-[#fff]"
                        } w-full py-[6px] rounded-md text-center text-[13px] font-bold flex items-center justify-center transition-all duration-300  hover:text-white cursor-pointer`}>
                        {/* <IoPlayCircleOutline className="text-[18px] font-bold mr-1 mt-1 group-hover:animate-pulse flex items-center justify-center" /> */}
                        {data.side_1}
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div
                        onClick={(e) =>
                          handleSelection(e, firstMarket._id, "no")
                        }
                        className={`group ${
                          selectedOption === "no"
                            ? "      bg-[#FF161A] text-[#ffff]"
                            : "     bg-[#FF161A] text-[#ffff]"
                        } ${
                          isDarkMode
                            ? "      bg-[#FF161A] text-[#ffff]"
                            : "     bg-[#FF161A] text-[#ffff]"
                        } w-full py-[6px] rounded-md text-center text-[13px] font-bold flex items-center justify-center transition-all duration-300  cursor-pointer`}>
                        {/* <FaSquare className="text-[14px] font-bold mr-1 mt-1 group-hover:animate-pulse flex items-center justify-center" /> */}

                        {data.side_2}
                      </div>
                    </div>
                  </>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Section 3: Volume and bookmark - fixed height */}
      <div className="flex justify-between mt-auto">
        <h1
          className={`text-[14px] ${
            isDarkMode ? "text-[#C5C5C5]" : "text-zinc-500"
          }`}>
          {renderVolume()}
        </h1>
        <div className="flex ">
          <div
            className={`rounded flex items-center px-1 justify-center transition-all duration-200 cursor-pointer ${
              isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              const firstMarket = res.sub_markets && res.sub_markets[0];
              let selection = selectedOption;
              if (!selection && firstMarket) {
                selection = firstMarket.side_1;
              } else if (selection && firstMarket) {
                selection =
                  selection === "yes" ? firstMarket.side_1 : firstMarket.side_2;
              }
              const fullUrl = `${window.location.origin}/market/details/${
                res._id
              }?selection=${selection || ""}`;
              navigator.clipboard
                .writeText(fullUrl)
                .then(() => {
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 2000);
                })
                .catch((err) => {
                  console.error("Failed to copy URL: ", err);
                });
            }}>
            {/* <i
              className={`ri-share-2-line ${
                isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
              }`}
              onClick={handleCopyUrl}></i> */}
          </div>

          {/* {showCopied && (
            <div
              className={`absolute z-5 bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded flex items-center justify-center ${
                isDarkMode
                  ? "bg-white/30 text-white backdrop-blur-[10px] rounded-lg p-4 shadow-md"
                  : "bg-[#dfe0e0] text-zinc-700"
                }`}
            >
              URL copied to clipboard!
            </div>
          )} */}

          <div
            onClick={handleBookmarkToggle}
            className={`rounded flex items-center px-1 justify-around transition-all duration-200 cursor-pointer ${
              isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
            }`}>
            {/* {isBookmarked ? (
            <img
              className={`hover:opacity-80 ${isDarkMode ? "brightness-[1.8]" : ""}`}
              src={bookmarkFilled}
              alt="Bookmark Filled"
              style={{width: '16px', height: '16px'}}
            />
          ) : (
            <img
              className={`hover:opacity-80 ${isDarkMode ? "brightness-[1.8]" : ""}`}
              src={bookmark}
              alt="Bookmark"
              style={{width: '16px', height: '16px'}}
            />
          )} */}

            {isBookmarked ? (
              <FaRegCheckCircle
                className={` ${
                  isDarkMode ? "text-[#FFAE35]" : "text-[#FFAE35]"
                }`}
              />
            ) : (
              <IoMdAddCircleOutline
                className={` ${
                  isDarkMode ? "text-[#FFAE35]" : "text-[#FFAE35]"
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Trading Panel - new section */}
      <AnimatePresence>
        {showTradingPanel && (
          <motion.div
            variants={jellyVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-[-75px] left-0 inset-0 z-50 flex items-center justify-center">
            <div
              onClick={(e) => e.stopPropagation()} // Prevent click from closing panel
              className={` p-3 w-full h-[50%] shadow-lg  rounded-tl-xl  rounded-tr-xl  transition-all duration-300 flex flex-col ${
                isDarkMode
                  ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                  : "bg-[rgb(247,247,247)] shadow-[0px_3px_9px_0px_rgba(137,137,137,0.18)]"
              }`}>
              {/* Header - market info and close button */}
              <div className="flex justify-between items-center">
                <p
                  className={`text-[14px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000]"
                  } `}>
                  {marketData?.name}
                </p>

                {/* Close button */}
                <div
                  onClick={handleCloseTradingPanel}
                  className={`p-1 rounded-full cursor-pointer
                     transition-all duration-150
                     active:scale-95 active:translate-y-[1px] active:shadow-inner
                     ${
                       isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
                     }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    }`}>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </div>

              <div className="w-full h-auto flex  mt-2 items-center justify-between gap-1">
                <div className="w-full h-auto flex flex-col items-center justify-center gap-1">
                  <button
                    className="w-full h-10 bg-[#009443] rounded-[12px] text-[16px] font-bold text-white
                    hover:bg-[#007a36] transition-all duration-150
                    active:scale-95 active:translate-y-[1px] active:shadow-inner"
                    onClick={() =>
                      handleShowDialog(
                        marketData?._id,
                        marketData.side_1,
                        marketData
                      )
                    }>
                    {marketData?.side_1}
                  </button>

                  <p className="text-[12px] font-semibold text-[#777777]">
                    $100 →{" "}
                    <span className="text-[#009443]">
                      {" "}
                      {(100 / 0.3).toFixed(1)}
                    </span>
                  </p>
                </div>
                <div className="w-full h-auto flex flex-col items-center justify-center gap-1">
                  <button
                    className="w-full h-10 bg-[#FF161A] rounded-[12px] text-[16px] font-bold text-[#ffff]
                      transition-all duration-150
                    active:scale-95 active:translate-y-[1px] active:shadow-inner"
                    onClick={() =>
                      handleShowDialog(
                        marketData._id,
                        marketData.side_2,
                        marketData
                      )
                    }>
                    {marketData?.side_2}
                  </button>

                  <p className="text-[12px] font-semibold text-[#777777]">
                    $100 →{" "}
                    <span className="text-[#009443]">
                      {(100 / 0.3).toFixed(1)}{" "}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastMessage.includes("successful") ? "success" : "error"}
        onClose={() => setShowToast(false)}
      />

      <BetDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        selectedOption={selectedOption}
        fetchUserPositions={fetchUserPositions}
        onOptionSelect={handleOptionSelect}
        selectedMarketId={selectedMarketId}
        event={res}
        hasSubMarkets={res?.has_sub_markets}
        marketPrices={marketPrices}
        userPositions={userPositions}
        subMarket={subMarket}
        setAddPositon={setAddPositon}
        addPosition={addPosition}
        showLimit={showLimit}
      />
    </div>
  );
};

export default QuestionPieChart;
