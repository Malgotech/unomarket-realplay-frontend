import React from "react";
import { useSelector } from "react-redux";
import like from "/like.svg";
import { postData } from "../services/apiServices";

const ThoughtItem = ({
  thought,
  isExpanded,
  repliesToShow,
  remainingReplies,
  currentUserId,
  onReplyClick,
  onLoadReplies,
  onToggleExpand,
  replyingTo,
  replyInput,
  onReplyInputChange,
  onPostReply,
  isPostingReply,
  onLikeToggle,
}) => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  // Calculate dynamic height for the vertical line
  const calculateLineHeight = () => {
    if (repliesToShow.length === 0) return "0px";

    // More accurate calculation based on actual reply structure:
    // - Each reply has approximately 80-100px height including margins
    // - Need to account for reply content, user info, and spacing
    // - Add extra height for the show/hide button
    const estimatedReplyHeight = 90; // Base height per reply
    const buttonHeight = (thought.replyCount > 2) ? 40 : 0; // Height for show more/hide button
    const totalHeight = (repliesToShow.length * estimatedReplyHeight) + buttonHeight + 20; // Extra 20px buffer

    return `${totalHeight}px`;
  };

  const handleLike = async (thoughtId) => {
    try {
      await postData(`api/user/thoughts/${thoughtId}/like`, {});
      // Update like status in parent component
      if (onLikeToggle) {
        onLikeToggle(thoughtId);
      }
    } catch (error) {
      console.error("Error liking thought:", error);
    }
  };

  return (
    <div className="mt-6 sm:mt-8">
      {/* Main Comment */}
      <div className="flex gap-3 sm:gap-4 relative">
        {/* Avatar with connecting line */}
        <div className="relative flex-shrink-0">
          <img
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            src={thought.user.profile_image || "https://placehold.co/48x48"}
            alt="User avatar"
          />
          {(thought.replyCount > 0 || repliesToShow.length > 0) && (
            <div
              className={`absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 w-px z-0 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                }`}
              style={{
                height: calculateLineHeight(),
                transition: "height 0.3s ease",
              }}
            />
          )}
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
            <h2 className={`text-[13px] sm:text-[14px] font-semibold ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
              }`}>
              {thought.user.username}
            </h2>
            <p className={`text-[11px] sm:text-[12px] ${isDarkMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
              {new Date(thought.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className={`text-[13px] sm:text-[14px] mt-1 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
            }`}>{thought.content}</p>
          <div className="flex items-center gap-1 text-lg mt-2">
            <button
              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleLike(thought._id)}
            >
              <img
                src={like}
                alt="Like"
                className="w-4 h-4"
                style={{
                  filter: thought.hasUserLiked ? "invert(45%) sepia(85%) saturate(2913%) hue-rotate(197deg) brightness(98%) contrast(108%)" : "none"
                }}
              />
              <span className={`font-semibold text-[13px] sm:text-[14px] ${thought.hasUserLiked ? 'text-blue-600' : ''}`}>
                {thought.likes || 0}
              </span>
            </button>
            <button
              className={`ml-3 text-blue-600 font-semibold text-[13px] sm:text-[14px] transition-colors ${thought.user._id === currentUserId
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:cursor-pointer hover:text-blue-700"
                }`}
              onClick={() => onReplyClick(thought._id, thought.user._id)}
              disabled={thought.user._id === currentUserId}
            >
              Reply
            </button>
          </div>

          {/* Reply Input Box */}
          {replyingTo === thought._id && (
            <div className="mt-4 pl-8 sm:pl-12">
              <div className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-[5px] outline outline-offset-[-1px] ${isDarkMode ? "outline-zinc-700" : "outline-zinc-300"
                } flex justify-between items-center gap-2 sm:gap-4`}>
                <div className={`text-[13px] sm:text-base w-full ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}>
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    className={`border-none border-transparent outline-0 w-full text-[13px] sm:text-base ${isDarkMode ? "bg-transparent text-[#C5C5C5] placeholder-[#C5C5C5]/50" : ""
                      }`}
                    value={replyInput}
                    onChange={(e) => onReplyInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        onPostReply(thought._id);
                      }
                    }}
                  />
                </div>
                <div
                  className={`h-4 justify-start text-[13px] sm:text-base whitespace-nowrap transition-colors ${isPostingReply ? "opacity-50 cursor-not-allowed" : isDarkMode ? "text-[#C5C5C5] hover:text-blue-400 cursor-pointer" : "text-zinc-800 hover:text-blue-600 cursor-pointer"
                    }`}
                  onClick={() => onPostReply(thought._id)}
                >
                  {isPostingReply ? "Posting..." : "Post"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies Section */}
      {repliesToShow.map((reply, replyIndex) => (
        <div key={reply._id} className="mt-6 ml-12 sm:ml-16 relative">
          {/* Horizontal connector line */}
          <div className={`absolute top-5 sm:top-6 -left-3 sm:-left-4 w-3 sm:w-4 h-px z-0 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
            }`} />

          <div className="flex gap-3 sm:gap-4">
            {/* Reply avatar */}
            <div className="relative flex-shrink-0">
              <img
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                src={reply.user.avatar || "https://placehold.co/40x40"}
                alt="Reply user avatar"
              />
              {/* Vertical line for subsequent replies */}
              {replyIndex < repliesToShow.length - 1 && (
                <div
                  className={`absolute top-8 sm:top-10 left-1/2 transform -translate-x-1/2 w-px z-0 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                    }`}
                  style={{ height: "calc(100% + 24px)" }}
                />
              )}
            </div>

            {/* Reply content */}
            <div className="flex-1">
              <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                <h2 className={`text-[13px] sm:text-[14px] font-semibold ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}>
                  {reply.user.username}
                </h2>
                <p className={`text-[11px] sm:text-[12px] ${isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  }`}>
                  {new Date(reply.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className={`text-[13px] sm:text-[14px] mt-1 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                }`}>{reply.content}</p>
              <div className="flex items-center gap-1 text-lg mt-2">
                <button
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleLike(reply._id)}
                >
                  <img
                    src={like}
                    alt="Like"
                    className="w-4 h-4"
                    style={{
                      filter: reply.hasUserLiked ? "invert(45%) sepia(85%) saturate(2913%) hue-rotate(197deg) brightness(98%) contrast(108%)" : "none"
                    }}
                  />
                  <span className={`font-semibold text-[13px] sm:text-[14px] ${reply.hasUserLiked ? 'text-blue-600' : ''}`}>
                    {reply.likes || 0}
                  </span>
                </button>
                <button
                  className="ml-3 text-blue-600 font-semibold text-[13px] sm:text-[14px] hover:cursor-pointer hover:text-blue-700 transition-colors"
                  onClick={() => onLoadReplies(reply._id)}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Show more/hide replies button */}
      {thought.replyCount > 0 && (
        <div className="ml-12 sm:ml-16 mt-4">
          {!isExpanded && remainingReplies > 0 ? (
            <button
              className={`flex items-center text-blue-600 text-[13px] sm:text-sm hover:text-blue-700 transition-colors ${isDarkMode ? "hover:text-blue-400" : ""
                }`}
              onClick={() => onToggleExpand(thought._id, true)}
            >
              <i className="ri-add-circle-line mr-1"></i>
              {remainingReplies} more{" "}
              {remainingReplies === 1 ? "reply" : "replies"}
            </button>
          ) : (
            isExpanded && repliesToShow.length > 2 && (
              <button
                className={`flex items-center text-blue-600 text-[13px] sm:text-sm hover:text-blue-700 transition-colors ${isDarkMode ? "hover:text-blue-400" : ""
                  }`}
                onClick={() => onToggleExpand(thought._id, false)}
              >
                <i className="ri-arrow-up-s-line mr-1"></i>
                Hide replies
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ThoughtItem;
