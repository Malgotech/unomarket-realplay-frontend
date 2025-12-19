import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Question from "../components/market_cards/Question";
import QuestionPieChart from "../components/market_cards/QuestionPieChart";
import Loader from "../components/Loader";
import SkeletonCard from "../components/SkeletonCard";
import { fetchData } from "../services/apiServices";
import { useSelector } from "react-redux";

const Search = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Get theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // Ref for the observer
  const observer = useRef();
  // Ref for the last element
  const lastEventElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreEvents();
          }
        },
        { threshold: 0.5 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Auto-focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchSearchResults = async (
    query,
    pageNum = 1,
    resetResults = true
  ) => {
    if (!query.trim()) {
      setEvents([]);
      setShowResults(false);
      setHasMore(false);
      return;
    }

    if (resetResults) {
      setLoading(true);
      setError(null);
      setPage(1);
      setEvents([]);
    } else {
      setLoadingMore(true);
    }

    try {
      // Make API call with the search query
      const res = await fetchData(
        `api/event/events?search=${encodeURIComponent(
          query.trim()
        )}&page=${pageNum}&limit=10`
      );

      if (res.events && Array.isArray(res.events)) {
        if (resetResults) {
          setEvents(res.events);
        } else {
          setEvents((prev) => [...prev, ...res.events]);
        }
        setHasMore(res.events.length === 10); // If we got 10 items, there might be more
        setShowResults(true);

        if (res.events.length === 0 && resetResults) {
          setError("No markets found for your search");
        }
      } else {
        if (resetResults) {
          setEvents([]);
          setError("No markets found for your search");
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      if (resetResults) {
        setError("Failed to load search results. Please try again later.");
        setEvents([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMore || !hasMore || !searchQuery.trim()) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchSearchResults(searchQuery, nextPage, false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery);
      } else {
        setEvents([]);
        setShowResults(false);
        setError(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div
      className={`search-page w-full min-h-screen ${
        isDarkMode ? "bg-[#121212]" : "bg-white"
      }`}
    >
      {/* Search Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${
          isDarkMode ? "bg-[#1A1B1E]" : "bg-white"
        } shadow-sm border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center px-4 py-3">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className={`mr-3 w-10 h-10 flex items-center justify-center rounded-full ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            <i
              className={`ri-arrow-left-line text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            ></i>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <div
              className={`flex items-center ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              } rounded-full px-4 py-2`}
            >
              <i
                className={`ri-search-line text-lg ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } mr-3`}
              ></i>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`flex-1 bg-transparent outline-none ${
                  isDarkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-900 placeholder-gray-500"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`ml-2 p-1 rounded-full ${
                    isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  } transition-colors`}
                >
                  <i
                    className={`ri-close-line text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  ></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="pt-20 pb-24 px-4">
        <div className="container w-full mx-0 max-w-[1350px]">
          <div className="mx-4">
            {/* Initial state - no search query */}
            {!searchQuery.trim() && !showResults && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <i
                  className={`ri-search-line text-6xl ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  } mb-4`}
                ></i>
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Search Markets
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Start typing to find markets you're interested in
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && searchQuery.trim() && (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                {Array(6)
                  .fill()
                  .map((_, index) => (
                    <SkeletonCard key={`skeleton-${index}`} />
                  ))}
              </div>
            )}

            {/* Search Results */}
            {showResults && events.length > 0 && !loading && (
              <>
                <div
                  className={`mb-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <h2 className="text-lg font-medium">
                    {events.length} result{events.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </h2>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map((event, index) => {
                    // Add ref to the last element
                    const isLastElement = index === events.length - 1;
                    return (
                      <div
                        ref={isLastElement ? lastEventElementRef : null}
                        key={event._id}
                        className="transition-all duration-300 ease-in-out"
                      >
                        {event.has_sub_markets && <Question res={event} />}
                        {!event.has_sub_markets && (
                          <QuestionPieChart res={event} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                {Array(3)
                  .fill()
                  .map((_, index) => (
                    <SkeletonCard key={`skeleton-more-${index}`} />
                  ))}
              </div>
            )}

            {/* No results found */}
            {error && showResults && !loading && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <i
                  className={`ri-search-line text-5xl ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  } mb-4`}
                ></i>
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  No Markets Found
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  } mb-4`}
                >
                  No markets found for "{searchQuery}"
                </p>
                <button
                  onClick={() => navigate("/market/all")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Markets
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
