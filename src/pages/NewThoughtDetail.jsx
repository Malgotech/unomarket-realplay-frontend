import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// Navbar removed - now handled globally in App.jsx
import Sidebar from "../components/Sidebar";
import TwitterTrend from "../components/TwitterTrend";
import ThoughtsCard from "../components/ThoughtsCard";
import ThoughtItem from "../components/ThoughtItem";
import { fetchData, postData } from "../services/apiServices";

const NewThoughtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const { showSuccessToast, showErrorToast } = useToast();
  // Main thought state
  const [thought, setThought] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thoughts and replies state (like Market.jsx)
  const [thoughts, setThoughts] = useState([]);
  const [thoughtReplies, setThoughtReplies] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [thoughtInput, setThoughtInput] = useState("");
  const [isPostingThought, setIsPostingThought] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchThoughtDetail();

    // Get current user info
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      setCurrentUserId(user.id);
    }
  }, [id]);

  const fetchThoughtDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchData(`thoughts/${id}`);

      if (response.success) {
        setThought(response.thought);

        // Fetch replies as thoughts for this specific thought
        await fetchThoughtReplies(response.thought._id);
      } else {
        setError("Failed to load thought");
      }
    } catch (error) {
      console.error("Error fetching thought:", error);
      setError("Failed to load thought");
    } finally {
      setLoading(false);
    }
  };

  const fetchThoughtReplies = async (thoughtId) => {
    try {
      const repliesRes = await fetchData(
        `api/user/thoughts/${thoughtId}/replies?page=1&limit=10`
      );

      if (repliesRes.success) {
        setThoughts(repliesRes.replies);

        // If there are replies with sub-replies, fetch their replies too
        const repliesWithSubReplies = repliesRes.replies.filter(
          (reply) => reply.replyCount > 0
        );

        await Promise.all(
          repliesWithSubReplies.map(async (reply) => {
            try {
              const subRepliesRes = await fetchData(
                `api/user/thoughts/${reply._id}/replies?page=1&limit=10`
              );
              if (subRepliesRes.success) {
                setThoughtReplies((prev) => ({
                  ...prev,
                  [reply._id]: subRepliesRes.replies,
                }));
              }
            } catch (subReplyErr) {
              console.error(
                `Error fetching sub-replies for reply ${reply._id}:`,
                subReplyErr
              );
            }
          })
        );
      }
    } catch (error) {
      console.error("Error fetching thought replies:", error);
    }
  };

  const handlePostThought = async () => {
    if (!thoughtInput.trim()) {
      alert("Please enter a reply before posting");
      return;
    }

    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      alert("Please login to post a reply");
      return;
    }

    try {
      setIsPostingThought(true);
      const response = await postData("api/user/thoughts", {
        content: thoughtInput.trim(),
        parentId: thought._id,
      });

      if (response.success) {
        setThoughtInput("");
        await fetchThoughtReplies(thought._id);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsPostingThought(false);
    }
  };

  const handleReplyClick = (thoughtId, userId) => {
    if (userId === currentUserId) {
      showErrorToast("You cannot reply to your own thought.");
      // alert("You cannot reply to your own thought");
      return;
    }

    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      alert("Please login to reply");
      return;
    }

    setReplyingTo(thoughtId);
    setReplyInput("");
  };

  const handlePostReply = async (thoughtId) => {
    if (!replyInput.trim()) {
      alert("Please enter a reply before posting");
      return;
    }

    try {
      setIsPostingReply(true);
      const response = await postData("api/user/thoughts", {
        content: replyInput.trim(),
        parentId: thoughtId,
      });

      if (response.success) {
        setReplyInput("");
        setReplyingTo(null);

        // Check if this is a reply to a main thought or a sub-reply
        const isMainThought = thoughts.some((t) => t._id === thoughtId);

        if (isMainThought) {
          // Refresh sub-replies for this thought
          const subRepliesRes = await fetchData(
            `api/user/thoughts/${thoughtId}/replies?page=1&limit=10`
          );
          if (subRepliesRes.success) {
            setThoughtReplies((prev) => ({
              ...prev,
              [thoughtId]: subRepliesRes.replies,
            }));
          }
        } else {
          // This is a reply to the main thought, refresh all replies
          await fetchThoughtReplies(thought._id);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleToggleExpand = (thoughtId, expand) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [thoughtId]: expand,
    }));
  };

  const handleLikeToggle = async (thoughtId) => {
    try {
      await postData(`api/user/thoughts/${thoughtId}/like`, {});
      // Refresh the main thought if it's being liked
      if (thoughtId === thought._id) {
        await fetchThoughtDetail();
      } else {
        // Refresh the specific thought's data in replies
        await fetchThoughtReplies(thought._id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
    return (
      <div
        className={`w-full min-h-screen ${isDarkMode ? "bg-[#121212]" : ""}`}
      >
        <div className="max-w-[1330px] mx-auto relative">
          <div className="flex">
            <div className="hidden md:block md:w-[250px] shrink-0"></div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <main className="px-4 pt-32 sm:pt-40 md:pt-36">
                <div
                  className={`text-center py-8 ${
                    isDarkMode ? "text-[#C5C5C5]" : ""
                  }`}
                >
                  Loading thought...
                </div>
              </main>
            </div>
          </div>
          <div className="hidden md:block">
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full min-h-screen ${isDarkMode ? "bg-[#121212]" : ""}`}>
        <div className="max-w-[1330px] mx-auto relative">
          <div className="flex">
            <div className="hidden md:block md:w-[250px] shrink-0"></div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <main className="px-4 pt-32 sm:pt-40 md:pt-36">
                <div
                  className={`text-center py-8 ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {error}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => navigate("/thoughts")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Back to Thoughts
                  </button>
                </div>
              </main>
            </div>
          </div>
          <div className="hidden md:block">
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-x-hidden min-h-screen ${
        isDarkMode ? "bg-[#121212]" : ""
      }`}
    >
      <div className="max-w-[1330px] mx-auto relative">
        <div className="flex">
          {/* Sidebar placeholder */}
          <div className="hidden md:block md:w-[250px] shrink-0"></div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <main className="container w-full mx-0 px-4 pt-32 sm:pt-40 md:pt-36 pb-24 max-w-[1330px]">
              {/* Responsive grid layout - full width on mobile/tablet, split on desktop */}
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3 sm:gap-4 md:gap-5">
                {/* Main content area - takes full width when TwitterTrend is hidden */}
                <div className="min-w-0 w-full">
                  {/* Back button */}
                  <div className="mb-6">
                    <button
                      onClick={() => navigate("/thoughts")}
                      className={`flex items-center gap-2 cursor-pointer ${
                        isDarkMode
                          ? "text-[#C5C5C5] hover:text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      } transition-colors`}
                    >
                      <i className="ri-arrow-left-line text-lg"></i>
                      Back to Thoughts
                    </button>
                  </div>

                  {/* Main thought */}
                  <div className="mb-8">
                    {thought && <ThoughtsCard thoughtData={thought} />}
                  </div>

                  {/* Reply input section (like Market.jsx) */}
                  <div className="mb-8">
                    <div
                      className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-[5px] outline outline-offset-[-1px] ${
                        isDarkMode ? "outline-[#C5C5C5]/30" : "outline-zinc-300"
                      } flex justify-between items-center gap-2 sm:gap-4`}
                    >
                      <div
                        className={`${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-base w-full`}
                      >
                        <input
                          type="text"
                          placeholder="Add your reply..."
                          className={`border-none border-transparent outline-0 w-full text-[14px] sm:text-base ${
                            isDarkMode
                              ? "text-[#C5C5C5] bg-transparent placeholder-[#C5C5C5]/50"
                              : "text-zinc-800 placeholder-zinc-500"
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
                        className={`h-4 justify-start mb-3 ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                        } text-[14px] sm:text-base hover:cursor-pointer whitespace-nowrap ${
                          isPostingThought
                            ? "opacity-50 cursor-not-allowed"
                            : isDarkMode
                            ? "hover:text-blue-400 cursor-pointer"
                            : "hover:text-blue-600 cursor-pointer"
                        }`}
                        onClick={handlePostThought}
                      >
                        {isPostingThought ? "Posting..." : "Post"}
                      </div>
                    </div>
                  </div>

                  {/* Replies section */}
                  <div>
                    {thoughts.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center py-12 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <i className="ri-chat-3-line text-4xl sm:text-5xl mb-4"></i>
                        <p className="text-base sm:text-lg text-center px-4">
                          No replies yet. Be the first to reply!
                        </p>
                      </div>
                    ) : (
                      thoughts.map((thoughtItem) => {
                        const isExpanded = expandedReplies[thoughtItem._id];
                        const allReplies =
                          thoughtReplies[thoughtItem._id] || [];
                        const repliesToShow = isExpanded
                          ? allReplies
                          : allReplies.slice(0, 2);
                        const remainingReplies = Math.max(
                          0,
                          allReplies.length - 2
                        );

                        return (
                          <ThoughtItem
                            key={thoughtItem._id}
                            thought={thoughtItem}
                            isExpanded={isExpanded}
                            repliesToShow={repliesToShow}
                            remainingReplies={remainingReplies}
                            currentUserId={currentUserId}
                            onReplyClick={handleReplyClick}
                            onLoadReplies={(replyId) => {
                              // Fetch replies for this specific thought
                              fetchData(
                                `api/user/thoughts/${replyId}/replies?page=1&limit=10`
                              )
                                .then((res) => {
                                  if (res.success) {
                                    setThoughtReplies((prev) => ({
                                      ...prev,
                                      [replyId]: res.replies,
                                    }));
                                  }
                                })
                                .catch((err) => {
                                  console.error("Error fetching replies:", err);
                                });
                            }}
                            onToggleExpand={handleToggleExpand}
                            replyingTo={replyingTo}
                            replyInput={replyInput}
                            onReplyInputChange={setReplyInput}
                            onPostReply={handlePostReply}
                            isPostingReply={isPostingReply}
                            onLikeToggle={handleLikeToggle}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                {/* TwitterTrend - only visible on xl screens when we have 2-column layout */}
                <div className="hidden xl:block w-full h-full rounded-xl flex-shrink-0 flex-grow-0">
                  <TwitterTrend title="Trend Watch" />
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Fixed sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default NewThoughtDetail;
