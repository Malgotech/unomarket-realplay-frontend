import React, { useState, useEffect } from "react";
import { fetchData } from "../../services/apiServices";
import SkeletonCard from "../SkeletonCard";
import Question from "../market_cards/Question";
import QuestionPieChart from "../market_cards/QuestionPieChart";

const SportsGeneral = ({
  selectedDates,
  selectedSubcategory,
  sportsSubcategories,
  isDarkMode,
}) => {
  const [sportsEvents, setSportsEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch sports events using the same API pattern as MarketHome
  const fetchSportsEvents = async (page = 1, reset = false) => {
    try {
      if (page === 1 || reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Build API URL similar to MarketHome.jsx
      let apiUrl = `api/event/events?filter=sports&page=${page}&limit=20`;

      // Add subcategory filter if selected
      if (selectedSubcategory && sportsSubcategories.length > 0) {
        const selectedSubcat = sportsSubcategories.find(
          (s) => s.id === selectedSubcategory
        );
        if (selectedSubcat) {
          apiUrl += `&subcategories=${selectedSubcat.id}`;
        }
      }

      const data = await fetchData(apiUrl);

      if (data.events && Array.isArray(data.events)) {
        const events = data.events;

        if (page === 1 || reset) {
          setSportsEvents(events);
        } else {
          setSportsEvents((prev) => [...prev, ...events]);
        }

        setHasMoreEvents(events.length >= 20);
        setCurrentPage(page);
      } else {
        setSportsEvents([]);
        setHasMoreEvents(false);
      }
    } catch (error) {
      console.error("Error fetching sports events:", error);
      setSportsEvents([]);
      setHasMoreEvents(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter events based on selected filters
  useEffect(() => {
    let filtered = [...sportsEvents];

    // Note: Subcategory filtering is now handled at API level in fetchSportsEvents
    // This client-side filter is kept as backup for edge cases
    if (selectedSubcategory && sportsSubcategories.length > 0) {
      const selectedSubcat = sportsSubcategories.find(
        (s) => s.id === selectedSubcategory
      );
      if (selectedSubcat) {
        filtered = filtered.filter(
          (event) =>
            event.subcategory_name === selectedSubcat.name ||
            event.sub_category === selectedSubcat.id ||
            event.category === selectedSubcat.name
        );
      }
    }

    // Filter by selected dates - check multiple date fields
    if (selectedDates.length > 0) {
      filtered = filtered.filter((event) => {
        // Check various date fields that might exist
        const eventDate = event.match_start_date ||
          event.list_date ||
          event.sub_markets?.[0]?.start_date ||
          event.createdAt;

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

    setFilteredEvents(filtered);
  }, [sportsEvents, selectedSubcategory, selectedDates, sportsSubcategories]);

  // Load more events
  const loadMoreEvents = () => {
    if (!loadingMore && hasMoreEvents) {
      fetchSportsEvents(currentPage + 1);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSportsEvents(1, true);
  }, []);

  // Reload when filters change
  useEffect(() => {
    fetchSportsEvents(1, true);
  }, [selectedSubcategory]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 15 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'
            }`}>
            <svg
              className={`w-8 h-8 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}
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
          <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'
            }`}>
            No Sports Events Found
          </h3>

          {/* Description */}
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
            {selectedSubcategory || selectedDates.length > 0
              ? "Try adjusting your filters to see more events"
              : "Check back later for new sports events"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event, index) => (
          <div key={`${event._id}-${index}`}>
            {event.has_sub_markets && <Question res={event} />}
            {!event.has_sub_markets && <QuestionPieChart res={event} />}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreEvents && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreEvents}
            disabled={loadingMore}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              } ${loadingMore ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
              }`}
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More Events"
            )}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={`loading-skeleton-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SportsGeneral;
