import React, { useState, useEffect } from "react";
import RedButton from "../Buttons/RedButton";
import GreenButton from "../Buttons/GreenButton";
import { useNavigate } from "react-router-dom";
import { isDarkColor } from "../../utils/colorExtractor";
import Loader from "../Loader";
import { useSelector } from "react-redux"; // Import useSelector for accessing theme state

const UpcomingMatch = ({ 
  event, 
  onSelect, 
  onExpandClick, 
  onEventSelect, 
  sportsSubcategories,
  selectedMarketId,
  selectedOption,
  isDarkMode
}) => {
  const navigate = useNavigate();
  const [subcategoryName, setSubcategoryName] = useState("SPORTS");
  const [subcategoryImage, setSubcategoryImage] = useState(""); // Add state for subcategory image
  const [team1Colors, setTeam1Colors] = useState({
    primary: "#4ade80",
    secondary: "#ffffff",
  });
  const [team2Colors, setTeam2Colors] = useState({
    primary: "#ef4444",
    secondary: "#ffffff",
  });
  const [colorsLoaded, setColorsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // No longer loading for color extraction
  const [isLive, setIsLive] = useState(false); // State to track if match is live
  const [allowOfficial, setAllowOfficial] = useState(true); // true if true, false if missing or false

  // Format match time to display in d MMM hh:mm a format (e.g. 2 May 10:30 PM)
  const formatMatchTime = (dateString) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} ${month} ${time}`;
  };

  // Card click navigates to event view
  const handleCardClick = (e) => {
    // Check if the click is from a button (betting buttons)
    if (e.target.closest('button')) {
      return; // Let the button handle its own click
    }
    
    // Navigate to event view
    if (onEventSelect && event?._id) {
      onEventSelect(event._id);
    }
  };

  // Get prices based on whether the event has submarkets or not
  // For single market (has_sub_markets = false), we get side_1/side_2 prices from the first market
  // For multi markets (has_sub_markets = true), we get side_1 prices from each market
  const getMarketPrices = () => {
    if (!event?.sub_markets || event.sub_markets.length === 0) {
      return {
        team1Price: null,
        drawPrice: null,
        team2Price: null,
        team1LastTrade: null,
        drawLastTrade: null,
        team2LastTrade: null,
      };
    }

    if (event.has_sub_markets) {
      // Multiple markets: Get side_1 prices from each market
      // Only use bestAsk prices, don't fall back to lastTradedSide1Price
      return {
        team1Price:
          event.sub_markets[0]?.marketPrices?.[event.sub_markets[0]?.side_1]
            ?.bestAsk || null,
        drawPrice:
          event.sub_markets[1]?.marketPrices?.[event.sub_markets[1]?.side_1]
            ?.bestAsk || null,
        team2Price:
          event.sub_markets[2]?.marketPrices?.[event.sub_markets[2]?.side_1]
            ?.bestAsk || null,

        // If you want to include last traded prices, you can add them here
        team1LastTrade: event.sub_markets[0]?.lastTradedSide1Price || null,
        drawLastTrade: event.sub_markets[1]?.lastTradedSide1Price || null,
        team2LastTrade: event.sub_markets[2]?.lastTradedSide1Price || null,
      };
    } else {
      // Single market: Get side_1 price for team1, side_2 price for team2
      // Only use bestAsk prices from dynamic keys
      const marketPrices = event.sub_markets[0]?.marketPrices;
      let side1Price = null;
      let side2Price = null;

      if (marketPrices) {
        // Get dynamic keys for sides
        const priceKeys = Object.keys(marketPrices);
        const side1Key = priceKeys[0]; // First key (e.g., "DAL", "MIN")
        const side2Key = priceKeys[1]; // Second key (e.g., "PHO", "WAS")

        side1Price = marketPrices[side1Key]?.bestAsk || null;
        side2Price = marketPrices[side2Key]?.bestAsk || null;
      }

      return {
        team1Price: side1Price,
        drawPrice: null,
        team2Price: side2Price,
        // If you want to include last traded prices, you can add them here
        team1LastTrade: event.sub_markets[0]?.lastTradedSide1Price || null,
        drawLastTrade: null,
        team2LastTrade:
          100 - event.sub_markets[0]?.lastTradedSide1Price || null,
      };
    }
  };

  // Get the prices
  const {
    team1Price,
    drawPrice,
    team2Price,
    team1LastTrade,
    drawLastTrade,
    team2LastTrade,
  } = getMarketPrices();

  // Use API-provided colors instead of extracting from images
  useEffect(() => {
    if (event?.team1_color && event?.team2_color) {
      setTeam1Colors({
        primary: event.team1_color,
        secondary: "#ffffff",
      });
      setTeam2Colors({
        primary: event.team2_color,
        secondary: "#ffffff",
      });
      setColorsLoaded(true);
      setIsLoading(false);
    } else {
      // Fallback to default colors if API doesn't provide them
      setTeam1Colors({
        primary: "#4ade80",
        secondary: "#ffffff",
      });
      setTeam2Colors({
        primary: "#ef4444",
        secondary: "#ffffff",
      });
      setColorsLoaded(true);
      setIsLoading(false);
    }
  }, [event?.team1_color, event?.team2_color]);

  // Emit event when both colors are loaded
  useEffect(() => {
    if (colorsLoaded && team1Colors && team2Colors) {
      window.dispatchEvent(new CustomEvent('match-colors-loaded', {
        detail: {
          eventId: event._id,
          team1Color: team1Colors.primary,
          team2Color: team2Colors.primary
        }
      }));
    }
  }, [colorsLoaded, team1Colors, team2Colors, event._id]);

  // Helper to get last word of a string
  const getLastWord = (str) => {
    if (!str) return "";
    const words = str.trim().split(" ");
    if (words.length === 0) return "";
    const last = words[words.length - 1];
    if (last.length === 1 && words.length > 1) {
      return words[words.length - 2];
    }
    return last;
  };

  // Get subcategory details from passed sportsSubcategories
  useEffect(() => {
    const getSubcategoryDetails = () => {
      if (event?.sub_category && sportsSubcategories?.length > 0) {
        try {
          // Find matching subcategory from passed data
          const subcategory = sportsSubcategories.find(
            (subcat) => subcat.id === event.sub_category
          );

          if (subcategory) {
            setSubcategoryName(event.league?.name || subcategory.name);
            setSubcategoryImage(event.league?.image || subcategory.image);
            setAllowOfficial(subcategory.allow_official === true);
          } else {
            setAllowOfficial(false);
          }
        } catch (error) {
          setAllowOfficial(false);
          console.error("Error getting subcategory details:", error);
        }
      } else {
        setAllowOfficial(false);
      }
    };
    getSubcategoryDetails();
  }, [event?.sub_category, event?.league, sportsSubcategories]);

  // Check if match is currently live
  useEffect(() => {
    const checkIfLive = () => {
      // Use game_start_date as the primary source for game timing
      const gameStartDate = event?.game_start_date;
      
      if (gameStartDate) {
        const startTime = new Date(gameStartDate);
        const currentTime = new Date();

        // Match is live if:
        // 1. The current time is past the game start time AND
        // 2. The game status indicates an active/in-progress game
        const hasStarted = currentTime >= startTime;
        const gameStatus = event?.game_status?.short || event?.game_status?.long || "";
        
        // Define status categories
        const isNotStarted = gameStatus === "NS" || gameStatus === "Not Started";
        const isInProgress = gameStatus.startsWith("IN") || // IN1, IN2, etc.
                            gameStatus === "INTR"; // Interrupted but still active
        const isFinal = gameStatus === "FT" || gameStatus === "Finished";
        const isPostponed = gameStatus === "POST" || gameStatus === "Postponed";
        const isCancelled = gameStatus === "CANC" || gameStatus === "Cancelled";
        const isAbandoned = gameStatus === "ABD" || gameStatus === "Abandoned";
        
        // Show as LIVE only for actively in-progress games (IN1-IN9, INTR)
        if (hasStarted && isInProgress && gameStatus) {
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      } else {
        setIsLive(false);
      }
    };

    // Check immediately and set up interval to check every 30 seconds
    checkIfLive();
    const intervalId = setInterval(checkIfLive, 30000);

    return () => clearInterval(intervalId);
  }, [event?.game_start_date, event?.match_start_date, event?.game_status]);

  // Helper function to determine which button is selected
  const getSelectedButton = () => {
    if (!selectedMarketId || !selectedOption || !event?.sub_markets) {
      return null;
    }

    // Check if any of this event's markets is selected
    const selectedMarket = event.sub_markets.find(market => market._id === selectedMarketId);
    if (!selectedMarket) {
      return null;
    }

    if (event.has_sub_markets) {
      // Multiple markets: Check which market index is selected
      const marketIndex = event.sub_markets.findIndex(market => market._id === selectedMarketId);
      if (marketIndex === 0) return 'team1';
      if (marketIndex === 1) return 'draw';
      if (marketIndex === 2) return 'team2';
    } else {
      // Single market: Check which side is selected
      if (selectedOption === selectedMarket.side_1) return 'team1';
      if (selectedOption === selectedMarket.side_2) return 'team2';
    }

    return null;
  };

  const selectedButton = getSelectedButton();

  // Handlers for button clicks
  const handleTeam1ButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    // Make sure team colors are loaded before trying to use them
    if (!team1Colors || !team2Colors) {
      console.log("UpcomingMatch - Colors not loaded yet!");
      return;
    }

    console.log(
      "UpcomingMatch - handleTeam1ButtonClick - About to call onSelect with colors:",
      {
        team1Color: team1Colors.primary,
        team2Color: team2Colors.primary,
      }
    );

    if (event?.sub_markets?.[0]?._id) {
      // Get the side_1 value for the first market (team1 side)
      const side1Value = event.sub_markets[0]?.side_1;

      // Very explicitly pass marketId, option, btn1Color, btn2Color to match the expected parameters
      if (onSelect)
        onSelect(
          event.sub_markets[0]._id, // marketId
          side1Value, // option (dynamic side value like "DAL", "MIN")
          team1Colors.primary, // btn1Color
          team2Colors.primary // btn2Color
        );
    }
  };

  const handleDrawButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    if (!team1Colors || !team2Colors) {
      console.log("UpcomingMatch - Colors not loaded yet!");
      return;
    }

    console.log(
      "UpcomingMatch - handleDrawButtonClick - About to call onSelect with colors:",
      {
        team1Color: team1Colors.primary,
        team2Color: team2Colors.primary,
      }
    );

    if (event?.sub_markets?.[1]?._id && event.has_sub_markets) {
      // Get the side_1 value for the second market (draw side)
      const side1Value = event.sub_markets[1]?.side_1;

      if (onSelect)
        onSelect(
          event.sub_markets[1]._id, // marketId
          side1Value, // option (dynamic side value for draw)
          team1Colors.primary, // btn1Color
          team2Colors.primary // btn2Color
        );
    }
  };

  const handleTeam2ButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    if (!team1Colors || !team2Colors) {
      console.log("UpcomingMatch - Colors not loaded yet!");
      return;
    }

    console.log(
      "UpcomingMatch - handleTeam2ButtonClick - About to call onSelect with colors:",
      {
        team1Color: team1Colors.primary,
        team2Color: team2Colors.primary,
      }
    );

    if (event.has_sub_markets) {
      // Get the side_1 value for the third market (team2 side)
      const side1Value = event.sub_markets[2]?.side_1;

      if (onSelect)
        onSelect(
          event.sub_markets[2]._id, // marketId
          side1Value, // option (dynamic side value like "PHO", "WAS")
          team1Colors.primary, // btn1Color
          team2Colors.primary // btn2Color
        );
    } else {
      // Get the side_2 value for the single market (team2 side)
      const side2Value = event.sub_markets[0]?.side_2;

      if (onSelect)
        onSelect(
          event.sub_markets[0]._id, // marketId
          side2Value, // option (dynamic side value like "PHO", "WAS")
          team1Colors.primary, // btn1Color
          team2Colors.primary // btn2Color
        );
    }
  };

  // Handle expand icon click to open game view
  const handleExpandClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    console.log("UpcomingMatch - Expand icon clicked - Navigating to game view");
    
    // Navigate to the sports game view with the event ID
    navigate(`/market/sports/game/${event._id}`);
  };

  // Calculate text color based on background color
  const getTextColor = (bgColor) => {
    return isDarkColor(bgColor) ? "#ffffff" : "#000000";
  };

  // Show loader while colors are being extracted
  if (isLoading) {
    return (
      <div
        className={`w-full h-auto min-h-[320px] ${
          isDarkMode ? "bg-[#1A1B1E]" : "bg-neutral-100"
        } rounded-lg p-4 flex flex-col justify-center items-center`}
      >
        <Loader size="medium" />
        <p
          className={`mt-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          } text-sm`}
        >
          Loading match details...
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .dots-container {
            position: relative;
            overflow: hidden;
          }
          
          .dots-container::after {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            background: linear-gradient(
              135deg,
              transparent 35%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 65%
            );
            opacity: 0;
            animation: verySubtleSweep 6s ease-in-out infinite;
            pointer-events: none;
            border-radius: 4px;
          }
          
          @keyframes verySubtleSweep {
            0%, 100% {
              opacity: 0;
              transform: translateX(-100%) translateY(-100%);
            }
            50% {
              opacity: 0.6;
              transform: translateX(100%) translateY(100%);
            }
          }
        `}
      </style>
      <div
        className={`${
          isDarkMode
            ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4)]"
            : "bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.15)]"
        } w-full rounded-xl p-4 hover:cursor-pointer flex flex-col justify-between transition-all duration-200`}
        onClick={handleCardClick} // Add click handler for card navigation
      >
        <div className="flex justify-between items-center">
          <div
            className="px-2 py-1.5 rounded inline-flex justify-center items-center"
            style={{
              backgroundColor: team1Colors.primary,
            }}
          >
            <p
              className="text-xs sm:text-sm"
              style={{
                color: getTextColor(team1Colors.primary),
              }}
            >
              {formatMatchTime(event?.game_start_date || event?.match_start_date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* LIVE indicator with blinking animation */}
            {isLive && (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="text-red-500 font-semibold text-xs animate-pulse">
                  LIVE
                </div>
                {/* Game Status (like IN7) next to LIVE indicator */}
                {event?.game_status && (event.game_status.short || event.game_status.long) && (
                  <div className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${isDarkMode ? 'bg-zinc-700 text-[#C5C5C5]' : 'bg-gray-200 text-gray-700'}`}>
                    {event.game_status.short || event.game_status.long}
                  </div>
                )}
              </div>
            )}
            <span
              className={`${
                isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-800/50"
              } text-xs sm:text-sm font-medium`}
            >
              ${event?.total_pool_in_usd?.toFixed(2) || "0.00"} Vol.
            </span>
            {subcategoryImage ? (
              <div className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8">
                <img
                  src={subcategoryImage}
                  alt={subcategoryName}
                  className="max-w-full max-h-full object-contain rounded-sm"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <span
                className={`${
                  isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                } text-xs sm:text-sm font-medium`}
              >
                {subcategoryName}
              </span>
            )}
            <div
              onClick={handleExpandClick}
              className={`cursor-pointer p-1 ${
                isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-200"
              } rounded-full transition-colors duration-200`}
            >
              <img
                src="/Expand Vector Icon.svg"
                alt="Expand"
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  isDarkMode ? "filter invert brightness-50 contrast-60" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Container for both team sections and the dots visualization */}
        <div className="flex flex-row mt-8 mb-2">
          {/* Left column with both team sections */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Team 1 section */}
            <div className="flex items-center gap-3">
              {!allowOfficial ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: team1Colors.primary,
                    borderRadius: "8px",
                    boxShadow: `0 0 8px ${team1Colors.primary}`,
                  }}
                >
                  <span
                    style={{
                      color: getTextColor(team1Colors.primary),
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      textTransform: "uppercase",
                      letterSpacing: 0,
                    }}
                  >
                    {event?.team1_short_name}
                  </span>
                </div>
              ) : (
                <img
                  src={event?.team1_image || "https://via.placeholder.com/64"}
                  alt={event?.team1_name}
                  className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg object-contain"
                />
              )}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span
                  className={`text-lg sm:text-xl font-medium ${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
                >
                  {allowOfficial
                    ? event?.team1_name
                    : getLastWord(event?.team1_name)}
                </span>
                <span
                  className={`${
                    isDarkMode ? "text-[#C5C5C5]/70" : "text-zinc-800/70"
                  } text-base font-medium sm:ml-3`}
                >
                  {/* Score would go here if available */}
                </span>
              </div>
            </div>
            {/* Team 2 section */}
            <div className="flex items-center gap-3">
              {!allowOfficial ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: team2Colors.primary,
                    borderRadius: "8px",
                    boxShadow: `0 0 8px ${team2Colors.primary}`,
                  }}
                >
                  <span
                    style={{
                      color: getTextColor(team2Colors.primary),
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      textTransform: "uppercase",
                      letterSpacing: 0,
                    }}
                  >
                    {event?.team2_short_name}
                  </span>
                </div>
              ) : (
                <img
                  src={event?.team2_image || "https://via.placeholder.com/64"}
                  alt={event?.team2_name}
                  className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg object-contain"
                />
              )}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span
                  className={`text-lg sm:text-xl font-medium ${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
                >
                  {allowOfficial
                    ? event?.team2_name
                    : getLastWord(event?.team2_name)}
                </span>
                <span
                  className={`${
                    isDarkMode ? "text-[#C5C5C5]/70" : "text-zinc-800/70"
                  } text-base font-medium sm:ml-3`}
                >
                  {/* Score would go here if available */}
                </span>
              </div>
            </div>
          </div>

          {/* Square dots visualization vertically centered */}
          {team1LastTrade !== null && team2LastTrade !== null && (
            <div className="hidden sm:flex items-center justify-center w-32 mr-1">
              <div className="flex flex-row gap-[2px] h-[70px] w-[70px] dots-container">
                {[...Array(10)].map((_, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-[2px]">
                    {[...Array(10)].map((_, rowIndex) => {
                      // When there are three markets (team1, draw, team2)
                      if (event?.has_sub_markets && drawLastTrade !== null) {
                        // Calculate dots based on percentage
                        const total =
                          team1LastTrade + drawLastTrade + team2LastTrade;
                        const team1Percentage =
                          total > 0 ? (team1LastTrade / total) * 100 : 33.33;
                        const drawPercentage =
                          total > 0 ? (drawLastTrade / total) * 100 : 33.33;
                        const team2Percentage =
                          total > 0 ? (team2LastTrade / total) * 100 : 33.33;

                        // Calculate total dots to fill (out of 100)
                        const totalDots = 100; // 10x10 grid
                        const team1Dots = Math.round(
                          (team1Percentage / 100) * totalDots
                        );
                        const drawDots = Math.round(
                          (drawPercentage / 100) * totalDots
                        );
                        const team2Dots = totalDots - team1Dots - drawDots;

                        // Calculate the current dot position (0-99)
                        const currentDotPosition = rowIndex * 10 + colIndex;

                        // Assign colors based on calculated dot distribution
                        if (currentDotPosition < team1Dots) {
                          return (
                            <div
                              key={rowIndex}
                              className="rounded-full"
                              style={{
                                width: "5px",
                                height: "5px",
                                backgroundColor: team1Colors.primary,
                              }}
                            />
                          );
                        } else if (currentDotPosition < team1Dots + drawDots) {
                          return (
                            <div
                              key={rowIndex}
                              className="rounded-full"
                              style={{
                                width: "5px",
                                height: "5px",
                                backgroundColor: "#6B7280", // Gray color for draw
                              }}
                            />
                          );
                        } else {
                          return (
                            <div
                              key={rowIndex}
                              className="rounded-full"
                              style={{
                                width: "5px",
                                height: "5px",
                                backgroundColor: team2Colors.primary,
                              }}
                            />
                          );
                        }
                      } else {
                        // For two markets (yes/no), calculate based on price percentages
                        const team1Percentage = team1LastTrade || 50; // Default to 50% if no price available
                        const team2Percentage = team2LastTrade || 50; // Default to 50% if no price available
                        const drawPercentage = drawLastTrade || 50; // Default to 50% if no price available
                        const total =
                          team1Percentage + team2Percentage + drawPercentage;

                        // Calculate proportion of dots for team1 (yes) out of total 100 dots
                        const totalDots = 100; // 10x10 grid
                        const team1Dots = Math.round(
                          (team1Percentage / total) * totalDots
                        );

                        // Calculate the current dot position (0-99)
                        const currentDotPosition = rowIndex * 10 + colIndex;

                        // Assign colors based on position in the grid
                        return (
                          <div
                            key={rowIndex}
                            className="rounded-full"
                            style={{
                              width: "5px",
                              height: "5px",
                              backgroundColor:
                                currentDotPosition < team1Dots
                                  ? team1Colors.primary
                                  : team2Colors.primary,
                            }}
                          />
                        );
                      }
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            className={`flex-1 py-2.5 px-4 rounded font-medium transition-all duration-200 hover:brightness-90 active:brightness-85 ${
              ''
            }`}
            style={{
              backgroundColor: team1Colors.primary,
              color: getTextColor(team1Colors.primary),
            }}
            onClick={handleTeam1ButtonClick}
          >
            {`${event?.team1_short_name || ""} ${
              team1Price !== null ? `${team1Price}¢` : ""
            }`}
          </button>

          {event?.has_sub_markets ? (
            <button
              className={`flex-1 py-2.5 px-4 rounded font-medium transition-all duration-200 hover:brightness-90 active:brightness-85 ${
                ''
              }`}
              style={{
                backgroundColor: "#6B7280", // Using a neutral gray color for draw
                color: "#ffffff", // White text for better contrast on gray
              }}
              onClick={handleDrawButtonClick}
            >
              {`DRAW ${drawPrice !== null ? `${drawPrice}¢` : ""}`}
            </button>
          ) : null}

          <button
            className={`flex-1 py-2.5 px-4 rounded font-medium transition-all duration-200 hover:brightness-90 active:brightness-85 ${
              ''
            }`}
            style={{
              backgroundColor: team2Colors.primary,
              color: getTextColor(team2Colors.primary),
            }}
            onClick={handleTeam2ButtonClick}
          >
            {`${event?.team2_short_name || ""} ${
              team2Price !== null ? `${team2Price}¢` : ""
            }`}
          </button>
        </div>
      </div>
    </>
  );
};

export default UpcomingMatch;
