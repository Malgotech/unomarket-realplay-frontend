import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import TodayMatch from "../market_cards/TodayMatch";
import ActivityChart from "../charts/ActivityChart";
import OrderBook from "../OrderBook";
import MarketSideBar from "../MarketSideBar";
import MobileTradingPanel from "../MobileTradingPanel";
import PositionsSection from "../positions/PositionsSection";
import { fetchData, postData } from "../../services/apiServices";
import {
  transformOrderBookData,
  calculateMarketPrices,
  calculateSpreads,
} from "../../utils/orderBookUtils";

// Component-level variables to track current team colors regardless of state timing
let currentTeam1Color = null;
let currentTeam2Color = null;

const SportsGameView = ({
  eventId,
  eventData,
  onBack,
  isDarkMode,
  sportsSubcategories,
}) => {
  const location = useLocation();

  // Remove all header-related state since it's now handled by parent Sports.jsx
  // State for the event and view
  const [selectedEvent, setSelectedEvent] = useState(eventData || null);
  const { showSuccessToast, showErrorToast } = useToast();
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [team1Color, setTeam1Color] = useState(null);
  const [team2Color, setTeam2Color] = useState(null);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Probability data and timeline
  const [probabilityData, setProbabilityData] = useState([]);
  const [timelineFilter, setTimelineFilter] = useState("all");

  // Tabs and content
  const [activeTab, setActiveTab] = useState("thoughts");
  const [thoughts, setThoughts] = useState([]);
  const [thoughtReplies, setThoughtReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [thoughtInput, setThoughtInput] = useState("");
  const [isPostingThought, setIsPostingThought] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [topHolders, setTopHolders] = useState({ yes: [], no: [] });
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // Market prices and other
  const [marketPrices, setMarketPrices] = useState({});
  const [allMarketPrices, setAllMarketPrices] = useState({}); // Store prices for all submarkets
  const [orderBookData, setOrderBookData] = useState(null); // Add state for orderbook data
  const [closesCountdown, setClosesCountdown] = useState("Loading...");

  // Mobile bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 1024);
  const bottomSheetRef = useRef(null);

  // Position data state - similar to Market.jsx
  const [userPositions, setUserPositions] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [showPositionsSection, setShowPositionsSection] = useState(false);
  const [initialPositionsLoaded, setInitialPositionsLoaded] = useState(false);

  // Timeline filter options for probability chart
  const timelineOptions = [
    { value: "1h", label: "1H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1m", label: "1M" },
    { value: "all", label: "ALL" },
  ];

  // Only fetch activity data when the activity tab is active
  useEffect(() => {
    if (
      selectedEvent &&
      activeTab === "activity" &&
      activityData.length === 0
    ) {
      fetchActivityData(selectedEvent._id);
    }
  }, [activeTab, selectedEvent]);

  // Function to check screen size and set desktop/mobile view
  const checkScreenSize = () => {
    setIsDesktopView(window.innerWidth >= 1024);
  };

  // Add event listener for screen resize
  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Function to toggle bottom sheet
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  // Closes countdown timer effect - updates every second
  useEffect(() => {
    let timer;
    if (selectedEvent && selectedEvent.sub_markets?.[0]?.end_date) {
      const updateClosesCountdown = () => {
        try {
          const endDate = new Date(selectedEvent.sub_markets[0].end_date);
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
  }, [selectedEvent]);

  // When team colors change in state, update the component-level variables
  useEffect(() => {
    currentTeam1Color = team1Color;
    console.log("SportsGameView - team1Color state updated:", team1Color);
  }, [team1Color]);

  useEffect(() => {
    currentTeam2Color = team2Color;
    console.log("SportsGameView - team2Color state updated:", team2Color);
  }, [team2Color]);

  // Initialize component on mount
  useEffect(() => {
    initializeComponent();
  }, [eventId, eventData]);

  // Show content immediately when event is loaded
  useEffect(() => {
    if (selectedEvent && !loadingEvents) {
      // Add a small delay to create a smooth fade-in effect
      setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
    }
  }, [selectedEvent, loadingEvents]);

  // Auto-select first button when component loads and colors are available
  useEffect(() => {
    if (selectedEvent && selectedMarketId && selectedOption && !loadingEvents) {
      // Trigger the selection to ensure MarketSideBar shows the first button as selected
      const firstMarket = selectedEvent.sub_markets?.[0];
      if (
        firstMarket &&
        selectedEvent.team1_color &&
        selectedEvent.team2_color
      ) {
        // Call handleOptionSelect to ensure the sidebar is properly initialized
        handleOptionSelect(selectedMarketId, selectedOption);
      }
    }
  }, [selectedEvent, selectedMarketId, selectedOption, loadingEvents]);

  // Listen for changes from OrderBook component - same as Market.jsx
  useEffect(() => {
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

  // Parse URL query parameters - same as Market.jsx
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const marketId = searchParams.get("marketId");
    const selection = searchParams.get("selection");
    return { marketId, selection };
  };

  // Effect to handle URL parameters and set initial state when event data is available
  useEffect(() => {
    if (selectedEvent) {
      // Get URL parameters
      const { marketId, selection } = getUrlParams();

      // If marketId and selection are provided in URL
      if (marketId && selection) {
        // Check if the market ID exists in the event's submarkets
        const marketExists = selectedEvent.sub_markets?.some(
          (market) => market._id === marketId
        );

        // Only set the market if it exists in the event's submarkets
        if (marketExists) {
          console.log(`Setting market to ${marketId} from URL params`);
          setSelectedMarketId(marketId);
          setSelectedOption(selection);
        } else {
          console.log(
            `Market ID ${marketId} from URL doesn't exist in event's submarkets, using first submarket`
          );
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
      if (selectedEvent.sub_markets?.length > 0) {
        const defaultMarketId = selectedEvent.sub_markets[0]._id;
        setSelectedMarketId(defaultMarketId);
        // Default to side_1 selection
        setSelectedOption(selectedEvent.sub_markets[0].side_1);
      }
    }
  }, [selectedEvent, location.search]);

  // Effect to fetch orderbook data when selectedMarketId changes
  useEffect(() => {
    if (selectedMarketId) {
      fetchOrderBookData(selectedMarketId);
    }
  }, [selectedMarketId]);

  // Listen for trade/order success events and refresh position data - similar to Market.jsx
  useEffect(() => {
    const handleTradeSuccess = async () => {
      if (selectedEvent?._id) {
        // Refresh positions and orders data when trades are executed
        await Promise.all([
          fetchUserPositions(selectedEvent._id),
          fetchUserOrders(selectedEvent._id),
        ]);
      }
    };

    window.addEventListener("Soundbet-trade-success", handleTradeSuccess);
    return () =>
      window.removeEventListener("Soundbet-trade-success", handleTradeSuccess);
  }, [selectedEvent]);

  // Function to fetch user positions - similar to Market.jsx
  const fetchUserPositions = async (eventId) => {
    if (!eventId) {
      setUserPositions([]);
      return { success: false, positions: [] };
    }
    try {
      const response = await fetchData(`api/event/positions?eventId=${eventId}`);
      if (response.success) {
        console.log(
          "SportsGameView: Fetched positions data:",
          response.positions
        );
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

  // Function to fetch user orders - similar to Market.jsx
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

  const initializeComponent = async () => {
    try {
      setLoadingEvents(true);
      setIsContentVisible(false); // Ensure content starts hidden

      let event = eventData;

      // If eventData is not provided, fetch it
      if (!event && eventId) {
        const response = await fetchData(`api/event/events/${eventId}`);
        if (response.success && response.event) {
          event = response.event;
          setSelectedEvent(event);
        }
      }

      if (event) {
        // Always select the first market's side_1 option by default
        const firstMarket =
          event.sub_markets && event.sub_markets.length > 0
            ? event.sub_markets[0]
            : null;

        setSelectedMarketId(firstMarket?._id);
        setSelectedOption(firstMarket?.side_1 || "yes");

        // Set team colors from event data if available
        if (event.team1_color && event.team2_color) {
          setTeam1Color(event.team1_color);
          setTeam2Color(event.team2_color);
          currentTeam1Color = event.team1_color;
          currentTeam2Color = event.team2_color;
        }

        // Extract current user ID from token immediately
        try {
          const token = localStorage.getItem("UnomarketToken");
          if (token) {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            setCurrentUserId(payload.userId);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }

        // Fetch all essential data in parallel including positions and orders
        const dataPromises = [];

        // Probability data
        dataPromises.push(
          fetchProbabilityData(event._id).catch((error) => {
            console.error("Error loading probability data:", error);
          })
        );

        // Position data
        dataPromises.push(
          fetchUserPositions(event._id).then(() => {
            setInitialPositionsLoaded(true);
            setShowPositionsSection(true);
          })
        );

        // Orders data
        dataPromises.push(fetchUserOrders(event._id));

        // Wait for all essential data to be fetched in parallel
        await Promise.all(dataPromises);

        // Set loading to false after all data is loaded
        setLoadingEvents(false);

        // Load other data only when needed (lazy loading)
        // fetchEventThoughts and fetchTopHolders will be called when their tabs are accessed
      }
    } catch (error) {
      console.error("Error initializing component:", error);
      setLoadingEvents(false);
    }
  };

  const fetchProbabilityData = async (eventId) => {
    try {
      const response = await fetchData(
        `api/event/markets/probability?event_id=${eventId}&interval=${timelineFilter}`
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
                probability: point.p.toString(), // Convert number to string
              })) || [],
          })) || [];

        setProbabilityData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching probability data:", error);
      setProbabilityData([]);
    }
  };

  const fetchEventThoughts = async (eventId) => {
    try {
      const response = await fetchData(`api/event/events/${eventId}/thoughts`);
      if (response.success) {
        setThoughts(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      setThoughts([]);
    }
  };

  const fetchTopHolders = async (eventId) => {
    try {
      setLoadingHoldings(true);
      const response = await fetchData(`api/event/events/${eventId}/holders`);
      if (response.success) {
        setTopHolders(response.data || { yes: [], no: [] });
      }
    } catch (error) {
      console.error("Error fetching top holders:", error);
      setTopHolders({ yes: [], no: [] });
    } finally {
      setLoadingHoldings(false);
    }
  };

  const fetchActivityData = async (eventId) => {
    try {
      setLoadingActivity(true);
      const response = await fetchData(
        `api/event/events/${eventId}/activity?page=${activityPage}`
      );
      if (response.success) {
        setActivityData(response.data?.activities || []);
        setActivityTotalPages(response.data?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setActivityData([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchOrderBookData = async (marketId) => {
    if (!marketId) return;

    try {
      console.log(`Fetching orderbook data for market ${marketId}`);
      const response = await fetchData(`api/event/orderbook?market_id=${marketId}`);
      if (response) {
        console.log("SportsGameView: Received orderbook data:", response);

        // Get dynamic side names for this market
        const submarket = selectedEvent?.sub_markets?.find(
          (m) => m._id === marketId
        );
        const side1 = submarket?.side_1 || "Yes";
        const side2 = submarket?.side_2 || "No";

        // Handle new or old orderbook format
        if (response.orderbook) {
          // New format - transform it
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

          // Store the complete orderbook data in the same structure as Market.jsx
          setOrderBookData({
            orderBook: transformedOrderBook,
            spreads: calculatedSpreads, // Use calculated spreads
            marketInfo: response.marketInfo || null,
          });

          // Calculate market prices if not provided
          if (response.marketPrices) {
            setMarketPrices(response.marketPrices);
          } else {
            const calculatedMarketPrices = calculateMarketPrices(
              transformedOrderBook,
              side1,
              side2
            );
            setMarketPrices(calculatedMarketPrices);
          }
        } else if (response.orderBook) {
          // Old format - use as is
          setOrderBookData({
            orderBook: response.orderBook || null,
            spreads: response.spreads || {},
            marketInfo: response.marketInfo || null,
          });

          // Update market prices
          if (response.marketPrices) {
            setMarketPrices(response.marketPrices);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orderbook data:", error);
      setOrderBookData(null);
    }
  };

  const handleTimelineChange = (option) => {
    setTimelineFilter(option.value);
  };

  const closeGameView = () => {
    // First fade out the content
    setIsContentVisible(false);

    // After the fade-out animation completes, call onBack
    setTimeout(() => {
      onBack();
    }, 300);
  };

  const toggleRules = () => setIsRulesExpanded((prev) => !prev);

  // Sync both selectedOption and selectedMarketId when sidebar changes - same as Market.jsx
  const handleOptionSelect = (marketId, option) => {
    if (marketId) setSelectedMarketId(marketId);
    setSelectedOption(option);

    // Update URL with the selected market and option - same as Market.jsx
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("marketId", marketId);
    searchParams.set("selection", option);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
  };

  // Handle real-time price updates from OrderBook SSE - same as Market.jsx
  const handlePriceUpdate = (submarketId, newPrices) => {
    // Find the submarket to get its dynamic sides
    const submarket = selectedEvent?.sub_markets?.find(
      (m) => m._id === submarketId
    );
    const side1 = submarket?.side_1 || "Yes";
    const side2 = submarket?.side_2 || "No";
    console.log(
      `🔄 SportsGameView.jsx: Received price update for submarket ${submarketId}:`,
      {
        [side1]: {
          bestAsk: newPrices[side1]?.bestAsk,
          bestBid: newPrices[side1]?.bestBid,
        },
        [side2]: {
          bestAsk: newPrices[side2]?.bestAsk,
          bestBid: newPrices[side2]?.bestBid,
        },
      }
    );

    // Update prices for all submarkets to keep TodayMatch in sync
    setAllMarketPrices((prevPrices) => ({
      ...prevPrices,
      [submarketId]: newPrices,
    }));

    // If this is the currently selected market, also update the sidebar prices
    if (submarketId === selectedMarketId) {
      console.log(
        "✅ SportsGameView.jsx: Updating sidebar prices for selected market",
        submarketId
      );
      setMarketPrices(newPrices);
    }
  };

  // Functions for the tabbed section
  const handlePostThought = async () => {
    // Check if input is empty
    if (!thoughtInput.trim()) {
      alert("Please enter a thought before posting");
      return;
    }

    // Check if user is logged in by checking token
    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      alert("Please login to post a thought");
      return;
    }

    try {
      setIsPostingThought(true);
      const response = await postData("api/user/thoughts", {
        content: thoughtInput.trim(),
        eventId: selectedEvent._id,
      });

      if (response.success) {
        // Clear input
        setThoughtInput("");
        // Refresh thoughts to show the new one
        const thoughtsRes = await fetchData(
          `api/user/events/${selectedEvent._id}/thoughts?page=1&limit=10`
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
      alert("Please login to post a reply");
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
      alert("Please login to post a reply");
      return;
    }

    try {
      setIsPostingReply(true);
      const response = await postData("api/user/thoughts", {
        content: replyInput.trim(),
        eventId: selectedEvent._id,
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

  // Graph and Summary Section for Game View
  const renderGameViewGraph = () => {
    if (!selectedEvent || !probabilityData) return null;

    // Check if any market has history data
    const hasHistoryData = probabilityData.some(
      (market) => market.data && market.data.length > 0
    );

    // If no history data, don't render the chart section
    if (!hasHistoryData) {
      // Only show summary section if it exists and there's no chart
      if (selectedEvent.market_summary) {
        return (
          <div className="mt-6">
            {/* Summary section - Full width when no chart */}
            <div
              className={`border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
                } overflow-hidden transition-all duration-300`}
            >
              <div className="p-4">
                <h2 className="text-[20px] font-medium mb-3">Context</h2>
                <div className="text-[14px]">
                  <span>{selectedEvent.market_summary}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    }

    return (
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Graph section - Full width */}
        <div
          className={`w-full border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
            } overflow-hidden pt-4 transition-all duration-300`}
        >
          <ActivityChart
            eventData={selectedEvent}
            probabilityData={probabilityData}
            timeFrame={timelineFilter}
            timelineOptions={timelineOptions}
            handleTimelineChange={handleTimelineChange}
          />
        </div>

        {/* Summary section - Only show if market summary exists */}
        {selectedEvent.market_summary && (
          <div
            className={`border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
              } overflow-hidden transition-all duration-300 relative hidden lg:block`}
            style={{
              width: "250px",
              minWidth: "250px",
              flex: "0 0 auto",
            }}
          >
            <div className="p-4">
              <h2 className="text-[20px] font-medium mb-3">Context</h2>
              <div className="text-[14px]">
                <span>{selectedEvent.market_summary}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile/Tablet Summary section - Full width, below the graph
  const renderMobileSummary = () => {
    if (!selectedEvent || !selectedEvent.market_summary) return null;

    return (
      <div
        className={`mt-6 border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
          } overflow-hidden lg:hidden`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[20px] font-medium mb-1">Context</h2>
            <button className="w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="text-[14px]">
            <span>{selectedEvent.market_summary}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loadingEvents || !selectedEvent) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        {/* Main content skeleton */}
        <div className="sm:flex-1 w-full">
          {/* Back button skeleton */}
          <div className="mb-4 h-8 flex items-center">
            <div
              className={`h-6 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded animate-pulse`}
            ></div>
          </div>

          {/* Match card skeleton */}
          <div
            className={`mb-5 p-4 rounded-xl ${isDarkMode
              ? "bg-zinc-900 border-zinc-700"
              : "bg-gray-100 border-gray-200"
              } border animate-pulse`}
          >
            <div className="flex justify-between items-center mb-4">
              <div
                className={`h-5 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded`}
              ></div>
              <div
                className={`h-5 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded`}
              ></div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-lg`}
              ></div>
              <div className="flex-1">
                <div
                  className={`h-5 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded mb-1`}
                ></div>
                <div
                  className={`h-4 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded`}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-lg`}
              ></div>
              <div className="flex-1">
                <div
                  className={`h-5 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded mb-1`}
                ></div>
                <div
                  className={`h-4 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded`}
                ></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className={`h-10 flex-1 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded`}
              ></div>
              <div
                className={`h-10 flex-1 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded`}
              ></div>
            </div>
          </div>

          {/* Chart and Summary section skeleton - New design matching Market.jsx */}
          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Chart skeleton */}
            <div
              className={`w-full border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
                } overflow-hidden pt-4 pb-6 mb-5 flex-1`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 mb-3 gap-3 sm:gap-0">
                <div className="flex flex-col">
                  <div
                    className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}
                  ></div>
                  <div
                    className={`h-6 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse mt-1`}
                  ></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-8 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}
                    ></div>
                  ))}
                </div>
              </div>
              <div
                className={`h-[270px] sm:h-[310px] ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } animate-pulse mx-4 rounded-md`}
              ></div>
            </div>
          </div>

          {/* Mobile summary section skeleton */}
          <div
            className={`mt-6 border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
              } overflow-hidden lg:hidden mb-5`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div
                  className={`h-6 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`w-6 h-6 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-full animate-pulse`}
                ></div>
              </div>
              <div className="space-y-2 mt-2">
                <div
                  className={`h-4 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-4 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-4 w-3/4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>
            </div>
          </div>

          {/* OrderBook skeleton section */}
          <div className="my-4">
            <div
              className={`border rounded-md ${isDarkMode ? "border-zinc-700" : "border-zinc-200"
                } p-4`}
            >
              <div
                className={`h-6 w-28 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-4`}
              ></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div
                      className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded animate-pulse`}
                    ></div>
                    <div
                      className={`h-4 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded animate-pulse`}
                    ></div>
                    <div
                      className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded animate-pulse`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rules section skeleton */}
          <div className="mt-5">
            <div
              className={`h-6 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse mb-2`}
            ></div>
            <div className="space-y-2">
              <div
                className={`h-4 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
              <div
                className={`h-4 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
              <div
                className={`h-4 w-3/4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
            </div>

            {/* Timeline and Payout skeleton */}
            <div className="mt-6">
              <div
                className={`h-6 w-48 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse mb-2`}
              ></div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-5 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}
                    ></div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-5 w-40 sm:w-64 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                        } rounded-md animate-pulse`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs skeleton section */}
          <div
            className={`flex mt-8 gap-7 border-b ${isDarkMode ? "border-zinc-800" : "border-gray-200"
              } pb-2`}
          >
            <div
              className={`h-6 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}
            ></div>
            <div
              className={`h-6 w-28 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}
            ></div>
            <div
              className={`h-6 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}
            ></div>
          </div>

          {/* Tab content skeleton */}
          <div className="mt-6">
            {/* Thoughts input skeleton */}
            <div
              className={`w-full px-4 py-3 rounded-[5px] outline outline-offset-[-1px] ${isDarkMode ? "outline-zinc-700" : "outline-zinc-300"
                } flex justify-between items-center gap-4 mb-6`}
            >
              <div
                className={`h-5 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
              <div
                className={`h-5 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
            </div>

            {/* Thoughts content skeleton - 3 items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-8">
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } animate-pulse`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex gap-4 items-center mb-2">
                      <div
                        className={`h-4 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`h-3 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                    </div>
                    <div className="space-y-1 mb-2">
                      <div
                        className={`h-4 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`h-4 w-3/4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className={`h-4 w-4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`h-4 w-8 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`h-4 w-14 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton - Matching Market.jsx design */}
        <div
          className="hidden lg:block"
          style={{ width: "320px", minWidth: "320px" }}
        >
          <div className="sticky top-40">
            <div
              className={`${isDarkMode
                ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                : "bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                } rounded-xl p-4 h-auto`}
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`h-6 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`w-10 h-10 rounded ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } animate-pulse`}
                ></div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-4">
                  <div
                    className={`h-5 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}
                  ></div>
                  <div
                    className={`h-5 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                      } rounded-md animate-pulse`}
                  ></div>
                </div>
                <div
                  className={`h-8 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>
              <hr
                className={`my-3 ${isDarkMode ? "border-zinc-800" : "border-zinc-300"
                  }`}
              />
              <div className="my-4 flex justify-between gap-2">
                <div
                  className={`w-1/2 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`w-1/2 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse mb-2`}
                ></div>
                <div
                  className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-40 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse mb-2`}
                ></div>
                <div
                  className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>

              <div className="mt-5">
                <div
                  className={`h-5 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse mb-2`}
                ></div>
                <div
                  className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>

              <div
                className={`mt-6 h-12 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
      {/* Main content (left side) */}
      <div className="sm:flex-1 w-full">
        {/* Game View with back button */}
        <div className="mb-4 h-8 flex items-center">
          <button
            onClick={closeGameView}
            className={`flex items-center ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors hover:cursor-pointer`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to matches
          </button>
        </div>

        {/* Game View Content with fade transition */}
        {selectedEvent && (
          <div
            className={`transition-opacity duration-600 ease-in-out ${
              isContentVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Team details */}
            <div className="mb-5">
              <TodayMatch
                event={{
                  ...selectedEvent,
                  // Update submarkets with real-time prices
                  sub_markets: selectedEvent?.sub_markets?.map((submarket) => ({
                    ...submarket,
                    marketPrices:
                      allMarketPrices[submarket._id] ||
                      submarket.marketPrices ||
                      {},
                  })),
                }}
                onSelect={(
                  marketId,
                  option,
                  btn1ColorValue,
                  btn2ColorValue
                ) => {
                  // Use the synchronized handleOptionSelect function
                  handleOptionSelect(marketId, option);

                  // If colors are passed, set them directly
                  if (btn1ColorValue && btn2ColorValue) {
                    setTeam1Color(btn1ColorValue);
                    setTeam2Color(btn2ColorValue);

                    // Also update component-level variables
                    currentTeam1Color = btn1ColorValue;
                    currentTeam2Color = btn2ColorValue;
                  }
                }}
                isDarkMode={isDarkMode}
                selectedMarketId={selectedMarketId}
                selectedOption={selectedOption}
                sportsSubcategories={sportsSubcategories || []} // Pass subcategories data for allow_official check
                hideExpandButton={true} // Hide expand button in game view
              />
            </div>

            {/* Activity Graph using the same interface as Market.jsx */}
            {renderGameViewGraph()}

            {/* Mobile Summary - Only visible on small screens */}
            {renderMobileSummary()}

            {/* User Positions Section */}
            <PositionsSection
              eventId={selectedEvent?._id}
              onSellClick={(position) => {
                // Handle sell click - similar to Market.jsx implementation
                const marketId = position.marketId;
                const side = position.side === "Yes" ? "yes" : "no";

                // Use the synchronized handleOptionSelect function
                handleOptionSelect(marketId, side);

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
              }}
              onCancelOrderClick={(orderId) => {
                // Handle cancel order click - you can implement a cancel dialog here
                console.log("Cancel order:", orderId);
                // For now, just show an alert - you can implement proper cancel functionality
                if (
                  window.confirm("Are you sure you want to cancel this order?")
                ) {
                  // Implement cancel order API call here
                  console.log("Order cancelled:", orderId);
                }
              }}
              onPositionsUpdate={(positions) => {
                console.log(
                  "SportsGameView: Received positions update:",
                  positions
                );
                setUserPositions(positions);
              }}
              showSection={showPositionsSection}
              initialPositionsLoaded={initialPositionsLoaded}
              userPositions={userPositions}
              userOrders={userOrders}
            />

            {/* OrderBook - Reduced margins */}
            <div className="my-4">
              <OrderBook
                marketId={selectedMarketId}
                showTitle={true}
                selectedOption={selectedOption}
                probabilityData={probabilityData}
                eventData={selectedEvent}
                currentTimelineFilter={timelineFilter}
                onPriceUpdate={handlePriceUpdate}
                orderBookData={orderBookData}
                marketPrices={marketPrices}
              />
            </div>

            {/* Rules and timeline section - styled to match Market.jsx */}
            <div className="mt-5">
              <div className="flex items-center">
                <h2
                  className={`text-[20px] sm:text-[20px] font-medium ${
                    isDarkMode ? "text-[#C5C5C5]" : ""
                  }`}
                >
                  Rules
                </h2>
              </div>

              <div
                className={`mt-2 text-[14px] sm:text-[14px] ${
                  isDarkMode ? "text-[#C5C5C5]" : ""
                }`}
              >
                {selectedEvent.rules_summary ? (
                  <>
                    <div>
                      {isRulesExpanded ? (
                        <>
                          {selectedEvent.rules_summary}

                          {/* Settlement Sources section within rules */}
                          {selectedEvent.settlement_sources &&
                            selectedEvent.settlement_sources.length > 0 && (
                              <p className="font-medium mt-3">
                                Settlement Source:{" "}
                                {selectedEvent.settlement_sources.join(", ")}
                              </p>
                            )}
                        </>
                      ) : selectedEvent.rules_summary.length > 150 ? (
                        `${selectedEvent.rules_summary.slice(0, 150)}...`
                      ) : (
                        <>
                          {selectedEvent.rules_summary}
                          {selectedEvent.settlement_sources &&
                            selectedEvent.settlement_sources.length > 0 &&
                            !isRulesExpanded && (
                              <p className="font-medium mt-3 truncate">
                                Settlement Source:{" "}
                                {selectedEvent.settlement_sources.join(", ")}
                              </p>
                            )}
                        </>
                      )}
                    </div>
                    {(selectedEvent.rules_summary.length > 150 ||
                      (selectedEvent.settlement_sources &&
                        selectedEvent.settlement_sources.length > 0)) && (
                      <button
                        onClick={toggleRules}
                        className="text-blue-500 underline mt-1 hover:cursor-pointer"
                      >
                        {isRulesExpanded ? "View less" : "View more"}
                      </button>
                    )}
                  </>
                ) : (
                  <div>No rules available for this event.</div>
                )}
              </div>

              <div className="mt-4">
                <h2
                  className={`text-[20px] sm:text-[20px] font-medium pb-2 pt-4 ${
                    isDarkMode ? "text-[#C5C5C5]" : ""
                  }`}
                >
                  Timeline and Payout
                </h2>
                <div className="flex flex-col space-y-1 text-[16px] sm:text-[16px]">
                  <div className="flex items-center">
                    <p className="text-blue-500 w-24">Opened</p>
                    <p className="text-[15px]">
                      {selectedEvent.sub_markets?.[0]?.start_date &&
                        new Date(selectedEvent.sub_markets[0].start_date)
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
                    <p className="text-blue-500 w-24">Closes</p>
                    <p
                      className="text-[15px]"
                      title={
                        selectedEvent.sub_markets?.[0]?.end_date &&
                        new Date(selectedEvent.sub_markets[0].end_date)
                          .toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .replace(",", " on")
                      }
                    >
                      {closesCountdown || "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-blue-500 w-24">Pays out</p>
                    <p className="text-[15px]">
                      {selectedEvent.sub_markets?.[0]?.settlement_time || 0}{" "}
                      hours after closing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adding Thoughts, Holders, Activity tabs section with smooth sliding underline */}
            <div
              className={`flex mt-6 text-[16px] sm:text-[18px] font-medium ${
                isDarkMode ? "border-zinc-800" : "border-gray-200"
              } border-b overflow-x-auto relative items-center`}
              style={{ gap: "32px" }}
            >
              {/* Animated underline that slides between tabs */}
              <div
                className="absolute bottom-0 h-[3px] bg-blue-500 rounded transition-all duration-300"
                style={{
                  left: (() => {
                    if (activeTab === "thoughts") return "0px";
                    else if (activeTab === "topHolders") return "112px";
                    else return "254px"; // activity tab
                  })(),
                  width: (() => {
                    if (activeTab === "thoughts") return "80px";
                    else if (activeTab === "topHolders") return "110px";
                    else return "80px"; // activity tab
                  })(),
                }}
              />

              {/* Tab buttons */}
              <h2
                className={`py-2 whitespace-nowrap cursor-pointer transition-all duration-300 ${
                  activeTab === "thoughts"
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-[#C5C5C5]"
                    : "text-zinc-800"
                }`}
                onClick={() => {
                  setActiveTab("thoughts");
                  // Load thoughts data if not already loaded
                  if (thoughts.length === 0 && selectedEvent) {
                    fetchEventThoughts(selectedEvent._id);
                  }
                }}
                style={{ width: "80px", textAlign: "center" }}
              >
                Thoughts
              </h2>
              <h2
                className={`py-2 whitespace-nowrap cursor-pointer transition-all duration-300 ${
                  activeTab === "topHolders"
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-[#C5C5C5]"
                    : "text-zinc-800"
                }`}
                onClick={() => {
                  setActiveTab("topHolders");
                  // Load top holders data if not already loaded
                  if (
                    topHolders.yes.length === 0 &&
                    topHolders.no.length === 0 &&
                    selectedEvent
                  ) {
                    fetchTopHolders(selectedEvent._id);
                  }
                }}
                style={{ width: "110px", textAlign: "center" }}
              >
                Top Holders
              </h2>
              <h2
                className={`py-2 whitespace-nowrap cursor-pointer transition-all duration-300 ${
                  activeTab === "activity"
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-[#C5C5C5]"
                    : "text-zinc-800"
                }`}
                onClick={() => {
                  setActiveTab("activity");
                  // Activity data is already handled by the existing useEffect
                }}
                style={{ width: "80px", textAlign: "center" }}
              >
                Activity
              </h2>
            </div>

            {/* Tab content with transitions */}
            <div className="relative pb-20">
              {/* Thoughts Tab */}
              <div
                className={`transition-all duration-300 ${
                  activeTab === "thoughts"
                    ? "opacity-100 translate-y-0"
                    : "absolute opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                {activeTab === "thoughts" && (
                  <>
                    <div
                      className={`w-full mt-3 px-4 py-3 rounded-[5px] outline outline-offset-[-1px] ${
                        isDarkMode ? "outline-zinc-700" : "outline-zinc-300"
                      } flex justify-between items-center gap-4`}
                    >
                      <div
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-base w-full`}
                      >
                        <input
                          type="text"
                          placeholder="Add your thoughts..."
                          className={`border-none border-transparent outline-0 w-full ${
                            isDarkMode
                              ? "bg-transparent text-[#C5C5C5] placeholder-gray-500"
                              : ""
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
                        className={`justify-start ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-base hover:cursor-pointer ${
                          isPostingThought
                            ? "opacity-50"
                            : isDarkMode
                            ? "hover:text-blue-400"
                            : "hover:text-blue-600"
                        }`}
                        onClick={handlePostThought}
                      >
                        {isPostingThought ? "Posting..." : "Post"}
                      </div>
                    </div>

                    {/* Thoughts content */}
                    {thoughts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                        <i className="ri-chat-3-line text-4xl mb-3"></i>
                        <p className="text-base">
                          No thoughts yet. Be the first to share your opinion!
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[500px] overflow-y-auto">
                        {thoughts.map((thought) => {
                          const isExpanded = expandedReplies[thought._id];
                          const repliesToShow = isExpanded
                            ? thoughtReplies[thought._id] || []
                            : (thoughtReplies[thought._id] || []).slice(0, 1);
                          const remainingReplies =
                            thought.replyCount - repliesToShow.length;

                          // Calculate dynamic height for the vertical line
                          const calculateLineHeight = () => {
                            if (repliesToShow.length === 0) return "0px";
                            // Base height + height for each reply
                            return `${40 + repliesToShow.length * 80}px`;
                          };

                          return (
                            <div key={thought._id} className="mt-4 relative">
                              <div className="flex gap-3">
                                {/* Left side - Avatar and vertical line for replies */}
                                <div className="relative">
                                  <img
                                    className="w-8 h-8 rounded-full object-cover"
                                    src={
                                      thought.user.avatar ||
                                      "https://placehold.co/40x40"
                                    }
                                    alt="User avatar"
                                  />
                                  {thought.replyCount > 0 &&
                                    repliesToShow.length > 0 && (
                                      <div
                                        className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-px ${
                                          isDarkMode
                                            ? "bg-gray-700"
                                            : "bg-gray-300"
                                        } z-0`}
                                        style={{
                                          height: calculateLineHeight(),
                                          transition: "height 0.3s ease",
                                        }}
                                      />
                                    )}
                                </div>

                                {/* Comment content */}
                                <div className="flex-1">
                                  <div className="flex gap-2 items-center flex-wrap">
                                    <h2
                                      className={`text-[13px] font-semibold ${
                                        isDarkMode ? "text-[#C5C5C5]" : ""
                                      }`}
                                    >
                                      {thought.user.username}
                                    </h2>
                                    <p className="text-zinc-400 text-[11px]">
                                      {new Date(
                                        thought.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <p
                                    className={`text-[13px] mt-1 ${
                                      isDarkMode ? "text-[#C5C5C5]" : ""
                                    }`}
                                  >
                                    {thought.content}
                                  </p>
                                  <div className="flex items-center gap-1 text-lg mt-2">
                                    <img
                                      src="/like.svg"
                                      alt="Like"
                                      className="w-4 h-4"
                                    />
                                    <p
                                      className={`font-semibold text-[13px] ${
                                        isDarkMode ? "text-[#C5C5C5]" : ""
                                      }`}
                                    >
                                      {thought.likes || 0}
                                    </p>
                                    <button
                                      className={`ml-1 ${
                                        thought.user._id === currentUserId
                                          ? "opacity-50 cursor-not-allowed"
                                          : "hover:cursor-pointer"
                                      } ${
                                        isDarkMode
                                          ? "text-blue-400"
                                          : "text-blue-600"
                                      } font-semibold text-[13px]`}
                                      onClick={() =>
                                        handleReplyClick(
                                          thought._id,
                                          thought.user._id
                                        )
                                      }
                                      disabled={
                                        thought.user._id === currentUserId
                                      }
                                    >
                                      Reply
                                    </button>
                                  </div>

                                  {/* Reply Input Box */}
                                  {replyingTo === thought._id && (
                                    <div className="mt-2 pl-8">
                                      <div
                                        className={`w-full px-4 py-3 rounded-[5px] outline outline-offset-[-1px] ${
                                          isDarkMode
                                            ? "outline-zinc-700"
                                            : "outline-zinc-300"
                                        } flex justify-between items-center gap-4`}
                                      >
                                        <div
                                          className={`${
                                            isDarkMode
                                              ? "text-[#C5C5C5]"
                                              : "text-zinc-800"
                                          } text-base w-full`}
                                        >
                                          <input
                                            type="text"
                                            placeholder="Add your reply..."
                                            className={`border-none border-transparent outline-0 w-full text-[14px] ${
                                              isDarkMode
                                                ? "bg-transparent text-[#C5C5C5] placeholder-gray-500"
                                                : ""
                                            }`}
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
                                          className={`justify-start text-[14px] hover:cursor-pointer ${
                                            isPostingReply
                                              ? "opacity-50"
                                              : isDarkMode
                                              ? "text-[#C5C5C5] hover:text-blue-400"
                                              : "text-zinc-800 hover:text-blue-600"
                                          }`}
                                          onClick={() =>
                                            handlePostReply(thought._id)
                                          }
                                        >
                                          {isPostingReply
                                            ? "Posting..."
                                            : "Post"}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Replies Section - More compact */}
                                  {repliesToShow.map((reply, replyIndex) => (
                                    <div
                                      key={reply._id}
                                      className="mt-3 ml-10 relative"
                                    >
                                      {/* Horizontal connector line */}
                                      <div
                                        className={`absolute top-4 -left-3 w-3 h-px ${
                                          isDarkMode
                                            ? "bg-gray-700"
                                            : "bg-gray-300"
                                        } z-0`}
                                      />

                                      <div className="flex gap-2">
                                        {/* Reply avatar */}
                                        <div className="relative flex-shrink-0">
                                          <img
                                            className="w-6 h-6 rounded-full object-cover"
                                            src={
                                              reply.user.avatar ||
                                              "https://placehold.co/40x40"
                                            }
                                            alt="Reply user avatar"
                                          />
                                        </div>

                                        {/* Reply content */}
                                        <div className="flex-1">
                                          <div className="flex gap-2 items-center flex-wrap">
                                            <h2
                                              className={`text-[12px] font-semibold ${
                                                isDarkMode
                                                  ? "text-[#C5C5C5]"
                                                  : ""
                                              }`}
                                            >
                                              {reply.user.username}
                                            </h2>
                                            <p className="text-zinc-400 text-[10px]">
                                              {new Date(
                                                reply.createdAt
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <p
                                            className={`text-[12px] mt-1 ${
                                              isDarkMode ? "text-[#C5C5C5]" : ""
                                            }`}
                                          >
                                            {reply.content}
                                          </p>
                                          <div className="flex items-center gap-1 text-lg mt-1">
                                            <img
                                              src="/like.svg"
                                              alt="Like"
                                              className="w-3 h-3"
                                            />
                                            <p
                                              className={`font-semibold text-[12px] ${
                                                isDarkMode
                                                  ? "text-[#C5C5C5]"
                                                  : ""
                                              }`}
                                            >
                                              {reply.likes || 0}
                                            </p>
                                            <button
                                              className={`ml-1 ${
                                                isDarkMode
                                                  ? "text-blue-400"
                                                  : "text-blue-600"
                                              } font-semibold text-[12px] hover:cursor-pointer`}
                                              onClick={() =>
                                                handleLoadReplies(reply._id)
                                              }
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Show more/hide replies button */}
                                  {thought.replyCount > 0 && (
                                    <div className="ml-10 mt-2">
                                      {remainingReplies > 0 ? (
                                        <button
                                          className={`flex items-center ${
                                            isDarkMode
                                              ? "text-blue-400 hover:text-blue-300"
                                              : "text-blue-600 hover:text-blue-700"
                                          } text-[12px] transition-colors`}
                                          onClick={() =>
                                            setExpandedReplies((prev) => ({
                                              ...prev,
                                              [thought._id]: true,
                                            }))
                                          }
                                        >
                                          <i className="ri-add-circle-line mr-1"></i>
                                          {remainingReplies} more{" "}
                                          {remainingReplies === 1
                                            ? "reply"
                                            : "replies"}
                                        </button>
                                      ) : isExpanded ? (
                                        <button
                                          className={`flex items-center ${
                                            isDarkMode
                                              ? "text-blue-400 hover:text-blue-300"
                                              : "text-blue-600 hover:text-blue-700"
                                          } text-[12px] transition-colors`}
                                          onClick={() =>
                                            setExpandedReplies((prev) => ({
                                              ...prev,
                                              [thought._id]: false,
                                            }))
                                          }
                                        >
                                          <i className="ri-arrow-up-s-line mr-1"></i>
                                          Hide replies
                                        </button>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                }`}
              >
                {activeTab === "topHolders" && (
                  <div className="mt-3">
                    {loadingHoldings ? (
                      <div
                        className={`flex justify-center py-8 ${
                          isDarkMode ? "text-[#C5C5C5]" : ""
                        }`}
                      >
                        <div className="animate-pulse">
                          Loading top holders...
                        </div>
                      </div>
                    ) : topHolders?.yes?.length === 0 &&
                      topHolders?.no?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <i className="ri-user-3-line text-4xl mb-3"></i>
                        <p className="text-base">
                          No top holders data available yet.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                        <div className="w-full md:w-1/2">
                          <div className="flex justify-between items-center mb-3">
                            <div
                              className={`justify-start ${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-lg font-medium`}
                            >
                              Yes Holders
                            </div>
                            <div
                              className={`justify-start ${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-sm font-medium`}
                            >
                              Units
                            </div>
                          </div>

                          <div className="space-y-2">
                            {topHolders?.yes?.map((holder, index) => (
                              <div
                                key={`yes-${index}`}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-[38px] h-[38px] ${
                                      isDarkMode
                                        ? "bg-[#1A1B1E]"
                                        : "bg-[#d9d9d9]"
                                    } rounded-full`}
                                  >
                                    <img
                                      src={holder.profile_image}
                                      alt={holder.name}
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
                                    } text-sm font-normal truncate max-w-[80px] sm:max-w-full`}
                                  >
                                    {holder.name}
                                  </div>
                                </div>
                                <div className="justify-start text-[#298c8c] text-sm font-normal text-right">
                                  {holder.shares.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="w-full md:w-1/2">
                          <div className="flex justify-between items-center mb-3">
                            <div
                              className={`justify-start ${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-lg font-medium`}
                            >
                              No Holders
                            </div>
                            <div
                              className={`justify-start ${
                                isDarkMode
                                  ? "text-[#C5C5C5]/50"
                                  : "text-[#2b2d2e]/50"
                              } text-sm font-medium`}
                            >
                              Units
                            </div>
                          </div>

                          <div className="space-y-2">
                            {topHolders?.no?.map((holder, index) => (
                              <div
                                key={`no-${index}`}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-[38px] h-[38px] ${
                                      isDarkMode
                                        ? "bg-[#1A1B1E]"
                                        : "bg-[#d9d9d9]"
                                    } rounded-full`}
                                  >
                                    <img
                                      src={holder.profile_image}
                                      alt={holder.name}
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
                                    } text-sm font-normal truncate max-w-[80px] sm:max-w-full`}
                                  >
                                    {holder.name}
                                  </div>
                                </div>
                                <div className="justify-start text-[#8d1f17] text-sm font-normal">
                                  {holder.shares.toLocaleString()}
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
                }`}
              >
                {activeTab === "activity" && (
                  <div className="mt-3">
                    {loadingActivity ? (
                      <div
                        className={`flex justify-center py-8 ${
                          isDarkMode ? "text-[#C5C5C5]" : ""
                        }`}
                      >
                        Loading activity data...
                      </div>
                    ) : activityData?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <i className="ri-time-line text-4xl mb-3"></i>
                        <p className="text-base">
                          No activity data available yet.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {activityData?.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex justify-between items-center py-1 flex-wrap gap-2 sm:flex-nowrap"
                            >
                              <div className="flex items-center">
                                <img
                                  src={activity.profile_image}
                                  alt={activity.name}
                                  className="w-[32px] h-[32px] rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://example.com/default-profile.jpg";
                                  }}
                                />
                                <div
                                  className={`ml-3 max-w-full sm:max-w-[600px] ${
                                    isDarkMode
                                      ? "text-[#C5C5C5]"
                                      : "text-[#2b2d2e]"
                                  } text-[14px] font-normal line-clamp-2 sm:line-clamp-1`}
                                >
                                  {activity.comments}
                                </div>
                              </div>
                              <div
                                className={`w-full sm:w-28 ${
                                  isDarkMode
                                    ? "text-[#C5C5C5]/50"
                                    : "text-[#2b2d2e]/50"
                                } text-[12px] font-normal text-right sm:text-right`}
                              >
                                {new Date(
                                  activity.created_at
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination controls - More compact */}
                        {activityTotalPages > 1 && (
                          <div className="flex justify-center mt-4 gap-2">
                            <button
                              onClick={() =>
                                setActivityPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={activityPage === 1}
                              className={`px-2 py-1 rounded text-xs ${
                                activityPage === 1
                                  ? isDarkMode
                                    ? "bg-gray-800 text-gray-500"
                                    : "bg-gray-100 text-gray-400"
                                  : isDarkMode
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              Previous
                            </button>
                            <span
                              className={`px-2 py-1 text-xs ${
                                isDarkMode ? "text-[#C5C5C5]" : ""
                              }`}
                            >
                              Page {activityPage} of {activityTotalPages}
                            </span>
                            <button
                              onClick={() =>
                                setActivityPage((prev) =>
                                  Math.min(prev + 1, activityTotalPages)
                                )
                              }
                              disabled={activityPage === activityTotalPages}
                              className={`px-2 py-1 rounded text-xs ${
                                activityPage === activityTotalPages
                                  ? isDarkMode
                                    ? "bg-gray-800 text-gray-500"
                                    : "bg-gray-100 text-gray-400"
                                  : isDarkMode
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
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
        )}
      </div>

      {/* Desktop Trading Sidebar */}
      <div
        className="lg:block hidden flex-shrink-0"
        style={{ width: "320px", minWidth: "320px" }}
      >
        <div className="sticky top-40">
          {loadingEvents || isLoadingColors ? (
            <div
              className={`${
                isDarkMode
                  ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                  : "bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
              } w-80 rounded-xl p-4 h-[600px] flex flex-col space-y-4`}
            >
              {/* Loading skeleton content */}
              <div
                className={`h-6 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse`}
              ></div>
              <div className="flex space-x-2">
                <div
                  className={`h-10 w-20 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-10 w-20 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
              </div>
              <div className="flex space-x-2">
                <div
                  className={`h-12 flex-1 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-12 flex-1 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
              </div>
              <div className="space-y-3">
                <div
                  className={`h-4 w-1/3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded animate-pulse`}
                ></div>
                <div
                  className={`h-10 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-4 w-1/3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded animate-pulse`}
                ></div>
                <div
                  className={`h-10 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-4 w-1/3 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded animate-pulse`}
                ></div>
                <div
                  className={`h-10 ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                  } rounded-md animate-pulse`}
                ></div>
              </div>
              <div
                className={`h-12 ${
                  isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                } rounded-md animate-pulse mt-auto`}
              ></div>
            </div>
          ) : (
            (() => {
              // Get the selected submarket to check if it's settled
              const selectedSubMarket = selectedEvent?.sub_markets?.find(
                (m) => m._id === selectedMarketId
              );

              // Check if market is settled
              if (
                selectedSubMarket?.result &&
                selectedSubMarket?.status === "settled"
              ) {
                return (
                  <div
                    className={`sticky top-[9rem] ${
                      isDarkMode
                        ? "bg-[#1A1B1E] text-[#C5C5C5] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                        : "bg-neutral-100 shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                    } rounded-xl p-4 h-80 flex items-center justify-center`}
                  >
                    {/* Header with result */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-[49px] h-[49px] p-[9px] bg-[#4169e1] rounded-3xl inline-flex justify-center items-center mb-3">
                        <img src="/soundbet Tick Icon.svg" alt="Settled" />
                      </div>
                      <span className="text-xl font-semibold text-[#4169e1] mb-1">
                        Game Settled
                      </span>
                      <span
                        className={`text-lg font-medium ${
                          selectedSubMarket.result === selectedSubMarket.side_1
                            ? "text-[#298c8c]"
                            : "text-[#8d1f17]"
                        }`}
                      >
                        Winner:{" "}
                        {selectedSubMarket.result.charAt(0).toUpperCase() +
                          selectedSubMarket.result.slice(1)}
                      </span>
                      {selectedEvent.has_sub_markets && (
                        <span
                          className={`text-sm mt-1 ${
                            isDarkMode
                              ? "text-[#C5C5C5]/70"
                              : "text-[#2b2d2e]/70"
                          }`}
                        >
                          {selectedSubMarket.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // If not settled, show the regular MarketSideBar
              return (
                <>
                  <MarketSideBar
                    selectedOption={selectedOption}
                    onOptionSelect={handleOptionSelect}
                    selectedMarketId={selectedMarketId}
                    event={
                      selectedEvent || {
                        _id: "dummy-event-id",
                        sub_markets: [
                          {
                            _id: "dummy-market-id",
                            name: "Select a match",
                          },
                        ],
                        team1_short_name: "Team 1",
                        team2_short_name: "Team 2",
                        has_sub_markets: false,
                      }
                    }
                    userPositions={[]} // TODO: Implement positions for sports
                    hasSubMarkets={selectedEvent?.has_sub_markets || false}
                    marketPrices={marketPrices}
                    btn1={
                      selectedEvent?.has_sub_markets
                        ? null
                        : selectedEvent?.team1_short_name || "Team 1"
                    }
                    btn2={
                      selectedEvent?.has_sub_markets
                        ? null
                        : selectedEvent?.team2_short_name || "Team 2"
                    }
                    btn1Color={
                      selectedEvent?.team1_color ||
                      currentTeam1Color ||
                      team1Color
                    }
                    btn2Color={
                      selectedEvent?.team2_color ||
                      currentTeam2Color ||
                      team2Color
                    }
                    isLoadingColors={isLoadingColors}
                  />

                  <div className="absolute w-full text-center text-[12px] sm:text-[12px] font-normal top-full mt-3">
                    By Trading, you accept our{" "}
                    <a
                      href="/terms"
                      className="underline text-[#4169E1] hover:text-blue-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of use
                    </a>
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Fixed trade button at bottom for mobile */}
      <div
        className={`lg:hidden fixed bottom-12 left-0 right-0 p-3 ${
          isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
        } shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40`}
      >
        <button
          onClick={toggleBottomSheet}
          className="bg-[#FF532A] text-white px-6 py-3 rounded-md text-lg font-medium flex items-center justify-center w-full transition-colors duration-200"
        >
          {isBottomSheetOpen ? "Close Trade Panel" : "Open Trade Panel"}
          <i
            className={`ri-arrow-${
              isBottomSheetOpen ? "down" : "up"
            }-s-line ml-2`}
          ></i>
        </button>
      </div>

      {/* Bottom Sheet Overlay - darkens the background */}
      {isBottomSheetOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsBottomSheetOpen(false)}
        ></div>
      )}

      {/* Bottom Sheet for Mobile - Fixed at bottom, slides up when open */}
      <div
        ref={bottomSheetRef}
        className={`fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 shadow-[0px_-4px_12px_rgba(0,0,0,0.1)] lg:hidden
          ${isBottomSheetOpen ? "translate-y-0" : "translate-y-full"}
          ${
            isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
          } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}
      >
        {/* Handle/pill for bottom sheet */}
        <div
          className={`w-full flex justify-center pt-2 pb-4 
            ${
              isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
            } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
          onClick={toggleBottomSheet}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Mobile Trading Panel */}
        <MobileTradingPanel
          selectedOption={selectedOption}
          onOptionSelect={handleOptionSelect}
          selectedMarketId={selectedMarketId}
          event={
            selectedEvent || {
              _id: "dummy-event-id",
              sub_markets: [
                {
                  _id: "dummy-market-id",
                  name: "Select a match",
                },
              ],
              team1_short_name: "Team 1",
              team2_short_name: "Team 2",
              has_sub_markets: false,
            }
          }
          hasSubMarkets={selectedEvent?.has_sub_markets || false}
          marketPrices={marketPrices}
          btn1={
            selectedEvent?.has_sub_markets
              ? null
              : selectedEvent?.team1_short_name || "Team 1"
          }
          btn2={
            selectedEvent?.has_sub_markets
              ? null
              : selectedEvent?.team2_short_name || "Team 2"
          }
          btn1Color={
            selectedEvent?.team1_color || currentTeam1Color || team1Color
          }
          btn2Color={
            selectedEvent?.team2_color || currentTeam2Color || team2Color
          }
          isLoadingColors={isLoadingColors}
          userPositions={[]} // TODO: Implement positions for sports
        />

        {/* Extra bottom padding for iOS devices */}
        <div
          className={`h-20
           ${
             isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
           } shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
        ></div>
      </div>
    </div>
  );
};

export default SportsGameView;
