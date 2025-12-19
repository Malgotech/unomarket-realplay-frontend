// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
// Navbar removed - now handled globally in App.jsx
import { Link, useNavigate } from "react-router-dom";
import TradeCard from "../components/market_cards/TradeCard";
import TwitterTrend from "../components/TwitterTrend";
import TradeCardBarGraph from "../components/market_cards/TradeCardBarGraph";
import ApexChart from "../components/charts/ApexChart";
import Question from "../components/market_cards/Question";
import QuestionPieChart from "../components/market_cards/QuestionPieChart";
import TradeCardBarGraphSkeleton from "../components/TradeCardBarGraphSkeleton";
import TradeCardSkeleton from "../components/TradeCardSkeleton";
import TwitterTrendSkeleton from "../components/TwitterTrendSkeleton";
import { fetchData } from "../services/apiServices";
import SkeletonCard from "../components/SkeletonCard";
import Footer from "../components/Footer";
import { useSelector } from "react-redux"; // Import for theme state
import SEO from "../components/SEO";
import { seoConfig } from "../utils/seoConfig";
import cardImg from "../../public/bnblogo.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import StockChart from "../components/StockChart";
import BetDialog from "../components/market_cards/BetDialog";
import HomeChart from "../components/HomeGraph";
import ActivityChartMiniVisx from "../components/charts/ActivityChartMiniVisx";
import HowPlay from "../components/HowPlay";

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
      mass: 1.2,
      duration: 0.5,
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

const eventsData = [
  {
    id: 1,
    title: "Giannis Antetokounmpo's next team?",
    cardImg: cardImg,
    data: [
      { date: "Jan", dem: 30, rep: 70 },
      { date: "Feb", dem: 40, rep: 60 },
      // ... more data points
    ],
    news: "A surprisingly tight special election in Tennessee's 7th District...",
    items: [
      { label: "Democratic Party", color: "blue", percentage: 78 },
      { label: "Republican Party", color: "red", percentage: 22 },
    ],
    predictions: [
      { title: "Prediction 1", percentage: 10 },
      { title: "Prediction 2", percentage: 15 },
    ],
  },
  {
    id: 2,
    title: "Giannis Antetokounmpo's next team?",
    cardImg: cardImg,
    data: [
      { date: "Jan", dem: 30, rep: 70 },
      { date: "Feb", dem: 40, rep: 60 },
      // ... more data points
    ],
    news: "A surprisingly tight special election in Tennessee's 7th District...",
    items: [
      { label: "Democratic Party", color: "blue", percentage: 78 },
      { label: "Republican Party", color: "red", percentage: 22 },
    ],
    predictions: [
      { title: "Prediction 1", percentage: 10 },
      { title: "Prediction 2", percentage: 15 },
    ],
  },
];

const Home = ({ addPosition, setAddPositon, setAddBookMark, addBookmark }) => {
  const [events, setEvents] = useState([]);
  const isLogin = useSelector((state) => state.user.isLogin);
  const navigate = useNavigate();
  const [first, setFirst] = useState("null");
  const [selectedRegion, setSelectedRegion] = useState("World");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContentVisible, setIsContentVisible] = useState(false); // State for handling fade transition
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  const [marketData, setMarketData] = useState();
  const [selectedOption, setSelectedOption] = useState(null);

  const [activeMarket, setActiveMarket] = useState(null);
  const [selectedMarkets, setSelectedMarkets] = useState({});
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [userPositions, setUserPositions] = useState([]);
  const [marketPrices, setMarketPrices] = useState(null);
  const [subMarket, setSubmarket] = useState();
  const [probabilityData, setProbabilityData] = useState([]);
  const [showLimit, setShowLimit] = useState(false);

  const [playModal, setPlayModal] = useState(false);
  const [showMethod, setShowMethod] = useState(false);

  // const handlePlayModal = () => {
  //   setPlayModal(!playModal);
  // };

  useEffect(() => {
    const hasShownModal = localStorage.getItem("playModalShown");

    if (!hasShownModal) {
      const timer = setTimeout(() => {
        setPlayModal(true);
        localStorage.setItem("playModalShown", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLogin]);

  // Function to get region ID from name
  const getRegionId = (regionName) => {
    if (!regionName || regionName === "World") return null;

    try {
      // Get the complete region data from localStorage
      const regionsRaw = localStorage.getItem("SoundbetRegionsMeta");

      if (regionsRaw) {
        const regions = JSON.parse(regionsRaw);
        // Find the region by name
        const region = regions.find(
          (r) => r.name.toLowerCase() === regionName.toLowerCase()
        );
        if (region && region._id) {
          return region._id;
        }
      }
    } catch (err) {
      console.error("Error getting region ID:", err);
    }

    return null;
  };

  // Effect to load the selected region from localStorage
  useEffect(() => {
    const cachedRegion = localStorage.getItem("SoundbetSelectedRegion");
    if (cachedRegion) {
      setSelectedRegion(cachedRegion);
    }
  }, []);

  // Add event listener for region changes
  useEffect(() => {
    // Function to handle region change events
    const handleRegionChange = (event) => {
      const newRegion = event.detail.region;
      setSelectedRegion(newRegion);
      // Refresh data when region changes
      GetEvents();
    };

    // Add event listener
    window.addEventListener("soundbetRegionChanged", handleRegionChange);

    // Clean up
    return () => {
      window.removeEventListener("soundbetRegionChanged", handleRegionChange);
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  const GetEvents = async () => {
    setLoading(true);
    setIsContentVisible(false); // Hide content before loading new data
    setError(null);

    try {
      // Use the new trending API endpoint instead of the query parameters
      const res = await fetchData("api/event/events/trending");

      if (res && res.success && res.events && Array.isArray(res.events)) {
        // Filter out any invalid events (those without required properties)
        const validEvents = res.events.filter(
          (event) =>
            event && event._id && typeof event.has_sub_markets !== "undefined"
        );

        setEvents(validEvents);

        if (validEvents.length === 0) {
          setError("No valid events found");
        }
      } else if (res && res.success && res.events && res.events.length === 0) {
        // Successful response but no events
        setEvents([]);
        setError(null);
      } else {
        setEvents([]);
        setError("No events found");
      }
    } catch (err) {
      console.error("Error fetching trending events:", err);
      setError("Failed to load events. Please try again later.");
      setEvents([]);
    } finally {
      setLoading(false);
      // Delay making content visible for smooth transition
      setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    GetEvents();
  }, [addBookmark]);

  // We no longer need the region-based fetching since we're using the trending endpoint
  // that already includes all necessary data

  // Get the current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const [active, setActive] = useState("forYou");

  const handleClick = (tab) => {
    setActive(tab);
  };

  const data = [
    { date: "Nov 2024", dem: 72, rep: 28 },
    { date: "Feb 2025", dem: 69, rep: 31 },
    { date: "May 2025", dem: 65, rep: 35 },
    { date: "Aug 2025", dem: 63, rep: 37 },
    { date: "Dec 2025", dem: 78, rep: 22 },
  ];

  const [showPanel, setShowPanel] = useState(false);

  const handleShowPanel = (e) => {
    e.stopPropagation();
    setShowPanel(!showPanel);
  };


  const handleCardClick = (item) => {
    // Only navigate if trading panel is not showing
    if (!showTradingPanel) {
      if (events.sub_markets && events.sub_markets.length > 0) {
        const firstMarketId = events.sub_markets[0]._id;
        const firstMarket = events.sub_markets[0];
        let defaultSelection = selectedMarkets[firstMarketId];
        if (!defaultSelection) {
          defaultSelection = firstMarket.side_1;
        } else {
          defaultSelection =
            defaultSelection === "yes"
              ? firstMarket.side_1
              : firstMarket.side_2;
        }
        navigate(
          `/market/details/${item}?marketId=${firstMarketId}&selection=${defaultSelection}`
        );
      } else {
        navigate(`/market/details/${item}`);
      }
    }
  };

  const handleSelection = (e, marketId, selection, marketdata) => {
    e.stopPropagation(); // Prevent the card click event from triggering

    // Store the selection in state
    setSelectedMarkets((prev) => ({
      ...prev,
      [marketId]: selection,
    }));

    // Find the market data from res

    setSelectedOption(selection);

    // Show the trading panel instead of navigating
    setShowPanel(true);
    setMarketData(marketdata);
  };

  const handleShowDialog = (marketId, option, subMarketItem) => {
    setShowDialog(true);
    setShowPanel(false);
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
    <>
      {/* Removed overflow-x-hidden to prevent right-side shadow clipping (e.g., TwitterTrend card) */}
      <div className="w-full min-h-screen mt-4">
        <SEO {...seoConfig.home} />
        <main className="container   mx-auto px-4 pt-20 md:pt-30 pb-24  max-w-full 2xl:max-w-[1330px] overflow-y-auto scrollbar-hide  ">
          <div className="mx-auto   ">
            {/* <div className="text-zinc-500 py-4 flex justify-start items-center gap-4">
            <Link>For you</Link>
            <Link>New </Link>
            <Link>Oscars </Link>
            <Link>DOGE </Link>
            <Link>Eric Adams </Link>
            <Link>First 100 days </Link>
            <Link>Trump Tariffs</Link>
          </div> */}

            {loading && (
              <div className="w-full flex justify-start items-center gap-2">
                {/* Skeleton buttons */}
                <div
                  className={`w-[60px] h-8 px-3 rounded-full  animate-pulse ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-300"
                  }`}></div>
                <div
                  className={`w-[60px] h-8 px-3 rounded-full  animate-pulse ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-300"
                  }`}></div>
              </div>
            )}

            {!loading && (
              <div className="w-full flex justify-start items-center gap-2">  
                <button
                  onClick={() => handleClick("forYou")}
                  className={`w-fit h-8 px-3 text-sm font-semibold rounded-full
          ${active === "forYou" ? "bg-[#FF532A] text-white" : ""}
          
          ${
            isDarkMode
              ? " bg-[#1a1a1a] text-[#ffff]"
              : "bg-[#E9E9E9]  text-black"
          }
        `}>
                  For You
                </button>

                {/* Survivor */}
                <button
                  onClick={() => handleClick("Survivor")}
                  className={`w-fit h-8 px-3 text-sm font-semibold rounded-full
          ${active === "Survivor" ? "bg-[#FF532A] text-white" : ""}
          
          ${
            isDarkMode
              ? " bg-[#1a1a1a] text-[#ffff]"
              : "bg-[#E9E9E9]  text-black"
          }
        `}>
                  Survivor
                </button>
              </div>
            )}

            {/* <button className="mt-5" onClick={handlePlayModal}>
              Add Modal
            </button> */}

            {/* Skeleton Loader for banner */}
            {loading && (
              <div
                className={`w-full min-h-[360px] mt-4 p-6 shadow-lg rounded-[20px] animate-pulse ${
                  isDarkMode ? "bg-[#1A1B1E] " : "bg-[#fff] "
                }`}>
                <div className="w-full min-h-[300px] px-2 py-4 grid grid-cols-2 gap-2">
                  {/* Left Side */}
                  <div className="flex flex-col justify-between gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 h-auto min-h-[60px]">
                      <div
                        className={`w-[80px] h-[80px]   rounded-lg   ${
                          isDarkMode ? "bg-zinc-800" : "bg-gray-300"
                        }`}></div>
                      <div
                        className={`h-6  rounded w-32 
                      ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                        
                        `}></div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex flex-col gap-3">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-[40px] h-[40px]   rounded-lg
                            ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                              
                              `}></div>
                            <div
                              className={`h-4   rounded w-20 
                            ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                              
                              `}></div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`h-4 bg-gray-300 rounded w-8 
                            ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                              `}></div>
                            <div
                              className={`w-12 h-8  rounded
                            ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                               `}></div>
                            <div
                              className={`w-12 h-8  rounded
                            ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                               `}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* News Text */}
                    <div
                      className={`h-12  rounded w-full
                          ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                      `}></div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col gap-4">
                    {/* Legend */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div
                          className={`h-4 rounded w-12  
                              ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                          `}></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <div
                          className={`h-4 rounded w-12  
                              ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                          `}></div>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div
                      className={`w-full h-[200px]  rounded-lg
                     ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}
                       `}></div>

                    {/* Labels */}
                    <div className="flex justify-between">
                      <div className="h-4 bg-blue-300 rounded w-28"></div>
                      <div className="h-4 bg-red-300 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* <div className="w-full min-h-[360px] mt-4 p-[24px] bg-[#ffff] shadow-lg  rounded-[20px] ">
              <div className="w-full min-h-[300px] px-2 py-4  grid grid-cols-2 gap-2  ">
                <div
                  className="w-full h-full flex flex-col
                 justify-between items-center gap-2 ">
                  <div className="w-full flex justify-start gap-3 h-auto min-h-[60px] items-center">
                    <img
                      src={cardImg || ""}
                      alt="Event"
                      className="w-[80px] h-[80px] rounded-[8px] object-cover text-transparent"
                    />

                    <h1
                      className={`text-[24px] font-semibold  ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      fsdfsaf
                    </h1>
                  </div>

                  <div className="w-full h-auto flex flex-col justify-between gap-3 mt-3">
                    <div className="w-full h-auto flex justify-between items-center">
                      <h1
                        className={`w-fit h-auto flex justify-start items-center gap-1 text-[16px] font-semibold  ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}>
                        <img
                          src={cardImg || ""}
                          alt="Event"
                          className="w-[40px] h-[40px] rounded-[8px] object-cover text-transparent"
                        />
                        Title
                      </h1>

                      <div className="w-fit flex justify-end items-center gap-1">
                        <p
                          className={`w-fit h-auto flex justify-start items-center gap-1 text-[16px] font-semibold  ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-black"
                          }`}>
                          10%
                        </p>

                        <button className="w-12 px-2 h-8 bg-[#009443] rounded-[4px] text-[16px] font-bold text-[#ffff]">
                          Yes
                        </button>

                        <button className="w-12 px-2 h-8 bg-[#E9E9E9] rounded-[4px] text-[16px] font-bold text-[#777777]">
                          No
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-auto flex justify-between items-center">
                      <h1
                        className={`w-fit h-auto flex justify-start items-center gap-1 text-[16px] font-semibold  ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}>
                        <img
                          src={cardImg || ""}
                          alt="Event"
                          className="w-[40px] h-[40px] rounded-[8px] object-cover text-transparent"
                        />
                        Title
                      </h1>

                      <div className="w-fit flex justify-end items-center gap-1">
                        <p
                          className={`w-fit h-auto flex justify-start items-center gap-1 text-[16px] font-semibold  ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-black"
                          }`}>
                          10%
                        </p>

                        <button className="w-12 px-2 h-8 bg-[#009443] rounded-[4px] text-[16px] font-bold text-[#ffff]">
                          Yes
                        </button>

                        <button className="w-12 px-2 h-8 bg-[#E9E9E9] rounded-[4px] text-[16px] font-bold text-[#777777]">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[16px] font-semibold text-[#777777] line-clamp-2">
                    <span className="text-[#000] font-bold">News:</span> A
                    surprisingly tight special election in Tennessee's 7th
                    District revealed a dramatic swing toward Democrats even as
                    Republican Matt Van Epps ultimately won, Newsweek reports.
                    Van Epps' victory came as Democrat Aftyn Behn posted
                    double-digit gains across nearly every county, fueling
                    Democratic optimism heading into next year’s midterms.
                  </p>
                </div>

                <div className="w-full rounded-xl p-4  ">
                  <div className="w-full h-auto flex flex-col justify-start items-start gap-1">
                    <div className="w-full h-auto flex justify-start items-center gap-1">
                      <div className="w-[8px] h-[8px] rounded-full bg-blue-600 "></div>

                      <span>Item</span>
                    </div>
                    <div className="w-full h-auto flex justify-start items-center gap-1">
                      <div className="w-[8px] h-[8px] rounded-full bg-red-600 "></div>
                      <span>Item</span>
                    </div>
                  </div>

                  <div className="w-full h-[200px]">
                    <ResponsiveContainer>
                      <LineChart data={data} margin={{ left: 0, right: 30 }}>
                        <YAxis
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          axisLine={false}
                          tickLine={false}
                          width={30}
                          stroke="#aaa"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          stroke="#aaa"
                        />

                        <Tooltip contentStyle={{ display: "none" }} />

                        <Line
                          type="monotone"
                          dataKey="dem"
                          stroke="#0057ff"
                          strokeWidth={3}
                          dot={false}
                        />

                      
                        <Line
                          type="monotone"
                          dataKey="rep"
                          stroke="#d60000"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

              
                  <div className="flex justify-between mt-2">
                    <div className="text-blue-600 font-semibold">
                      Democratic Party <span className="text-xl">78%</span>
                    </div>

                    <div className="text-red-600 font-semibold">
                      Republican Party <span className="text-xl">22%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {!loading && (
              <div
                className={`w-full h-auto swiper-container-home ${
                  isDarkMode ? "dark-swiper" : ""
                } `}>
                <Swiper
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  modules={[Pagination, Autoplay]}
                  className="mySwiper"
                  autoplay={{
                    delay: 3000, // 3 seconds
                    disableOnInteraction: false, // Continue autoplay after user interaction
                    pauseOnMouseEnter: true, // Pause on hover (optional)
                  }}
                  loop={true} // Enable infinite loop
                  speed={800} // Transition speed in ms
                >
                  {events.slice(1, 4).map((event) => (
                    <SwiperSlide
                      key={event.id}
                      className="swiper-slide-home"
                      onClick={() => handleCardClick(event?._id)}>
                      <div
                        className={`w-full min-h-[350px] cursor-pointer mt-4 p-[10px] lg:py-[16px] lg:px-[24px] swiper-slide-container ${
                          isDarkMode ? "bg-[#1a1a1a]" : "bg-[#ffff]"
                        } shadow-lg rounded-[20px]`}>
                        <div className="w-full min-h-[240px] px-2 py-2 lg:py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column - Event Details */}
                          <div className="w-full h-full relative flex flex-col justify-between items-center gap-4">
                            {/* Event Header */}
                            <div className="w-full flex  justify-start gap-2 lg:gap-4 h-auto min-h-[60px] items-center">
                              <img
                                src={event?.event_image || ""}
                                alt="Event"
                                className="w-[35px] lg:w-[80px] h-[35px] lg:h-[80px] rounded-[8px] object-cover"
                              />
                              <h1
                                className={` text-[15px]  lg:text-[24px] font-semibold ${
                                  isDarkMode ? "text-[#C5C5C5]" : "text-black"
                                }`}>
                                {event?.event_title}
                              </h1>
                            </div>

                            {/* Predictions Section */}
                            <div className="w-full h-auto flex flex-col justify-between gap-4 mt-2">
                              {event.sub_markets.slice(0, 2).map((market) => (
                                <div
                                  key={market._id}
                                  className="w-full h-auto flex justify-between items-start">
                                  <h1
                                    className={`mobile-truncate-10 w-fit h-auto flex flex-nowrap  justify-start items-center gap-2 text-[14px] lg:text-[16px] font-semibold ${
                                      isDarkMode
                                        ? "text-[#C5C5C5]"
                                        : "text-black"
                                    }`}>
                                    <img
                                      src={market?.market_image || ""}
                                      alt="Event"
                                      className=" w-[25] lg:w-[40px] h-[25px] lg:h-[40px] rounded-[8px] object-cover"
                                    />
                                    {market?.name}
                                  </h1>

                                  <div className="w-fit flex   justify-end items-center gap-2">
                                    {/* <p
                                      className={`w-fit h-auto text-[16px] font-semibold ${
                                        isDarkMode
                                          ? "text-[#C5C5C5]"
                                          : "text-black"
                                      }`}>
                                      {prediction.percentage}%
                                    </p> */}

                                    {market.lastTradedSide1Price &&
                                    !(
                                      market.result &&
                                      market.status === "settled"
                                    ) ? (
                                      <h1
                                        className={`mr-2 text-[16px] ${
                                          isDarkMode
                                            ? "text-[#C5C5C5]"
                                            : "text-black"
                                        }`}>
                                        {market.lastTradedSide1Price}%
                                      </h1>
                                    ) : null}

                                    <button
                                      className="w-12 px-2 h-8 bg-[#009443] rounded-[4px] text-[16px] font-bold text-white 
             hover:bg-[#007a36] transition-all 
             active:scale-95 active:translate-y-[1px] active:shadow-inner"
                                      onClick={(e) =>
                                        handleSelection(
                                          e,
                                          market._id,
                                          "yes",
                                          market
                                        )
                                      }>
                                      {market.side_1}
                                    </button>
                                    <button
                                      className="w-12 px-2 h-8 bg-[#FF161A] rounded-[4px] text-[16px] font-bold text-[#fff] 
             hover:bg-[#d9d9d9] transition-all
             active:scale-95 active:translate-y-[1px] active:shadow-inner"
                                      onClick={(e) =>
                                        handleSelection(
                                          e,
                                          market._id,
                                          "no",
                                          market
                                        )
                                      }>
                                      {market.side_2}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* News Section */}
                            <p className="w-full text-[14px] lg:text-[16px] font-semibold text-[#777777] line-clamp-2">
                              <span
                                className={`mr-1 text-[15px] lg:text-[16px]  ${
                                  isDarkMode ? "text-[#C5C5C5]" : "text-[#000]"
                                } font-bold`}>
                                News:
                              </span>
                              {event.market_summary}
                            </p>
                            <AnimatePresence>
                              {showPanel && (
                                <motion.div
                                  variants={jellyVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  className="  absolute top-[10%]  left-0 inset-0 z-50 flex items-center justify-center">
                                  <div
                                    onClick={(e) => e.stopPropagation()} // Prevent click from closing panel
                                    className={` p-3 w-full h-[50%] rounded-xl shadow-lg transition-all duration-300 flex flex-col ${
                                      isDarkMode
                                        ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                                        : "bg-[rgb(247,247,247)] shadow-[0px_3px_9px_0px_rgba(137,137,137,0.18)]"
                                    }`}>
                                    {/* Header - market info and close button */}
                                    <div className="flex justify-between items-center">
                                      <p
                                        className={`text-[14px] ${
                                          isDarkMode
                                            ? "text-[#fff]"
                                            : "text-[#000]"
                                        } `}>
                                        {marketData?.name}
                                      </p>

                                      {/* Close button */}
                                      <div
                                        onClick={handleShowPanel}
                                        className={`p-1 rounded-full cursor-pointer ${
                                          isDarkMode
                                            ? "hover:bg-zinc-800"
                                            : "hover:bg-[#dfe0e0]"
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
                                            isDarkMode
                                              ? "text-[#C5C5C5]"
                                              : "text-[#2b2d2e]"
                                          }`}>
                                          <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"></line>
                                          <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"></line>
                                        </svg>
                                      </div>
                                    </div>

                                    <div className="w-full h-auto flex  mt-2 items-center justify-between gap-1">
                                      <div className="w-full h-auto flex flex-col items-center justify-center gap-1">
                                        <button
                                          className="w-full h-10 bg-[#009443] rounded-[12px] text-[16px] font-bold text-white
             hover:bg-[#007a36] transition-all
             active:scale-95 active:translate-y-[1px] active:shadow-inner"
                                          onClick={() =>
                                            handleShowDialog(
                                              marketData._id,
                                              marketData.side_1,
                                              marketData
                                            )
                                          }>
                                          {marketData?.side_1}
                                        </button>

                                        <p className="text-[12px] font-semibold text-[#777777]">
                                          $100 →{" "}
                                          <span className="text-[#009443]">
                                            $556{" "}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="w-full h-auto flex flex-col items-center justify-center gap-1">
                                        <button
                                          className="w-full h-10 bg-[#FF161A] rounded-[12px] text-[16px] font-bold text-[#fff]
           transition-all
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
                                            $556{" "}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Right Column - Chart */}

                          {/* <StockChart
                            eventData={event}
                            probabilityData={probabilityData}
                            timeFrame={timelineFilter}
                            timelineOptions={timelineOptions}
                            handleTimelineChange={handleTimelineChange}
                          /> */}

                          <div className="overflow-hidden hidden lg:inline max-h-[230px]">
                            <ActivityChartMiniVisx
                              eventData={event}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {loading && (
              <div className="mt-4">
                {/* <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-[2fr_1fr] gap-5 mb-5 ml-1  ">
                  <div className="grid sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="space-y-5">
                      <TradeCardSkeleton />
                      <SkeletonCard />
                    </div>
                    <div className="space-y-5">
                      <TradeCardBarGraphSkeleton />
                      <SkeletonCard />
                    </div>
                  </div>
                  <div className="hidden md:block w-[calc(100%)] h-[99%]">
                    <TwitterTrendSkeleton />
                  </div>
                </div> */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                     <SkeletonCard />
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                     <SkeletonCard />
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                     <SkeletonCard />
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <i
                  className={`ri-bar-chart-line text-5xl mb-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}></i>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  No Markets Found
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                  There are no trending markets available at the moment.
                </p>
              </div>
            )}

            {/* Featured Section - First 4 events with Twitter trends - all equal width */}
            {!loading && !error && events.length > 0 && (
              <>
                <div
                  className={`md:hidden hidden sm:grid-cols-1 gap-3 mb-5 ml-1 transition-opacity duration-600 ease-in-out  ${
                    isContentVisible ? "opacity-100" : "opacity-0"
                  }`}>
                  {events[0] &&
                    events[0]._id &&
                    typeof events[0].has_sub_markets !== "undefined" && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[0].has_sub_markets ? (
                          <TradeCardBarGraph res={events[0]} />
                        ) : (
                          <TradeCard res={events[0]} />
                        )}
                      </div>
                    )}
                  {events[1] &&
                    events[1]._id &&
                    typeof events[1].has_sub_markets !== "undefined" && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[1].has_sub_markets ? (
                          <TradeCardBarGraph res={events[1]} />
                        ) : (
                          <TradeCard res={events[1]} GetEvents={GetEvents} />
                        )}
                      </div>
                    )}
                  {events[2] &&
                    events[2]._id &&
                    typeof events[2].has_sub_markets !== "undefined" && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[2].has_sub_markets ? (
                          <Question res={events[2]} GetEvents={GetEvents} />
                        ) : (
                          <Question res={events[2]} GetEvents={GetEvents} />
                        )}
                      </div>
                    )}
                  {events[3] &&
                    events[3]._id &&
                    typeof events[3].has_sub_markets !== "undefined" && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[3].has_sub_markets ? (
                          <Question res={events[3]} GetEvents={GetEvents} />
                        ) : (
                          <Question res={events[3]} GetEvents={GetEvents} />
                        )}
                      </div>
                    )}
                </div>

                {/* Desktop layout */}
                <div
                  className={`hidden md:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 ml-1 transition-opacity duration-600 ease-in-out ${
                    isContentVisible ? "opacity-100" : "opacity-0"
                  }`}>
                  {/* <div className="space-y-5">
                    {events[0] && events[0]._id && typeof events[0].has_sub_markets !== 'undefined' && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[0].has_sub_markets ? <TradeCardBarGraph res={events[0]} /> : <TradeCard res={events[0]} />}
                      </div>
                    )}
                    {events[2] && events[2]._id && typeof events[2].has_sub_markets !== 'undefined' && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[2].has_sub_markets ? <Question res={events[2]} /> : <QuestionPieChart res={events[2]} />}
                      </div>
                    )}
                  </div> */}
                  <div className="space-y-5">
                    {/* {events[1] && events[1]._id && typeof events[1].has_sub_markets !== 'undefined' && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[1].has_sub_markets ? <TradeCardBarGraph res={events[1]} /> : <TradeCard res={events[1]} />}
                      </div>
                    )} */}
                    {/* {events[3] && events[3]._id && typeof events[3].has_sub_markets !== 'undefined' && (
                      <div className="transition-all duration-300 ease-in-out">
                        {events[3].has_sub_markets ? <Question res={events[3]} /> : <QuestionPieChart res={events[3]} />}
                      </div>
                    )} */}
                  </div>

                  {/* <div className="hidden xl:block">
                    <TwitterTrend title={"Trend Watch"} />
                  </div> */}
                </div>
              </>
            )}

            {/* Regular Events Grid - Remaining events starting from index 4 */}
            {!loading && events.length > 4 && (
              <div
                className={`grid ml-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 transition-opacity duration-600 ease-in-out mt-2 ${
                  isContentVisible ? "opacity-100" : "opacity-0"
                }`}>
                {events.map((event, index) => {
                  // Add safety check for event object
                  if (!event || !event._id) {
                    console.warn(
                      "Invalid event object at index",
                      index + 4,
                      event
                    );
                    return null;
                  }

                  // Add safety check for has_sub_markets property
                  if (typeof event.has_sub_markets === "undefined") {
                    console.warn(
                      "Event missing has_sub_markets property:",
                      event._id
                    );
                    return null;
                  }

                  return (
                    <div
                      key={event._id}
                      className="transition-all duration-300 ease-in-out  ">
                      {/* Alternate between Question and QuestionPieChart components */}
                      {event.has_sub_markets ? (
                        <Question
                          setAddPositon={setAddPositon}
                          addPosition={addPosition}
                          res={event}
                          GetEvents={GetEvents}
                          addBookmark={addBookmark}
                          setAddBookMark={setAddBookMark}
                          showLimit={showLimit}
                          setShowLimit={setShowLimit}
                        
                        />
                      ) : (
                        <QuestionPieChart
                          setAddPositon={setAddPositon}
                          addPosition={addPosition}
                          res={event}
                          GetEvents={GetEvents}
                          addBookmark={addBookmark}
                          setAddBookMark={setAddBookMark}
                          showLimit={showLimit}
                          setShowLimit={setShowLimit}
                        />
                        
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state when no events */}
            {!loading && !error && events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <i
                  className={`ri-bar-chart-line text-5xl mb-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}></i>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  No Trending Markets
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                  There are no trending markets available at the moment.
                </p>
              </div>
            )}
          </div>
        </main>

        <BetDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          selectedOption={selectedOption}
          fetchUserPositions={fetchUserPositions}
          onOptionSelect={handleOptionSelect}
          selectedMarketId={selectedMarketId}
          event={marketData}
          hasSubMarkets={marketData?.has_sub_markets}
          marketPrices={marketPrices}
          userPositions={userPositions}
          subMarket={subMarket}
          setAddPositon={setAddPositon}
          addPosition={addPosition}
          setShowLimit={setShowLimit}
          showLimit={showLimit}
        />

        <div className="hidden md:block">
          <Footer />
        </div>

        {/* <HowPlay
          open={playModal}
          handleClose={() => setPlayModal(false)}
          showMethod={showMethod}
          setShowMethod={setShowMethod}
        /> */}
      </div>
    </>
  );
};

export default Home;
