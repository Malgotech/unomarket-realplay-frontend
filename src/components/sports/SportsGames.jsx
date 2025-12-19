import React, { useState, useEffect, useRef } from "react";
import { fetchData } from "../../services/apiServices";
import SkeletonCard from "../SkeletonCard";
import TodayMatch from "../market_cards/TodayMatch";
import UpcomingMatch from "../market_cards/UpcomingMatch";
import MarketSideBar from "../MarketSideBar";
import MobileTradingPanel from "../MobileTradingPanel";
import LeagueDropdown from "../../pages/LeagueDropdown";
import Loader from "../Loader";
import SportsSidebarSkeleton from "./SportsSidebarSkeleton";

const SportsGames = ({
  selectedDates,
  selectedSubcategory,
  selectedTodayLeague,
  selectedUpcomingLeague,
  onTodayLeagueChange,
  onUpcomingLeagueChange,
  sportsSubcategories,
  isDarkMode,
  onEventSelect, // Add prop for event selection
}) => {
  const todayMatchesRef = useRef(null);
  const upcomingMatchesRef = useRef(null);

  // State management
  const [sportsEvents, setSportsEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [filteredTodayEvents, setFilteredTodayEvents] = useState([]);
  const [filteredUpcomingEvents, setFilteredUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false); // State for handling fade transition

  // Selected market state for sidebar
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedButtonColors, setSelectedButtonColors] = useState({
    btn1Color: null,
    btn2Color: null,
  });

  // Available leagues for dropdowns
  const [availableLeagues, setAvailableLeagues] = useState([]);

  // Mobile trading panel state
  const [showMobileTradingPanel, setShowMobileTradingPanel] = useState(false);

  // Function to check if a date is today in local time
  const isDateToday = (dateString) => {
    if (!dateString) return false;

    const eventDate = new Date(dateString);
    const now = new Date();

    // Compare dates in local timezone
    const eventDateLocal = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return eventDateLocal.getTime() === nowLocal.getTime();
  };

  // Fetch sports events using the same API pattern as Sports.jsx
  const fetchSportsEvents = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
        setIsContentVisible(false); // Hide content before loading new data
      } else {
        setLoadingMore(true);
      }

      // Build API URL with filters
      let apiUrl = `api/event/events/sports?page=${page}&limit=50`;

      // Add subcategory filter if selected
      if (selectedSubcategory && sportsSubcategories.length > 0) {
        const selectedSubcat = sportsSubcategories.find(
          (s) => s.id === selectedSubcategory
        );
        if (selectedSubcat) {
          apiUrl += `&subcategories=${selectedSubcat.id}`;
        }
      }

      // Add league filter if both today and upcoming are the same
      if (
        selectedTodayLeague &&
        selectedTodayLeague === selectedUpcomingLeague &&
        selectedTodayLeague !== "all"
      ) {
        apiUrl += `&leagueid=${selectedTodayLeague}`;
      }

      console.log(`Fetching sports events with URL: ${apiUrl}`);

      // Use the sports events API endpoint with filters
      const data = await fetchData(apiUrl);
      console.log('sportsdata :>> ', data);
      if (data.success) {
        const allEvents = data.events;
        const now = new Date();

        // Separate today's events from upcoming events
        const todayMatches = allEvents.filter((event) => {
          const isToday =
            event.match_start_date && isDateToday(event.match_start_date);
          if (isToday) {
            console.log(
              "Today match found:",
              event.event_title,
              event.match_start_date
            );
          }
          return isToday;
        });

        const upcomingMatches = allEvents.filter((event) => {
          const hasDate = event.match_start_date;
          const notToday = !isDateToday(event.match_start_date);
          const isFuture = new Date(event.match_start_date) > now;
          const isUpcoming = hasDate && notToday && isFuture;

          if (isUpcoming) {
            console.log(
              "Upcoming match found:",
              event.event_title,
              event.match_start_date
            );
          }

          return isUpcoming;
        });

        console.log("SportsGames - Event filtering results:", {
          totalEvents: allEvents.length,
          todayMatches: todayMatches.length,
          upcomingMatches: upcomingMatches.length,
          currentDate: now.toISOString(),
          sampleEventDate: allEvents[0]?.match_start_date,
        });

        // Add to existing events if loading more, otherwise replace
        if (page > 1) {
          setTodayEvents((prev) => [...prev, ...todayMatches]);
          setUpcomingEvents((prev) => [...prev, ...upcomingMatches]);
        } else {
          setTodayEvents(todayMatches);
          setUpcomingEvents(upcomingMatches);
        }

        // Store all events together as well
        setSportsEvents((prev) =>
          page > 1 ? [...prev, ...allEvents] : allEvents
        );

        // Check if there are more events to load
        setHasMoreEvents(allEvents.length >= 50);

        // Don't auto-select immediately - wait for colors to be extracted
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching sports events:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      // Delay making content visible for smooth transition (only for initial load)
      if (page === 1) {
        setTimeout(() => {
          console.log("SportsGames - Setting content visible to true");
          setIsContentVisible(true);
        }, 50);
      }
    }
  };

  // Load more events
  const loadMoreEvents = () => {
    if (!loadingMore && hasMoreEvents) {
      fetchSportsEvents(currentPage + 1);
    }
  };

  // Auto-select first event when colors are available
  const autoSelectFirstEvent = (btn1Color, btn2Color) => {
    if (selectedMarketId !== null) return; // Already selected

    const allEvents = [...filteredTodayEvents, ...filteredUpcomingEvents];
    if (allEvents.length === 0) return;

    const firstEvent =
      filteredTodayEvents.length > 0
        ? filteredTodayEvents[0]
        : filteredUpcomingEvents[0];

    if (
      firstEvent &&
      firstEvent.sub_markets &&
      firstEvent.sub_markets.length > 0
    ) {
      const firstMarketId = firstEvent.sub_markets[0]._id;
      const side1Value = firstEvent.sub_markets[0]?.side_1;

      setSelectedMarketId(firstMarketId);
      setSelectedOption(side1Value);
      setSelectedEvent(firstEvent);
      setSelectedButtonColors({
        btn1Color: btn1Color,
        btn2Color: btn2Color,
      });
    }
  };

  // Handle option selection for sidebar and mobile trading panel
  const handleOptionSelect = (marketId, option, btn1Color, btn2Color) => {
    setSelectedMarketId(marketId);
    setSelectedOption(option);

    // Find the event that contains this market
    const event = sportsEvents.find((event) =>
      event.sub_markets?.some((market) => market._id === marketId)
    );

    if (event) {
      setSelectedEvent(event);
    }

    // Store the button colors for the sidebar
    setSelectedButtonColors({
      btn1Color: btn1Color,
      btn2Color: btn2Color,
    });

    // Show mobile trading panel on mobile devices (below lg breakpoint)
    const isMobile = window.innerWidth < 1024; // lg breakpoint is 1024px
    if (isMobile) {
      setShowMobileTradingPanel(true);
    }
  };

  // Helper function to convert dynamic side values to yes/no for mobile trading panel
  const getMobileTradingOption = () => {
    if (!selectedEvent || !selectedMarketId || !selectedOption) {
      return null;
    }

    // Find the selected market
    const selectedMarket = selectedEvent.sub_markets?.find(
      (market) => market._id === selectedMarketId
    );
    if (!selectedMarket) {
      return null;
    }

    if (selectedEvent.has_sub_markets) {
      // For multi-market events, always use "yes" since each market represents a specific outcome
      return "yes";
    } else {
      // For single market events, check if the selected option matches side_1 (yes) or side_2 (no)
      if (selectedOption === selectedMarket.side_1) {
        return "yes";
      } else if (selectedOption === selectedMarket.side_2) {
        return "no";
      }
    }

    return null;
  };

  // Handle option selection specifically for mobile trading panel
  const handleMobileOptionSelect = (
    marketId,
    mobileOption,
    btn1Color,
    btn2Color
  ) => {
    // Find the event that contains this market
    const event =
      selectedEvent ||
      sportsEvents.find((event) =>
        event.sub_markets?.some((market) => market._id === marketId)
      );

    if (!event) return;

    // Find the selected market
    const selectedMarket = event.sub_markets?.find(
      (market) => market._id === marketId
    );
    if (!selectedMarket) return;

    // Convert mobile option (yes/no) back to actual side value
    let actualOption;
    if (event.has_sub_markets) {
      // For multi-market events, always use side_1 since each market represents a specific outcome
      actualOption = selectedMarket.side_1;
    } else {
      // For single market events, map yes/no to side_1/side_2
      if (mobileOption === "yes") {
        actualOption = selectedMarket.side_1;
      } else if (mobileOption === "no") {
        actualOption = selectedMarket.side_2;
      }
    }

    // Update the state with the actual option value
    setSelectedMarketId(marketId);
    setSelectedOption(actualOption);
    setSelectedEvent(event);

    // Always use the event's team colors for consistency
    setSelectedButtonColors({
      btn1Color: event.team1_color || btn1Color,
      btn2Color: event.team2_color || btn2Color,
    });
  };

  // Get leagues for selected subcategory
  const getLeaguesForSubcategory = () => {
    if (!selectedSubcategory || !sportsSubcategories.length) {
      return [];
    }

    const selectedSubcat = sportsSubcategories.find(
      (s) => s.id === selectedSubcategory
    );

    if (!selectedSubcat || !selectedSubcat.leagues) {
      return [];
    }

    // Add "All Leagues" option first, then the subcategory's leagues
    const leagues = [
      { _id: "all", name: "All Leagues", image: null },
      ...selectedSubcat.leagues.map((league) => ({
        _id: league._id,
        name: league.name,
        image: league.image,
      })),
    ];

    return leagues;
  };

  // Update available leagues when subcategory changes
  useEffect(() => {
    const subcategoryLeagues = getLeaguesForSubcategory();
    setAvailableLeagues(subcategoryLeagues);
  }, [selectedSubcategory, sportsSubcategories]);

  // Filter events based on selected filters (now mainly for league and date filtering)
  useEffect(() => {
    let filteredToday = [...todayEvents];
    let filteredUpcoming = [...upcomingEvents];

    // Filter today's events by league
    if (selectedTodayLeague && selectedTodayLeague !== "all") {
      filteredToday = filteredToday.filter(
        (event) =>
          event.league?._id === selectedTodayLeague ||
          event.league?.name === selectedTodayLeague ||
          event.league_id === selectedTodayLeague ||
          event.league_name === selectedTodayLeague
      );
    }

    // Filter upcoming events by league
    if (selectedUpcomingLeague && selectedUpcomingLeague !== "all") {
      filteredUpcoming = filteredUpcoming.filter(
        (event) =>
          event.league?._id === selectedUpcomingLeague ||
          event.league?.name === selectedUpcomingLeague ||
          event.league_id === selectedUpcomingLeague ||
          event.league_name === selectedUpcomingLeague
      );
    }

    // Filter by selected dates (keep existing date filtering logic)
    if (selectedDates.length > 0) {
      filteredToday = filteredToday.filter((event) => {
        const eventDate = event.match_start_date;
        if (!eventDate) return false;

        const eventDateObj = new Date(eventDate);
        const eventDateString = eventDateObj.toISOString().split("T")[0];

        return selectedDates.some((selectedDate) => {
          const selected = new Date(selectedDate);
          const selectedDateString = selected.toISOString().split("T")[0];
          return eventDateString === selectedDateString;
        });
      });

      filteredUpcoming = filteredUpcoming.filter((event) => {
        const eventDate = event.match_start_date;
        if (!eventDate) return false;

        const eventDateObj = new Date(eventDate);
        const eventDateString = eventDateObj.toISOString().split("T")[0];

        return selectedDates.some((selectedDate) => {
          const selected = new Date(selectedDate);
          const selectedDateString = selected.toISOString().split("T")[0];
          return eventDateString === selectedDateString;
        });
      });
    }

    console.log("SportsGames - Final filtering results:", {
      originalToday: todayEvents.length,
      originalUpcoming: upcomingEvents.length,
      filteredToday: filteredToday.length,
      filteredUpcoming: filteredUpcoming.length,
      selectedTodayLeague,
      selectedUpcomingLeague,
      selectedDates: selectedDates.length,
    });

    setFilteredTodayEvents(filteredToday);
    setFilteredUpcomingEvents(filteredUpcoming);
  }, [
    todayEvents,
    upcomingEvents,
    selectedTodayLeague,
    selectedUpcomingLeague,
    selectedDates,
  ]);

  // Initial load and reload when filters change
  useEffect(() => {
    fetchSportsEvents(1);
  }, [selectedSubcategory, selectedTodayLeague, selectedUpcomingLeague]);

  // Handle scroll-based loading
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMoreEvents) return;

      const checkSection = (ref, threshold = 200) => {
        if (!ref.current) return false;
        const { scrollTop, scrollHeight, clientHeight } = ref.current;
        return scrollHeight - scrollTop - clientHeight < threshold;
      };

      // For the upcoming matches container
      if (upcomingMatchesRef.current) {
        const rect = upcomingMatchesRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
          const scrollPosition = window.innerHeight + window.pageYOffset;
          const scrollThreshold = document.body.offsetHeight - 200;

          if (scrollPosition >= scrollThreshold) {
            loadMoreEvents();
          }
        }
      }

      // Check for scroll within containers too
      if (checkSection(todayMatchesRef) || checkSection(upcomingMatchesRef)) {
        loadMoreEvents();
      }
    };

    const todaySection = todayMatchesRef.current;
    const upcomingSection = upcomingMatchesRef.current;

    if (todaySection) todaySection.addEventListener("scroll", handleScroll);
    if (upcomingSection)
      upcomingSection.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (todaySection)
        todaySection.removeEventListener("scroll", handleScroll);
      if (upcomingSection)
        upcomingSection.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadingMore, hasMoreEvents]);

  // Auto-select first event when events are loaded (since we now get colors directly from API)
  useEffect(() => {
    const allEvents = [...filteredTodayEvents, ...filteredUpcomingEvents];
    if (allEvents.length > 0 && selectedMarketId === null) {
      const firstEvent =
        filteredTodayEvents.length > 0
          ? filteredTodayEvents[0]
          : filteredUpcomingEvents[0];

      if (firstEvent && firstEvent.team1_color && firstEvent.team2_color) {
        autoSelectFirstEvent(firstEvent.team1_color, firstEvent.team2_color);
      }
    }
  }, [filteredTodayEvents, filteredUpcomingEvents, selectedMarketId]);

  // Handle window resize to close mobile panel when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      if (isDesktop && showMobileTradingPanel) {
        setShowMobileTradingPanel(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showMobileTradingPanel]);

  // Close mobile trading panel when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showMobileTradingPanel) {
        setShowMobileTradingPanel(false);
      }
    };

    if (showMobileTradingPanel) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showMobileTradingPanel]);

  // Listen for successful trade events and refresh data
  useEffect(() => {
    const handleTradeSuccess = () => {
      console.log("Trade successful - refreshing sports events data");

      // Close mobile trading panel
      setShowMobileTradingPanel(false);

      // Refresh the sports events data
      fetchSportsEvents(1);

      // Reset selections to trigger auto-selection of first event
      setSelectedMarketId(null);
      setSelectedOption(null);
      setSelectedEvent(null);
      setSelectedButtonColors({
        btn1Color: null,
        btn2Color: null,
      });
    };

    // Listen for the trade success event dispatched by MobileTradingPanel
    window.addEventListener("soundbet-trade-success", handleTradeSuccess);

    return () => {
      window.removeEventListener("soundbet-trade-success", handleTradeSuccess);
    };
  }, []); // Empty dependency array since fetchSportsEvents is stable

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {loading ? (
        // Show skeleton while loading - Match exact layout structure
        <>
          {/* Left side - Events skeleton - Use flex-1 to match actual content */}
          <div className="flex-1">
            {/* Today's Matches Section Skeleton - Exactly 2 matches */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-7 w-44 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
                <div
                  className={`h-10 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={`today-skeleton-${index}`}
                    className={`${isDarkMode ? "bg-[#1A1B1E]" : "bg-[#f7f7f7]"
                      } rounded-xl p-3 sm:p-5 flex flex-col relative transition-all duration-200 ${isDarkMode
                        ? "shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                        : "shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                      }`}
                  >
                    {/* Header section with time, volume, and subcategory */}
                    <div className="flex justify-between items-center mb-4">
                      <div
                        className={`h-8 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded animate-pulse`}
                      ></div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-md animate-pulse`}
                        ></div>
                        <div
                          className={`w-8 h-8 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-sm animate-pulse`}
                        ></div>
                        <div
                          className={`w-6 h-6 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-full animate-pulse`}
                        ></div>
                      </div>
                    </div>

                    {/* Main content area with teams and stats */}
                    <div className="flex flex-row items-center">
                      {/* Left column - Teams */}
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Team 1 */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } animate-pulse`}
                          ></div>
                          <div className="flex flex-col">
                            <div
                              className={`h-6 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse`}
                            ></div>
                            <div
                              className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse mt-1`}
                            ></div>
                          </div>
                        </div>
                        {/* Team 2 */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } animate-pulse`}
                          ></div>
                          <div className="flex flex-col">
                            <div
                              className={`h-6 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse`}
                            ></div>
                            <div
                              className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse mt-1`}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Center stats visualization */}
                      <div className="hidden sm:flex flex-col items-center mx-2 sm:mx-10 relative">
                        <div className="flex items-center justify-center relative h-[30px] sm:h-[44px]">
                          <div
                            className={`h-4 w-8 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } rounded-md animate-pulse absolute left-0`}
                          ></div>
                          <div
                            className={`w-[150px] h-[30px] sm:h-[44px] ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } rounded-md animate-pulse mx-8 sm:mx-10`}
                          ></div>
                          <div
                            className={`h-4 w-8 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } rounded-md animate-pulse absolute right-0`}
                          ></div>
                        </div>
                      </div>

                      {/* Right column - Team images */}
                      <div className="flex flex-col gap-4 items-end">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } animate-pulse`}
                        ></div>
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } animate-pulse`}
                        ></div>
                      </div>
                    </div>

                    {/* Buttons section */}
                    <div className="flex items-center gap-4 mt-6">
                      <div
                        className={`flex-1 h-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`flex-1 h-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                      <div
                        className={`flex-1 h-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded-md animate-pulse`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Matches Section Skeleton - Exactly 6 matches */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-7 w-48 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                    } rounded-md animate-pulse`}
                ></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`upcoming-skeleton-${index}`}
                    className={`${isDarkMode
                      ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
                      : "bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
                      } w-full rounded-xl p-4 flex flex-col justify-between transition-all duration-200`}
                  >
                    {/* Header section */}
                    <div className="flex justify-between items-center">
                      <div
                        className={`h-8 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded animate-pulse`}
                      ></div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-16 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-md animate-pulse`}
                        ></div>
                        <div
                          className={`w-8 h-8 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-sm animate-pulse`}
                        ></div>
                        <div
                          className={`w-6 h-6 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-full animate-pulse`}
                        ></div>
                      </div>
                    </div>

                    {/* Container for teams and dots visualization */}
                    <div className="flex flex-row mt-8 mb-2">
                      {/* Left column with teams */}
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Team 1 */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } animate-pulse`}
                          ></div>
                          <div className="flex flex-col">
                            <div
                              className={`h-5 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse`}
                            ></div>
                          </div>
                        </div>
                        {/* Team 2 */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                              } animate-pulse`}
                          ></div>
                          <div className="flex flex-col">
                            <div
                              className={`h-5 w-20 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                                } rounded-md animate-pulse`}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Square dots visualization */}
                      <div className="hidden sm:flex items-center justify-center w-32 mr-1">
                        <div
                          className={`h-[70px] w-[70px] ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                            } rounded-md animate-pulse`}
                        ></div>
                      </div>
                    </div>

                    {/* Buttons section */}
                    <div className="flex items-center gap-4 mt-4">
                      <div
                        className={`flex-1 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded animate-pulse`}
                      ></div>
                      <div
                        className={`flex-1 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded animate-pulse`}
                      ></div>
                      <div
                        className={`flex-1 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"
                          } rounded animate-pulse`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Sidebar skeleton (w-80 width to match actual sidebar) */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-[9rem]">
              <SportsSidebarSkeleton isDarkMode={isDarkMode} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Left side - Events */}
          <div className="flex-1">
            {/* Today's Matches Section */}
            {filteredTodayEvents.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Today's Matches
                  </h2>
                  {availableLeagues.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <LeagueDropdown
                        leagues={availableLeagues}
                        selectedLeague={selectedTodayLeague}
                        onSelect={onTodayLeagueChange}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  )}
                </div>
                <div ref={todayMatchesRef} className="grid grid-cols-1 gap-4">
                  {filteredTodayEvents.map((event, index) => (
                    <div
                      key={`today-${event._id}-${index}`}
                      className="transition-all duration-300 ease-in-out"
                    >
                      <TodayMatch
                        event={event}
                        onSelect={handleOptionSelect}
                        onEventSelect={(eventId) => {
                          // Pass the event data directly to avoid API call
                          if (onEventSelect) {
                            onEventSelect(event);
                          }
                        }}
                        selectedMarketId={selectedMarketId}
                        selectedOption={selectedOption}
                        sportsSubcategories={sportsSubcategories}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Matches Section */}
            {filteredUpcomingEvents.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Upcoming Matches
                  </h2>
                  {/* Only show league dropdown for upcoming if there are no today's matches */}
                  {availableLeagues.length > 1 &&
                    filteredTodayEvents.length === 0 && (
                      <div className="flex items-center space-x-2">
                        <LeagueDropdown
                          leagues={availableLeagues}
                          selectedLeague={selectedUpcomingLeague}
                          onSelect={onUpcomingLeagueChange}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    )}
                </div>
                <div
                  ref={upcomingMatchesRef}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {filteredUpcomingEvents.map((event, index) => {
                    console.log(
                      "SportsGames - Rendering upcoming event:",
                      event.event_title,
                      event._id
                    );
                    return (
                      <div
                        key={`upcoming-${event._id}-${index}`}
                        className="transition-all duration-300 ease-in-out"
                      >
                        <UpcomingMatch
                          event={event}
                          onSelect={handleOptionSelect}
                          onExpandClick={(event, team1Color, team2Color) => {
                            // Pass the event data directly to avoid API call
                            if (onEventSelect) {
                              onEventSelect(event, team1Color, team2Color);
                            }
                          }}
                          selectedMarketId={selectedMarketId}
                          selectedOption={selectedOption}
                          sportsSubcategories={sportsSubcategories}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={`loading-skeleton-${index}`} />
                ))}
              </div>
            )}

            {/* No events found */}
            {!loading &&
              filteredTodayEvents.length === 0 &&
              filteredUpcomingEvents.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-center max-w-md">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"
                        }`}
                    >
                      <svg
                        className={`w-8 h-8 ${isDarkMode ? "text-zinc-400" : "text-gray-400"
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        }`}
                    >
                      No Sports Events Found
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-sm leading-relaxed ${isDarkMode ? "text-zinc-500" : "text-zinc-600"
                        }`}
                    >
                      {selectedSubcategory || selectedDates.length > 0
                        ? "Try adjusting your filters to see more events"
                        : "Check back later for new sports events"}
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Right side - Sticky Sidebar - Only show when there are events */}
          {(filteredTodayEvents.length > 0 ||
            filteredUpcomingEvents.length > 0) && (
              <div className="hidden lg:block w-80">
                <div className="sticky top-[9rem]">
                  {!selectedEvent ? (
                    <SportsSidebarSkeleton isDarkMode={isDarkMode} />
                  ) : (
                    <>
                      <MarketSideBar
                        selectedMarketId={selectedMarketId}
                        selectedOption={selectedOption}
                        event={selectedEvent}
                        isDarkMode={isDarkMode}
                        btn1Color={selectedButtonColors.btn1Color}
                        btn2Color={selectedButtonColors.btn2Color}
                        onOptionSelect={handleOptionSelect}
                        hasSubMarkets={selectedEvent?.has_sub_markets || false}
                        isLoadingColors={false}
                        userPositions={[]} // TODO: Implement positions for sports
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
                  )}
                </div>
              </div>
            )}
        </>
      )}

      {/* Mobile Trading Panel - Show only on mobile when a button is clicked */}
      {showMobileTradingPanel && selectedEvent && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Very light overlay to show cards behind
            backdropFilter: "blur(2px)", // Light blur effect
          }}
          onClick={(e) => {
            // Close panel when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowMobileTradingPanel(false);
            }
          }}
        >
          <div
            className={`w-full ${isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
              } rounded-t-xl shadow-2xl`}
            style={{
              maxHeight: "70vh", // Reduced height to ensure bottom button is visible
              minHeight: "50vh", // Minimum height for good UX
            }}
          >
            {/* Header with close button */}
            <div
              className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
                } flex-shrink-0`}
            >
              <h3
                className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {selectedEvent?.team1_name && selectedEvent?.team2_name
                  ? `${selectedEvent.team1_name} vs ${selectedEvent.team2_name}`
                  : "Trade Panel"}
              </h3>
              <button
                onClick={() => setShowMobileTradingPanel(false)}
                className={`p-2 rounded-full transition-colors ${isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
                  }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Trading Panel Content - Scrollable area */}
            <div
              className="overflow-y-auto flex-1"
              style={{ maxHeight: "calc(70vh - 80px)" }}
            >
              <div className="pb-20">
                {" "}
                {/* Add bottom padding to ensure button is visible above navbar */}
                <MobileTradingPanel
                  selectedOption={getMobileTradingOption()}
                  onOptionSelect={handleMobileOptionSelect}
                  selectedMarketId={selectedMarketId}
                  event={selectedEvent}
                  hasSubMarkets={selectedEvent?.has_sub_markets || false}
                  marketPrices={
                    selectedEvent?.sub_markets?.find(
                      (market) => market._id === selectedMarketId
                    )?.marketPrices
                  }
                  btn1={selectedEvent?.team1_short_name || "Yes"}
                  btn2={selectedEvent?.team2_short_name || "No"}
                  btn1Color={selectedEvent?.team1_color || "#298C8C"}
                  btn2Color={selectedEvent?.team2_color || "#8D1F17"}
                  isLoadingColors={false}
                  userPositions={[]} // TODO: Implement positions for sports
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsGames;
