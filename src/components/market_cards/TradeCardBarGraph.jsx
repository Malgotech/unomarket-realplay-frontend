import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector for theme
import ActivityChartMiniVisx from "../charts/ActivityChartMiniVisx";

const TradeCardBarGraph = ({ res }) => {
  const navigate = useNavigate();
  const [selectedMarkets, setSelectedMarkets] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const [viewMode, setViewMode] = useState("bar"); // "bar" or "chart"
  const [isLoading, setIsLoading] = useState(true);
  const [barWidths, setBarWidths] = useState({});
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === 'dark'; // Check if dark mode is active
  const [showCopied, setShowCopied] = useState(false);

  // Set initial bookmarked state from res data when component mounts
  useEffect(() => {
    if (res && res.isBookmarked !== undefined) {
      setIsBookmarked(res.isBookmarked);
    }

    // Set initial bar widths to 0 for animation
    if (res && res.sub_markets) {
      const initialWidths = {};
      res.sub_markets.forEach(market => {
        initialWidths[`yes-${market._id}`] = 0;
        initialWidths[`no-${market._id}`] = 0;
      });
      setBarWidths(initialWidths);

      // Simulate loading delay
      setTimeout(() => {
        const finalWidths = {};
        res.sub_markets.forEach(market => {
          finalWidths[`yes-${market._id}`] = market.lastTradedSide1Price || 50;
          finalWidths[`no-${market._id}`] = 100 - (market.lastTradedSide1Price || 50);
        });
        setBarWidths(finalWidths);
        setIsLoading(false);
      }, 300);
    }
  }, [res]);
  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showSuccessToast("URL Copied to clipboard!");
  };
  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // Prevent card click event from triggering
    if (isBookmarkProcessing) return; // Prevent multiple rapid clicks

    try {
      setIsBookmarkProcessing(true);

      // Call the API to toggle bookmark status with the correct payload structure
      const response = await postData("api/user/bookmarks", {
        type: "event",
        content_id: res._id
      });

      if (response.success) {
        setIsBookmarked(!isBookmarked);
      } else {
        console.error("Failed to toggle bookmark:", response.message);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("UnomarketToken");
    if (!token) setIsBookmarked(false);
  }, []);

  // Function to handle mouse movement on the Yes/No button
  const handleMouseMove = (e) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - buttonRect.left;
    const buttonWidth = buttonRect.width;

    // Calculate the percentage position of the mouse within the button
    const mousePosition = (mouseX / buttonWidth) * 100;

    // Apply dynamic gradient based on mouse position
    if (mousePosition < 50) {
      // Hovering on Yes side - make more green
      e.currentTarget.style.background = `linear-gradient(94deg, 
        rgba(41, 140, 140, 1) 0%, 
        rgba(41, 140, 140, 1) 30%, 
        rgba(41, 140, 140, 0.3)  100%`;
      e.currentTarget.querySelector('.yes-text').classList.add('text-white');
      e.currentTarget.querySelector('.no-text').classList.remove('text-white');
      e.currentTarget.querySelector('.no-text').classList.add('text-[#8d1f17]');
    } else {
      // Hovering on No side - make more red
      e.currentTarget.style.background = `linear-gradient(94deg, 
        rgba(141, 31, 23, 0.3) 0%, 
        rgba(141, 31, 23, 1) 70%, 
        rgba(141, 31, 23, 1) 100%`;
      e.currentTarget.querySelector('.yes-text').classList.remove('text-white');
      e.currentTarget.querySelector('.yes-text').classList.add('text-[#0d9488]');
      e.currentTarget.querySelector('.no-text').classList.add('text-white');
    }
  };

  // Reset hover state when mouse leaves
  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = "linear-gradient(94deg, rgba(41, 140, 140, 0.12) -28.76%, rgba(141, 31, 23, 0.18) 129.04%)";
    e.currentTarget.querySelector('.yes-text').classList.remove('text-white');
    e.currentTarget.querySelector('.yes-text').classList.add('text-[#0d9488]');
    e.currentTarget.querySelector('.no-text').classList.remove('text-white');
    e.currentTarget.querySelector('.no-text').classList.add('text-[#8d1f17]');
  };

  // Toggle between bar and chart view with animation
  const toggleViewMode = (mode, e) => {
    e.stopPropagation(); // Prevent the card click event from triggering

    if (viewMode !== mode) {
      // Reset bar widths for animation if switching to bar mode
      if (mode === "bar") {
        setIsLoading(true);
        const initialWidths = {};
        if (res && res.sub_markets) {
          res.sub_markets.forEach(market => {
            initialWidths[`yes-${market._id}`] = 0;
            initialWidths[`no-${market._id}`] = 0;
          });
          setBarWidths(initialWidths);

          // Animate bars after view change
          setTimeout(() => {
            const finalWidths = {};
            res.sub_markets.forEach(market => {
              finalWidths[`yes-${market._id}`] = market.lastTradedSide1Price || 50;
              finalWidths[`no-${market._id}`] = 100 - (market.lastTradedSide1Price || 50);
            });
            setBarWidths(finalWidths);
            setIsLoading(false);
          }, 300);
        }
      }

      setViewMode(mode);
    }
  };

  // Handle selection of Yes/No for a specific market
  const handleSelection = (e, marketId, selection) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    setSelectedMarkets(prev => ({
      ...prev,
      [marketId]: selection
    }));
    const market = res.sub_markets.find(m => m._id === marketId);
    let selectionValue = selection;
    if (market) {
      selectionValue = selection === 'yes' ? market.side_1 : market.side_2;
    }
    navigate(`/market/details/${res._id}?marketId=${marketId}&selection=${selectionValue}`);
  };

  // Handle card click to navigate to detail page with default selection
  const handleCardClick = () => {
    if (res.sub_markets && res.sub_markets.length > 0) {
      const firstMarketId = res.sub_markets[0]._id;
      const firstMarket = res.sub_markets[0];
      let defaultSelection = selectedMarkets[firstMarketId];
      if (!defaultSelection) {
        defaultSelection = firstMarket.side_1;
      } else {
        defaultSelection = defaultSelection === 'yes' ? firstMarket.side_1 : firstMarket.side_2;
      }
      navigate(`/market/details/${res._id}?marketId=${firstMarketId}&selection=${defaultSelection}`);
    } else {
      navigate(`/market/details/${res._id}`);
    }
  };

  // Helper to render volume/age logic
  const renderVolume = () => {
    const pool = res.total_pool_in_usd;
    const startDate = res.sub_markets?.[0]?.start_date || res.createdAt;
    const daysOld = startDate ? Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0;
    if (pool < 10000) {
      if (daysOld < 7) {
        return <img src="/soundbet Vector.svg" alt="Yolft" style={{ display: 'inline', height: 18, verticalAlign: 'middle' }} />;
      } else {
        return <span>$&lt;10K Vol.</span>;
      }
    } else {
      return <span>${pool.toLocaleString()} Vol.</span>;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      /* Unified Card Style Variant D (from QuestionPieChart) */
      className={`w-full rounded-xl p-4 relative hover:cursor-pointer h-[430px] flex flex-col justify-between transition-all duration-300 overflow-hidden
        after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300
        ${isDarkMode
          ? "bg-[#111113] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_10px_-2px_rgba(0,0,0,0.55),0_14px_34px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_6px_14px_-2px_rgba(0,0,0,0.65),0_20px_46px_-8px_rgba(0,0,0,0.75)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.08)_inset,0_0_36px_-10px_rgba(255,255,255,0.10)_inset]"
          : "bg-[rgb(247,247,247)] shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_10px_-2px_rgba(0,0,0,0.10),0_14px_34px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.16),0_6px_16px_-2px_rgba(0,0,0,0.14),0_22px_52px_-10px_rgba(0,0,0,0.18)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.85)_inset,0_0_36px_-12px_rgba(0,0,0,0.06)_inset]"
        }
      `}
    >
      {/* Title and Image */}
      <div className="w-full flex justify-between mb-1 items-center">
        <div className="w-[90%] relative group">
          <h1
            className={`text-[17px] font-semibold hover:underline hover:decoration-[2px] line-clamp-2 ${isDarkMode ? "text-[#C5C5C5]" : "text-black"
              }`}
          >
            {res.event_title || ""}
          </h1>
          <div
            className={`absolute top-0 left-0 w-full z-20 bg-${isDarkMode ? "[#1A1B1E]" : "[#f7f7f7]"
              } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          >
            <h1
              className={`text-[17px] font-semibold hover:underline hover:decoration-[2px] ${isDarkMode ? "text-[#C5C5C5]" : "text-black"
                }`}
            >
              {res.event_title || ""}
            </h1>
          </div>
        </div>
        <img
          src={res.event_image || ""}
          alt="Event"
          className="rounded w-[54px] h-[54px] ml-2 flex-shrink-0"
        />
      </div>

      {/* Markets Selection */}
      {res.sub_markets &&
        res.sub_markets.slice(0, 2).map((market, index) => (
          <div key={market._id} className="mt-3 flex justify-between">
            <div className="w-full ">
              <h2
                className={`text-[16px] transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:font-normal hover:underline ${isDarkMode ? "text-[#C5C5C5]" : "text-black"
                  }`}
              >
                {market.name || ``}
              </h2>
            </div>
            <div className="flex text-xl w-[48%] justify-end items-center">
              {market.lastTradedSide1Price ? (
                <h1
                  className={`mr-2 text-[16px] ${isDarkMode ? "text-[#C5C5C5]" : "text-black"
                    }`}
                >
                  {market.lastTradedSide1Price}%
                </h1>
              ) : null}
              <div
                className={`rounded flex items-center justify-around h-[32px] transition-all duration-200 ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-200"
                  }`}
                style={{
                  background:
                    "linear-gradient(94deg, rgba(41, 140, 140, 0.12) -28.76%, rgba(141, 31, 23, 0.18) 129.04%)",
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <h1
                  className={`yes-text ${selectedMarkets[market._id] === "yes"
                    ? "text-white font-bold"
                    : "text-[#0d9488]"
                    } text-[16px] transition-colors duration-200 hover:cursor-pointer mx-2`}
                  onClick={(e) => handleSelection(e, market._id, "yes")}
                >
                  {market.side_1}
                </h1>
                <span className="text-gray-400 text-xl font-light pb-0.5">
                  /
                </span>
                <h1
                  className={`no-text ${selectedMarkets[market._id] === "no"
                    ? "text-white font-bold"
                    : "text-[#8d1f17]"
                    } text-[16px] transition-colors duration-200 hover:cursor-pointer mx-2`}
                  onClick={(e) => handleSelection(e, market._id, "no")}
                >
                  {market.side_2}
                </h1>
              </div>
            </div>
          </div>
        ))}

      {/* Added spacing between yes/no buttons and graph section */}
      <div className="mt-3">
        {/* View toggle buttons */}
        <div className="w-full flex justify-end mb-3">
          <div
            className={`${isDarkMode ? "bg-gray-700" : "bg-blue-100"
              } rounded flex items-center gap-2 relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 h-full bg-blue-500 transition-transform duration-300 ${viewMode === "bar"
                ? "translate-x-0 w-[40px]"
                : "translate-x-[40px] w-[40px]"
                } rounded`}
            ></div>
            <h1
              onClick={(e) => toggleViewMode("bar", e)}
              className={`py-[4px] text-[10px] w-[35px] text-center rounded hover:cursor-pointer transition-all duration-300 relative z-10 ${viewMode === "bar"
                ? "text-white"
                : isDarkMode
                  ? "text-gray-300"
                  : ""
                }`}
            >
              Bar
            </h1>
            <h1
              onClick={(e) => toggleViewMode("chart", e)}
              className={`py-[4px] text-[10px] w-[35px] text-center rounded hover:cursor-pointer transition-all duration-300 relative z-10 ${viewMode === "chart"
                ? "text-white"
                : isDarkMode
                  ? "text-gray-300"
                  : ""
                }`}
            >
              Chart
            </h1>
          </div>
        </div>

        {/* Graph container with consistent height for both views */}
        <div className="w-full h-[160px] flex justify-center relative overflow-visible">
          {/* Bar chart visualization with animation */}
          <div
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ease-in-out ${viewMode === "bar" ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="w-full h-full flex">
              <div className="flex flex-col justify-between pr-1 mt-3">
                {res.sub_markets &&
                  res.sub_markets.slice(0, 2).map((market) => (
                    <div
                      key={`img-${market._id}`}
                      className="flex items-center mb-9"
                    >
                      <img
                        src={market.market_image || ""}
                        alt=""
                        className="w-12 h-11 rounded-sm object-cover"
                      />
                    </div>
                  ))}
              </div>

              <div
                className={`rounded h-full ${isDarkMode ? "bg-zinc-700" : "bg-zinc-300"
                  } w-1`}
              ></div>

              <div className="pl-1 py-2 flex flex-col justify-between h-full w-full">
                {res.sub_markets &&
                  res.sub_markets.slice(0, 2).map((market) => (
                    <div key={`bar-${market._id}`} className="mb-2">
                      <p
                        className={`text-sm ${isDarkMode ? "text-[#C5C5C5]" : ""
                          }`}
                      >
                        {market.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 mt-0.2 bg-[#0d9488] rounded-r-lg transition-all duration-1000 ease-out"
                          style={{
                            width: `${barWidths[`yes-${market._id}`] || 0}%`,
                          }}
                        ></div>
                        <h1
                          className={`text-xs ${isDarkMode ? "text-[#C5C5C5]" : ""
                            }`}
                        >
                          {market.lastTradedSide1Price || 50}%
                        </h1>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 mt-0.2 bg-[#8d1f17] rounded-r-lg transition-all duration-1000 ease-out"
                          style={{
                            width: `${barWidths[`no-${market._id}`] || 0}%`,
                          }}
                        ></div>
                        <h1
                          className={`text-xs ${isDarkMode ? "text-[#C5C5C5]" : ""
                            }`}
                        >
                          {100 - (market.lastTradedSide1Price || 50)}%
                        </h1>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Chart view with ActivityChartMiniVisx - Added padding-top to prevent clipping */}
          <div
            className={`absolute top-0 left-0 w-full h-full ${isDarkMode ? "bg-[#1A1B1E]" : ""
              } rounded transition-opacity duration-300 ease-in-out ${viewMode === "chart" ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className={`w-full h-full`}>
              <ActivityChartMiniVisx eventData={res} />
            </div>
          </div>
        </div>
      </div>

      {/* Pool size and bookmark - positioned at bottom with flex-1 to push to bottom */}
      <div className="flex justify-between mt-auto pt-4">
        <h1
          className={`text-[14px] ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
            }`}
        >
          {renderVolume()}
        </h1>
        <div className="flex">
          <div
            className={`rounded flex items-center px-1 justify-center transition-all duration-200 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              const firstMarket = res.sub_markets && res.sub_markets[0];
              let selection = selectedMarkets[firstMarket?._id];
              if (!selection && firstMarket) {
                selection = firstMarket.side_1;
              } else if (selection && firstMarket) {
                selection =
                  selection === "yes" ? firstMarket.side_1 : firstMarket.side_2;
              }
              const fullUrl = `${window.location.origin}/market/details/${res._id
                }?selection=${selection || ""}`;
              navigator.clipboard
                .writeText(fullUrl)
                .then(() => {
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 2000);
                })
                .catch((err) => {
                  console.error("Failed to copy URL: ", err);
                });
            }}
          >
            <i className={`ri-share-2-line ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"}`} onClick={handleCopyUrl}></i>
          </div>

          {/* {showCopied && (
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded flex items-center justify-center ${isDarkMode ? 'bg-zinc-800 text-[#C5C5C5]' : 'bg-[#dfe0e0] text-zinc-700'}`}>
              URL copied to clipboard!
            </div>
          )} */}

          <div
            onClick={handleBookmarkToggle}
            className={`rounded flex items-center px-1 justify-around transition-all duration-200 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
              }`}
          >
            {isBookmarked ? (
              <i
                className={`ri-bookmark-fill ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                  }`}
              ></i>
            ) : (
              <i
                className={`ri-bookmark-line ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                  }`}
              ></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeCardBarGraph;