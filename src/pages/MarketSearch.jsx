import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Navbar removed - now handled globally in App.jsx
import Question from "../components/market_cards/Question";
import QuestionPieChart from "../components/market_cards/QuestionPieChart";
import Loader from "../components/Loader";
import { fetchData } from "../services/apiServices";

const MarketSearch = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

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

  // Function to get search query from URL parameters
  const getSearchQuery = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("q") || "";
  };

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    setPage(1);

    const query = getSearchQuery();
    setSearchQuery(query);

    if (!query) {
      setLoading(false);
      setError("No search query provided");
      setEvents([]);
      return;
    }

    try {
      // Make API call with the search query
      const res = await fetchData(
        `api/event/events?search=${encodeURIComponent(query)}&page=1&limit=10`
      );

      if (res.events && Array.isArray(res.events)) {
        setEvents(res.events);
        setHasMore(res.events.length === 10); // If we got 10 items, there might be more
      } else {
        setEvents([]);
        setHasMore(false);
        setError("No events found for your search");
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to load search results. Please try again later.");
      setEvents([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const query = getSearchQuery();

      const res = await fetchData(
        `api/event/events?search=${encodeURIComponent(
          query
        )}&page=${nextPage}&limit=10`
      );

      if (res.events && Array.isArray(res.events)) {
        if (res.events.length > 0) {
          setEvents((prev) => [...prev, ...res.events]);
          setPage(nextPage);
          setHasMore(res.events.length === 10); // If we got fewer than 10 items, we've reached the end
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more search results:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [location.search]); // Re-fetch when the search query in URL changes

  return (
    <div className="market-search-page w-full  min-h-screen">
      <main className="container w-full mx-0 px-4 pt-34 pb-16 sm:pt-40 md:pt-34 max-w-[1350px]">
        <div className="mx-4">
          {/* Search title */}
          <h1 className="text-2xl font-medium mb-4">
            Search Results for "{searchQuery}"
          </h1>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center my-16">
              <Loader size="large" />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-red-500 my-4">{error}</div>
          )}

          {/* Events grid */}
          {!loading && events.length > 0 && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
              {events.map((event, index) => {
                // Add ref to the last element
                const isLastElement = index === events.length - 1;
                return (
                  <div
                    ref={isLastElement ? lastEventElementRef : null}
                    key={event._id}
                  >
                    {event.has_sub_markets && <Question res={event} />}
                    {!event.has_sub_markets && <QuestionPieChart res={event} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center items-center my-4">
              <Loader size="medium" />
            </div>
          )}

          {/* No events found */}
          {!loading && events.length === 0 && !error && (
            <div className="text-center my-16 flex flex-col items-center">
              <i className="ri-search-line text-5xl text-gray-400 mb-3"></i>
              <p className="text-xl text-gray-600">
                No markets found for "{searchQuery}"
              </p>
              <button
                onClick={() => navigate("/market/all")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Browse All Markets
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MarketSearch;
