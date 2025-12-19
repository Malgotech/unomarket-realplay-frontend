import React, { useState, useEffect } from "react";
import { fetchData } from "../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector to access theme state

const TwitterTrend = ({ title, className, isThoughts = false }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  useEffect(() => {
    const fetchTwitterTrends = async () => {
      try {
        setLoading(true);
        const response = await fetchData("api/event/twitter/trends");
        if (response.success) {
          setTrends(response.trends);
          setLastUpdated(new Date(response.lastUpdated));
        } else {
          setError("Failed to fetch trends");
        }
      } catch (err) {
        console.error("Error fetching Twitter trends:", err);
        setError("Error loading trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTwitterTrends();
    // Refresh trends every 15 minutes
    const intervalId = setInterval(fetchTwitterTrends, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleTrendClick = (trend) => {
    // Create search URL for Twitter
    let searchQuery;
    if (trend.name.startsWith("#")) {
      // For hashtags
      searchQuery = encodeURIComponent(trend.name);
    } else {
      // For regular terms
      searchQuery = encodeURIComponent(`"${trend.name}"`);
    }

    const twitterSearchUrl = `https://x.com/search?q=${searchQuery}`;
    window.open(twitterSearchUrl, "_blank");
  };

  const formatPostCount = (description) => {
    if (!description) return "";

    const match = description.match(/(\d+(\.\d+)?)\s*([KM]?)\s*posts/i);
    if (!match) return description;

    return `${match[1]}${match[3]} posts`;
  };

  // Check if component is called from Thoughts page by examining the className prop
  const isFromThoughts = className?.includes("h-full");

  return (
    <div
      className={`block rounded-xl h-full w-[100%] ${
        !isFromThoughts ? "md:max-h-[1280px] xl:max-h-[678px]" : ""
      } transition-all duration-200 ${className || ""} 
      ${
        isDarkMode
          ? ` ${
              isThoughts ? "border-zinc-600 border-1" : "bg-[#1A1B1E]"
            } text-[#C5C5C5] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4)]`
          : ` ${
              isThoughts ? "border-gray-300 border-1" : "bg-[#f7f7f7]"
            } text-black shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.15)]`
      } flex flex-col`}
    >
      {/* Fixed Title Section */}
      {title && (
        <div className="p-4 pb-0 flex-shrink-0">
          <h2
            className={` mb-5 ${
              isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
            } text-2xl font-medium pl-2`}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Scrollable Content Section */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-hide ${
          title ? "p-4 pt-4" : "p-4"
        }`}
      >
        {loading ? (
          <div
            className={`flex justify-center p-6 ${
              isDarkMode ? "text-gray-400" : ""
            }`}
          >
            Loading trends...
          </div>
        ) : error ? (
          <div className="text-red-500 p-6 text-center">{error}</div>
        ) : (
          <>
            {trends.map((trend, index) => (
              <React.Fragment key={trend._id || index}>
                <div
                  className={`px-5 py-3 ${
                    isDarkMode ? "hover:bg-zinc-800" : "hover:bg-blue-50"
                  } cursor-pointer rounded transition-colors duration-200`}
                  onClick={() => handleTrendClick(trend)}
                >
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#4169E1]"
                    }`}
                  >
                    {trend.name}
                  </p>

                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-gray-600"
                    }`}
                  >
                    {formatPostCount(trend.description)}
                    {trend.description ? " · " : ""}
                    {trend.context}
                  </p>
                </div>
                {index < trends.length - 1 && (
                  <hr
                    className={`mx-5 ${
                      isDarkMode ? "border-zinc-800" : "border-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

/* CSS to hide scrollbar but maintain functionality */
const scrollbarHideStyle = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Inject CSS into the document
const styleElement = document.createElement("style");
styleElement.textContent = scrollbarHideStyle;
document.head.appendChild(styleElement);

export default TwitterTrend;
