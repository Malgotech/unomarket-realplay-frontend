import React, { useEffect, useState } from "react";
// Navbar removed - now handled globally in App.jsx
import ThoughtsCard from "../components/ThoughtsCard";
import Sidebar from "../components/Sidebar";
import TwitterTrend from "../components/TwitterTrend";
import like from "/like.svg";
import { useParams } from "react-router-dom";
import { fetchData, postData } from "../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector for theme

const ThoughtDetail = () => {
  const { id } = useParams();
  const [thought, setThought] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyTextMap, setReplyTextMap] = useState({}); // Map of replyId -> replyText
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [nestedReplies, setNestedReplies] = useState({});
  const [showNestedReplies, setShowNestedReplies] = useState({});
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === 'dark'; // Check if dark mode is active

  const fetchThoughtData = async () => {
    try {
      const response = await fetchData(`api/user/thoughts/${id}`);
      if (response.success) {
        setThought(response.thought);
        if (response.thought.replyCount > 0) {
          fetchReplies();
        }
      }
    } catch (error) {
      console.error("Error fetching thought:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetchData(
        `api/user/thoughts/${id}/replies?page=1&limit=10`
      );
      if (response.success) {
        setReplies(response.replies);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const fetchNestedReplies = async (replyId) => {
    try {
      const response = await fetchData(
        `api/user/thoughts/${replyId}/replies?page=1&limit=10`
      );
      if (response.success) {
        setNestedReplies((prev) => ({
          ...prev,
          [replyId]: response.replies,
        }));
        setShowNestedReplies((prev) => ({
          ...prev,
          [replyId]: true,
        }));
      }
    } catch (error) {
      console.error("Error fetching nested replies:", error);
    }
  };

  const handlePostReply = async (parentId = id) => {
    const replyText = replyTextMap[parentId] || "";
    if (!replyText.trim()) return;

    try {
      const payload = {
        content: replyText,
        parentId: parentId,
      };

      // Add eventId if thought has an event
      if (thought?.event?._id) {
        payload.eventId = thought.event._id;
      }

      const response = await postData("api/user/thoughts", payload);
      if (response.success) {
        // Clear only the specific reply text
        setReplyTextMap((prev) => ({
          ...prev,
          [parentId]: "",
        }));
        setReplyingTo(null);
        if (parentId === id) {
          fetchReplies(); // Refresh main replies
        } else {
          fetchNestedReplies(parentId); // Refresh nested replies
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleReplyTextChange = (parentId, text) => {
    setReplyTextMap((prev) => ({
      ...prev,
      [parentId]: text,
    }));
  };

  const handleCancelReply = (parentId) => {
    setReplyTextMap((prev) => ({
      ...prev,
      [parentId]: "",
    }));
    setReplyingTo(null);
  };

  useEffect(() => {
    fetchThoughtData();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-[#121212] text-[#C5C5C5]' : ''}`}>
        <div className="mt-28">Loading...</div>
      </div>
    );
  }

  const RenderReply = ({ reply, level = 0, isNested = false }) => {
    const hasNestedReplies = reply.replyCount > 0;
    const showingNestedReplies = showNestedReplies[reply._id];
    const nestedReplyList = nestedReplies[reply._id] || [];
    const currentReplyText = replyTextMap[reply._id] || "";

    return (
      <div className={`mt-8 flex gap-8 relative ${isNested ? "ml-12" : ""}`}>
        <div className="relative">
          <img
            className="w-12 h-12 rounded-full object-cover min-w-12"
            src={reply.user?.profile_image || "https://placehold.co/48x48"}
            alt="Reply user avatar"
          />
          {hasNestedReplies && showingNestedReplies && (
            <div
              className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-[1px] ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}
              style={{ height: "calc(100% - 12px)" }}
            />
          )}
        </div>
        {isNested && (
          <div className={`absolute top-6 -left-8 w-8 h-[1px] ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
        )}
        <div className="flex-1">
          <div className="flex gap-4">
            <h2 className={`text-[14px] font-semibold ${isDarkMode ? 'text-[#C5C5C5]' : ''}`}>
              {reply.user?.username}
            </h2>
            <p className="text-zinc-400 text-[12px]">
              {new Date(reply.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className={`text-[14px] mt-1 ${isDarkMode ? 'text-[#C5C5C5]' : ''}`}>{reply.content}</p>
          <div className="flex items-center gap-1 text-lg mt-2">
            <img
              src={like}
              alt=""
              className="w-4 h-4"
            />
            <p className={`font-semibold text-[14px] ${isDarkMode ? 'text-[#C5C5C5]' : ''}`}>{reply.likes}</p>
            <button
              className="ml-1 text-blue-600 font-semibold text-[14px] hover:cursor-pointer"
              onClick={() => setReplyingTo(reply._id)}
            >
              Reply
            </button>
            {hasNestedReplies && !showingNestedReplies && (
              <button
                className="ml-4 text-blue-600 text-sm font-semibold flex items-center"
                onClick={() => fetchNestedReplies(reply._id)}
              >
                <i className="ri-add-circle-line mr-1 text-lg" />
                Show {reply.replyCount}{" "}
                {reply.replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
            {showingNestedReplies && (
              <button
                className="ml-4 text-blue-600 text-sm font-semibold flex items-center"
                onClick={() =>
                  setShowNestedReplies((prev) => ({
                    ...prev,
                    [reply._id]: false,
                  }))
                }
              >
                <i className="ri-arrow-up-s-line mr-1 text-lg" />
                Hide replies
              </button>
            )}
          </div>

          {replyingTo === reply._id && (
            <div className={`mt-4 w-full px-4 py-3.5 rounded-[5px] outline outline-offset-[-1px] ${isDarkMode ? 'outline-zinc-700 bg-zinc-800' : 'outline-zinc-300'} flex justify-between items-center gap-4`}>
              <div className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-[13px] sm:text-base w-full`}>
                <input
                  type="text"
                  value={currentReplyText}
                  onChange={(e) =>
                    handleReplyTextChange(reply._id, e.target.value)
                  }
                  placeholder="Write your reply..."
                  className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? 'bg-zinc-800 text-[#C5C5C5] placeholder-[#C5C5C5]/50' : ''}`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleCancelReply(reply._id)}
                >
                  Cancel
                </button>
                <button
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => handlePostReply(reply._id)}
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {showingNestedReplies &&
            nestedReplyList.map((nestedReply) => (
              <RenderReply
                key={nestedReply._id}
                reply={nestedReply}
                level={level + 1}
                isNested={true}
              />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`thoughts-page w-full min-h-screen ${isDarkMode ? 'bg-[#121212]' : ''}`}>
      <div className="max-w-[1330px] mx-auto relative">
        <div className="flex h-screen">
          {/* Sidebar placeholder to maintain layout with fixed sidebar */}
          <div className="hidden md:block md:w-[250px] shrink-0">
            {/* This is just a placeholder that takes up space */}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <main className="px-4 pt-32 sm:pt-40 md:pt-36 flex gap-5">
              {/* Main content that takes up remaining space */}
              <div className="flex-1">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Center content that takes up remaining space */}
                    <div className="flex-1 min-w-0">
                      {thought && <ThoughtsCard thoughtData={thought} />}

                      {replyingTo === id && (
                        <div className={`w-full mt-4 px-4 py-3.5 rounded-[5px] outline outline-offset-[-1px] ${isDarkMode ? 'outline-zinc-700 bg-zinc-800' : 'outline-zinc-300'} flex justify-between items-center gap-4`}>
                          <div className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-[13px] sm:text-base w-full`}>
                            <input
                              type="text"
                              value={replyTextMap[id] || ""}
                              onChange={(e) =>
                                handleReplyTextChange(id, e.target.value)
                              }
                              placeholder="Write your reply..."
                              className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? 'bg-zinc-800 text-[#C5C5C5] placeholder-[#C5C5C5]/50' : ''}`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleCancelReply(id)}
                            >
                              Cancel
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handlePostReply(id)}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}

                      {!replyingTo && (
                        <button
                          className={`w-full mt-4 px-4 py-3.5 rounded-[5px] outline outline-offset-[-1px] ${isDarkMode ? 'outline-zinc-700 bg-zinc-800/50 text-[#C5C5C5]/70 hover:bg-zinc-800' : 'outline-zinc-300 text-zinc-500 hover:bg-gray-50'} flex justify-between items-center gap-4 text-left`}
                          onClick={() => setReplyingTo(id)}
                        >
                          Add your thoughts...
                        </button>
                      )}

                      {replies.map((reply) => (
                        <RenderReply key={reply._id} reply={reply} />
                      ))}
                    </div>
                    {/* TwitterTrend with increased width */}
                    <div className="w-full lg:w-[360px] shrink-0">
                      <TwitterTrend title="Trend Watch" />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Actual Sidebar component that's position fixed */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default ThoughtDetail;
