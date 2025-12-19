import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TwitterTrend from "../components/TwitterTrend";
import ThoughtsCard from "../components/ThoughtsCard";
import ThoughtItem from "../components/ThoughtItem";
import { fetchData, postData } from "../services/apiServices";

const NewThoughtDetail = () => {
  const { id } = useParams();
  const { showSuccessToast, showErrorToast } = useToast();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

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
      const response = await fetchData(`api/user/thoughts/${id}`);

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

        // Don't automatically fetch sub-replies since we're showing them separately below
        // Users can manually expand them using the show/hide buttons
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

      const payload = {
        content: thoughtInput.trim(),
        parentId: thought._id,
      };

      // Add eventId if thought has an event
      if (thought?.event?._id) {
        payload.eventId = thought.event._id;
      }

      const response = await postData("thoughts", payload);

      if (response.success) {
        setThoughtInput("");
        setReplyingTo(null);
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
      showErrorToast("You cannot reply to your own thought");
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
        const isMainThought = thoughts.some(t => t._id === thoughtId);

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
    setExpandedReplies(prev => ({
      ...prev,
      [thoughtId]: expand
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
        <Navbar />
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
      <div
        className={`w-full min-h-screen ${isDarkMode ? "bg-[#121212]" : ""}`}
      >
        <Navbar />
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
    <div className={`w-full overflow-x-hidden min-h-screen ${isDarkMode ? "bg-[#121212]" : ""}`}>
      <Navbar />

      <div className="max-w-[1330px] mx-auto relative">
        <div className="flex">
          {/* Sidebar placeholder */}
          <div className="hidden md:block md:w-[250px] shrink-0"></div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="relative">
              <div className="flex flex-col lg:flex-row relative max-w-full">
                {/* Left column with vertical borders extending to include the title */}
                <div className={`flex-1 min-w-0 relative lg:max-w-[calc(100%-360px)] border-l border-r ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}
                  style={{ minHeight: 'calc(100vh)' }}>
                  <div className="px-0 relative pt-32 sm:pt-40 md:pt-36">
                    {/* Top divider line */}
                    <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'} mb-4`}></div>

                    <div className="mx-6">
                      {/* Back button */}
                      <div className="mb-6">
                        <button
                          onClick={() => navigate("/thoughts")}
                          className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-zinc-800"
                            } transition-colors`}
                        >
                          <i className="ri-arrow-left-line text-lg"></i>
                          Back to Thoughts
                        </button>
                      </div>

                      {/* Main thought */}
                      {thought && <ThoughtsCard thoughtData={thought} />}

                      {/* Reply input section */}
                      {replyingTo === id ? (
                        <div className="relative w-full mt-4 -mx-6">
                          <div className={`h-px w-[calc(100%+3rem)] absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                          <div className={`w-full px-4 py-3.5 outline-0 flex justify-between items-center gap-4`}>
                            <div className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-[13px] sm:text-base w-full ml-2`}>
                              <input
                                type="text"
                                value={thoughtInput}
                                onChange={(e) => setThoughtInput(e.target.value)}
                                placeholder="Write your reply..."
                                className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? 'bg-transparent text-[#C5C5C5] placeholder-[#C5C5C5]/50' : 'bg-transparent'}`}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handlePostThought();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2 mr-6">
                              <button
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setThoughtInput("");
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className={`text-blue-600 hover:text-blue-700 ${isPostingThought ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePostThought}
                                disabled={isPostingThought}
                              >
                                {isPostingThought ? "Posting..." : "Reply"}
                              </button>
                            </div>
                          </div>
                          <div className={`h-px w-[calc(100%+3rem)] absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                        </div>
                      ) : (
                        <div className="relative w-full mt-4 -mx-6">
                          <div className={`h-px w-[calc(100%+3rem)] absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                          <button
                            className={`w-full px-6 py-3.5 outline-0 ${isDarkMode ? 'bg-transparent text-[#C5C5C5]/70 hover:bg-zinc-800/30' : 'bg-transparent text-zinc-500 hover:bg-gray-50/30'} flex justify-between items-center gap-4 text-left`}
                            onClick={() => setReplyingTo(id)}
                          >
                            Add your thoughts...
                          </button>
                          <div className={`h-px w-[calc(100%+3rem)] absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                        </div>
                      )}

                      {/* Replies section */}
                      {thoughts.length === 0 ? (
                        <div
                          className={`flex flex-col items-center justify-center py-12 mt-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"
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
                          const allReplies = thoughtReplies[thoughtItem._id] || [];
                          const repliesToShow = isExpanded ? allReplies : [];
                          const remainingReplies = allReplies.length;

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
                                fetchData(`api/user/thoughts/${replyId}/replies?page=1&limit=10`)
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
                </div>

                {/* Right column: TwitterTrend sidebar */}
                <div className="hidden lg:block lg:w-[360px] lg:shrink-0 relative">
                  <div className="w-full pt-32 sm:pt-40 md:pt-36 px-4">
                    <TwitterTrend title="Trend Watch" />
                  </div>
                </div>
              </div>
            </div>
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
