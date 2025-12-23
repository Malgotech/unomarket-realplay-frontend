import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { fetchData } from "../services/apiServices";
import ActivityChart from "./charts/ActivityChart"; // Import ActivityChart component
import ResolutionDialog from "./resolution/ResolutionDialog"; // Import ResolutionDialog component
import ResolutionTimeline from "./resolution/ResolutionTimeline"; // Import ResolutionTimeline component
import { useSelector } from "react-redux"; // Import useSelector to get theme
import { useOrderBookSSE } from "../hooks/useOrderBookSSE"; // Import our custom SSE hook
import "./OrderBookAnimations.css"; // Import smooth transition styles
import { useToast } from "../context/ToastContext";
import { IoIosArrowDown } from "react-icons/io";
const OrderBook = ({
  marketId,
  showTitle,
  selectedOption,
  probabilityData = [],
  eventData,
  currentTimelineFilter = "all",
  onPriceUpdate = null, // Add prop for notifying parent of price updates
  orderBookData: initialOrderBookData = null, // Add prop for orderbook data from parent
  marketPrices: initialMarketPrices = null, // Add prop for market prices from parent
}) => {
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  const { showSuccessToast, showErrorToast } = useToast();
  // Helper function to get tab text based on whether it's a sports event with teams
  // const getTabText = (side) => {
  //   if (eventData?.team1_short_name && eventData?.team2_short_name) {
  //     return `Trade ${side === "Yes" ? eventData.team1_short_name : eventData.team2_short_name}`;
  //   }
  //   return `Trade ${side}`;
  // };

  // Helper to get dynamic sides for the current market
  const getCurrentSides = () => {
    const submarket = eventData?.sub_markets?.find((m) => m._id === marketId);
    return {
      side1: submarket?.side_1 || "Yes",
      side2: submarket?.side_2 || "No",
    };
  };

  const { side1, side2 } = getCurrentSides();

  // Use our custom SSE hook for real-time order book updates
  const {
    orderBook: sseOrderBook,
    isLoading: sseIsLoading,
    error: sseError,
    connectionStatus,
    lastUpdateTime: sseLastUpdateTime,
    isUpdating: sseIsUpdating,
  } = useOrderBookSSE(marketId, side1, side2);

  // Add state for tracking last update time
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Add states for smooth animations and transitions
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevOrderBookData, setPrevOrderBookData] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Use dynamic sides for initial state
  const [orderBookData, setOrderBookData] = useState({
    [side1]: { bids: [], asks: [] },
    [side2]: { bids: [], asks: [] },
    spreads: { [side1]: null, [side2]: null },
    marketPrices: {
      [side1]: { bestBid: null, bestAsk: null },
      [side2]: { bestBid: null, bestAsk: null },
    },
  });

  // Update orderBookData when SSE data changes
  useEffect(() => {
    if (
      sseOrderBook &&
      (sseOrderBook.orderBook || (sseOrderBook.Above && sseOrderBook.Below))
    ) {
      try {
        const { side1, side2 } = getCurrentSides();
        // Support both new and old formats
        const orderBook = sseOrderBook.orderBook || sseOrderBook;
        const spreads = sseOrderBook.spreads || {
          [side1]: null,
          [side2]: null,
        };
        const marketPrices = sseOrderBook.marketPrices || {
          [side1]: { bestBid: null, bestAsk: null },
          [side2]: { bestBid: null, bestAsk: null },
        };
        const sortedSide1Asks = Array.isArray(orderBook[side1]?.asks)
          ? [...orderBook[side1].asks].sort((a, b) => b.price - a.price)
          : [];
        const sortedSide1Bids = Array.isArray(orderBook[side1]?.bids)
          ? [...orderBook[side1].bids].sort((a, b) => b.price - a.price)
          : [];
        const sortedSide2Asks = Array.isArray(orderBook[side2]?.asks)
          ? [...orderBook[side2].asks].sort((a, b) => b.price - a.price)
          : [];
        const sortedSide2Bids = Array.isArray(orderBook[side2]?.bids)
          ? [...orderBook[side2].bids].sort((a, b) => b.price - a.price)
          : [];
        const processedData = {
          [side1]: {
            asks: sortedSide1Asks,
            bids: sortedSide1Bids,
          },
          [side2]: {
            asks: sortedSide2Asks,
            bids: sortedSide2Bids,
          },
          spreads: spreads,
          marketPrices: marketPrices,
        };

        // Store previous data for smooth transitions
        setPrevOrderBookData(orderBookData);

        // Set updating state to trigger animations
        setIsUpdating(true);

        // Update data with a slight delay for smooth transition
        setTimeout(() => {
          setOrderBookData(processedData);
          setLastUpdateTime(new Date());
          setAnimationTrigger((prev) => prev + 1);

          // Reset updating state after animation
          setTimeout(() => {
            setIsUpdating(false);
          }, 100);
        }, 50);

        if (
          onPriceUpdate &&
          typeof onPriceUpdate === "function" &&
          processedData.marketPrices
        ) {
          onPriceUpdate(marketId, processedData.marketPrices);
        }
      } catch (error) {
        console.error("Error processing SSE order book data:", error);
        setIsUpdating(false);
      }
    }
  }, [sseOrderBook, eventData, marketId]);

  const [isOrderBookOpen, setIsOrderBookOpen] = useState(true);
  const contentRef = useRef(null);
  const scrollableContainerRef = useRef(null); // Ref for the scrollable order list
  const spreadRowRef = useRef(null); // Ref for the spread row
  const floatingSpreadRef = useRef(null); // Ref for the floating spread row
  const [initialScrollDone, setInitialScrollDone] = useState(false); // Track initial scroll
  const [userHasScrolled, setUserHasScrolled] = useState(false); // Track if user has manually scrolled
  const [spreadPosition, setSpreadPosition] = useState("middle"); // 'top', 'middle', 'bottom'
  const [lastScrollTop, setLastScrollTop] = useState(0); // Track last scroll position
  const [scrollDirection, setScrollDirection] = useState("down"); // Track scroll direction

  const [contentHeight, setContentHeight] = useState("auto");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("OrderBook"); // New state for tracking active tab
  const [showResolutionDialog, setShowResolutionDialog] = useState(false); // State for resolution dialog visibility
  const [resolutionData, setResolutionData] = useState({
    proposed_result: "yes", // Default to yes
    evidence_url_1: "",
    evidence_url_2: "",
    evidence_description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // For tracking API submission state
  const [resolutionState, setResolutionState] = useState("open"); // Default resolution state
  const [resolutionPreview, setResolutionPreview] = useState(null); // To store resolution proposal details

  // Timeline filter state and options for Activity Graph
  const [timelineFilter, setTimelineFilter] = useState(
    currentTimelineFilter || "all"
  );
  const timelineOptions = [
    { value: "1h", label: "1H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1m", label: "1M" },
    { value: "all", label: "ALL" },
  ];

  // Filter probability data for this specific market
  const filteredProbabilityData = useMemo(() => {
    if (!probabilityData || probabilityData.length === 0) return [];

    // Find the data for just this market ID
    const marketData = probabilityData.find(
      (item) => item.market_id === marketId
    );

    if (marketData && marketData.data && marketData.data.length > 0) {
      // Check if there's actual data in the data array (not just empty objects)
      const hasValidData = marketData.data.some(
        (item) => item.probability && parseFloat(item.probability) >= 0
      );

      if (hasValidData) {
        // Return just this market's data as an array of one item
        return [marketData];
      }
    }

    return [];
  }, [probabilityData, marketId]);

  // Check if we have any graph data to display
  const hasGraphData = useMemo(() => {
    return (
      filteredProbabilityData.length > 0 &&
      filteredProbabilityData[0]?.data?.length > 0 &&
      filteredProbabilityData[0].data.some(
        (item) => item.probability && parseFloat(item.probability) >= 0
      )
    );
  }, [filteredProbabilityData]);

  // State for market details
  const [marketDetails, setMarketDetails] = useState(null);
  const [localProbabilityData, setLocalProbabilityData] = useState(
    filteredProbabilityData
  );

  // Get the selected option from URL
  const getInitialActiveSide = () => {
    // Get dynamic sides
    const submarket = eventData?.sub_markets?.find((m) => m._id === marketId);
    const side1 = submarket?.side_1 || "Yes";
    const side2 = submarket?.side_2 || "No";
    // If selectedOption prop is provided, use it first
    if (selectedOption) {
      return selectedOption === side1 ? side1 : side2;
    }

    // Otherwise, fall back to URL params
    const searchParams = new URLSearchParams(location.search);
    const selection = searchParams.get("selection");
    return selection === side2 ? side2 : side1; // Default to side1 if no selection
  };

  const [activeSide, setActiveSide] = useState(getInitialActiveSide);

  // Update active side when URL parameters change or selectedOption prop changes
  useEffect(() => {
    if (selectedOption) {
      setActiveSide(
        selectedOption ===
          eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
          ? eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
          : eventData?.sub_markets?.find((m) => m._id === marketId)?.side_2
      );
    } else {
      const searchParams = new URLSearchParams(location.search);
      const selection = searchParams.get("selection");
      if (selection) {
        setActiveSide(
          selection ===
            eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
            ? eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
            : eventData?.sub_markets?.find((m) => m._id === marketId)?.side_2
        );
      }
    }
  }, [location.search, selectedOption]);

  // Force a re-render when the connection status or last update time changes
  useEffect(() => {
    if (connectionStatus === "established" && lastUpdateTime) {
      // This is just to ensure the component re-renders with the latest data
      const forceRender = () => {};
      forceRender();
    } else if (connectionStatus === "established" && sseLastUpdateTime) {
      // Use SSE update time if our local state hasn't been set yet
    }
  }, [connectionStatus, lastUpdateTime, sseLastUpdateTime]);

  // Update local probability data when parent prop changes or marketId changes
  useEffect(() => {
    if (filteredProbabilityData && filteredProbabilityData.length > 0) {
      setLocalProbabilityData(filteredProbabilityData);
    } else if (probabilityData && probabilityData.length > 0) {
      // If we couldn't find specific data for this market, log a warning
      console.warn(
        `WARNING: Couldn't find specific data for market ${marketId}, falling back to sample data`
      );
      generateSampleDataForChart();
    }
  }, [filteredProbabilityData, marketId]);

  // Handle tab click - update URL and notify parent component
  const handleTabClick = (side) => {
    setActiveSide(side);

    // Update URL to match the selected side
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(
      "selection",
      side === eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
        ? eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
        : eventData?.sub_markets?.find((m) => m._id === marketId)?.side_2
    );
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );

    // Dispatch a custom event to notify parent components
    const event = new CustomEvent("orderbook-side-changed", {
      detail: {
        side:
          side ===
          eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
            ? eventData?.sub_markets?.find((m) => m._id === marketId)?.side_1
            : eventData?.sub_markets?.find((m) => m._id === marketId)?.side_2,
      },
    });
    window.dispatchEvent(event);
  };

  // Process initial orderbook data from props
  useEffect(() => {
    if (initialOrderBookData && initialMarketPrices) {
      // Get dynamic sides for the current market
      const { side1, side2 } = getCurrentSides();

      // Extract the actual orderBook data from the structure
      const orderBookData =
        initialOrderBookData.orderBook || initialOrderBookData;
      const spreadsData = initialOrderBookData.spreads || {};

      // Process the data structure to match our component's expectations
      const processedData = {
        [side1]: {
          asks: Array.isArray(orderBookData[side1]?.asks)
            ? [...orderBookData[side1].asks].sort((a, b) => b.price - a.price)
            : [],
          bids: Array.isArray(orderBookData[side1]?.bids)
            ? [...orderBookData[side1].bids].sort((a, b) => b.price - a.price)
            : [],
        },
        [side2]: {
          asks: Array.isArray(orderBookData[side2]?.asks)
            ? [...orderBookData[side2].asks].sort((a, b) => b.price - a.price)
            : [],
          bids: Array.isArray(orderBookData[side2]?.bids)
            ? [...orderBookData[side2].bids].sort((a, b) => b.price - a.price)
            : [],
        },
        spreads: {
          [side1]: spreadsData[side1] || null,
          [side2]: spreadsData[side2] || null,
        },
        marketPrices: { ...initialMarketPrices },
      };

      setOrderBookData(processedData);

      // Set market details if available
      if (initialOrderBookData.marketInfo) {
        setMarketDetails(initialOrderBookData.marketInfo);

        // Update resolution state from market info
        if (initialOrderBookData.marketInfo.resolution_state) {
          setResolutionState(initialOrderBookData.marketInfo.resolution_state);
        }

        // Set resolution preview if available
        if (initialOrderBookData.marketInfo.resolution_proposal) {
          setResolutionPreview(
            initialOrderBookData.marketInfo.resolution_proposal
          );
        }
      }
    }
  }, [initialOrderBookData, initialMarketPrices, marketId]);

  // Fetch market probability data if not provided by parent
  const fetchProbabilityData = async () => {
    // If we already have probability data from parent, don't fetch again
    if (probabilityData && probabilityData.length > 0) {
      return;
    }

    try {
      const eventId = eventData?._id;
      if (!eventId) {
        console.error("ERROR: No event ID available to fetch probability data");
        generateSampleDataForChart();
        return;
      }

      const response = await fetchData(
        `api/event/markets/probability?event_id=${eventId}&interval=${timelineFilter}`
      );

      if (response.success && response.markets && response.markets.length > 0) {
        // Transform new API format to old format expected by ActivityChart
        const transformedData = response.markets.map((market) => ({
          market_id: market.id,
          market_name: market.name,
          side_1: market.s1,
          side_2: market.s2,
          data:
            market.history?.map((point) => ({
              time: new Date(point.t * 1000).toISOString(), // Convert Unix timestamp to ISO string
              probability: point.p.toString(), // Convert number to string
            })) || [],
        }));

        setLocalProbabilityData(transformedData);
      } else {
        console.error("ERROR: API did not return valid markets data");
        generateSampleDataForChart();
      }
    } catch (err) {
      console.error("ERROR: Exception fetching probability data:", err);
      generateSampleDataForChart();
    }
  };

  // Generate sample data for the chart when API data is not available
  const generateSampleDataForChart = () => {
    if (localProbabilityData.length > 0) return; // Don't generate if we already have data

    const now = new Date();
    const sampleData = [
      {
        market_id: marketId,
        market_name: marketDetails?.name || "This Market",
        data: Array.from({ length: 10 }).map((_, i) => {
          const timestamp = new Date(now);
          timestamp.setDate(now.getDate() - 10 + i);
          const probability = Math.floor(Math.random() * 40) + 30;

          return {
            time: timestamp.toISOString(),
            probability: probability.toString(),
            hasData: true,
          };
        }),
      },
    ];

    setLocalProbabilityData(sampleData);
  };

  // Check market resolution state from event data
  const fetchMarketResolutionState = () => {
    if (!marketId || !eventData) return;

    try {
      // Find the current market in the event's sub_markets array
      const currentMarket = eventData.sub_markets?.find(
        (market) => market._id === marketId
      );

      if (currentMarket) {
        // Set resolution state from the current market
        setResolutionState(currentMarket.resolution_state || "open");

        // If this market has a current_resolution, find the resolution details
        if (
          currentMarket.current_resolution &&
          currentMarket.resolutions?.length > 0
        ) {
          const activeResolution = currentMarket.resolutions.find(
            (res) => res._id === currentMarket.current_resolution
          );

          if (activeResolution) {
            setResolutionPreview(activeResolution);
          }
        }

        // If no specific resolution was found but there are resolutions available
        else if (currentMarket.resolutions?.length > 0) {
          // Use the most recent resolution as preview
          setResolutionPreview(currentMarket.resolutions[0]);
        }
      } else {
        console.warn(`Market ID ${marketId} not found in event data`);
      }
    } catch (error) {
      console.error("Error getting market resolution state:", error);
    }
  };

  // Effect to handle market changes and reset scroll state
  useEffect(() => {
    if (marketId) {
      fetchMarketResolutionState(); // Fetch resolution state when marketId changes
      setInitialScrollDone(false); // Reset scroll flag when market or side changes
      setUserHasScrolled(false); // Reset user scroll tracking when market or side changes
    }
  }, [marketId, activeSide]);

  // Effect to scroll the order book to the spread row on initial load or when one side has no orders
  useEffect(() => {
    const container = scrollableContainerRef.current;
    const spreadRow = spreadRowRef.current;

    if (
      !container ||
      !spreadRow ||
      activeTab !== "OrderBook" ||
      !isOrderBookOpen
    )
      return;

    const asks = orderBookData[activeSide]?.asks || [];
    const bids = orderBookData[activeSide]?.bids || [];
    const hasAsks = asks.length > 0;
    const hasBids = bids.length > 0;

    // Only auto-center in these specific cases:
    // 1. Initial load (!initialScrollDone)
    // 2. When one side has no orders (need to recenter to show available data)
    // 3. User hasn't manually scrolled yet (!userHasScrolled)
    const shouldAutoCenter =
      (!initialScrollDone || !hasAsks || !hasBids) && !userHasScrolled;

    if (shouldAutoCenter && (hasAsks || hasBids)) {
      // Ensure elements are visible and have dimensions before calculating scroll
      if (container.clientHeight > 0 && spreadRow.offsetHeight > 0) {
        const containerHeight = container.clientHeight;
        // Calculate offsetTop relative to scrollable container
        const spreadRowOffsetTop = spreadRow.offsetTop - container.offsetTop;
        const spreadRowHeight = spreadRow.offsetHeight;

        // Center the spread row, but clamp to valid scroll range
        let scrollTop =
          spreadRowOffsetTop - containerHeight / 2 + spreadRowHeight / 2;
        scrollTop = Math.max(0, scrollTop);
        scrollTop = Math.min(
          scrollTop,
          container.scrollHeight - containerHeight
        );

        if (Math.abs(container.scrollTop - scrollTop) > 1) {
          container.scrollTop = scrollTop;
        }
        setInitialScrollDone(true);
        setLastScrollTop(scrollTop);
      }
    }
  }, [
    orderBookData,
    activeSide,
    marketId,
    activeTab,
    initialScrollDone,
    isOrderBookOpen,
    userHasScrolled,
  ]);

  // Handle scroll events to determine spread row position for floating spread
  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container || !spreadRowRef.current) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const spreadRow = spreadRowRef.current;
      const containerHeight = container.clientHeight;
      const spreadRowOffsetTop = spreadRow.offsetTop;
      const spreadRowHeight = spreadRow.offsetHeight;

      // Track that user has manually scrolled (only if scroll position changed significantly)
      if (Math.abs(currentScrollTop - lastScrollTop) > 5) {
        setUserHasScrolled(true);
      }

      // Update scroll direction and last scroll position for reference
      const direction = currentScrollTop > lastScrollTop ? "down" : "up";
      setScrollDirection(direction);
      setLastScrollTop(currentScrollTop);

      // Calculate if spread row is visible in the viewport
      const spreadRowTop = spreadRowOffsetTop - currentScrollTop;
      const spreadRowBottom = spreadRowTop + spreadRowHeight;

      // Only update spread position for floating spread display purposes
      // Don't interfere with user's scroll position
      if (spreadRowTop >= 0 && spreadRowBottom <= containerHeight) {
        // Spread row is fully visible - show in middle position
        setSpreadPosition("middle");
      } else if (spreadRowTop < 0) {
        // Spread row is above viewport - show floating at top
        setSpreadPosition("top");
      } else {
        // Spread row is below viewport - show floating at bottom
        setSpreadPosition("bottom");
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop, activeTab, isOrderBookOpen]);

  // Update timeline filter when parent's timeline changes
  useEffect(() => {
    if (currentTimelineFilter) {
      setTimelineFilter(currentTimelineFilter);
    }
  }, [currentTimelineFilter]);

  const handleTimelineChange = (option) => {
    setTimelineFilter(option.value);
  };

  // Add animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [arrowRotation, setArrowRotation] = useState(true); // Controls arrow rotation independently

  const toggleOrderBook = () => {
    setIsAnimating(true);

    if (isOrderBookOpen) {
      // Immediately update arrow rotation state when starting to close
      setArrowRotation(false);

      // CLOSING: Set exact height first, then transition to 0
      const height = contentRef.current.scrollHeight;
      contentRef.current.style.height = `${height}px`;

      // Force a reflow to make sure the browser recognizes the height
      contentRef.current.offsetHeight;

      // Set to 0 to start the animation
      contentRef.current.style.height = "0px";

      // Wait for animation to finish before changing state
      setTimeout(() => {
        setIsOrderBookOpen(false);
        setIsAnimating(false);
      }, 500); // Match this to your transition duration
    } else {
      // OPENING: Update arrow rotation immediately
      setArrowRotation(true);

      // First set state to true, then animate to full height
      setIsOrderBookOpen(true);

      // Wait for the component to render with isOrderBookOpen=true
      setTimeout(() => {
        if (contentRef.current) {
          // Start with height 0
          contentRef.current.style.height = "0px";

          // Force a reflow
          contentRef.current.offsetHeight;

          // Animate to full height
          const height = contentRef.current.scrollHeight;
          contentRef.current.style.height = `${height}px`;

          // Reset to auto after animation completes
          setTimeout(() => {
            contentRef.current.style.height = "auto";
            setIsAnimating(false);
          }, 500); // Match this to your transition duration
        }
      }, 0);
    }
  };

  // Effect to update the height when content changes or when active tab changes
  useEffect(() => {
    if (contentRef.current && isOrderBookOpen) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(`${height}px`);
    }
  }, [activeTab, activeSide, isOrderBookOpen]);

  // Handle tab change in header
  const handleHeaderTabChange = (tab) => {
    setActiveTab(tab);

    // If switching to Graph tab, ensure we have probability data
    if (tab === "Graph" && localProbabilityData.length === 0) {
      fetchProbabilityData();
    }
  };

  // Use event data from props or create a default object
  const chartEventData = useMemo(() => {
    return (
      eventData || {
        _id: marketId,
        event_title: marketDetails?.name || "Market Data",
        has_sub_markets: true,
      }
    );
  }, [eventData, marketId, marketDetails]);

  // Return to OrderBook tab if Graph tab is selected but there's no data
  useEffect(() => {
    if (activeTab === "Graph" && !hasGraphData) {
      // Only switch back to OrderBook if it's a valid tab to switch to
      if (resolutionState != "final_resolution") {
        setActiveTab("OrderBook");
      } else {
        // If OrderBook is not available (e.g. resolved market), switch to Resolution
        setActiveTab("Resolution");
      }
    }
  }, [activeTab, hasGraphData, resolutionState, setActiveTab]);

  // Effect to switch tab if OrderBook is active and market gets resolved
  useEffect(() => {
    if (resolutionState == "final_resolution" && activeTab === "OrderBook") {
      if (hasGraphData) {
        setActiveTab("Graph");
      } else {
        setActiveTab("Resolution"); // Default to Resolution if Graph is not available
      }
    }
  }, [resolutionState, activeTab, hasGraphData, setActiveTab]);

  // Function to submit resolution proposal
  const submitResolution = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("UnomarketToken");
      if (!token) {
        alert("Please log in to propose a resolution");
        setShowResolutionDialog(false);
        return;
      }

      const payload = {
        market_id: marketId,
        proposed_result: resolutionData.proposed_result,
        evidence_url_1:
          resolutionData.evidence_url_1 || "https://example.com/evidence.pdf", // Default value
        evidence_url_2:
          resolutionData.evidence_url_2 || "https://example.com/evidence2.pdf", // Default value
        evidence_description:
          resolutionData.evidence_description || "Market resolution proposal",
      };

      const response = await fetch(
        "http://localhost:3007/api/resolution/propose",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        showSuccessToast("Resolution proposal submitted successfully");
        setShowResolutionDialog(false);
      } else {
        showErrorToast(
          `Failed to submit resolution: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error submitting resolution:", error);
      showErrorToast(`Error submitting resolution: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to format date for displaying in resolution preview
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      className={`mt-6 border rounded-md   ${
        isDarkMode ? "border-zinc-700" : "border-zinc-200"
      } overflow-hidden`}>
      {/* Header with multiple tabs */}
      <div
        className={`flex cursor-pointer ${isDarkMode ? "" : ""}`}
        onClick={showTitle ? toggleOrderBook : undefined}>
        {resolutionState != "final_resolution" && (
          <button
            className={`py-2 px-4 text-center font-medium text-[18px] hover:cursor-pointer ${
              activeTab === "OrderBook"
                ? isDarkMode
                  ? "text-zinc-100"
                  : "text-zinc-700"
                : isDarkMode
                ? "text-zinc-500"
                : "text-zinc-400"
            } transition-colors duration-300`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggleOrderBook if showTitle is true
              handleHeaderTabChange("OrderBook");
            }}>
            Order Book
          </button>
        )}
        {/* Graph Tab */}
        {(showTitle ? false : hasGraphData) && (
          <button
            className={`py-2 px-4 text-center font-medium text-[18px] hover:cursor-pointer ${
              activeTab === "Graph"
                ? isDarkMode
                  ? "text-zinc-100"
                  : "text-zinc-700"
                : isDarkMode
                ? "text-zinc-500"
                : "text-zinc-400"
            } transition-colors duration-300`}
            onClick={(e) => {
              e.stopPropagation();
              handleHeaderTabChange("Graph");
            }}>
            Graph
          </button>
        )}
        <button
          className={`py-2 px-4 text-center font-medium text-[18px] hover:cursor-pointer ${
            activeTab === "Resolution"
              ? isDarkMode
                ? "text-zinc-100"
                : "text-zinc-700"
              : isDarkMode
              ? "text-zinc-500"
              : "text-zinc-400"
          } transition-colors duration-300`}
          onClick={(e) => {
            e.stopPropagation();
            handleHeaderTabChange("Resolution");
          }}>
          Resolution
        </button>
        {showTitle && (
          <div
            className="ml-auto p-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleOrderBook();
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              } transform transition-transform duration-500 ${
                isOrderBookOpen ? "rotate-180" : "rotate-0"
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
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      <div
        ref={contentRef}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isDarkMode ? "" : ""
        }`}>
        {activeTab === "OrderBook" && (
          <>
            {/* Trade Yes and Trade No Tabs */}
            <div
              className={`flex border-b ${
                isDarkMode ? "border-zinc-800" : "border-zinc-200"
              }`}>
              <button
                className={`py-3 px-6 text-center font-medium hover:cursor-pointer ${
                  isDarkMode ? "text-[#fff]" : "text-[#000]"
                }  ${
                  activeSide === getCurrentSides().side1
                    ? " border-b-2 border-[#FF161A]"
                    : "border-b-2 border-none"
                } transition-all duration-300`}
                onClick={() => handleTabClick(getCurrentSides().side1)}>
                Trade {getCurrentSides().side1}
              </button>

              <button
                className={`py-3 px-6 text-center font-medium hover:cursor-pointer ${
                  isDarkMode ? "text-[#fff]" : "text-[#000]"
                }  ${
                  activeSide === getCurrentSides().side2
                    ? " border-b-2 border-[#FF161A]"
                    : "border-b-2 border-none"
                } transition-all duration-300`}
                onClick={() => handleTabClick(getCurrentSides().side2)}>
                Trade {getCurrentSides().side2}
              </button>
            </div>

            <div className={`relative ${isDarkMode ? "" : "bg-white"}`}>
              {/* Column Headers - Fixed Position */}
              <div
                className={`grid grid-cols-6 gap-4 py-2 border-b ${
                  isDarkMode ? "border-zinc-800 " : "border-zinc-200 bg-white"
                } font-medium ${
                  isDarkMode ? "text-zinc-300" : "text-zinc-600"
                } sticky top-0 z-40`}>
                <div></div>
                <div></div>
                <div></div>
                <div>Price</div>
                <div>Units</div>
                <div>Total</div>
              </div>

              {/* Scrollable Order List */}
              <div
                className={`orderbook-container max-h-[400px] overflow-y-auto scrollbar-hide relative ${
                  sseIsUpdating
                    ? "orderbook-updating fade-out"
                    : "orderbook-updating fade-in"
                }`}
                ref={scrollableContainerRef}>
                {(() => {
                  const { side1, side2 } = getCurrentSides();
                  const asks = orderBookData[activeSide]?.asks || [];
                  const bids = orderBookData[activeSide]?.bids || [];
                  const maxShares = Math.max(
                    ...asks.map((ask) => ask.shares || 0),
                    ...bids.map((bid) => bid.shares || 0)
                  );
                  return (
                    <>
                      {/* Asks (Sell Orders) with Relative Background Bars */}
                      <div className="relative">
                        {asks.length > 0 ? (
                          asks.map((ask, index) => (
                            <div
                              key={`ask-${ask.price}-${ask.shares}`}
                              className={`orderbook-row grid grid-cols-6 gap-4 py-2 relative z-10 transition-all duration-300 ease-in-out transform ${
                                sseIsUpdating
                                  ? "updating opacity-95 scale-[0.998]"
                                  : "opacity-100 scale-100"
                              } ${
                                isDarkMode
                                  ? "hover:bg-[rgba(141,31,23,0.25)]"
                                  : "hover:bg-[rgba(141,31,23,0.15)]"
                              } cursor-pointer ${
                                isDarkMode ? "text-zinc-200" : ""
                              }`}
                              style={{
                                animationDelay: `${index * 20}ms`,
                              }}>
                              {index === asks.length - 1 && (
                                <div className="absolute bottom-2 left-2 z-20">
                                  <div className="w-[39px] h-[22px] bg-[#FF161A] rounded-[3px] flex items-center justify-center">
                                    <div className="flex items-center justify-center w-[27px] h-2.5 text-[#fff] text-xs font-medium">
                                      Asks
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div
                                className="orderbook-bar absolute top-0 left-0 h-full z-0 transition-all duration-500 ease-out opacity-30 "
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "#FF161A"
                                    : "#FF161A",
                                  width: `${
                                    ((ask.shares || 0) / maxShares) * 40
                                  }%`,
                                  transform: `scaleX(${
                                    sseIsUpdating ? 0.95 : 1
                                  })`,
                                  transformOrigin: "left center",
                                }}
                              />
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="orderbook-price font-medium relative z-10 text-[#FF161A] transition-all duration-200">
                                {ask.price}¢
                              </div>
                              <div className="orderbook-shares relative z-10 transition-all duration-200">
                                {ask.shares.toLocaleString()}
                              </div>
                              <div className="orderbook-total relative z-10 transition-all duration-200">
                                $
                                {(
                                  (ask.price / 100) *
                                  ask.shares
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className={`grid grid-cols-6 gap-4 py-2 text-center relative ${
                              isDarkMode ? "text-zinc-400" : "text-zinc-500"
                            }`}>
                            <div className="col-span-6 font-medium">
                              No Asks
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Spread and Last Indicator Row */}
                      <div
                        className={`py-2 flex justify-between items-center border-t border-b ${
                          isDarkMode
                            ? "border-zinc-800 text-zinc-400"
                            : "border-zinc-200 text-zinc-500"
                        } z-10 ${
                          spreadPosition === "middle" ? "" : "invisible"
                        }`}
                        ref={spreadRowRef}>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div>
                          Spread{" "}
                          {orderBookData.spreads &&
                          typeof orderBookData.spreads[activeSide] === "number"
                            ? `${orderBookData.spreads[activeSide]}¢`
                            : "--"}
                        </div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>

                      {/* Bids (Buy Orders) with Relative Background Bars */}
                      <div className="relative">
                        {bids.length > 0 ? (
                          bids.map((bid, index) => (
                            <div
                              key={`bid-${bid.price}-${bid.shares}`}
                              className={`orderbook-row   grid grid-cols-6 gap-4 py-2 relative z-10 transition-all duration-300 ease-in-out transform ${
                                sseIsUpdating
                                  ? "updating opacity-95 scale-[0.998]"
                                  : "opacity-100 scale-100"
                              } ${
                                isDarkMode
                                  ? "hover:bg-[#95d3b1]"
                                  : "hover:bg-[#95d3b1]"
                              } cursor-pointer ${
                                isDarkMode ? "text-zinc-200" : ""
                              }`}
                              style={{
                                animationDelay: `${index * 20}ms`,
                              }}>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 z-20  ">
                                  <div className="w-[39px] h-[22px] bg-[#009443] rounded-[3px] flex items-center justify-center">
                                    <div className="flex items-center justify-center w-[27px] h-2.5 text-[#fff] text-xs font-medium">
                                      Bids
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div
                                className="orderbook-bar absolute top-0 left-0 h-full z-0 transition-all duration-500 ease-out"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "rgba(41, 140, 140, 0.40)"
                                    : "rgba(41, 140, 140, 0.30)",
                                  width: `${
                                    ((bid.shares || 0) / maxShares) * 40
                                  }%`,
                                  transform: `scaleX(${
                                    sseIsUpdating ? 0.95 : 1
                                  })`,
                                  transformOrigin: "left center",
                                }}
                              />
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="orderbook-price font-medium relative z-10 text-[#009443] transition-all duration-200">
                                {bid.price}¢
                              </div>
                              <div className="orderbook-shares relative z-10 transition-all duration-200">
                                {bid.shares.toLocaleString()}
                              </div>
                              <div className="orderbook-total relative z-10 transition-all duration-200">
                                $
                                {(
                                  (bid.price / 100) *
                                  bid.shares
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className={`grid grid-cols-6 gap-4 py-2 text-center ${
                              isDarkMode ? "text-zinc-400" : "text-zinc-500"
                            }`}>
                            <div className="col-span-6 font-medium">
                              No Bids
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Floating Spread Row - positioned based on scroll */}
              {spreadPosition !== "middle" && (
                <div
                  ref={floatingSpreadRef}
                  className={`absolute left-0 right-0 z-30 py-2 flex justify-between items-center ${
                    spreadPosition === "top"
                      ? "border-b top-[41px]"
                      : "border-t bottom-0"
                  } ${
                    isDarkMode
                      ? "border-zinc-800 text-zinc-400 bg-zinc-900"
                      : "border-zinc-200 text-zinc-500 bg-white"
                  } transition-all duration-200`}>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>
                    Spread{" "}
                    {orderBookData.spreads &&
                    typeof orderBookData.spreads[activeSide] === "number"
                      ? `${orderBookData.spreads[activeSide]}¢`
                      : "--"}
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              )}
            </div>
          </>
        )}

        {isOrderBookOpen && activeTab === "Graph" && hasGraphData && (
          <div
            className={`mt-4 rounded-2xl shadow-none pt-4 pb-4 ${
              isDarkMode ? "text-zinc-300" : ""
            }`}>
            {/* Debug data display */}
            {false && (
              <div className="bg-black text-white p-2 text-xs overflow-auto">
                <pre>
                  {JSON.stringify(
                    {
                      hasData:
                        localProbabilityData && localProbabilityData.length > 0,
                      dataLength: localProbabilityData?.length || 0,
                      firstMarket: localProbabilityData?.[0]
                        ? {
                            market_id: localProbabilityData[0].market_id,
                            dataPoints:
                              localProbabilityData[0].data?.length || 0,
                          }
                        : "none",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            <ActivityChart
              eventData={chartEventData}
              probabilityData={localProbabilityData}
              timeFrame={timelineFilter}
              timelineOptions={timelineOptions}
              handleTimelineChange={handleTimelineChange}
              isSubmarketMode={true} // Explicitly mark this as a submarket chart
            />
          </div>
        )}

        {isOrderBookOpen && activeTab === "Resolution" && (
          <div
            className={`p-4 flex flex-col items-start justify-left overflow-visible ${
              isDarkMode ? "text-zinc-300" : ""
            }`}>
            {resolutionState == "open" ? (
              // Show propose resolution button if resolution state is open
              <div
                className="w-64 h-12 px-8 py-3 bg-[#FF532A] rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer"
                onClick={() => setShowResolutionDialog(true)}>
                <div className="justify-center text-white text-base font-medium">
                  Propose Solution
                </div>
              </div>
            ) : resolutionState != "open" ? (
              // Show resolution timeline if there are resolutions
              <div className="w-full">
                {/* Use the current submarket's resolutions if available */}
                {eventData?.sub_markets?.find((m) => m._id === marketId)
                  ?.resolutions?.length > 0 ? (
                  <ResolutionTimeline
                    resolutions={
                      eventData.sub_markets.find((m) => m._id === marketId)
                        .resolutions
                    }
                    marketId={marketId}
                    eventData={eventData}
                    onDispute={() => {
                      // After successful dispute, refresh the resolution state
                      fetchMarketResolutionState();
                    }}
                  />
                ) : null}
              </div>
            ) : (
              // Default message for other states
              <div className={isDarkMode ? "text-zinc-400" : "text-gray-500"}>
                No resolution information available for this market.
              </div>
            )}
          </div>
        )}

        {/* Resolution Dialog */}
        <ResolutionDialog
          isOpen={showResolutionDialog}
          onClose={() => setShowResolutionDialog(false)}
          eventData={eventData}
          marketId={marketId}
          onSubmit={() => {
            // After successful submission, refresh the resolution state
            fetchMarketResolutionState();
          }}
        />
      </div>
    </div>
  );
};

export default OrderBook;
