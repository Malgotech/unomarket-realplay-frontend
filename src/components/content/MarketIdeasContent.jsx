import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ThoughtsCard from "../ThoughtsCard";
import ThoughtsCardSkeleton from "../ThoughtsCardSkeleton";
import ThoughtsComposerSkeleton from "../ThoughtsComposerSkeleton";
import { postData } from '../../services/apiServices';
import { fetchData } from "../../services/apiServices";

const MarketIdeasContent = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
              const isLogin = useSelector((state) => state.user.isLogin);
  
  const [thoughts, setThoughts] = useState([]);
  // inline composer state
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // fetch logged-in user profile from API
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const resp = await fetchData('api/event/user');
        if (resp.success && resp.user) setCurrentUser(resp.user);
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      const response = await fetchData("api/user/thoughts?filter=market_ideas&page=1&limit=10");
      if (response.success) {
        setThoughts(response.thoughts);
      }
    } catch (error) {
      console.error("Error fetching market ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleComposerFocus = (e) => {
    if (!isLogin) {
      window.dispatchEvent(new Event("open-login-dialog"));
      e.target.blur(); // Remove focus to prevent typing
    }
  };

  const userData = currentUser || JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="relative">
      <div className="relative">
        <div className="flex flex-col lg:flex-row relative max-w-full">
          {/* Left column with vertical borders extending to include the title */}
          <div
            className={`flex-1 min-w-0 relative  w-full  border-l border-r ${
              isDarkMode ? "border-zinc-600" : "border-gray-300"
            }`}
            style={{ minHeight: "100vh" }}
          >
            {/* Page title inside the vertical borders */}
            <h1
              className={`${
                isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
              } text-[17px] sm:text-[20px] font-medium mb-8 px-6 relative pt-0 sm:pt-0 md:pt-0`}
            >
              Market Ideas
            </h1>
            {/* Content wrapper with padding */}
            <div className="px-0 relative">
              {/* Top divider line */}
              <div
                className={`h-px w-full ${
                  isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                } mb-4`}
              ></div>

              {/* Inline post composer with transparent background */}
              {isLoading ? (
                <ThoughtsComposerSkeleton />
              ) : (
                <div className={`mb-5 p-4 mx-6`}>
                  {/* User avatar and name */}
                  <div className="flex items-center gap-3 mb-3">
                    {userData.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt={userData.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-400" />
                    )}
                    <span
                      className={`text-[15px] sm:text-[17px] ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } font-medium`}
                    >
                      {userData.username || userData.name || "User"}
                    </span>
                  </div>
                  <textarea
                    placeholder="Share your market ideas?"
                    value={content}
                    onFocus={handleComposerFocus}
                    onChange={(e) => {
                      setContent(e.target.value);
                      // Auto-resize logic
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    rows={1}
                    style={{ overflow: "hidden" }}
                    className={`w-full min-h-[40px] max-h-[200px] p-2 text-[13px] sm:text-[16px] rounded-lg resize-none focus:outline-none ${
                      isDarkMode
                        ? "bg-transparent text-white"
                        : "bg-transparent text-gray-900"
                    } border border-transparent focus:border-transparent`}
                  />
                  {error && (
                    <div className="text-red-500 text-sm mt-1">{error}</div>
                  )}
                  <div className="mt-1 flex justify-end">
                    <button
                      onClick={async () => {
                        setError("");
                        if (!content.trim()) {
                          setError("Cannot post empty market idea");
                          return;
                        }
                        try {
                          await postData("api/user/thoughts", {
                            content: content.trim(),
                            is_market_idea: true,
                          });
                          setContent("");
                          fetchThoughts();
                        } catch (err) {
                          console.error(err);
                          setError("Failed to post.");
                        }
                      }}
                      disabled={!content.trim()}
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        content.trim()
                          ? "bg-[#4169e1] hover:bg-[#4F46E5]" // platform primary color
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom divider line */}
              <div
                className={`h-px w-full ${
                  isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                } mb-4`}
              ></div>

              {/* Market Ideas list */}
              <div className="mx-6">
                {isLoading ? (
                  <div className="thoughts-container">
                    {Array(5)
                      .fill()
                      .map((_, index) => (
                        <React.Fragment key={`skeleton-${index}`}>
                          <ThoughtsCardSkeleton />
                          {index < 4 && (
                            <div
                              className={`h-px w-[calc(100%+3rem)] -ml-6 ${
                                isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                              } my-2`}
                            ></div>
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                ) : thoughts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <i
                      className={`ri-lightbulb-line text-5xl mb-4 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    ></i>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      No Market Ideas Yet
                    </h3>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Be the first to share your market insights!
                    </p>
                  </div>
                ) : (
                  <div className="thoughts-container">
                    {thoughts.map((thought, index) => (
                      <React.Fragment key={thought._id}>
                        <ThoughtsCard thoughtData={thought} />
                        {index < thoughts.length - 1 && (
                          <div
                            className={`h-px w-[calc(100%+3rem)] -ml-6 ${
                              isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                            } my-2`}
                          ></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Hidden on mobile, keeps layout structure */}
          {/* <div className="hidden lg:block lg:w-[360px] lg:shrink-0 relative">
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MarketIdeasContent;
