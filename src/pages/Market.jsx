import React, { useEffect, useState, useRef } from "react";
// Navbar removed - now handled globally in App.jsx
// import MarketSideBar from "../components/MarketSideBar";
import like from "/like.svg";
import bookmarkFilled from "/soundbet Bookmark Light (2).svg";
import bookmark from "/soundbet Bookmark Light (1).svg";
import upload from "/Humble Icons Share.svg";
import dollar from "/Dollar Icon.svg";
import closingtime from "/soundbet Time Light Icons.svg";
import ActivityChart from "../components/charts/ActivityChart";
import GreenButton from "../components/Buttons/GreenButton";
import RedButton from "../components/Buttons/RedButton";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchData, postData } from "../services/apiServices";
import OrderBook from "../components/OrderBook";
import Dropdown from "../components/Dropdown";
import MobileTradingPanel from "../components/MobileTradingPanel";
import LoginDialog from "../components/auth/LoginDialog";
import PositionsSection from "../components/positions/PositionsSection";
import { useSelector } from "react-redux";
import { useToast } from "../context/ToastContext";
import { sub } from "date-fns";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
  transformOrderBookData,
  calculateMarketPrices,
  calculateSpreads,
} from "../utils/orderBookUtils";
import RegisterDialog from "../components/auth/RegisterDialog";
import { FaRegStar, FaStar } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";
import MarketSidebarNew from "../components/MarketSidebarNew";

import { Line } from "react-chartjs-2";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import StackedCard from "../components/charts/StackedCard";
import StockChart from "../components/StockChart";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";

// Market component now uses Server-Sent Events (SSE) for real-time order book updates
// The OrderBook component handles the SSE connection internally using the useOrderBookSSE hook

// Market Skeleton Component for loading state
const MarketSkeleton = () => {
  const { showSuccessToast, showErrorToast } = useToast();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  return (
    <div
      className={`w-full  min-h-screen  flex justify-center items-start   ${
        isDarkMode ? " " : ""
      }`}>
      <main className="  container w-full mx-0 px-2 sm:px-4 pt-32 sm:pt-34 pb-24 md:pt-36   2xl:max-w-[1330px]  ">
        <div className="flex flex-col lg:flex-row gap-10 mx-4">
          <div className="lg:flex-1 w-full">
            {/* Header section skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6">
              <div className="flex gap-2 items-center">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse`}></div>
                <div>
                  <div
                    className={`h-6 sm:h-7 w-60 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                    <div
                      className={`h-4 sm:h-5 w-24 ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}></div>
                    <div
                      className={`h-4 w-4 rounded-full ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } animate-pulse hidden sm:block`}></div>
                    <div
                      className={`h-4 sm:h-5 w-28 ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}></div>
                  </div>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl text-zinc-800 hidden sm:flex gap-2">
                <div
                  className={`w-8 h-8 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`w-8 h-8 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>
            </div>

            {/* Chart section skeleton */}
            <div className="mt-6">
              {/* Chart skeleton */}
              <div
                className={`w-full border rounded-md ${
                  isDarkMode ? "border-zinc-800" : "border-zinc-200"
                } overflow-hidden pt-4 pb-6 mb-5`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 mb-3 gap-3 sm:gap-0">
                  <div className="flex flex-col">
                    <div
                      className={`h-4 w-16 ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}></div>
                    <div
                      className={`h-6 w-32 ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse mt-1`}></div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-8 w-12 ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}></div>
                    ))}
                  </div>
                </div>
                <div
                  className={`h-[270px] sm:h-[310px] ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse mx-4 rounded-md`}></div>
              </div>
            </div>

            {/* Mobile summary section skeleton */}
            <div
              className={`mt-6 border rounded-md ${
                isDarkMode ? "border-zinc-800" : "border-zinc-200"
              } overflow-hidden lg:hidden mb-5`}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div
                    className={`h-6 w-24 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                  <div
                    className={`w-6 h-6 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-full animate-pulse`}></div>
                </div>
                <div className="space-y-2 mt-2">
                  <div
                    className={`h-4 w-full ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                  <div
                    className={`h-4 w-full ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                  <div
                    className={`h-4 w-3/4 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                </div>
              </div>
            </div>

            {/* Submarkets section skeleton */}
            <div>
              <hr
                className={`${
                  isDarkMode ? "border-zinc-800" : "text-zinc-300"
                } mb-2`}
              />
              <div className="px-1 sm:px-2 flex text-[14px] sm:text-xl w-full items-center">
                <div
                  className={`w-[45%] sm:w-[50%] h-5 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse rounded-md`}></div>
                <div
                  className={`w-[15%] h-5 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse rounded-md ml-auto`}></div>
                <div
                  className={`w-[30%] sm:w-[25%] h-5 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse rounded-md ml-auto`}></div>
              </div>
              <hr
                className={`${
                  isDarkMode ? "border-zinc-800" : "text-zinc-300"
                } my-2`}
              />

              {/* Generate 3 skeleton submarkets */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-2">
                  <div className="px-1 sm:px-2 py-3 flex items-center w-full">
                    <div className="flex items-center w-[45%] sm:w-[50%]">
                      <div
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } animate-pulse mr-2`}></div>
                      <div className="flex flex-col gap-1">
                        <div
                          className={`h-5 w-24 sm:w-36 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                        <div
                          className={`h-4 w-16 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                      </div>
                    </div>
                    <div
                      className={`w-[15%] h-7 ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } animate-pulse rounded-md text-center`}></div>
                    <div className="flex justify-between gap-2 sm:gap-4 w-[40%] sm:w-[35%] pl-2 sm:pl-4">
                      <div
                        className={`w-1/2 h-9 ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } animate-pulse rounded-md`}></div>
                      <div
                        className={`w-1/2 h-9 ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } animate-pulse rounded-md`}></div>
                    </div>
                  </div>
                  <hr
                    className={`${
                      isDarkMode ? "border-zinc-800" : "text-zinc-300"
                    } my-2`}
                  />
                </div>
              ))}
            </div>

            {/* Rules section skeleton */}
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <div
                  className={`h-6 sm:h-7 w-20 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`h-8 w-24 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>
              <div className="mt-2">
                <div
                  className={`h-4 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`h-4 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mt-2`}></div>
                <div
                  className={`h-4 w-3/4 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mt-2`}></div>
              </div>

              {/* Timeline and Payout skeleton */}
              <div className="mt-6">
                <div
                  className={`h-6 sm:h-7 w-48 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-2`}></div>
                <div className="flex gap-4">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-5 w-20 ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-5 w-40 sm:w-64 ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs skeleton section */}
            <div
              className={`flex mt-8 gap-7 border-b ${
                isDarkMode ? "border-zinc-800" : "border-gray-200"
              } pb-2`}>
              <div
                className={`h-6 sm:h-7 w-20 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}></div>
              <div
                className={`h-6 sm:h-7 w-28 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}></div>
              <div
                className={`h-6 sm:h-7 w-20 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}></div>
            </div>

            {/* Tab content skeleton */}
            <div className="mt-6">
              {/* Thoughts input skeleton */}
              <div
                className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-[5px] outline outline-offset-[-1px] ${
                  isDarkMode ? "outline-zinc-800" : "outline-zinc-300"
                } flex justify-between items-center gap-2 sm:gap-4 mb-6`}>
                <div
                  className={`h-5 sm:h-6 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`h-5 sm:h-6 w-12 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>

              {/* Thoughts content skeleton - 3 items */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8">
                  <div className="flex gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                        isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } animate-pulse`}></div>
                    <div className="flex-1">
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <div
                          className={`h-4 w-24 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                        <div
                          className={`h-3 w-16 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div
                          className={`h-4 w-full ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                        <div
                          className={`h-4 w-3/4 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <div
                          className={`h-4 w-4 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                        <div
                          className={`h-4 w-8 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                        <div
                          className={`h-4 w-14 ${
                            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton - Fixed for desktop view */}
          <div
            className="hidden lg:block"
            style={{ width: "320px", minWidth: "320px" }}>
            <div
              className={`${
                isDarkMode ? "bg-[#1A1B1E]" : "bg-neutral-100"
              } rounded-xl p-4 ${
                isDarkMode
                  ? "shadow-[0px_0px_9px_1.8px_rgba(0,0,0,0.3)]"
                  : "shadow-[0px_0px_9px_1.8px_rgba(87,87,87,0.18)]"
              } h-auto`}>
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`h-6 w-32 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse`}></div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-4">
                  <div
                    className={`h-5 w-12 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                  <div
                    className={`h-5 w-12 ${
                      isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}></div>
                </div>
                <div
                  className={`h-8 w-24 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>
              <hr
                className={`my-3 ${
                  isDarkMode ? "border-zinc-800" : "border-zinc-300"
                }`}
              />
              <div className="my-4 flex justify-between gap-2">
                <div
                  className={`w-1/2 h-10 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
                <div
                  className={`w-1/2 h-10 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-32 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-2`}></div>
                <div
                  className={`h-10 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-40 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-2`}></div>
                <div
                  className={`h-10 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-24 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-2`}></div>
                <div
                  className={`h-10 w-full ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}></div>
              </div>

              <div
                className={`mt-6 h-12 w-full ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Market = ({ addPosition, setAddPositon, sidebar }) => {
  const { id } = useParams();
  const location = useLocation();
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  const [thoughts, setThoughts] = useState([]);
  const [thoughtReplies, setThoughtReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [openSubmarkets, setOpenSubmarkets] = useState({});
  const [selectedOption, setSelectedOption] = useState("Yes");
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [timelineFilter, setTimelineFilter] = useState("all"); // Default to daily
  const [probabilityData, setProbabilityData] = useState([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false); // Prevent timeframe UI change until data loads
  const [marketPrices, setMarketPrices] = useState(null); // Store market prices for current selection
  const [allMarketPricesData, setAllMarketPricesData] = useState({}); // Store all market prices by marketId
  const [allOrderBookData, setAllOrderBookData] = useState({}); // Store all orderbook data by marketId
  const [allLastTradedSide1Price, setAllLastTradedSide1Price] = useState({}); // Store last traded prices for all markets
  const [expandedReplies, setExpandedReplies] = useState({});
  const [thoughtInput, setThoughtInput] = useState("");
  const [isPostingThought, setIsPostingThought] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // Add state for current user ID
  const [activeTab, setActiveTab] = useState("thoughts"); // New state for tab control
  const [topHolders, setTopHolders] = useState({
    yes: [],
    no: [],
  });
  const [subMarket, setSubmarket] = useState();

  const orderTypes = [
    "Donald Trump",
    "Pope Leo XIV",
    "Sam Altman",
    "ChatGPT",
    "Zohran Mamdani",
    "Charlie Kirk",
    "Benjamin Netanyahu",
    "Xi Jinping",
    "Peter Thiel",
    "Elon Musk",
    "Volodymyr Zelenskyy",
  ];

  const [orderType, setOrderType] = useState(orderTypes[0]);
  const [isOpen, setIsOpen] = useState(false);
  // Cancel order dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [loadingActivity, setLoadingActivity] = useState(false);
  // Add state for mobile bottom sheet
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  // Add ref for bottom sheet
  const bottomSheetRef = useRef(null);
  // Add state for bookmark functionality
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  // Add ref for submarket elements
  const submarketRefs = useRef({});
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const summaryRef = useRef(null);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 1024);
  const [isSummaryContentVisible, setIsSummaryContentVisible] = useState(
    !isSummaryCollapsed
  );
  const [isMobileSummaryContentVisible, setIsMobileSummaryContentVisible] =
    useState(true);
  const summaryContentRef = useRef(null);
  const mobileSummaryContentRef = useRef(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // Add state for content visibility (fade animation)
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const toggleRules = () => setIsRulesExpanded((prev) => !prev);

  // Add state to track if positions section should be visible and if initial data is loaded
  const [showPositionsSection, setShowPositionsSection] = useState(false);
  const [initialPositionsLoaded, setInitialPositionsLoaded] = useState(false);
  const [userPositions, setUserPositions] = useState([]); // Add state for user positions
  const [userOrders, setUserOrders] = useState([]); // Add state for user orders

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [marketHasStarted, setMarketHasStarted] = useState(true);

  // Countdown state for market closes
  const [closesCountdown, setClosesCountdown] = useState("Loading...");

  // Function to check screen size and set desktop/mobile view
  const checkScreenSize = () => {
    setIsDesktopView(window.innerWidth >= 1024);
  };

  // Add event listener for screen resize
  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Function to toggle bottom sheet
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  // Function to toggle desktop summary section collapse/expand
  const toggleSummary = () => {
    setIsSummaryCollapsed(!isSummaryCollapsed);

    // Handle content visibility with delay for smooth animation
    if (!isSummaryCollapsed) {
      // Collapsing - hide content immediately
      setIsSummaryContentVisible(false);
    } else {
      // Expanding - show content after a short delay
      setTimeout(() => {
        setIsSummaryContentVisible(true);
      }, 150);
    }
  };

  // Function to toggle mobile summary section collapse/expand
  const toggleMobileSummary = () => {
    setIsSummaryCollapsed(!isSummaryCollapsed);

    // Handle content visibility with delay for smooth animation
    if (!isSummaryCollapsed) {
      // Collapsing - hide content immediately
      setIsMobileSummaryContentVisible(false);
    } else {
      // Expanding - show content after a short delay
      setTimeout(() => {
        setIsMobileSummaryContentVisible(true);
      }, 150);
    }
  };

  const comments = [1, 2, 3];

  const timelineOptions = [
    { value: "1h", label: "1H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1m", label: "1M" },
    { value: "all", label: "ALL" },
  ];

  useEffect(() => {
    // Listen for changes from OrderBook component
    const handleOrderBookSideChange = (event) => {
      setSelectedOption(event.detail.side);
    };

    window.addEventListener(
      "orderbook-side-changed",
      handleOrderBookSideChange
    );

    // Clean up event listener
    return () => {
      window.removeEventListener(
        "orderbook-side-changed",
        handleOrderBookSideChange
      );
    };
  }, []);

  const toggleOrderBook = (submarketId, option) => {
    // Get the current state for this submarket
    const isCurrentlyOpen = openSubmarkets[submarketId];

    // First, close any currently open submarket with animation
    const closeCurrentlyOpenSubmarket = () => {
      // Find which submarket is currently open
      const openSubmarketId = Object.keys(openSubmarkets).find(
        (id) => openSubmarkets[id]
      );

      if (openSubmarketId && openSubmarketId !== submarketId) {
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

    if (isCurrentlyOpen) {
      // CLOSING: Get the ref element for this submarket
      const submarketEl = submarketRefs.current[submarketId];
      if (submarketEl) {
        // First set exact height before transitioning to 0
        const height = submarketEl.scrollHeight;
        submarketEl.style.height = `${height}px`;

        // Force a reflow to ensure the browser recognizes the height
        submarketEl.offsetHeight;

        // Transition to 0 height
        submarketEl.style.height = "0px";

        // Wait for animation to finish before updating state
        setTimeout(() => {
          setOpenSubmarkets((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
              newState[key] = false;
            });
            return newState;
          });
        }, 500); // Match this to your transition duration
      }
    } else {
      // OPENING: First close any currently open submarket
      closeCurrentlyOpenSubmarket();

      // Update state immediately to render the component
      setOpenSubmarkets((prev) => {
        // Create a new object with all submarkets closed
        const newState = {};
        Object.keys(prev).forEach((key) => {
          newState[key] = false;
        });
        // Open only the clicked submarket
        newState[submarketId] = true;
        return newState;
      });

      // After the state update and render cycle
      requestAnimationFrame(() => {
        const submarketEl = submarketRefs.current[submarketId];
        if (submarketEl) {
          // Set initial height to 0
          submarketEl.style.height = "0px";

          // Force reflow
          submarketEl.offsetHeight;

          // Get the final height
          const height = submarketEl.scrollHeight;

          // Animate to the final height
          submarketEl.style.height = `${height}px`;

          // Reset to auto after animation completes to allow for content changes
          setTimeout(() => {
            submarketEl.style.height = "auto";
          }, 500);
        }
      });
    }

    // If we're opening this submarket, also select it
    if (!openSubmarkets[submarketId]) {
      handleOptionSelect(submarketId, option);
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

  const calculateChance = (submarket) => {
    // Use lastTradedSide1Price from the API data (already in percentage format)
    if (
      submarket.lastTradedSide1Price !== null &&
      submarket.lastTradedSide1Price !== undefined
    ) {
      return submarket.lastTradedSide1Price; // Already in cents/percentage format (33 = 33%)
    }

    // Fallback to 0 if no last traded price available
    return 0;
  };

  // Separate function to fetch order book data for all submarkets
  const fetchAllSubmarketsData = async () => {
    try {
      if (event?.sub_markets) {
        const updatedPrices = { ...allLastTradedSide1Price };
        const updatedMarketPrices = { ...allMarketPricesData };
        const updatedOrderBookData = { ...allOrderBookData };

        // Fetch data for each submarket in parallel
        await Promise.all(
          event.sub_markets.map(async (submarket) => {
            const response = await fetchData(
              `api/event/orderbook?market_id=${submarket._id}`
            );
            if (response) {
              // Update last traded price for this submarket
              if (response.lastTradedSide1Price !== undefined) {
                updatedPrices[submarket._id] = response.lastTradedSide1Price;
              }
              // Update market prices for this submarket
              if (response.marketPrices) {
                updatedMarketPrices[submarket._id] = response.marketPrices;
              }
              // Update complete orderbook data for this submarket
              if (response.orderbook) {
                // Get dynamic side names for this submarket
                const side1 = submarket.side_1 || "Yes";
                const side2 = submarket.side_2 || "No";

                // Transform the new orderbook format
                const transformedOrderBook = transformOrderBookData(
                  response,
                  side1,
                  side2
                );

                // Calculate spreads from actual ask/bid gap
                const calculatedSpreads = calculateSpreads(
                  transformedOrderBook,
                  side1,
                  side2
                );

                updatedOrderBookData[submarket._id] = {
                  orderBook: transformedOrderBook,
                  spreads: calculatedSpreads, // Use calculated spreads
                  marketInfo: response.marketInfo || null,
                };

                // Calculate market prices if not provided by API
                if (!response.marketPrices) {
                  const calculatedMarketPrices = calculateMarketPrices(
                    transformedOrderBook,
                    side1,
                    side2
                  );
                  updatedMarketPrices[submarket._id] = calculatedMarketPrices;
                }
              }
            }
          })
        );

        setAllLastTradedSide1Price(updatedPrices);
        setAllMarketPricesData(updatedMarketPrices);
        setAllOrderBookData(updatedOrderBookData);
      }
    } catch (error) {
      console.error("Error fetching all submarkets data:", error);
    }
  };

  // Function to fetch user positions
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

  // Function to fetch user orders
  const fetchUserOrders = async (eventId) => {
    if (!eventId) {
      setUserOrders([]);
      return { success: false, openOrders: [] };
    }
    try {
      const response = await fetchData(
        `api/event/orders/open${eventId ? `?eventId=${eventId}` : ""}`
      );
      if (response.success) {
        setUserOrders(response.openOrders);
      }
      return response;
    } catch (error) {
      console.error("Error in fetchUserOrders:", error);
      return {
        success: false,
        openOrders: [],
        pagination: { totalOrders: 0, currentPage: 1, totalPages: 1 },
      };
    }
  };

  const GetData = async () => {
    try {
      setLoading(true);
      setIsContentVisible(false); // Hide content before loading new data
      const res = await fetchData(`api/event/events/${id}`);
      if (res.event && res.event.is_live_sports) {
        navigate(`/market/sports?gameView=true&eventId=${id}`);
        return; // Exit the function early to prevent further data loading
      }

      setEvent(res.event);

      // Set bookmark state directly from the event data
      if (res.event && res.event.isBookmarked !== undefined) {
        setIsBookmarked(res.event.isBookmarked);
      }

      // Fetch all data in parallel including positions and orders
      const dataPromises = [];

      // Thoughts data
      dataPromises.push(
        fetchData(`api/user/events/${res.event._id}/thoughts?page=1&limit=10`)
          .then(async (thoughtsRes) => {
            if (thoughtsRes.success) {
              setThoughts(thoughtsRes.thoughts);

              // If there are thoughts with replies, fetch their replies
              const thoughtsWithReplies = thoughtsRes.thoughts.filter(
                (thought) => thought.replyCount > 0
              );
              await Promise.all(
                thoughtsWithReplies.map(async (thought) => {
                  try {
                    const repliesRes = await fetchData(
                      `api/user/thoughts/${thought._id}/replies?page=1&limit=10`
                    );
                    if (repliesRes.success) {
                      setThoughtReplies((prev) => ({
                        ...prev,
                        [thought._id]: repliesRes.replies,
                      }));
                    }
                  } catch (replyErr) {
                    console.error(
                      `Error fetching replies for thought ${thought._id}:`,
                      replyErr
                    );
                  }
                })
              );
            }
          })
          .catch((thoughtsErr) => {
            console.error("Error fetching thoughts:", thoughtsErr);
          })
      );

      // Activity data
      dataPromises.push(
        fetchData(
          `api/event/events/${id}/transactions?page=${activityPage}&limit=10`
        )
          .then((response) => {
            if (response.success) {
              setActivityData(response.activities);
              setActivityTotalPages(response.pagination.totalPages);
            }
          })
          .catch((error) => {
            console.error("Error fetching activity data:", error);
          })
      );

      // Top holders data
      dataPromises.push(
        fetchData(`api/event/events/${id}/holdings`)
          .then((response) => {
            if (response.success) {
              setTopHolders(response.holdings);
            }
          })
          .catch((error) => {
            console.error("Error fetching top holders data:", error);
          })
      );

      // Position data
      dataPromises.push(
        fetchUserPositions(id).then(() => {
          setInitialPositionsLoaded(true);
          setShowPositionsSection(true);
        })
      );

      // Orders data
      dataPromises.push(fetchUserOrders(id));

      // Submarkets data
      if (res.event?.sub_markets) {
        const initialOpenState = {};
        res.event.sub_markets.forEach((sub) => {
          initialOpenState[sub._id] = false;
        });
        setOpenSubmarkets(initialOpenState);

        // Add submarkets data to parallel fetch
        dataPromises.push(fetchAllSubmarketsData());
      }

      // Wait for all data to be fetched in parallel
      await Promise.all(dataPromises);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
      // Delay making content visible for smooth transition
      setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
    }
  };

  // Helper function to get price for a specific submarket
  const getSubmarketPrices = (submarketId) => {
    if (!allMarketPricesData || !allMarketPricesData[submarketId]) {
      return {
        side1BestAsk: null,
        side2BestAsk: null,
      };
    }

    const prices = allMarketPricesData[submarketId];

    // Find the submarket to get its side_1 and side_2
    const submarket = event?.sub_markets?.find((m) => m._id === submarketId);
    if (!submarket) {
      return {
        side1BestAsk: null,
        side2BestAsk: null,
      };
    }
    const side1 = submarket.side_1;
    const side2 = submarket.side_2;
    return {
      side1BestAsk:
        prices[side1]?.bestAsk !== null && prices[side1]?.bestAsk !== undefined
          ? prices[side1].bestAsk
          : null,
      side2BestAsk:
        prices[side2]?.bestAsk !== null && prices[side2]?.bestAsk !== undefined
          ? prices[side2].bestAsk
          : null,
    };
  };

  // Handle real-time price updates from OrderBook SSE
  const handlePriceUpdate = (submarketId, newPrices) => {
    // Find the submarket to get its dynamic sides
    const submarket = event?.sub_markets?.find((m) => m._id === submarketId);
    const side1 = submarket?.side_1 || "Yes";
    const side2 = submarket?.side_2 || "No";
    // First update all market prices data cache
    setAllMarketPricesData((prevData) => ({
      ...prevData,
      [submarketId]: newPrices,
    }));

    // If this is the currently selected market, update the sidebar prices too
    if (submarketId === selectedMarketId) {
      setMarketPrices(newPrices);
    }
  };

  const fetchProbabilityData = async (intervalOverride, returnOnly = false) => {
    try {
      // Use event_id instead of market_id for the API call
      const response = await fetchData(
        `api/event/markets/probability?event_id=${event._id}&interval=${
          intervalOverride || timelineFilter
        }`
      );
      if (response.success) {
        // Transform new API format to old format expected by ActivityChart
        const transformedData =
          response.markets?.map((market) => ({
            market_id: market.id,
            market_name: market.name,
            side_1: market.s1,
            side_2: market.s2,
            data:
              market.history?.map((point) => ({
                time: new Date(point.t * 1000).toISOString(), // Convert Unix timestamp to ISO string
                probability: point.p, // keep number; ActivityChart parses float
                a: point.a, // preserve availability flag for dotted rendering
              })) || [],
          })) || [];

        if (!returnOnly) {
          setProbabilityData(transformedData);
        }
        return transformedData;
      }
    } catch (err) {
      console.error("Error fetching probability data:", err);
    }
  };

  const handleLoadReplies = async (thoughtId) => {
    if (loadingReplies[thoughtId]) return;

    setLoadingReplies((prev) => ({ ...prev, [thoughtId]: true }));
    try {
      const repliesRes = await fetchData(
        `api/user/thoughts/${thoughtId}/replies?page=1&limit=10`
      );
      if (repliesRes.success) {
        setThoughtReplies((prev) => ({
          ...prev,
          [thoughtId]: repliesRes.replies,
        }));
        // Auto-expand when replies are loaded
        setExpandedReplies((prev) => ({
          ...prev,
          [thoughtId]: true,
        }));
      }
    } catch (err) {
      console.error(`Error loading replies for thought ${thoughtId}:`, err);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [thoughtId]: false }));
    }
  };

  // Consolidated function to fetch order book data for a specific market
  const fetchOrderBookDataForMarket = async (marketId) => {
    try {
      // Check if data already exists from fetchAllSubmarketsData
      const existingOrderBookData = allOrderBookData[marketId];
      const existingMarketPrices = allMarketPricesData[marketId];
      const existingLastTradedPrice = allLastTradedSide1Price[marketId];

      // If all data exists, use it instead of making API call
      if (
        existingOrderBookData &&
        existingMarketPrices &&
        existingLastTradedPrice !== undefined
      ) {
        // If this marketId is currently selected, update marketPrices state
        if (selectedMarketId === marketId) {
          setMarketPrices(existingMarketPrices);
        }
        return;
      }

      // If data doesn't exist, make API call
      const response = await fetchData(
        `api/event/orderbook?market_id=${marketId}`
      );
      if (response) {
        // Update last traded price for this submarket
        if (response.lastTradedSide1Price !== undefined) {
          setAllLastTradedSide1Price((prev) => ({
            ...prev,
            [marketId]: response.lastTradedSide1Price,
          }));
        }

        // Update market prices for this submarket
        if (response.marketPrices) {
          setAllMarketPricesData((prev) => ({
            ...prev,
            [marketId]: response.marketPrices,
          }));

          // If this marketId is currently selected, update marketPrices state
          if (selectedMarketId === marketId) {
            setMarketPrices(response.marketPrices);
          }
        }

        // Update complete orderbook data for this submarket
        if (response.orderbook) {
          // Get the dynamic side names for this market
          const submarket = event?.sub_markets?.find((m) => m._id === marketId);
          const side1 = submarket?.side_1 || "Yes";
          const side2 = submarket?.side_2 || "No";

          // Transform the new orderbook format
          const transformedOrderBook = transformOrderBookData(
            response,
            side1,
            side2
          );

          // Calculate market prices from transformed orderbook
          const calculatedMarketPrices = calculateMarketPrices(
            transformedOrderBook,
            side1,
            side2
          );

          // Calculate spreads from actual ask/bid gap
          const calculatedSpreads = calculateSpreads(
            transformedOrderBook,
            side1,
            side2
          );

          setAllOrderBookData((prev) => ({
            ...prev,
            [marketId]: {
              orderBook: transformedOrderBook,
              spreads: calculatedSpreads, // Use calculated spreads instead of API spreads
              marketInfo: response.marketInfo || null,
            },
          }));

          // Also update market prices if not already provided by API
          if (!response.marketPrices) {
            setAllMarketPricesData((prev) => ({
              ...prev,
              [marketId]: calculatedMarketPrices,
            }));

            // If this marketId is currently selected, update marketPrices state
            if (selectedMarketId === marketId) {
              setMarketPrices(calculatedMarketPrices);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching order book data for market:", err);
    }
  };

  const handlePostThought = async () => {
    // Check if input is empty
    if (!thoughtInput.trim()) {
      alert("Please enter a thought before posting");
      return;
    }

    // Check if user is logged in by checking token
    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      setShowLoginDialog(true);
      return;
    }

    try {
      setIsPostingThought(true);
      const response = await postData("api/user/thoughts", {
        content: thoughtInput.trim(),
        eventId: event._id,
      });

      if (response.success) {
        // Clear input
        setThoughtInput("");
        // Refresh thoughts to show the new one
        const thoughtsRes = await fetchData(
          `api/user/events/${event._id}/thoughts?page=1&limit=10`
        );
        if (thoughtsRes.success) {
          setThoughts(thoughtsRes.thoughts);
        }
      }
    } catch (error) {
      console.error("Error posting thought:", error);
      alert("Failed to post thought. Please try again.");
    } finally {
      setIsPostingThought(false);
    }
  };

  const handleReplyClick = (thoughtId, userId) => {
    // Check if user is trying to reply to their own thought
    if (userId === currentUserId) {
      showErrorToast("You cannot reply to your own thought");
      // alert("You cannot reply to your own thought");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      setShowLoginDialog(true);
      return;
    }

    setReplyingTo(thoughtId);
    setReplyInput("");
  };

  const handlePostReply = async (thoughtId) => {
    // Check if input is empty
    if (!replyInput.trim()) {
      alert("Please enter a reply before posting");
      return;
    }

    // Check if user is logged in by checking token
    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      setShowLoginDialog(true);
      return;
    }

    try {
      setIsPostingReply(true);
      const response = await postData("api/user/thoughts", {
        content: replyInput.trim(),
        eventId: event._id,
        parentId: thoughtId,
      });

      if (response.success) {
        // Clear input and close reply box
        setReplyInput("");
        setReplyingTo(null);

        // Refresh replies for this thought
        await handleLoadReplies(thoughtId);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsPostingReply(false);
    }
  };

  // Parse URL query parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const marketId = searchParams.get("marketId");
    const selection = searchParams.get("selection");
    return { marketId, selection };
  };

  // Function to copy current URL to clipboard with multiple fallbacks
  const handleShareClick = async () => {
    const currentUrl = window.location.href;

    try {
      // Try the modern navigator.clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        showSuccessToast("URL copied to clipboard!");
        return;
      }

      // Fallback 1: Document execCommand method
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;

      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        showSuccessToast("URL copied to clipboard!");
        return;
      }

      // Fallback 2: Web Share API for mobile devices
      if (navigator.share) {
        try {
          await navigator.share({
            title: event?.event_title || "Market share",
            text: "Check out this market on soundbet!",
            url: currentUrl,
          });
          showSuccessToast("Shared successfully!");
          return;
        } catch (shareError) {
          console.error("Share API error:", shareError);
          // Continue to fallback 3 if sharing fails
        }
      }

      // Fallback 3: Prompt user to copy manually
      prompt("Copy this link to share:", currentUrl);
      showSuccessToast("Please copy the URL manually");
    } catch (err) {
      console.error("Failed to share:", err);
      showErrorToast("Failed to copy URL. Please try again.");
    }
  };

  // Add this new function to fetch activity/transaction data
  const fetchActivityData = async () => {
    try {
      setLoadingActivity(true);
      const response = await fetchData(
        `api/event/events/${id}/transactions?page=${activityPage}&limit=10`
      );
      if (response.success) {
        setActivityData(response.activities);
        setActivityTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Add this new function to fetch top holders data
  const fetchTopHoldersData = async () => {
    try {
      setLoadingHoldings(true);
      const response = await fetchData(`api/event/events/${id}/holdings`);
      if (response.success) {
        setTopHolders(response.holdings);
      }
    } catch (error) {
      console.error("Error fetching top holders data:", error);
    } finally {
      setLoadingHoldings(false);
    }
  };

  useEffect(() => {
    GetData();
  }, [id]);

  // Add a new effect to handle pagination changes for activity data
  useEffect(() => {
    if (id) {
      fetchActivityData();
    }
  }, [activityPage, id]);

  // Effect to handle URL parameters and set initial state when event data is available
  useEffect(() => {
    if (event) {
      // Get URL parameters
      const { marketId, selection } = getUrlParams();

      // If marketId and selection are provided in URL
      if (marketId && selection) {
        // Check if the market ID exists in the event's submarkets
        const marketExists = event.sub_markets?.some(
          (market) => market._id === marketId
        );

        // Only set the market if it exists in the event's submarkets
        if (marketExists) {
          setSelectedMarketId(marketId);
          setSelectedOption(selection);
          fetchOrderBookDataForMarket(marketId); // Fetch order book data for this specific market

          // Also update the openSubmarkets state to show this market
          if (event.has_sub_markets) {
            setOpenSubmarkets((prev) => {
              // Create a new state with all submarkets closed
              const newState = {};
              Object.keys(prev).forEach((key) => {
                newState[key] = false;
              });
              // Open only the selected submarket
              newState[marketId] = true;
              return newState;
            });
          }
        } else {
          defaultToFirstMarket();
        }
      }
      // Otherwise use default logic
      else {
        defaultToFirstMarket();
      }
    }

    // Helper function to set the first market as default
    function defaultToFirstMarket() {
      // If there are submarkets, select the first one by default
      if (event.has_sub_markets && event.sub_markets?.length > 0) {
        const defaultMarketId = event.sub_markets[0]._id;
        setSelectedMarketId(defaultMarketId);
        // Default to 'yes' selection if no selection preference is found
        setSelectedOption(event.sub_markets[0].side_1);
        fetchOrderBookDataForMarket(defaultMarketId); // Fetch order book data for default market
      } else {
        setSelectedMarketId(id);
        setSelectedOption(event.sub_markets[0].side_1);
        fetchOrderBookDataForMarket(id); // Fetch order book data for the main market
      }
    }
  }, [event, id, location.search]);

  // Effect to handle market selection changes and update the sidebar with the right market data
  useEffect(() => {
    if (selectedMarketId) {
      // Always fetch probability data when time frame changes
      fetchProbabilityData();

      // Only fetch order book data if we don't already have it
      if (!allMarketPricesData[selectedMarketId]) {
        fetchOrderBookDataForMarket(selectedMarketId);
      } else {
        // If we already have data for this market, use it immediately
        setMarketPrices(allMarketPricesData[selectedMarketId]);
      }
    }
  }, [selectedMarketId, timelineFilter]);

  // Add auto-refresh interval for submarkets data
  useEffect(() => {
    if (event?.sub_markets) {
      // Initial fetch
      fetchAllSubmarketsData();

      // Set up auto-refresh interval (every 30 seconds)
      const intervalId = setInterval(fetchAllSubmarketsData, 30000);

      // Cleanup on component unmount
      return () => clearInterval(intervalId);
    }
  }, [event]);

  // Add function to get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem("UnomarketToken");
    if (token) {
      try {
        // Decode the JWT token to get user info
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleTimelineChange = async (option) => {
    // Don't change the visible timeline until the data for it is loaded
    if (!option || option.value === timelineFilter || isTimelineLoading) return;
    try {
      setIsTimelineLoading(true);
      // Prefetch data for the requested interval without switching the UI yet
      const prefetched = await fetchProbabilityData(option.value, true);
      // Once loaded, switch the timeline and immediately show data
      setTimelineFilter(option.value);
      if (prefetched) setProbabilityData(prefetched);
    } catch (e) {
      console.error("handleTimelineChange failed: ", e);
    } finally {
      setIsTimelineLoading(false);
    }
  };

  const handleBookmarkClick = async () => {
    if (isBookmarkProcessing) return;

    try {
      setIsBookmarkProcessing(true);

      // Check if user is logged in
      const token = localStorage.getItem("UnomarketToken");
      if (!token) {
        setShowLoginDialog(true);
        setIsBookmarkProcessing(false);
        return;
      }

      // Call the API to toggle bookmark status with the correct payload structure
      const response = await postData("api/user/bookmarks", {
        type: "event",
        content_id: event._id,
      });
      if (response.status) {
        setIsBookmarked(!isBookmarked);
        showSuccessToast(
          isBookmarked
            ? "Market removed from bookmarks"
            : "Market added to bookmarks"
        );
        GetData();
      } else {
        console.error("Failed to toggle bookmark:", response.message);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      showErrorToast("Failed to update bookmark. Please try again.");
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  // Silent refresh functions that update data without showing loading states
  const silentRefreshActivityData = async () => {
    try {
      const response = await fetchData(
        `api/event/events/${id}/transactions?page=${activityPage}&limit=10`
      );
      if (response.success) {
        setActivityData(response.activities);
        setActivityTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  const silentRefreshTopHoldersData = async () => {
    try {
      const response = await fetchData(`api/event/events/${id}/holdings`);
      if (response.success) {
        setTopHolders(response.holdings);
      }
    } catch (error) {
      console.error("Error fetching top holders data:", error);
    }
  };

  const silentRefreshEventData = async () => {
    try {
      const res = await fetchData(`api/event/events/${id}`);
      if (res.event) {
        setEvent(res.event);

        // Set bookmark state directly from the event data
        if (res.event.isBookmarked !== undefined) {
          setIsBookmarked(res.event.isBookmarked);
        }

        // Update submarkets state if needed
        if (res.event.sub_markets) {
          const initialOpenState = {};
          res.event.sub_markets.forEach((sub) => {
            initialOpenState[sub._id] = false;
          });
          setOpenSubmarkets(initialOpenState);
        }
      }
    } catch (error) {
      console.error("Error in silentRefreshEventData:", error);
    }
  };

  const silentRefreshProbabilityData = async () => {
    try {
      if (id) {
        const response = await fetchData(
          `api/event/markets/probability?event_id=${id}&interval=${timelineFilter}`
        );
        if (response.success) {
          // Transform new API format to old format expected by ActivityChart
          const transformedData =
            response.markets?.map((market) => ({
              market_id: market.id,
              market_name: market.name,
              side_1: market.s1,
              side_2: market.s2,
              data:
                market.history?.map((point) => ({
                  time: new Date(point.t * 1000).toISOString(), // Convert Unix timestamp to ISO string
                  probability: point.p, // keep number
                  a: point.a, // preserve availability
                })) || [],
            })) || [];

          setProbabilityData(transformedData);
        }
      }
    } catch (error) {
      console.error("Error in silentRefreshProbabilityData:", error);
    }
  };

  // Listen for trade/order success events and refetch all market data
  useEffect(() => {
    const handleTradeSuccess = async () => {
      // First refresh the event data to ensure we have the latest event info
      await silentRefreshEventData();

      // Then refresh all other data that depends on event data
      await Promise.all([
        silentRefreshActivityData(),
        silentRefreshTopHoldersData(),
        fetchAllSubmarketsData(), // This one doesn't set loading states
        silentRefreshProbabilityData(), // Silent refresh for probability data
        fetchUserPositions(id), // Refresh positions data
        fetchUserOrders(id), // Refresh orders data
      ]);

      // Show success toast message
      showSuccessToast("Order placed successfully");
    };
    window.addEventListener("soundbet-trade-success", handleTradeSuccess);
    return () =>
      window.removeEventListener("soundbet-trade-success", handleTradeSuccess);
  }, [id, activityPage, timelineFilter]); // Added timelineFilter dependency

  // Handle positions update from PositionsSection
  const handlePositionsUpdate = (positions) => {
    setUserPositions(positions);
  };

  // Add function to handle selling from positions
  const handleSellClick = (position) => {
    // First, select the correct market and option
    const marketId = position.marketId;
    const side = position.side === "Yes" ? "yes" : "no";

    // Set the selected market and option
    setSelectedMarketId(marketId);
    setSelectedOption(side);

    // Create and dispatch a custom event to notify MarketSideBar to switch to sell
    const customEvent = new CustomEvent("position-sell-click", {
      detail: {
        marketId,
        side,
        shares: position.shares,
        price: position.currentPricePerShare,
      },
    });
    window.dispatchEvent(customEvent);

    // For mobile devices, show the trading panel
    if (!isDesktopView) {
      setIsBottomSheetOpen(true);
    }
  };

  // Function to toggle cancel order dialog
  const toggleCancelDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelDialog((prev) => !prev);
  };

  // Function to cancel order
  const cancelOrder = async (orderId) => {
    try {
      const response = await postData(`api/event/orders/${orderId}/cancel`, {});

      if (response.success) {
        // window.location.reload();
      }
      return {
        success: response.success,
        message: response.message || "Order canceled successfully",
      };
    } catch (error) {
      console.error("Error canceling order:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to cancel order",
      };
    }
  };

  // Handle cancel order button click
  const handleCancelOrderClick = (orderId) => {
    toggleCancelDialog(orderId);
  };

  // Handle confirm cancel
  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;

    setCancelLoading(true);

    try {
      const response = await cancelOrder(selectedOrderId);

      if (response.success) {
        // Show success toast - UI will be updated by PositionsSection component
        showSuccessToast("Order canceled successfully");

        // Dispatch event to refresh positions section
        window.dispatchEvent(new Event("Soundbet-trade-success"));
      } else {
        // Show error toast
        showErrorToast(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error in handleConfirmCancel:", error);
      setToastMessage("An error occurred while canceling the order");
      setShowToast(true);
    } finally {
      setCancelLoading(false);
      setShowCancelDialog(false);
      setSelectedOrderId(null);
    }
  };

  // Handle cancel dialog close
  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setSelectedOrderId(null);
  };

  // Handle escape key for cancel dialog
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

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (
      timeRemaining !== null &&
      marketHasStarted === false &&
      selectedMarketId
    ) {
      // If the market hasn't started, calculate the time remaining
      const calculateTimeRemaining = () => {
        const now = new Date();
        const selectedMarket = event.sub_markets?.find(
          (m) => m._id === selectedMarketId
        );
        const startTime = new Date(selectedMarket?.start_date);
        const diff = startTime - now;

        if (diff <= 0) {
          // Market has started
          setMarketHasStarted(true);
          setTimeRemaining(null);
        } else {
          // Update the time remaining every second
          setTimeRemaining(diff);
        }
      };

      calculateTimeRemaining(); // Initial calculation
      timer = setInterval(calculateTimeRemaining, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, event, marketHasStarted, selectedMarketId]);

  // Initialize countdown check when selectedMarketId or event changes
  useEffect(() => {
    if (event && selectedMarketId) {
      const selectedMarket = event.sub_markets?.find(
        (m) => m._id === selectedMarketId
      );
      if (selectedMarket?.start_date) {
        const now = new Date();
        const startTime = new Date(selectedMarket.start_date);

        if (now < startTime) {
          // Market hasn't started yet
          setMarketHasStarted(false);
          setTimeRemaining(startTime - now);
        } else {
          // Market has already started
          setMarketHasStarted(true);
          setTimeRemaining(null);
        }
      } else {
        // No start date, assume market has started
        setMarketHasStarted(true);
        setTimeRemaining(null);
      }
    }
  }, [selectedMarketId, event]);

  // Closes countdown timer effect - updates every second
  useEffect(() => {
    let timer;
    if (event && event.sub_markets?.[0]?.end_date) {
      const updateClosesCountdown = () => {
        try {
          const endDate = new Date(event.sub_markets[0].end_date);
          const now = new Date();
          const diffTime = endDate - now;

          if (diffTime <= 0) {
            setClosesCountdown("Closed");
          } else {
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (diffTime % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

            let timeString = "";
            if (days > 0) timeString += `${days}d `;
            if (hours > 0 || days > 0) timeString += `${hours}h `;
            if (minutes > 0 || hours > 0 || days > 0)
              timeString += `${minutes}m `;
            timeString += `${seconds}s`;

            const finalTimeString = timeString.trim();
            setClosesCountdown(finalTimeString);
          }
        } catch (error) {
          console.error("Error calculating countdown:", error);
          setClosesCountdown("Error");
        }
      };

      updateClosesCountdown(); // Initial calculation
      timer = setInterval(updateClosesCountdown, 1000); // Update every second
    } else {
      // If no event data, set to loading
      setClosesCountdown("Loading...");
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [event]);

  // Format countdown time for display
  const formatCountdown = (milliseconds) => {
    if (!milliseconds) return "";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading)
    return (
      <div className="w-full min-h-screen">
        <MarketSkeleton />
      </div>
    );
  if (error)
    return (
      <div className="w-full min-h-screen">
        <div className="container w-full mx-0 px-2 sm:px-4 pt-28 sm:pt-34 pb-24 md:pt-36 flex items-center justify-center">
          Error: {error}
        </div>
      </div>
    );
  if (!event)
    return (
      <div className="w-full min-h-screen">
        <div className="container w-full mx-0 px-2 sm:px-4 pt-28 sm:pt-34 pb-24 md:pt-36 flex items-center justify-center">
          Event not found
        </div>
      </div>
    );

  // Determine if the selected submarket has a result
  const selectedSubMarket = event.sub_markets?.find(
    (m) => m._id === selectedMarketId
  );

  // Tab definitions for underline animation
  const marketTabs = [
    { name: "thoughts", label: "Thoughts", width: 80 },
    { name: "topHolders", label: "Top Holders", width: 110 },
    { name: "activity", label: "Activity", width: 80 },
  ];
  const tabSpacing = 32; // px, adjust as needed for gap-7

  const getTabIndicatorPosition = () => {
    let position = 0;
    for (
      let i = 0;
      i < marketTabs.findIndex((tab) => tab.name === activeTab);
      i++
    ) {
      position += marketTabs[i].width + tabSpacing;
    }
    return position;
  };
  const getTabIndicatorWidth = () => {
    return marketTabs.find((tab) => tab.name === activeTab)?.width || 80;
  };

  return (
    <div
      className={` w-full min-h-screen mt-4 flex justify-center items-start ${
        isDarkMode ? " " : ""
      }`}>
         <Toast
            message={toastMessage}
            show={showToast}
            onClose={() => setShowToast(false)}
          />
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onShowRegister={() => {
          setShowLoginDialog(false);
          setShowRegisterDialog(true);
        }}
      />
      {typeof showRegisterDialog !== "undefined" && (
        <RegisterDialog
          open={showRegisterDialog}
          onClose={() => setShowRegisterDialog(false)}
          onShowLogin={() => {
            setShowRegisterDialog(false);
            setShowLoginDialog(true);
          }}
        />
      )}
      <main
        className={`container w-full mx-0 px-2 sm:px-4 pt-20 sm:pt-34 pb-24 md:pt-36 2xl:max-w-[1330px]   ${
          isDarkMode ? "text-[#C5C5C5]" : ""
        }`}>
        <div
          className={`flex flex-col lg:flex-row gap-6 lg:gap-4 2xl:gap-10 mx-2 sm:mx-4 transition-opacity duration-600 ease-in-out ${
            isContentVisible ? "opacity-100" : "opacity-0"
          }`}>
          <div className="lg:flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex gap-2 items-start">
                <img
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded"
                  src={event.event_image || ""}
                />
                <div>
                  <h1 className="text-[20px] sm:text-[24px] font-semibold">
                    {event.event_title}
                  </h1>
                  <div className="text-zinc-500 text-[12px] sm:text-[16px] flex flex-wrap items-center gap-1  ">
                    {event.total_pool_in_usd < 10000 ? (
                      // If volume is less than 1000, check if the market is less than 7 days old
                      (() => {
                        const listDate = new Date(
                          event.sub_markets?.[0]?.start_date || event.createdAt
                        );
                        const currentDate = new Date();
                        const daysDifference = Math.floor(
                          (currentDate - listDate) / (1000 * 60 * 60 * 24)
                        );
                        return daysDifference < 7 ? (
                          <img src="/soundbet Vector.svg" alt="soundbet" />
                        ) : (
                          <p>$&lt;10K Vol.</p>
                        );
                      })()
                    ) : (
                      <p>${event.total_pool_in_usd.toLocaleString()} Vol.</p>
                    )}
                    <span className="hidden sm:inline"></span>
                    <div className="flex items-center relative group">
                      <i className="ri-time-line mr-1"></i>
                      <p>
                        {new Date(event.sub_markets[0].end_date).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div
                          className={`rounded p-2 text-xs whitespace-nowrap ${
                            isDarkMode
                              ? "bg-zinc-800 text-zinc-100"
                              : "bg-zinc-700 text-white"
                          } shadow-lg`}>
                          This is estimated end date.
                        </div>
                        <div
                          className={`w-2 h-2 rotate-45 absolute top-full left-4 -mt-1 ${
                            isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                          }`}></div>
                      </div>
                    </div>

                    {event.market_summary && (
                      <div className="flex items-center relative group/context ml-4">
                        <i className="ri-information-line mr-1"></i>
                        <p>Context</p>
                        {/* Tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover/context:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                          <div
                            className={`rounded-lg p-3 text-xs max-w-md min-w-[300px] ${
                              isDarkMode
                                ? "bg-zinc-800 text-zinc-100"
                                : "bg-zinc-700 text-white"
                            } shadow-lg`}>
                            <div className="font-medium text-[18px] mb-1">
                              Context
                            </div>
                            <div className="text-[13px] leading-relaxed">
                              {event.market_summary}
                            </div>
                          </div>
                          <div
                            className={`w-2 h-2 rotate-45 absolute -top-1 left-1/2 transform -translate-x-1/2 ${
                              isDarkMode ? "bg-zinc-800" : "bg-zinc-700"
                            }`}></div>
                        </div>
                      </div>
                    )}
                    <div className="sm:hidden flex gap-2 ml-auto">
                      <div
                        className="hover:scale-110 transition-all duration-200 cursor-pointer"
                        onClick={handleBookmarkClick}>
                        {isBookmarked ? (
                          <FaStar
                            className={`hover:opacity-80 ${
                              isDarkMode ? "brightness-[1.8]" : ""
                            }`}
                            style={{ width: "18px", height: "18px" }}
                          />
                        ) : (
                          <FaRegStar
                            className={`hover:opacity-80 ${
                              isDarkMode ? "brightness-[1.8]" : ""
                            }`}
                            style={{ width: "18px", height: "18px" }}
                          />
                        )}
                      </div>
                      <div
                        className="hover:scale-110 transition-all duration-200 cursor-pointer"
                        onClick={handleShareClick}>
                        <IoCopyOutline
                          className={`hover:opacity-80 ${
                            isDarkMode ? "brightness-[1.8]" : ""
                          }`}
                          style={{ width: "14px", height: "14px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl text-zinc-800 hidden sm:flex gap-2 h-full self-end sm:self-auto">
                {/* <div
                      className="hover:scale-110 transition-all duration-200 cursor-pointer"
                      onClick={handleShareClick}
                    >
                      <img className="hover:opacity-80" src={dollar} alt="Share" />
                    </div>
                    <div
                      className="hover:scale-110 transition-all duration-200 cursor-pointer"
                      onClick={handleShareClick}
                    >
                      <img className="hover:opacity-80" src={closingtime} alt="Share" />
                    </div> */}
                <div
                  className="hover:scale-110 transition-all duration-200 cursor-pointer"
                  onClick={handleBookmarkClick}>
                  {isBookmarked ? (
                    <FaStar
                      className={`hover:opacity-80 ${
                        isDarkMode ? "brightness-[1.8]" : ""
                      }`}
                      style={{ width: "18px", height: "18px" }}
                    />
                  ) : (
                    <FaRegStar
                      className={`hover:opacity-80 ${
                        isDarkMode ? "brightness-[1.8]" : ""
                      }`}
                      style={{ width: "18px", height: "18px" }}
                    />
                  )}
                </div>
                <div
                  className="hover:scale-110 transition-all duration-200 cursor-pointer"
                  onClick={handleShareClick}>
                  <IoCopyOutline
                    className={`hover:opacity-80 ${
                      isDarkMode ? "brightness-[1.8]" : ""
                    }`}
                    style={{ width: "18px", height: "18px" }}
                  />
                </div>
              </div>
            </div>

            {/* <StackedCard
              eventData={event}
              probabilityData={probabilityData}
              timeFrame={timelineFilter}
              timelineOptions={timelineOptions}
              handleTimelineChange={handleTimelineChange}
            /> */}

            {/* Graph and Summary Section */}
            {probabilityData &&
            probabilityData.length > 0 &&
            probabilityData.some(
              (market) => market.data && market.data.length > 0
            ) ? (
              <>
                <div className="mt-6 flex flex-col lg:flex-row gap-6 transition-all duration-300 ease-in-out">
                  <div
                    className={`w-full border rounded-md ${
                      isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
                    } overflow-hidden pt-4 transition-all duration-300 ease-in-out`}
                    style={{
                      flex: isDesktopView ? "1 1 0" : "1 1 100%",
                      minWidth: "0", // Allows flex item to shrink below its content size
                    }}>
                    {/* <ActivityChart
                    eventData={event}
                    probabilityData={probabilityData}
                    timeFrame={timelineFilter}
                    timelineOptions={timelineOptions}
                    handleTimelineChange={handleTimelineChange}
                  />

                  <StackedCard
                    eventData={event}
                    probabilityData={probabilityData}
                    timeFrame={timelineFilter}
                    timelineOptions={timelineOptions}
                    handleTimelineChange={handleTimelineChange}
                  /> */}
                    <StockChart
                      eventData={event}
                      probabilityData={probabilityData}
                      timeFrame={timelineFilter}
                      timelineOptions={timelineOptions}
                      handleTimelineChange={handleTimelineChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-10" />
            )}

            {/* Mobile/Tablet Summary section - Full width, below the graph */}
            {!isDesktopView &&
              event.market_summary &&
              probabilityData &&
              probabilityData.length > 0 &&
              probabilityData.some(
                (market) => market.data && market.data.length > 0
              ) && (
                <div
                  className={`mt-6 border rounded-md ${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
                  } overflow-hidden lg:hidden`}>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-[20px] sm:text-[20px] font-medium mb-1">
                        Context
                      </h2>
                      <button
                        className="w-6 h-6 flex items-center justify-center"
                        onClick={toggleMobileSummary}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 text-zinc-600 transform transition-transform duration-300 ${
                            isSummaryCollapsed ? "rotate-0" : "rotate-180"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isSummaryCollapsed ? "0" : "500px",
                        opacity: isSummaryCollapsed ? 0 : 1,
                      }}>
                      <div
                        ref={mobileSummaryContentRef}
                        className={`text-[14px] sm:text-[14px] mt-2 transition-opacity duration-300 ease-in-out ${
                          isMobileSummaryContentVisible
                            ? "opacity-100"
                            : "opacity-0"
                        }`}>
                        {isMobileSummaryContentVisible && (
                          <span>{event.market_summary}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Fallback full-width section when there is NO graph data but there is market summary */}
            {(!probabilityData ||
              !probabilityData.length > 0 ||
              !probabilityData.some(
                (market) => market.data && market.data.length > 0
              )) &&
              event.market_summary && (
                <div
                  className={`mt-6 border rounded-md ${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
                  } overflow-hidden`}>
                  <div className="p-4">
                    <h2 className="text-[20px] sm:text-[20px] font-medium mb-3">
                      Context
                    </h2>
                    <div className="text-[14px] sm:text-[14px]">
                      <span>{event.market_summary}</span>
                    </div>
                  </div>
                </div>
              )}

            {/* User Positions Section */}
            <PositionsSection
              eventId={id}
              onSellClick={handleSellClick}
              onCancelOrderClick={handleCancelOrderClick}
              onPositionsUpdate={handlePositionsUpdate}
              showSection={showPositionsSection}
              initialPositionsLoaded={initialPositionsLoaded}
              userPositions={userPositions}
              userOrders={userOrders}
            />

            {event.has_sub_markets && (
              <div className="mt-5">
                <hr
                  className={`${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-300"
                  } my-1`}
                />
                {/* Desktop Headers */}
                <div className="hidden sm:flex px-1 sm:px-2 text-[14px] sm:text-xl text-zinc-400 w-full items-center">
                  <h2 className="w-[45%] sm:w-[50%] text-[14px] sm:text-[16px]">
                    Outcome
                  </h2>
                  <h2 className="w-[15%] text-[14px] sm:text-[16px] text-center">
                    %Chance
                  </h2>
                  <h2 className="w-[40%] sm:w-[35%] text-[14px] sm:text-[16px] text-center"></h2>
                </div>
                <hr
                  className={`${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-300"
                  } my-2`}
                />

                {event.sub_markets?.map((subMarketItem) => (
                  <div key={subMarketItem._id}>
                    {/* Desktop Layout */}
                    <div
                      className={`hidden sm:flex px-1 sm:px-2 items-center w-full cursor-pointer transition-colors duration-200 ${
                        isDarkMode
                          ? "hover:bg-[#C5C5C5]/10"
                          : "hover:bg-zinc-100"
                      }`}
                      onClick={() =>
                        toggleOrderBook(subMarketItem._id, subMarketItem.side_1)
                      }>
                      <div className="flex items-center w-[45%] sm:w-[50%]">
                        {subMarketItem.market_image ? (
                          <img
                            className="w-6 h-6  rounded mr-2"
                            src={subMarketItem.market_image || ""}
                            alt={subMarketItem.name}></img>
                        ) : null}

                        <div>
                          <h2 className="font-medium text-[16px]  line-clamp-1">
                            {subMarketItem.name}
                          </h2>
                          <div className="flex items-center gap-1">
                            {event.total_pool_in_usd >= 10000 && (
                              <p className="text-[14px] sm:text-[18px] text-zinc-500">
                                ${subMarketItem.dollar_volume?.toLocaleString()}
                              </p>
                            )}

                            {subMarketItem.status &&
                              subMarketItem.status !== "settled" &&
                              subMarketItem.status !== "open" && (
                                <i className="ri-time-line text-orange-500"></i>
                              )}
                          </div>
                        </div>
                      </div>
                      {subMarketItem.result &&
                      subMarketItem.status == "settled" ? (
                        <div className="w-[55%] flex justify-end items-center">
                          <span
                            className={`text-base font-semibold ${
                              subMarketItem.result === subMarketItem.side_1
                                ? "text-[#298c8c]"
                                : "text-[#8d1f17]"
                            }`}>
                            Result: {subMarketItem.result}
                          </span>
                        </div>
                      ) : (
                        <>
                          <h2 className="w-[15%] font-medium text-[18px] sm:text-[24px] text-center">
                            {calculateChance(subMarketItem) || "--"}%
                          </h2>
                          <div className="flex justify-between gap-2 sm:gap-4 w-[40%] sm:w-[35%] pl-2 sm:pl-4">
                            {/* Yes/No buttons for unresolved markets */}
                            <div className="w-1/2">
                              <GreenButton
                                title={`${subMarketItem.side_1}  ${
                                  getSubmarketPrices(
                                    subMarketItem,
                                    subMarketItem._id
                                  ).side1BestAsk !== null
                                    ? `${
                                        getSubmarketPrices(subMarketItem._id)
                                          .side1BestAsk
                                      }¢`
                                    : ""
                                }`}
                                isActive={
                                  selectedMarketId === subMarketItem._id &&
                                  selectedOption === subMarketItem.side_1
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionSelect(
                                    subMarketItem._id,
                                    subMarketItem.side_1,
                                    subMarketItem
                                  );
                                }}
                              />
                            </div>
                            <div className="w-1/2">
                              <RedButton
                                title={`${subMarketItem.side_2} ${
                                  getSubmarketPrices(subMarketItem._id)
                                    .side2BestAsk !== null
                                    ? `${
                                        getSubmarketPrices(subMarketItem._id)
                                          .side2BestAsk
                                      }¢`
                                    : ""
                                }`}
                                isActive={
                                  selectedMarketId === subMarketItem._id &&
                                  selectedOption === subMarketItem.side_2
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionSelect(
                                    subMarketItem._id,
                                    subMarketItem.side_2,
                                    subMarketItem
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile Layout */}
                    <div
                      className={`block sm:hidden px-1 cursor-pointer transition-colors duration-200 ${
                        isDarkMode
                          ? "hover:bg-[#C5C5C5]/10"
                          : "hover:bg-zinc-100"
                      }`}
                      onClick={() =>
                        toggleOrderBook(subMarketItem._id, subMarketItem.side_1)
                      }>
                      {/* Top row: Outcome data (left) and %Chance (right) */}
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center flex-1">
                          {subMarketItem.market_image ? (
                            <img
                              className="w-8 h-8 rounded mr-2 flex-shrink-0"
                              src={subMarketItem.market_image || ""}
                              alt={subMarketItem.name}></img>
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <h2 className="font-medium text-[16px] line-clamp-1">
                              {subMarketItem.name}
                            </h2>
                            <div className="flex items-center gap-1">
                              <p className="text-[14px] text-zinc-500">
                                ${subMarketItem.dollar_volume?.toLocaleString()}
                              </p>
                              {subMarketItem.status &&
                                subMarketItem.status !== "settled" &&
                                subMarketItem.status !== "open" && (
                                  <i className="ri-time-line text-orange-500"></i>
                                )}
                            </div>
                          </div>
                        </div>

                        {subMarketItem.result &&
                        subMarketItem.status == "settled" ? (
                          <div className="flex-shrink-0">
                            <span
                              className={`text-base font-semibold ${
                                subMarketItem.result === "yes"
                                  ? "text-[#298c8c]"
                                  : "text-[#8d1f17]"
                              }`}>
                              Result:{" "}
                              {subMarketItem.result.charAt(0).toUpperCase() +
                                subMarketItem.result.slice(1)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex-shrink-0">
                            <h2 className="font-medium text-[18px] text-center">
                              {calculateChance(subMarketItem) || "--"}%
                            </h2>
                          </div>
                        )}
                      </div>

                      {/* Bottom row: Yes/No buttons (only if not settled) */}
                      {!(
                        subMarketItem.result &&
                        subMarketItem.status == "settled"
                      ) && (
                        <div className="flex gap-2 pb-3">
                          <div className="w-1/2">
                            <GreenButton
                              title={`${subMarketItem.side_1} ${
                                getSubmarketPrices(subMarketItem._id)
                                  .side1BestAsk !== null
                                  ? `${
                                      getSubmarketPrices(subMarketItem._id)
                                        .side1BestAsk
                                    }¢`
                                  : ""
                              }`}
                              isActive={
                                selectedMarketId === subMarketItem._id &&
                                selectedOption === subMarketItem.side_1
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOptionSelect(
                                  subMarketItem._id,
                                  subMarketItem.side_1
                                );
                              }}
                            />
                          </div>
                          <div className="w-1/2">
                            <RedButton
                              title={`${subMarketItem.side_2} ${
                                getSubmarketPrices(subMarketItem._id)
                                  .side2BestAsk !== null
                                  ? `${
                                      getSubmarketPrices(subMarketItem._id)
                                        .side2BestAsk
                                    }¢`
                                  : ""
                              }`}
                              isActive={
                                selectedMarketId === subMarketItem._id &&
                                selectedOption === subMarketItem.side_2
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOptionSelect(
                                  subMarketItem._id,
                                  subMarketItem.side_2
                                );
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      ref={(el) =>
                        (submarketRefs.current[subMarketItem._id] = el)
                      }
                      className="transition-all duration-500 ease-in-out overflow-hidden"
                      style={{
                        height: openSubmarkets[subMarketItem._id]
                          ? "auto"
                          : "0px",
                        opacity: openSubmarkets[subMarketItem._id] ? 1 : 0,
                      }}>
                      {openSubmarkets[subMarketItem._id] && (
                        <OrderBook
                          marketId={subMarketItem._id}
                          selectedOption={selectedOption}
                          probabilityData={probabilityData}
                          eventData={event}
                          currentTimelineFilter={timelineFilter}
                          onPriceUpdate={handlePriceUpdate}
                          orderBookData={
                            allOrderBookData[subMarketItem._id] || null
                          }
                          marketPrices={
                            allMarketPricesData[subMarketItem._id] || null
                          }
                        />
                      )}
                    </div>
                    <hr
                      className={`${
                        isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-300"
                      } my-2`}
                    />
                  </div>
                ))}
              </div>
            )}

            {!event.has_sub_markets && (
              <OrderBook
                marketId={event.sub_markets[0]._id}
                showTitle={true}
                selectedOption={selectedOption}
                probabilityData={probabilityData}
                eventData={event}
                currentTimelineFilter={timelineFilter}
                onPriceUpdate={handlePriceUpdate}
                orderBookData={
                  allOrderBookData[event.sub_markets[0]._id] || null
                }
                marketPrices={
                  allMarketPricesData[event.sub_markets[0]._id] || null
                }
              />
            )}

            <div className="mt-5">
              <div className="flex justify-between items-center">
                <h2 className="text-[20px] sm:text-[20px] font-medium">
                  Rules
                </h2>
              </div>
              <div className="relative w-48">
                {/* Dropdown button */}
                <div
                  className={` truncate px-3 py-2  border-none border-[outline:none] rounded-lg shadow-sm cursor-pointer flex justify-between items-center ${
                    isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
                  }`}
                  onClick={() => setIsOpen(!isOpen)}>
                  <span className="truncate max-w-[80%]" title={orderType}>
                    {orderType.length > 15
                      ? orderType.slice(0, 15) + "..."
                      : orderType}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>

                {/* Dropdown list */}
                {isOpen && (
                  <ul
                    data-lenis-prevent
                    className={`absolute z-10 w-full   border-none border-[outline:none] rounded-lg mt-1 max-h-44 overflow-auto shadow-lg hide-scrollbar ${
                      isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
                    }`}>
                    {orderTypes.map((item) => (
                      <li
                        key={item}
                        className="px-3 py-2 cursor-pointer truncate"
                        onClick={() => {
                          setOrderType(item);
                          setIsOpen(false);
                        }}
                        title={item} // tooltip on hover
                      >
                        {item.length > 15 ? item.slice(0, 15) + "..." : item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-2 text-[15px] sm:text-[15px]">
                <div
                  style={
                    !isRulesExpanded &&
                    ((event.rules_summary &&
                      event.rules_summary.length > 150) ||
                      (event.settlement_sources &&
                        event.settlement_sources.length > 0))
                      ? {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }
                      : {}
                  }>
                  {event.rules_summary}

                  {/* Settlement Sources section within rules */}
                  {event.settlement_sources &&
                    event.settlement_sources.length > 0 && (
                      <p className="font-medium mt-3">
                        Settlement Source: {event.settlement_sources.join(", ")}
                      </p>
                    )}
                </div>
                {((event.rules_summary && event.rules_summary.length > 150) ||
                  (event.settlement_sources &&
                    event.settlement_sources.length > 0)) && (
                  <button
                    onClick={toggleRules}
                    className="text-[#FF532A] underline mt-1 hover:cursor-pointer">
                    {isRulesExpanded ? "View less" : "View more"}
                  </button>
                )}
              </div>

              {/* Timeline and Payout section - Moved here from Rules section */}
              <div className="mt-4">
                <h2 className="text-[20px] sm:text-[20px] font-medium pb-2 pt-4">
                  Timeline and Payout
                </h2>
                <div className="flex flex-col space-y-1 text-[16px] sm:text-[16px]">
                  <div className="flex items-center">
                    <p className="text-[#FF532A] w-24">Opened</p>
                    <p className="text-[15px]">
                      {new Date(event.sub_markets[0].start_date)
                        .toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .replace(",", " on")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-[#FF532A]  w-24">Closes</p>
                    <p
                      className="text-[15px]"
                      title={new Date(event.sub_markets[0].end_date)
                        .toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .replace(",", " on")}>
                      {closesCountdown || "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-[#FF532A]  w-24">Pays out</p>
                    <p className="text-[15px]">
                      {event.sub_markets[0].settlement_time} hours after closing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`flex mt-6 text-[16px] sm:text-[18px] font-medium border-b ${
                isDarkMode ? "border-[#C5C5C5]/30" : "border-gray-200"
              } overflow-x-auto relative items-center`}
              style={{ gap: `${tabSpacing}px` }}>
              {/* Animated underline */}
              <div
                className="absolute bottom-0 h-[3px] bg-[#FF532A] rounded transition-all duration-300"
                style={{
                  left: getTabIndicatorPosition(),
                  width: getTabIndicatorWidth(),
                }}
              />
              {marketTabs.map((tab) => (
                <h2
                  key={tab.name}
                  className={`py-2 whitespace-nowrap cursor-pointer transition-all duration-300 ${
                    activeTab === tab.name
                      ? "text-[#FF532A]"
                      : isDarkMode
                      ? "text-[#C5C5C5]"
                      : "text-zinc-800"
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                  style={{ width: tab.width, textAlign: "center" }}>
                  {tab.label}
                </h2>
              ))}
            </div>

            {/* Tab content with transitions */}
            <div className="relative">
              {/* Thoughts Tab */}
              <div
                className={`transition-all duration-300 ${
                  activeTab === "thoughts"
                    ? "opacity-100 translate-y-0"
                    : "absolute opacity-0 translate-y-4 pointer-events-none"
                }`}>
                {activeTab === "thoughts" && (
                  <>
                    <div
                      className={`w-full mt-4 px-3 sm:px-4 py-3 sm:py-3.5 rounded-[5px] outline outline-offset-[-1px] ${
                        isDarkMode ? "outline-[#C5C5C5]/30" : "outline-zinc-300"
                      } flex justify-between items-center gap-2 sm:gap-4`}>
                      <div
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-base w-full`}>
                        <input
                          type="text"
                          placeholder="Add your thoughts..."
                          className={`border-none border-transparent outline-0 w-full text-[14px] sm:text-base ${
                            isDarkMode
                              ? "text-[#C5C5C5] bg-transparent placeholder-[#C5C5C5]/50"
                              : "text-zinc-800 placeholder-zinc-500"
                          }`}
                          value={thoughtInput}
                          onChange={(e) => setThoughtInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handlePostThought();
                            }
                          }}
                        />
                      </div>
                      <div
                        className={`h-4 justify-start mb-3 ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-[14px] sm:text-base hover:cursor-pointer whitespace-nowrap ${
                          isPostingThought
                            ? "opacity-50"
                            : isDarkMode
                            ? "hover:text-blue-400"
                            : "hover:text-blue-600"
                        }`}
                        onClick={handlePostThought}>
                        {isPostingThought ? "Posting..." : "Post"}
                      </div>
                    </div>
                    {thoughts.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-12 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                        <i className="ri-chat-3-line text-4xl sm:text-5xl mb-4"></i>
                        <p className="text-base sm:text-lg text-center px-4">
                          No thoughts yet. Be the first to share your opinion!
                        </p>
                      </div>
                    ) : (
                      thoughts.map((thought) => {
                        const isExpanded = expandedReplies[thought._id];
                        const repliesToShow = isExpanded
                          ? thoughtReplies[thought._id] || []
                          : (thoughtReplies[thought._id] || []).slice(0, 1);
                        const remainingReplies =
                          thought.replyCount - repliesToShow.length;

                        // Calculate dynamic height for the vertical line
                        const calculateLineHeight = () => {
                          if (repliesToShow.length === 0) return "0px";

                          // Base height for the first reply
                          let height = 100; // Adjust this base value as needed

                          // Additional height for each extra reply when expanded
                          if (isExpanded && repliesToShow.length > 1) {
                            height += (repliesToShow.length - 1) * 120; // 120px per additional reply
                          }

                          return `${height}px`;
                        };

                        return (
                          <div key={thought._id} className="mt-6 sm:mt-8">
                            {/* Main Comment */}
                            <div className="flex gap-3 sm:gap-4 relative">
                              {/* Avatar with connecting line */}
                              <div className="relative flex-shrink-0">
                                <img
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                  src={
                                    thought?.user?.profile_image ||
                                    "https://placehold.co/48x48"
                                  }
                                  alt="User avatar"
                                  onError={(e) => {
                                    e.target.src = "https://placehold.co/48x48";
                                    e.target.onerror = null;
                                    e.target.style.backgroundColor = "#d9d9d9";
                                  }}
                                />
                                {/* Dynamic vertical line */}
                                {(thought.replyCount > 0 ||
                                  repliesToShow.length > 0) && (
                                  <div
                                    className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 w-px bg-gray-300 z-0"
                                    style={{
                                      height: calculateLineHeight(),
                                      transition: "height 0.3s ease",
                                    }}
                                  />
                                )}
                              </div>

                              {/* Comment content */}
                              <div className="flex-1">
                                <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                                  <h2 className="text-[13px] sm:text-[14px] font-semibold">
                                    {thought.user
                                      ? thought.user.username ??
                                        "Anonymous User"
                                      : "Anonymous User"}
                                  </h2>
                                  <p className="text-zinc-400 text-[11px] sm:text-[12px]">
                                    {new Date(
                                      thought.createdAt
                                    ).toLocaleDateString()}
                                    sdfsdafsda
                                  </p>
                                </div>
                                <p className="text-[13px] sm:text-[14px] mt-1">
                                  {thought.content}
                                </p>
                                <div className="flex items-center gap-1 text-lg mt-2">
                                  <img
                                    src={like}
                                    alt="Like"
                                    className="w-4 h-4"
                                  />
                                  <p className="font-semibold text-[13px] sm:text-[14px]">
                                    {thought.likes || 0}
                                  </p>
                                  <button
                                    className={`ml-1 text-blue-600 font-semibold text-[13px] sm:text-[14px] ${
                                      thought.user &&
                                      thought.user._id &&
                                      thought.user._id === currentUserId
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:cursor-pointer"
                                    }`}
                                    onClick={() =>
                                      handleReplyClick(
                                        thought._id,
                                        thought.user?._id
                                      )
                                    }
                                    disabled={
                                      thought.user &&
                                      thought.user._id === currentUserId
                                    }>
                                    Reply
                                  </button>
                                </div>

                                {/* Reply Input Box */}
                                {replyingTo === thought._id && (
                                  <div className="mt-4 pl-8 sm:pl-12">
                                    <div className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-[5px] outline outline-offset-[-1px] outline-zinc-300 flex justify-between items-center gap-2 sm:gap-4">
                                      <div className="text-zinc-800 text-[13px] sm:text-base w-full">
                                        <input
                                          type="text"
                                          placeholder="Write a reply..."
                                          className="border-none border-transparent outline-0 w-full text-[13px] sm:text-base"
                                          value={replyInput}
                                          onChange={(e) =>
                                            setReplyInput(e.target.value)
                                          }
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handlePostReply(thought._id);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div
                                        className={`h-4 justify-start text-zinc-800 text-[13px] sm:text-base hover:cursor-pointer whitespace-nowrap ${
                                          isPostingReply
                                            ? "opacity-50"
                                            : "hover:text-blue-600"
                                        }`}
                                        onClick={() =>
                                          handlePostReply(thought._id)
                                        }>
                                        {isPostingReply ? "Posting..." : "Post"}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Replies Section */}
                            {repliesToShow.map((reply, replyIndex) => (
                              <div
                                key={reply._id}
                                className="mt-6 ml-12 sm:ml-16 relative">
                                {/* Horizontal connector line */}
                                <div className="absolute top-5 sm:top-6 -left-3 sm:-left-4 w-3 sm:w-4 h-px bg-gray-300 z-0" />

                                <div className="flex gap-3 sm:gap-4">
                                  {/* Reply avatar */}
                                  <div className="relative flex-shrink-0">
                                    <img
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                      src={
                                        reply?.user?.profile_image ||
                                        "https://placehold.co/40x40"
                                      }
                                      alt="Reply user avatar"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/40x40";
                                      }}
                                    />
                                    {/* Vertical line for subsequent replies */}
                                    {replyIndex < repliesToShow.length - 1 && (
                                      <div
                                        className="absolute top-8 sm:top-10 left-1/2 transform -translate-x-1/2 w-px bg-gray-300 z-0"
                                        style={{ height: "calc(100% + 24px)" }}
                                      />
                                    )}
                                  </div>

                                  {/* Reply content */}
                                  <div className="flex-1">
                                    <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                                      <h2 className="text-[13px] sm:text-[14px] font-semibold">
                                        {reply?.user?.username ||
                                          "Anonymous User"}
                                      </h2>
                                      <p className="text-zinc-400 text-[11px] sm:text-[12px]">
                                        {new Date(
                                          reply?.createdAt || new Date()
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <p className="text-[13px] sm:text-[14px] mt-1">
                                      {reply.content}
                                    </p>
                                    <div className="flex items-center gap-1 text-lg mt-2">
                                      <img
                                        src={like}
                                        alt="Like"
                                        className="w-4 h-4"
                                      />
                                      <p className="font-semibold text-[13px] sm:text-[14px]">
                                        {reply.likes || 0}
                                      </p>
                                      <button
                                        className="ml-1 text-blue-600 font-semibold text-[13px] sm:text-[14px] hover:cursor-pointer"
                                        onClick={() =>
                                          handleLoadReplies(reply._id)
                                        }>
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Show more/hide replies button */}
                            {thought.replyCount > 0 && (
                              <div className="ml-12 sm:ml-16 mt-4">
                                {remainingReplies > 0 ? (
                                  <button
                                    className="flex items-center text-blue-600 text-[13px] sm:text-sm hover:text-blue-700 transition-colors"
                                    onClick={() =>
                                      setExpandedReplies((prev) => ({
                                        ...prev,
                                        [thought._id]: true,
                                      }))
                                    }>
                                    <i className="ri-add-circle-line mr-1"></i>
                                    {remainingReplies} more{" "}
                                    {remainingReplies === 1
                                      ? "reply"
                                      : "replies"}
                                  </button>
                                ) : isExpanded ? (
                                  <button
                                    className="flex items-center text-blue-600 text-[13px] sm:text-sm hover:text-blue-700 transition-colors"
                                    onClick={() =>
                                      setExpandedReplies((prev) => ({
                                        ...prev,
                                        [thought._id]: false,
                                      }))
                                    }>
                                    <i className="ri-arrow-up-s-line mr-1"></i>
                                    Hide replies
                                  </button>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

              {/* Top Holders Tab */}
              <div
                className={`transition-all duration-300 ${
                  activeTab === "topHolders"
                    ? "opacity-100 translate-y-0"
                    : "absolute opacity-0 translate-y-4 pointer-events-none"
                }`}>
                {activeTab === "topHolders" && (
                  <div className="mt-6">
                    {loadingHoldings ? (
                      <div
                        className={`flex justify-center py-8 ${
                          isDarkMode ? "text-[#C5C5C5]" : ""
                        }`}>
                        <div className="animate-pulse">
                          Loading top holders...
                        </div>
                      </div>
                    ) : topHolders.yes.length === 0 &&
                      topHolders.no.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-12 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                        <i className="ri-user-3-line text-4xl sm:text-5xl mb-4"></i>
                        <p className="text-base sm:text-lg">
                          No top holders data available yet.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-8 md:gap-15">
                        {/* Yes Holders Column */}
                        <div className="w-full md:w-1/2">
                          <div className="flex justify-between items-center mb-4">
                            <div
                              className={`justify-start ${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-xl sm:text-2xl font-medium  `}>
                              Yes Holders
                            </div>
                            <div
                              className={`justify-start ${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-sm sm:text-base font-medium  `}>
                              Units
                            </div>
                          </div>

                          {/* Yes Holders List */}
                          <div className="space-y-3 sm:space-y-4">
                            {topHolders.yes.map((holder, index) => (
                              <div
                                key={`yes-${index}`}
                                className="flex justify-between items-center">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div
                                    className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] ${
                                      isDarkMode
                                        ? "bg-[#1A1B1E]"
                                        : "bg-[#d9d9d9]"
                                    } rounded-full`}>
                                    <img
                                      src={
                                        holder?.profile_image ||
                                        "https://example.com/default-profile.jpg"
                                      }
                                      alt={holder?.name || "User"}
                                      className="w-full h-full rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://example.com/default-profile.jpg";
                                      }}
                                    />
                                  </div>
                                  <div
                                    className={`justify-start ${
                                      isDarkMode
                                        ? "text-[#C5C5C5]"
                                        : "text-[#2b2d2e]"
                                    } text-base sm:text-lg font-normal   truncate max-w-[120px] sm:max-w-full`}>
                                    {holder?.name || "Anonymous User"}
                                  </div>
                                </div>
                                <div className="justify-start text-[#298c8c] text-base sm:text-lg font-normal   text-right">
                                  {holder?.shares?.toLocaleString() || "0"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* No Holders Column */}
                        <div className="w-full md:w-1/2 mt-8 md:mt-0">
                          <div className="flex justify-between items-center mb-4">
                            <div
                              className={`justify-start ${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-xl sm:text-2xl font-medium  `}>
                              No Holders
                            </div>
                            <div
                              className={`justify-start ${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-sm sm:text-base font-medium  `}>
                              Units
                            </div>
                          </div>

                          {/* No Holders List */}
                          <div className="space-y-3 sm:space-y-4">
                            {topHolders.no.map((holder, index) => (
                              <div
                                key={`no-${index}`}
                                className="flex justify-between items-center">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div
                                    className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] ${
                                      isDarkMode
                                        ? "bg-[#1A1B1E]"
                                        : "bg-[#d9d9d9]"
                                    } rounded-full`}>
                                    <img
                                      src={
                                        holder?.profile_image ||
                                        "https://example.com/default-profile.jpg"
                                      }
                                      alt={holder?.name || "User"}
                                      className="w-full h-full rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://example.com/default-profile.jpg";
                                      }}
                                    />
                                  </div>
                                  <div
                                    className={`justify-start ${
                                      isDarkMode
                                        ? "text-[#C5C5C5]"
                                        : "text-[#2b2d2e]"
                                    } text-base sm:text-lg font-normal   truncate max-w-[120px] sm:max-w-full`}>
                                    {holder?.name || "Anonymous User"}
                                  </div>
                                </div>
                                <div className="justify-start text-[#8d1f17] text-base sm:text-lg font-normal  ">
                                  {holder?.shares?.toLocaleString() || "0"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Activity Tab */}
              <div
                className={`transition-all duration-300 ${
                  activeTab === "activity"
                    ? "opacity-100 translate-y-0"
                    : "absolute opacity-0 translate-y-4 pointer-events-none"
                }`}>
                {activeTab === "activity" && (
                  <div className="mt-6">
                    {loadingActivity ? (
                      <div
                        className={`flex justify-center py-8 ${
                          isDarkMode ? "text-[#C5C5C5]" : ""
                        }`}>
                        <div className="animate-pulse">
                          Loading activity data...
                        </div>
                      </div>
                    ) : activityData.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-12 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                        <i className="ri-bar-chart-2-line text-4xl sm:text-5xl mb-4"></i>
                        <p className="text-base sm:text-lg text-center px-4">
                          No activity data available
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {activityData.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex justify-between items-center py-2 flex-wrap gap-2 sm:flex-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] ${
                                    isDarkMode ? "bg-[#1A1B1E]" : "bg-[#d9d9d9]"
                                  } rounded-full`}>
                                  <img
                                    src={
                                      activity?.profile_image ||
                                      "https://example.com/default-profile.jpg"
                                    }
                                    alt={activity?.name || "User"}
                                    className="w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://example.com/default-profile.jpg";
                                    }}
                                  />
                                </div>
                                <div
                                  className={`ml-3 sm:ml-6 max-w-full sm:max-w-[600px] ${
                                    isDarkMode
                                      ? "text-[#C5C5C5]"
                                      : "text-[#2b2d2e]"
                                  } text-[16px] sm:text-[18px] font-normal line-clamp-2 sm:line-clamp-1`}>
                                  {activity.comments}
                                </div>
                              </div>
                              <div
                                className={`w-full sm:w-28 ${
                                  isDarkMode
                                    ? "text-[#C5C5C5]/50"
                                    : "text-[#2b2d2e]/50"
                                } text-[14px] sm:text-[16px] font-normal text-right sm:text-right`}>
                                {new Date(
                                  activity.created_at
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination controls */}
                        {activityTotalPages > 1 && (
                          <div className="flex justify-center mt-6 gap-2">
                            <button
                              onClick={() =>
                                setActivityPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={activityPage === 1}
                              className={`px-3 py-1 rounded text-sm sm:text-base ${
                                activityPage === 1
                                  ? isDarkMode
                                    ? "bg-zinc-800 text-gray-500"
                                    : "bg-gray-100 text-gray-400"
                                  : isDarkMode
                                  ? "bg-zinc-700 hover:bg-zinc-600 text-[#C5C5C5]"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}>
                              Previous
                            </button>
                            <span
                              className={`px-3 py-1 text-sm sm:text-base ${
                                isDarkMode ? "text-[#C5C5C5]" : ""
                              }`}>
                              Page {activityPage} of {activityTotalPages}
                            </span>
                            <button
                              onClick={() =>
                                setActivityPage((prev) =>
                                  Math.min(prev + 1, activityTotalPages)
                                )
                              }
                              disabled={activityPage === activityTotalPages}
                              className={`px-3 py-1 rounded text-sm sm:text-base ${
                                activityPage === activityTotalPages
                                  ? isDarkMode
                                    ? "bg-zinc-800 text-gray-500"
                                    : "bg-gray-100 text-gray-400"
                                  : isDarkMode
                                  ? "bg-zinc-700 hover:bg-zinc-600 text-[#C5C5C5]"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}>
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Trading Sidebar */}
          <div
            className={`
  lg:block
  hidden
  flex-shrink-0
  2xl:w-[400px]
  ${sidebar ? "lg:w-[350px]" : ""}
`}>
            {selectedSubMarket?.result &&
            selectedSubMarket?.status == "settled" ? (
              <div
                className={`sticky top-[9rem] ${
                  isDarkMode
                    ? "bg-[#1A1B1E] text-[#C5C5C5] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                    : "bg-neutral-100 shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                } rounded-xl p-4 h-80 flex items-center justify-center`}>
                {/* Header with result */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-[49px] h-[49px] p-[9px] bg-[#4169e1] rounded-3xl inline-flex justify-center items-center mb-3">
                    <img src="/soundbet Tick Icon.svg" alt="Settled" />
                  </div>
                  <span className="text-xl font-semibold text-[#4169e1] mb-1">
                    Market Settled
                  </span>
                  <span
                    className={`text-lg font-medium ${
                      selectedSubMarket.result === selectedSubMarket.side_1
                        ? "text-[#298c8c]"
                        : "text-[#8d1f17]"
                    }`}>
                    Outcome:{" "}
                    {selectedSubMarket.result.charAt(0).toUpperCase() +
                      selectedSubMarket.result.slice(1)}
                  </span>
                  {event.has_sub_markets && (
                    <span
                      className={`text-sm mt-1 ${
                        isDarkMode ? "text-[#C5C5C5]/70" : "text-[#2b2d2e]/70"
                      }`}>
                      {selectedSubMarket.name}
                    </span>
                  )}
                </div>
              </div>
            ) : !marketHasStarted && timeRemaining ? (
              <div
                className={`w-75 sticky top-[9rem]  ${
                  isDarkMode
                    ? "bg-[#1A1B1E] text-[#C5C5C5] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                    : "bg-neutral-100 shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                } rounded-xl p-3 flex flex-col justify-center items-center h-70`}>
                <div className="w-[49px] h-[49px] p-[9px] bg-[#4169e1] rounded-3xl flex justify-center items-center">
                  <i className="ri-time-line text-white text-2xl" />
                </div>
                <span className={`text-2xl font-semibold mt-4 text-[#4169e1]`}>
                  Starts in
                </span>
                <span className={`text-xl font-bold mt-2 text-[#4169e1]`}>
                  {formatCountdown(timeRemaining)}
                </span>
                <span
                  className={`text-lg font-normal ${
                    isDarkMode ? "text-[#C5C5C5]/70" : "text-[#2b2d2e]/70"
                  }`}>
                  {event.has_sub_markets ? selectedSubMarket?.name : null}
                </span>
              </div>
            ) : (
              <div className="sticky top-[9rem]">
                {" "}
                {/* New wrapper div for the sticky of th */}
                {/* <MarketSideBar
                  selectedOption={selectedOption}
                  fetchUserPositions={fetchUserPositions}
                  onOptionSelect={handleOptionSelect}
                  selectedMarketId={selectedMarketId}
                  event={event}
                  hasSubMarkets={event.has_sub_markets}
                  marketPrices={marketPrices}
                  userPositions={userPositions}
                /> */}
                <MarketSidebarNew
                  selectedOption={selectedOption}
                  fetchUserPositions={fetchUserPositions}
                  onOptionSelect={handleOptionSelect}
                  selectedMarketId={selectedMarketId}
                  event={event}
                  hasSubMarkets={event.has_sub_markets}
                  marketPrices={marketPrices}
                  userPositions={userPositions}
                  subMarket={subMarket}
                  setAddPositon={setAddPositon}
                  addPosition={addPosition}
                  setShowToast={setShowToast}
                  toastMessage={toastMessage}
                  setToastMessage={setToastMessage}
                />
                <div className="absolute w-full text-center text-[12px] sm:text-[12px] font-normal top-full mt-3">
                  By Trading, you accept our{" "}
                  <a
                    href="/terms"
                    className="underline text-[#FF4215] hover:text-[#FF4215] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer">
                    Terms of use
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed trade button at bottom for mobile */}
      <div
        className={`lg:hidden fixed bottom-12 left-0 right-0 p-3 ${
          isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
        } shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40`}>
        <button
          onClick={toggleBottomSheet}
          className="bg-[#FF532A] text-white px-6 py-3 rounded-md text-lg font-medium flex items-center justify-center w-full transition-colors duration-200">
          {isBottomSheetOpen ? "Close Trade Panel" : "Open Trade Panel"}
          <i
            className={`ri-arrow-${
              isBottomSheetOpen ? "down" : "up"
            }-s-line ml-2`}></i>
        </button>
      </div>
      {/* Bottom Sheet Overlay - darkens the background */}
      {isBottomSheetOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsBottomSheetOpen(false)}></div>
      )}

      {/* Bottom Sheet for Mobile - Fixed at bottom, slides up when open */}
      <div
        ref={bottomSheetRef}
        className={`fixed bottom-0 left-0 right-0 w-full z-40 transform transition-transform duration-300 shadow-[0px_-4px_12px_rgba(0,0,0,0.1)] lg:hidden
          ${isBottomSheetOpen ? "translate-y-0" : "translate-y-full"}
          ${
            isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
          } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          maxWidth: "100vw",
        }}>
        {/* Handle/pill for bottom sheet */}
        <div
          className={`w-full  flex justify-center pt-2 pb-4 
            ${
              isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
            } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
          onClick={toggleBottomSheet}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Mobile Trading Panel */}
        <MobileTradingPanel
          selectedOption={selectedOption}
          fetchUserPositions={fetchUserPositions}
          onOptionSelect={handleOptionSelect}
          selectedMarketId={selectedMarketId}
          event={event}
          hasSubMarkets={event.has_sub_markets}
          marketPrices={marketPrices}
          userPositions={userPositions}
          subMarket={subMarket}
          setAddPositon={setAddPositon}
          addPosition={addPosition}
        />

        {/* Extra bottom padding for iOS devices */}
        <div
          className={`h-20
           ${
             isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
           } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}></div>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#2b2d2e]/70 z-[9999]">
          <div
            className={`${
              isDarkMode
                ? "bg-[#1A1B1E] text-[#C5C5C5]"
                : "bg-white text-[#2b2d2e]"
            } rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative`}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center flex-col gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e53935"
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
                Are you sure you want to cancel this order? This action cannot
                be undone.
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
    </div>
  );
};

export default Market;
