import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ThoughtsCard from "../ThoughtsCard";
import ThoughtsCardSkeleton from "../ThoughtsCardSkeleton";
import { fetchData } from "../../services/apiServices";

const ThoughtsContent = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const userId = useSelector((state) => state.user.userData?._id);

  const [tab, setTab] = useState("Recommended");
  const [isLoading, setIsLoading] = useState(true);

  const [recommendedFeed, setRecommendedFeed] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);

  // 🔹 Fetch Recommended Feed
  const fetchRecommendedFeed = async () => {
    try {
      const res = await fetchData("api/user/thoughts?filter=Commentary&page=1&limit=10");
      if (res.success) {
        setRecommendedFeed(res.thoughts || []);
      }
    } catch (err) {
      console.error("Recommended feed error:", err);
    }
  };

  // 🔹 Fetch Following Feed
  const fetchFollowingFeed = async () => {
    try {
      const res = await fetchData("api/user/following-feed");
      if (res.success) {
        setFollowingFeed(res.thoughts || []);
      }
    } catch (err) {
      console.error("Following feed error:", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchRecommendedFeed(), fetchFollowingFeed()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  // 🔥 Normalize likes
  const activeFeed = useMemo(() => {
    const feed = tab === "Recommended" ? recommendedFeed : followingFeed;
    return feed.map((thought) => ({
      ...thought,
      hasUserLiked: thought?.likedBy?.includes(userId),
    }));
  }, [tab, recommendedFeed, followingFeed, userId]);

  return (
    <div className="relative">
      <div className="flex flex-col gap-1 lg:flex-row w-full">
        <div
          className={`w-full border-l border-r ${isDarkMode ? "border-zinc-600" : "border-gray-300"
            }`}
          style={{ minHeight: "100vh" }}
        >
          {/* Header */}


          {/* Tabs */}
          <div className="flex gap-3 px-6 mt-4">
            {["Recommended", "Following"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`h-9 px-5 rounded-md text-sm font-semibold transition
                  ${tab === item
                    ? "bg-[#FF532A] text-white"
                    : isDarkMode
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-[#E9E9E9] text-black"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            className={`h-px w-full my-4 ${isDarkMode ? "bg-zinc-600" : "bg-gray-300"
              }`}
          />

          {/* Feed */}
          <div className="mx-6">
            {isLoading ? (
              Array(5)
                .fill()
                .map((_, index) => (
                  <React.Fragment key={index}>
                    <ThoughtsCardSkeleton />
                    {index < 4 && (
                      <div
                        className={`h-px w-[calc(100%+3rem)] -ml-6 my-2 ${isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                          }`}
                      />
                    )}
                  </React.Fragment>
                ))
            ) : activeFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <i
                  className={`ri-chat-3-line text-5xl mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                />
                <h3
                  className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {tab === "Recommended"
                    ? "No recommended thoughts yet"
                    : "No posts from followed users"}
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {tab === "Recommended"
                    ? "Check back later for new content."
                    : "Follow users to see their thoughts here."}
                </p>
              </div>
            ) : (
              activeFeed.map((thought, index) => (
                <React.Fragment key={thought._id}>
                  <ThoughtsCard thoughtData={thought} />
                  {index < activeFeed.length - 1 && (
                    <div
                      className={`h-px w-[calc(100%+3rem)] -ml-6 my-2 ${isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                        }`}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtsContent;
