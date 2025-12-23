import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ThoughtsCard from "./ThoughtsCard";

const Following = ({ followingfeed = [] }) => {
    const theme = useSelector((state) => state.theme.value);
    const isDarkMode = theme === "dark";
    const userId = useSelector((state) => state.user.userData?._id);

    const [content, setContent] = useState("");
    const [isLoading] = useState(false);

    const normalizedFeed = useMemo(() => {
        return (followingfeed || []).map((thought) => ({
            ...thought,
            hasUserLiked: thought?.likedBy?.includes(userId),
        }));
    }, [followingfeed, userId]);

    return (
        <div className="relative">
            <div className="flex flex-col gap-1 lg:flex-row max-w-full">
                <div
                    className={`w-full border-l border-r ${isDarkMode ? "border-zinc-600" : "border-gray-300"
                        }`}
                    style={{ minHeight: "calc(100vh - 100px)" }}
                >
                    <h1
                        className={`text-[17px] sm:text-[20px] font-medium mb-8 px-6 pt-10 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                            }`}
                    >
                        Commentary
                    </h1>

                    <div className="px-0">
                        <div
                            className={`h-px w-full ${isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                                } mb-4`}
                        />

                        <div className="mb-5 p-4 mx-6">
                            <textarea
                                placeholder="Share your commentary?"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                rows={1}
                                className={`w-full min-h-[40px] max-h-[200px] p-2 rounded-lg resize-none focus:outline-none text-[13px] sm:text-[15px]
                  ${isDarkMode
                                        ? "bg-transparent text-white placeholder-gray-400"
                                        : "bg-transparent text-gray-900"
                                    }`}
                            />

                            <div className="mt-2 flex justify-end">
                                <button
                                    disabled={!content.trim()}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${content.trim()
                                        ? "bg-[#FF4215]"
                                        : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Post
                                </button>
                            </div>
                        </div>

                        <div
                            className={`h-px w-full ${isDarkMode ? "bg-zinc-600" : "bg-gray-300"
                                } mb-4`}
                        />

                        {/* Feed */}
                        <div className="mx-6">
                            {isLoading ? (
                                <div className="text-center py-10 text-gray-500">
                                    Loading feed...
                                </div>
                            ) : normalizedFeed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                    <i
                                        className={`ri-message-3-line text-5xl mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                            }`}
                                    />
                                    <h3
                                        className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                            }`}
                                    >
                                        No posts from followed users
                                    </h3>
                                    <p
                                        className={`${isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}
                                    >
                                        Follow users to see their thoughts here.
                                    </p>
                                </div>
                            ) : (
                                normalizedFeed.map((thought, index) => (
                                    <React.Fragment key={thought._id}>
                                        <ThoughtsCard thoughtData={thought} />
                                        {index < normalizedFeed.length - 1 && (
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
        </div>
    );
};

export default Following;
