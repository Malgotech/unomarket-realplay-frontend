import React, { useState, useEffect } from "react";
import like from "/like.svg";
import upload from "/upload.svg";
import { Link, useNavigate } from "react-router-dom";
import { fetchData, postData } from "../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector to access theme state

const ThoughtsCard = ({ thoughtData, isNestedReply = false }) => {
  const navigate = useNavigate();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(thoughtData?.likes || 0);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  useEffect(() => {
    // Set initial like count and status
    setLikeCount(thoughtData?.likes || 0);
    setIsLiked(thoughtData?.hasUserLiked || false);
  }, [thoughtData]);

  const fetchReplies = async (id) => {
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

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const payload = {
        content: replyText,
        parentId: thoughtData._id,
      };

      // Add eventId if thought has an event
      if (thoughtData?.event?._id) {
        payload.eventId = thoughtData.event._id;
      }

      const response = await postData("api/user/thoughts", payload);
      if (response.success) {
        setReplyText("");
        setShowReplyInput(false);
        // Refresh replies if they were already loaded
        if (showReplies) {
          fetchReplies(thoughtData._id);
        }
        // Update reply count in parent
        if (thoughtData.onReplyAdded) {
          thoughtData.onReplyAdded();
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await postData(`api/user/thoughts/${thoughtData._id}/like`, {});
      setIsLiked(!isLiked);
      setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
    } catch (error) {
      console.error("Error liking thought:", error);
    }
  };

  const handleCardClick = (e) => {
    // Only navigate if not clicking on reply elements
    if (!e.target.closest(".reply-section")) {
      navigate(`/thought/detail/${thoughtData._id}`);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  const handleReplyClick = (e) => {
    e.stopPropagation();
    setShowReplyInput(true);
  };

  const handleShowReplies = (e) => {
    e.stopPropagation();
    if (!showReplies) {
      fetchReplies(thoughtData._id);
    }
    setShowReplies(!showReplies);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days`;
    }
  };

  // Use optional chaining to safely access nested properties
  const username = thoughtData?.user?.name || "Anonymous";
  const profileImage =
    thoughtData?.user?.profile_image || "https://placehold.co/80x80";
  const content = thoughtData?.content || "";
  const replyCount = thoughtData?.replyCount || 0;

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`p-5 flex gap-2 hover:cursor-pointer transition-colors ${
          isNestedReply ? "ml-12" : ""
        }`}
      >
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex justify-between items-center mt-2">
            <div className="flex justify-center items-center gap-2">
              <img
                className="w-[30px] h-[30px] rounded-xl"
                src={profileImage}
                alt={username}
              />
              <div className="">
                <div className="flex items-center gap-3">
                  <h1
                    className={` text-[15px] sm:text-[17px]  ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                    } text-lg font-semibold`}
                  >
                    {username}
                  </h1>
                  <p
                    className={`text-[12px] sm:text-[14px] ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-800/50"
                    } text-xs font-semibold`}
                  >
                    {thoughtData.createdAt && formatDate(thoughtData.createdAt)}
                  </p>
                </div>
                {thoughtData.event && thoughtData.eventData?.categoryName && (
                  <p className="text-blue-600 text-[13px] sm:text-[15px] font-semibold">
                    {thoughtData.eventData.categoryName}
                  </p>
                )}
              </div>
            </div>

            {/* <i className={`w-4 h-4 ri-bookmark-line ${isDarkMode ? 'text-[#C5C5C5]/50' : ''}`}></i> */}
          </div>

          <p
            className={`my-1 h-auto min-h-[44px] justify-start text-[13px] sm:text-[15px] ${
              isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
            } font-normal`}
          >
            {content}
          </p>

          <div className="flex justify-between">
            <div>
              {thoughtData.event && thoughtData.eventData && (
                <div className="mb-4">
                  <p className="text-teal-600 text-[13px] sm:text-[16px] font-semibold">
                    {thoughtData.eventData.title}
                  </p>
                </div>
              )}
              <div
                className="flex gap-2 mt-2 items-center reply-section"
                onClick={handleActionClick}
              >
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1"
                >
                  <img
                    className="w-4 h-4"
                    src={like}
                    alt="Like"
                    style={{
                      filter: isLiked
                        ? "invert(45%) sepia(85%) saturate(2913%) hue-rotate(197deg) brightness(98%) contrast(108%)"
                        : isDarkMode
                        ? "invert(70%)"
                        : "none",
                    }}
                  />
                  <span
                    className={`${
                      isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                    } text-sm font-semibold ${isLiked ? "text-blue-600" : ""}`}
                  >
                    {likeCount}
                  </span>
                </button>
                <i className="ri-chat-3-line"></i>
                <span
                  className={`${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  } text-sm font-semibold`}
                >
                  {replyCount}
                </span>
                {/* <span
                  className="text-blue-600 text-sm font-semibold cursor-pointer"
                  onClick={handleReplyClick}
                >
                  Replys
                </span> */}
                {/* {thoughtData.replyCount > 0 && (
                  <span
                    className="text-blue-600 text-sm font-semibold cursor-pointer ml-2"
                    onClick={handleShowReplies}
                  >
                    {showReplies ? "Hide Replies" : "Show Replies"}
                  </span>
                )} */}
              </div>
            </div>
            {thoughtData.event && thoughtData.eventData && (
              <div
                className="flex flex-col justify-end items-end"
                onClick={handleActionClick}
              >
                <Link
                  to={`/market/details/${thoughtData.event._id}`}
                  className="h-9 px-4 py-1.5 bg-[#FF4215] text-white rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors"
                >
                  Buy
                </Link>
              </div>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-4 reply-section">
              <div
                className={`w-full px-4 py-3.5 rounded-[5px] outline outline-offset-[-1px] ${
                  isDarkMode
                    ? "outline-zinc-700 bg-zinc-800"
                    : "outline-zinc-300"
                } flex justify-between items-center gap-4`}
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className={`border-none border-transparent outline-0 w-full ${
                    isDarkMode
                      ? "bg-zinc-800 text-[#C5C5C5] placeholder-[#C5C5C5]/50"
                      : "bg-transparent"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setShowReplyInput(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-700"
                    onClick={handleReply}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReplies &&
        replies.map((reply, index) => (
          <React.Fragment key={reply._id}>
            <ThoughtsCard
              thoughtData={{
                ...reply,
                onReplyAdded: () => fetchReplies(thoughtData._id),
              }}
              isNestedReply={true}
            />
            {index < replies.length - 1 && (
              <div
                className={`h-px w-full ml-12 ${
                  isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                } my-2`}
              ></div>
            )}
          </React.Fragment>
        ))}
    </>
  );
};

export default ThoughtsCard;
