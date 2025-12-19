import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ThoughtsCard from "../ThoughtsCard";
import ThoughtDetailSkeleton from "../ThoughtDetailSkeleton";
import like from "/like.svg";
import { fetchData, postData } from "../../services/apiServices";

const ThoughtDetailContent = () => {
  const { id } = useParams();
  const [thought, setThought] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyTextMap, setReplyTextMap] = useState({}); // Map of replyId -> replyText
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [nestedReplies, setNestedReplies] = useState({});
  const [showNestedReplies, setShowNestedReplies] = useState({});
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

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
    return <ThoughtDetailSkeleton />;
  }

  const RenderReply = ({ reply, level = 0, isNested = false }) => {
    const hasNestedReplies = reply.replyCount > 0;
    const showingNestedReplies = showNestedReplies[reply._id];
    const nestedReplyList = nestedReplies[reply._id] || [];
    const currentReplyText = replyTextMap[reply._id] || "";

    return (
      <div className={`mt-8 flex gap-8 relative ${isNested ? "" : ""}`}>
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
            <div className="relative w-full mt-4">
              <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
              <div className={`w-full px-4 py-3.5 outline-0 flex justify-between items-center gap-4`}>
                <div className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-[13px] sm:text-base w-full`}>
                  <input
                    key={`reply-input-${reply._id}`}
                    type="text"
                    value={currentReplyText}
                    onChange={(e) =>
                      handleReplyTextChange(reply._id, e.target.value)
                    }
                    placeholder="Write your reply..."
                    className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? 'bg-transparent text-[#C5C5C5] placeholder-[#C5C5C5]/50' : 'bg-transparent'}`}
                    autoFocus
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
              <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
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
    <div className="relative">
      <div className="relative">
        <div className="flex flex-col lg:flex-row relative max-w-full">
          {/* Left column with vertical borders extending to include the title */}
          <div className={`flex-1 min-w-0 relative lg:max-w-[calc(100%-360px)] border-l border-r ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}
            style={{ minHeight: 'calc(100vh)' }}>
            <div className="px-0 relative pt-32 sm:pt-40 md:pt-36">
              {/* Top divider line */}
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'} mb-4`}></div>

              <div className="mx-6">
                {thought && <ThoughtsCard thoughtData={thought} />}

                {/* // main card reply */}

                {replyingTo === id && (
                  <div className="relative w-full mt-4">
                    <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                    <div className={`w-full  py-3.5 outline-0 flex justify-between items-center gap-4`}>
                      <div className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-[13px] sm:text-base w-full`}>
                        <input
                          key={`main-reply-input-${id}`}
                          type="text"
                          value={replyTextMap[id] || ""}
                          onChange={(e) =>
                            handleReplyTextChange(id, e.target.value)
                          }
                          placeholder="Write your reply..."
                          className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? 'bg-transparent text-[#C5C5C5] placeholder-[#C5C5C5]/50' : 'bg-transparent'}`}
                          autoFocus
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
                    <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                  </div>
                )}

                {!replyingTo && (
                  <div className="relative w-full mt-4">
                    <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                    <button
                      className={`w-full px-6 py-3.5 outline-0 ${isDarkMode ? 'bg-transparent text-[#C5C5C5]/70 hover:bg-zinc-800/30' : 'bg-transparent text-zinc-500 hover:bg-gray-50/30'} flex justify-between items-center gap-4 text-left`}
                      onClick={() => setReplyingTo(id)}
                    >
                      Add your thoughts...
                    </button>
                    <div className={`h-px w-[calc(100%+3rem)] -ml-6 absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                  </div>
                )}

                {replies.map((reply) => (
                  <RenderReply key={reply._id} reply={reply} />
                ))}
              </div>

            </div>
          </div>

          {/* Right column: Hidden on mobile, keeps layout structure */}
          <div className="hidden lg:block lg:w-[360px] lg:shrink-0 relative">
            {/* Empty placeholder div to maintain layout */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtDetailContent;