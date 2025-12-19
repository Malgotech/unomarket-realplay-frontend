import React, { useEffect, useState, useRef, useCallback } from "react";
// Navbar removed - now handled globally in App.jsx
import Question from "../components/market_cards/Question";
import QuestionPieChart from "../components/market_cards/QuestionPieChart";
import SkeletonCard from "../components/SkeletonCard";
import { fetchData } from "../services/apiServices";

const Watchlist = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchBookmarkedEvents = async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const res = await fetchData(`api/user/bookmarks/events?page=1&limit=20`);

      if (res.success && res.events && Array.isArray(res.events)) {
        setBookmarkedEvents(res.events);

        // Check if there are more pages
        if (res.pagination && res.pagination.totalPages) {
          setHasMore(res.pagination.currentPage < res.pagination.totalPages);
        } else {
          setHasMore(false);
        }
      } else {
        setBookmarkedEvents([]);
        setHasMore(false);
        setError("No bookmarked events found");
      }
    } catch (err) {
      console.error("Error fetching bookmarked events:", err);
      setError("Failed to load bookmarked events. Please try again later.");
      setBookmarkedEvents([]);
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

      const res = await fetchData(
        `api/user/bookmarks/events?page=${nextPage}&limit=20`
      );

      if (res.success && res.events && Array.isArray(res.events)) {
        if (res.events.length > 0) {
          setBookmarkedEvents((prev) => [...prev, ...res.events]);
          setPage(nextPage);

          // Check if there are more pages
          if (res.pagination && res.pagination.totalPages) {
            setHasMore(nextPage < res.pagination.totalPages);
          } else {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more bookmarked events:", err);
      setError(
        "Failed to load more bookmarked events. Please try again later."
      );
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedEvents();
  }, []);

  return (
    <div className="watchlist-page w-full min-h-screen">
        <main className="container   mx-auto px-4 pt-20 md:pt-30 pb-24 max-w-[1000px] 2xl:max-w-[1330px] overflow-y-auto scrollbar-hide">

        <div className="mx-4">
          <h1 className="text-[17px] sm:text-[20px] font-medium mb-6 mt-4">
            Your Bookmarks
          </h1>

          {/* Loading state with skeleton cards */}
          {loading && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
              {Array(9)
                .fill()
                .map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-red-500 my-4">{error}</div>
          )}

          {/* Events grid */}
          {!loading && bookmarkedEvents.length > 0 && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
              {bookmarkedEvents.map((event, index) => {
                // Add ref to the last element
                const isLastElement = index === bookmarkedEvents.length - 1;
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
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
              {Array(3)
                .fill()
                .map((_, index) => (
                  <SkeletonCard key={`skeleton-more-${index}`} />
                ))}
            </div>
          )}

          {/* No events found */}
          {!loading && bookmarkedEvents.length === 0 && !error && (
            <div className="text-center my-8 py-8">
              <p className="text-gray-500">
                You haven't bookmarked any markets yet.
              </p>
              <p className="text-gray-500 mt-2">
                Browse markets and click the bookmark icon to add them to your
                Bookmarks.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Watchlist;
