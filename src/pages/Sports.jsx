import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// Navbar removed - now handled globally in App.jsx
import SportCard from "../components/SportCard";
import SportCardSkeleton from "../components/SportCardSkeleton";
import SportsGeneral from "../components/sports/SportsGeneral";
import SportsGames from "../components/sports/SportsGames";
import SportsGameView from "../components/sports/SportsGameView";
import DateFilter from "../components/DateFilter";
import Toast from "../components/Toast";
import { useSelector } from "react-redux";
import { fetchData } from "../services/apiServices";

// Module-level cache to persist across component re-mounts
let sportsSubcategoriesCache = null;
let subcategoriesLoadedCache = false;

const Sports = ({ initialEventId = null }) => {
  const scrollContainerRef = useRef(null);

  // State management
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTodayLeague, setSelectedTodayLeague] = useState("all");
  const [selectedUpcomingLeague, setSelectedUpcomingLeague] = useState("all");
  const [sportsSubcategories, setSportsSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [autoScrollInterval, setAutoScrollInterval] = useState(null);
  const [clonedItems, setClonedItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState("sports"); // "sports" or "other"

  // Add state to track if subcategories have been loaded
  const [subcategoriesLoaded, setSubcategoriesLoaded] = useState(false);

  // Game view state - for when a specific event is selected
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [currentView, setCurrentView] = useState(
    initialEventId ? "game" : "list"
  ); // "list" or "game"

  // URL parameter handling for direct game access
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Theme
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // Scroll controls
  const [canScrollSportsLeft, setCanScrollSportsLeft] = useState(false);
  const [canScrollSportsRight, setCanScrollSportsRight] = useState(false);

  // Categories hook
  // Removed useCategories hook - now using direct API call

  // Initialize from cache on component mount
  useEffect(() => {
    // Check if we have cached data first
    if (subcategoriesLoadedCache && sportsSubcategoriesCache) {
      setSportsSubcategories(sportsSubcategoriesCache);
      setClonedItems([
        ...sportsSubcategoriesCache,
        ...sportsSubcategoriesCache,
        ...sportsSubcategoriesCache,
      ]);
      setSubcategoriesLoaded(true);
      setLoading(false);
      return;
    }

    // Only fetch if subcategories haven't been loaded yet
    if (subcategoriesLoaded) {
      setLoading(false);
      return;
    }

    const fetchSportsCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchData("api/admin/categories");
        if (data.status && data.data.categories) {
          // Find the sports category
          const sportsCategory = data.data.categories.find(
            (category) => category.name === "Sports"
          );
          if (sportsCategory && sportsCategory.subcategories) {
            // Format subcategories for the UI
            const formattedSubcategories = sportsCategory.subcategories.map(
              (subcat) => ({
                name: subcat.name,
                volume: 148.75, // Default volume
                start_date: "24-10-2023", // Default dates
                end_date: "14-04-2024",
                image: subcat.image,
                id: subcat._id,
                leagues: subcat.leagues || [],
                description: subcat.description,
                allow_official: subcat.allow_official || false,
              })
            );

            // Update state
            setSportsSubcategories(formattedSubcategories);
            setClonedItems([
              ...formattedSubcategories,
              ...formattedSubcategories,
              ...formattedSubcategories,
            ]);
            setSubcategoriesLoaded(true);

            // Update module-level cache
            sportsSubcategoriesCache = formattedSubcategories;
            subcategoriesLoadedCache = true;

          } 
        } else {
          console.error(
            "Failed to fetch categories:",
            data.message || "Unknown error"
          );
          setToastMessage("Failed to load sports categories");
          setShowToast(true);
        }
      } catch (error) {
        console.error("Error fetching sports categories:", error);
        setToastMessage("Error loading sports categories");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsCategories();
  }, []); // Empty dependency array - only run once on mount

  // Handle URL parameters for direct game access
  useEffect(() => {
    // Only process URL params if we don't have an initialEventId (from route)
    if (!initialEventId) {
      const eventId = searchParams.get("eventId");
      if (eventId) {
        handleEventSelect(eventId);
        // Remove the eventId from URL after navigation
        setSearchParams({});
      }
    }
  }, [searchParams, initialEventId]);

  // Subcategory handling
  const handleSubcategorySelect = (subcategoryId) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }

    // Reset league selections when subcategory changes
    setSelectedTodayLeague("all");
    setSelectedUpcomingLeague("all");

    // Reset to list view when filter changes
    setCurrentView("list");
    setSelectedEventId(null);
  };

  // Handle event selection for game view - now accepts event data directly
  const handleEventSelect = (eventIdOrData, team1Color, team2Color) => {
    if (typeof eventIdOrData === "string") {
      // Legacy support - just eventId passed
      setSelectedEventId(eventIdOrData);
      setSelectedEventData(null);
    } else {
      // New approach - full event data passed
      setSelectedEventId(eventIdOrData._id);
      setSelectedEventData(eventIdOrData);
    }

    setCurrentView("game");
    // Navigate to the new URL format unless we're already on it (initialEventId case)
    if (!initialEventId) {
      const eventId =
        typeof eventIdOrData === "string" ? eventIdOrData : eventIdOrData._id;
      navigate(`/market/sports/game/${eventId}`, { replace: true });
    }
  };

  // Handle back to list view
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedEventId(null);
    // Navigate back to sports list if we're not on the main sports page
    if (initialEventId) {
      navigate("/market/sports", { replace: true });
    }
  };

  // Carousel scroll functions
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      setIsScrolling(true);
      clearTimeout(window.scrollTimeout);

      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 5000);
    }
  };

  const checkSportsScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    setCanScrollSportsLeft(container.scrollLeft > 0);
    setCanScrollSportsRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  // Infinite scroll for sports categories
  useEffect(() => {
    if (!scrollContainerRef.current || sportsSubcategories.length === 0) return;

    const container = scrollContainerRef.current;
    const cardWidth = 224;
    let isAutoScrolling = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling || isAutoScrolling) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemIndex = parseInt(entry.target.getAttribute("data-index"));

            if (itemIndex >= clonedItems.length - 3) {
              const additionalItems = sportsSubcategories.map((item) => ({
                ...item,
                key: `${item.id}-${Math.random()}`,
              }));

              setClonedItems((prev) => [...prev, ...additionalItems]);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Array.from(container.children).forEach((child) => {
      observer.observe(child);
    });

    const startAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }

      const interval = setInterval(() => {
        if (scrollContainerRef.current && !isScrolling) {
          isAutoScrolling = true;
          scrollContainerRef.current.scrollBy({
            left: cardWidth,
            behavior: "smooth",
          });

          setTimeout(() => {
            isAutoScrolling = false;
          }, 500);
        }
      }, 4000);

      setAutoScrollInterval(interval);
    };

    startAutoScroll();

    return () => {
      observer.disconnect();
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
  }, [sportsSubcategories, isScrolling, clonedItems]);

  // User interaction with carousel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleUserInteraction = () => {
      setIsScrolling(true);
      clearTimeout(window.scrollTimeout);

      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 5000);
    };

    container.addEventListener("mousedown", handleUserInteraction);
    container.addEventListener("touchstart", handleUserInteraction);
    container.addEventListener("wheel", handleUserInteraction);

    return () => {
      container.removeEventListener("mousedown", handleUserInteraction);
      container.removeEventListener("touchstart", handleUserInteraction);
      container.removeEventListener("wheel", handleUserInteraction);
      clearTimeout(window.scrollTimeout);
    };
  }, []);

  // Scroll controls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkSportsScroll();
      container.addEventListener("scroll", checkSportsScroll);
      window.addEventListener("resize", checkSportsScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkSportsScroll);
        window.removeEventListener("resize", checkSportsScroll);
      }
    };
  }, []);

  return (
    <div
      className={`sports-page w-full min-h-screen flex justify-center items-start ${isDarkMode ? "bg-[#121212]" : " "}`}
    >
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <main className="container w-full mx-0 px-2 sm:px-4 pt-34 pb-16 sm:pt-34 md:pt-34 max-w-[1350px]">
        {/* Date Filter Section */}
        <div className="mx-4 mb-5 relative">
          <DateFilter
            selectedDates={selectedDates}
            onDateSelect={(dates) => setSelectedDates(dates)}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Sports Categories Section */}
        <div className="mx-4 mb-8 mt-0 overflow-hidden">
          {/* Parent flex container - Responsive gap and overflow handling */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full">
            {/* Left side: Scrollable sports categories */}
            <div className="flex-1 relative min-w-0 overflow-hidden">
              {/* Left scroll button */}
              {!loading &&
                sportsSubcategories.length > 0 &&
                canScrollSportsLeft && (
                  <button
                    onClick={() => scroll("left")}
                    className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      isDarkMode
                        ? "text-white hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                    aria-label="Scroll left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

              {/* Right scroll button */}
              {!loading &&
                sportsSubcategories.length > 0 &&
                canScrollSportsRight && (
                  <button
                    onClick={() => scroll("right")}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      isDarkMode
                        ? "text-white hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                    aria-label="Scroll right"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}

              {/* Left gradient overlay */}
              {!loading &&
                sportsSubcategories.length > 0 &&
                canScrollSportsLeft && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-12 z-[5] pointer-events-none transition-opacity duration-300"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(to right, #121212 0%, rgba(18, 18, 18, 0.8) 50%, transparent 100%)"
                        : "linear-gradient(to right, white 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
                    }}
                  />
                )}

              {/* Right gradient overlay */}
              {!loading &&
                sportsSubcategories.length > 0 &&
                canScrollSportsRight && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-12 z-[5] pointer-events-none transition-opacity duration-300"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(to left, #121212 0%, rgba(18, 18, 18, 0.8) 50%, transparent 100%)"
                        : "linear-gradient(to left, white 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
                    }}
                  />
                )}

              {/* Scrollable container */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-none relative"
                style={{
                  scrollBehavior: "smooth",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="flex gap-3 py-2 whitespace-nowrap min-w-0">
                  {loading ? (
                    // Skeleton loading state
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="flex-shrink-0">
                        <SportCardSkeleton isDarkMode={isDarkMode} />
                      </div>
                    ))
                  ) : sportsSubcategories.length > 0 ? (
                    sportsSubcategories.map((sport, index) => (
                      <div
                        className="flex-shrink-0"
                        key={`${sport.name}-${index}`}
                        data-index={index}
                      >
                        <SportCard
                          props={sport}
                          isSelected={selectedSubcategory === sport.id}
                          onClick={() => handleSubcategorySelect(sport.id)}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <h1
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-lg font-semibold`}
                      >
                        No Sports Available
                      </h1>
                      <p
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-800/50"
                        } text-sm font-normal`}
                      >
                        Check back later for updates!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Games/General toggle - Separate div */}
            <div className="flex-shrink-0">
              {/* Desktop view toggle */}
              <div className="hidden sm:flex">
                <div
                  className={`rounded-[8px] p-[4px] flex items-center h-[43px] cursor-pointer transition-all duration-200 shadow-md ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {/* Games Toggle */}
                  <div
                    onClick={() => setViewMode("sports")}
                    className={`px-3 py-1 rounded-[6px] text-[16px] font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === "sports"
                        ? isDarkMode
                          ? "bg-[#FF532A] text-[#fff]"
                          : "bg-[#FF532A]   text-[#fff]"
                        : isDarkMode
                        ? "text-[#C5C5C5]  "
                        : "text-gray-700  "
                    }`}
                  >
                    Games
                  </div>

                  {/* General Toggle */}
                  <div
                    onClick={() => setViewMode("other")}
                    className={`px-3 py-1 rounded-[6px] text-[16px] font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === "other"
                        ? isDarkMode
                        ? "bg-[#FF532A] text-[#fff]"
                          : "bg-[#FF532A]   text-[#fff]"
                        : isDarkMode
                        ? "text-[#C5C5C5]  "
                        : "text-gray-700 "
                    }`}
                  >
                    General
                  </div>
                </div>
              </div>

              {/* Mobile view dropdown */}
              <div className="sm:hidden">
                <div
                  className={`rounded-[8px] p-[4px] flex items-center h-[36px] cursor-pointer transition-all duration-200 shadow-md min-w-0 ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    onClick={() =>
                      setViewMode(viewMode === "sports" ? "other" : "sports")
                    }
                    className={`px-2 py-1 rounded-[6px] text-[13px] font-medium transition-all duration-200 cursor-pointer flex items-center whitespace-nowrap ${
                      isDarkMode
                        ? "text-[#C5C5C5] hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {viewMode === "sports" ? "Games" : "General"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mx-4">
          {currentView === "game" && selectedEventId ? (
            // Game View - Show SportsGameView component
            <SportsGameView
              eventId={selectedEventId}
              eventData={selectedEventData}
              onBack={handleBackToList}
              isDarkMode={isDarkMode}
              sportsSubcategories={sportsSubcategories}
            />
          ) : viewMode === "sports" ? (
            // Sports View - Show SportsGames component with sidebar
            <SportsGames
              selectedDates={selectedDates}
              selectedSubcategory={selectedSubcategory}
              selectedTodayLeague={selectedTodayLeague}
              selectedUpcomingLeague={selectedUpcomingLeague}
              onTodayLeagueChange={setSelectedTodayLeague}
              onUpcomingLeagueChange={setSelectedUpcomingLeague}
              sportsSubcategories={sportsSubcategories}
              isDarkMode={isDarkMode}
              onEventSelect={handleEventSelect}
            />
          ) : (
            // Other View - Show SportsGeneral component
            <SportsGeneral
              selectedDates={selectedDates}
              selectedSubcategory={selectedSubcategory}
              sportsSubcategories={sportsSubcategories}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Sports;
