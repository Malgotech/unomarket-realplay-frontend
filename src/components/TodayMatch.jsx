import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isDarkColor } from "../utils/colorExtractor";
import Loader from "./Loader";
import { useSelector } from "react-redux"; // Import useSelector for accessing theme state

const TodayMatch = ({ event, onSelect, onExpandClick, sportsSubcategories }) => {
  const navigate = useNavigate();
  const [subcategoryName, setSubcategoryName] = useState("SPORTS");
  const [subcategoryImage, setSubcategoryImage] = useState(""); // Add state for subcategory image
  const [team1Colors, setTeam1Colors] = useState({
    primary: "#d4162c",
    secondary: "#ffffff",
  });
  const [team2Colors, setTeam2Colors] = useState({
    primary: "#ffdb58",
    secondary: "#ffffff",
  });
  const [colorsLoaded, setColorsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // No longer loading for color extraction
  const [gameMode, setGameMode] = useState(false); // State to track game mode
  const [isLive, setIsLive] = useState(false); // State to track if match is live
  const [allowOfficial, setAllowOfficial] = useState(true); // true if true, false if missing or false
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === 'dark'; // Check if dark mode is active

  // Format match time to display in 12-hour format (e.g. 10:30 PM)
  const formatMatchTime = (dateString) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format match date and time to display in 'd MMM yyyy, hh:mm a' format (e.g. 16 Jul 2025, 10:30 AM)
  const formatMatchDateTime = (dateString) => {
    if (!dateString) return "--/--/---- --:--";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return `${day} ${month}, ${time}`;
  };

  // Get prices based on whether the event has submarkets or not
  // For single market (has_sub_markets = false), we get side_1/side_2 prices from the first market
  // For multi markets (has_sub_markets = true), we get side_1 prices from each market
  const getMarketPrices = () => {
    if (!event?.sub_markets || event.sub_markets.length === 0) {
      return { team1Price: null, drawPrice: null, team2Price: null, extraPrice: null };
    }

    if (event.has_sub_markets) {
      // Check if we have 4 submarkets (special case)
      if (event.sub_markets.length >= 4) {
        return {
          team1Price: event.sub_markets[0]?.marketPrices?.[event.sub_markets[0]?.side_1]?.bestAsk || null,
          drawPrice: event.sub_markets[1]?.marketPrices?.[event.sub_markets[1]?.side_1]?.bestAsk || null,
          team2Price: event.sub_markets[2]?.marketPrices?.[event.sub_markets[2]?.side_1]?.bestAsk || null,
          extraPrice: event.sub_markets[3]?.marketPrices?.[event.sub_markets[3]?.side_1]?.bestAsk || null
        };
      } else {
        // Standard 3 submarkets case
        return {
          team1Price: event.sub_markets[0]?.marketPrices?.[event.sub_markets[0]?.side_1]?.bestAsk || null,
          drawPrice: event.sub_markets[1]?.marketPrices?.[event.sub_markets[1]?.side_1]?.bestAsk || null,
          team2Price: event.sub_markets[2]?.marketPrices?.[event.sub_markets[2]?.side_1]?.bestAsk || null,
          extraPrice: null,

          // For 3 markets, we don't have an extra price
          team1LastTrade: event.sub_markets[0]?.lastTradedSide1Price || null,
          drawLastTrade: event.sub_markets[1]?.lastTradedSide1Price || null,
          team2LastTrade: event.sub_markets[2]?.lastTradedSide1Price || null
        };
      }
    } else {
      // Single market: Get side_1 price for team1, side_2 price for team2
      // Only use bestAsk prices, don't fall back to lastTradedSide1Price
      const side1Price = event.sub_markets[0]?.marketPrices?.[event.sub_markets[0]?.side_1]?.bestAsk;
      const side2Price = event.sub_markets[0]?.marketPrices?.[event.sub_markets[0]?.side_2]?.bestAsk;
      
      return {
        team1Price: side1Price || null,
        drawPrice: null,
        team2Price: side2Price || null,
        extraPrice: null,
        // For single market, we don't have draw or extra prices
        team1LastTrade: event.sub_markets[0]?.lastTradedSide1Price || null,
        drawLastTrade: null, // No draw market in single market
        team2LastTrade: 100 - event.sub_markets[0]?.lastTradedSide1Price || null
      };
    }
  };

  // Get the prices
  const { team1Price, drawPrice, team2Price, extraPrice, team1LastTrade, drawLastTrade, team2LastTrade } = getMarketPrices();

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
        primary: "#d4162c",
        secondary: "#ffffff",
      });
      setTeam2Colors({
        primary: "#ffdb58",
        secondary: "#ffffff",
      });
      setColorsLoaded(true);
      setIsLoading(false);
    }
  }, [event?.team1_color, event?.team2_color]);

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

  // Helper to get last word of a string
  const getLastWord = (str) => {
    if (!str) return '';
    const words = str.trim().split(' ');
    return words[words.length - 1];
  };

  // Helper function to check if this is a baseball event
  const isBaseballEvent = () => {
    // Check multiple indicators for baseball:
    // 1. Subcategory name contains baseball/MLB
    // 2. Event has scores data (baseball-specific)
    // 3. League name contains MLB
    return subcategoryName?.toLowerCase().includes('baseball') || 
           subcategoryName?.toLowerCase().includes('mlb') ||
           event?.league?.name?.toLowerCase().includes('mlb') ||
           (event?.scores && (event.scores.home || event.scores.away)); // If scores data exists with home/away structure
  };

  // Helper function to format baseball scores
  const getBaseballScores = () => {
    if (!event?.scores) return null;
    
    // Only show scores if the game has actually started (not "Not Started")
    const gameStatus = event?.game_status?.short || event?.game_status?.long || "";
    const isNotStarted = gameStatus === "NS" || gameStatus === "Not Started";
    
    // Don't show scores if game hasn't started - only show for active games
    // Show scores for: IN1, IN2, IN3, IN4, IN5, IN6, IN7, IN8, IN9, POST, CANC, INTR, ABD, FT
    // Don't show scores for: NS (Not Started)
    if (isNotStarted) {
      return null;
    }
    
    const homeScore = event.scores.home?.total || 0;
    const awayScore = event.scores.away?.total || 0;
    
    // In baseball format "Team @ Team", the first team is away, second is home
    // From event title "San Francisco Giants @ Toronto Blue Jays":
    // - San Francisco Giants (team2) is away
    // - Toronto Blue Jays (team1) is home
    // But we need to check the side_1 and side_2 to determine the correct mapping
    
    const side1 = event.sub_markets?.[0]?.side_1; // TOR
    const side2 = event.sub_markets?.[0]?.side_2; // SF
    
    // Map scores correctly based on home/away designation
    // In the API, team1 = Toronto (TOR) = home, team2 = San Francisco (SF) = away
    return {
      team1Score: homeScore,  // team1 (TOR) is home team
      team2Score: awayScore,  // team2 (SF) is away team  
      gameStatus: gameStatus
    };
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
            setSubcategoryName(subcategory.name);
            setSubcategoryImage(subcategory.image);
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
  }, [event?.sub_category, sportsSubcategories]);

  // Card click does nothing now
  const handleCardClick = (e) => {
    // No action on card click
    e.preventDefault();
    return;
  };

  // New handlers for button clicks with very explicit parameter order
  const handleTeam1ButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    // Make sure team colors are loaded before trying to use them
    if (!team1Colors || !team2Colors) {
      return;
    }


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
    if (event?.sub_markets?.[1]?._id && event.has_sub_markets) {
      // Get the side_1 value for the second market (draw side)
      const side1Value = event.sub_markets[1]?.side_1;
      
      if (onSelect)
        onSelect(
          event.sub_markets[1]._id,
          side1Value, // option (dynamic side value for draw)
          team1Colors.primary,
          team2Colors.primary
        );
    }
  };

  const handleTeam2ButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click event
 
    if (event.has_sub_markets) {
      // Get the side_1 value for the third market (team2 side)
      const side1Value = event.sub_markets[2]?.side_1;
      
      if (onSelect)
        onSelect(
          event.sub_markets[2]._id,
          side1Value, // option (dynamic side value like "PHO", "WAS")
          team1Colors.primary,
          team2Colors.primary
        );
    } else {
      // Get the side_2 value for the single market (team2 side)
      const side2Value = event.sub_markets[0]?.side_2;
      
      if (onSelect)
        onSelect(
          event.sub_markets[0]._id,
          side2Value, // option (dynamic side value like "PHO", "WAS")
          team1Colors.primary,
          team2Colors.primary
        );
    }
  };

  // Handle expand icon click to open game view in parent component
  const handleExpandClick = (e) => {
    e.stopPropagation(); // Prevent card click event

    // If onExpandClick prop is provided, call it with the event and colors
    if (onExpandClick) {
    
      onExpandClick(event, team1Colors.primary, team2Colors.primary);
    } else {
      // Fallback to original behavior if no parent handler provided
      setGameMode(!gameMode);
    }
  };

  // Calculate text color based on background color
  const getTextColor = (bgColor) => {
    return isDarkColor(bgColor) ? "#ffffff" : "#000000";
  };

  // Show loader while colors are being extracted
  if (isLoading) {
    return (
      <div className={`${isDarkMode ? 'bg-[#1A1B1E]' : 'bg-[#f7f7f7]'} rounded-[25px] p-5 flex flex-col justify-center items-center min-h-[300px] ${
        isDarkMode 
          ? 'shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]' 
          : 'shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]'
      }`}>
        <Loader size="medium" />
        <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Loading match details...</p>
      </div>
    );
  }

  return (
    <div
      className={`${isDarkMode ? 'bg-[#1A1B1E]' : 'bg-[#f7f7f7]'} rounded-xl p-3 sm:p-5 flex flex-col relative cursor-default transition-all duration-200 ${
        isDarkMode 
          ? 'shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4)]' 
          : 'shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.15)]'
      }`}
      onClick={handleCardClick}
    >
      {/* Lightning bolt SVG with responsive opacity */}
      {/* <svg
        width="182"
        height="253"
        viewBox="0 0 182 283"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        // Apply team name color for bolt
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-30 sm:opacity-50 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}
      >
        <g opacity="0.5" filter="url(#filter0_f_1661_754)">
          <path
            d="M78.0292 177.003H12.1074L104.398 -7.57813V97.8967H170.32L78.0292 282.478L78.0292 177.003Z"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_1661_754"
            x="0.711449"
            y="-18.9741"
            width="181.004"
            height="312.849"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="5.69799"
              result="effect1_foregroundBlur_1661_754"
            />
          </filter>
        </defs>
      </svg> */}

      {/* Top section */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {subcategoryImage ? (
            <img
              src={subcategoryImage}
              alt={subcategoryName}
              className="w-6 h-6 sm:w-10 sm:h-10 object-contain rounded-lg"
            />
          ) : (
            <div className={`w-auto justify-start ${isDarkMode ? 'text-[#C5C5C5]' : 'text-[#2b2d2e]'} text-sm sm:text-xl font-medium`}>
              {subcategoryName}
            </div>
          )}
          {/* LIVE indicator with responsive sizing */}
          {isLive && (
            <div className="flex items-center space-x-1">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="text-red-500 font-semibold text-xs sm:text-sm animate-pulse">
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
        </div>
        <div className="flex items-center">
          <div className="w-auto justify-start text-[#4169e1] text-xs sm:text-base font-semibold mr-2">
            {formatMatchDateTime(event?.game_start_date || event?.match_start_date)}
          </div>
          <div
            onClick={handleExpandClick}
            className={`cursor-pointer p-1 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'} rounded-full transition-colors duration-200`}
          >
            <img
              src="/Expand Vector Icon.svg"
              alt="Expand"
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'filter invert brightness-50 contrast-60' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Main content section with responsive spacing */}
      <div className="flex justify-between items-center mt-4 sm:mt-8 flex-1 px-2 sm:px-8 z-10">
        {/* Left column - Team 1 */}
        <div className="flex flex-col items-center w-[40%] relative">
          {/* Team1 color square with short name if not official */}
          {!allowOfficial ? (
            <div
              className="flex items-center justify-center"
              style={{
                width: '70px',
                height: '70px',
                backgroundColor: team1Colors.primary,
                borderRadius: '12px',
                boxShadow: `0 0 8px ${team1Colors.primary}`,
              }}
            >
              <span
                style={{
                  color: getTextColor(team1Colors.primary),
                  fontWeight: 700,
                  fontSize: '2rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {event?.team1_short_name}
              </span>
            </div>
          ) : (
            <>
              {/* Blurred team1 logo background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-30">
                <img
                  src={event?.team1_image || "https://via.placeholder.com/90"}
                  alt=""
                  className="w-[90px] h-[90px] sm:w-[150px] sm:h-[150px] object-contain filter blur-[10px]"
                />
              </div>
              {/* Main team1 logo */}
              <img
                src={event?.team1_image || "https://via.placeholder.com/90"}
                alt={event?.team1_name}
                className="w-[45px] h-[45px] sm:w-[70px] sm:h-[70px] object-contain z-10 relative"
              />
            </>
          )}
          <div className="mt-2">
            <div
              className={`w-auto justify-start text-sm sm:text-[18px] font-medium ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-center`}
            >
              {allowOfficial ? event?.team1_name : getLastWord(event?.team1_name)}
            </div>
          </div>
        </div>

        {/* Center column - Statistics - Show only when relevant prices are available */}
        {team1LastTrade !== null && team2LastTrade !== null && (
          <div className="flex flex-col items-center mx-2 sm:mx-10 relative">
            {/* Probability display with vertically centered percentages */}
            <div className="flex items-center justify-center relative h-[30px] sm:h-[44px]">
              {/* Left percentage - Absolutely positioned to center vertically */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-[#2b2d2e]'} text-xs sm:text-base font-semibold mr-1 mt-2`}>
                {team1LastTrade}%
              </div>
              
              {/* Probability circles - 10x20 grid where each circle represents 0.5% - Positioned higher */}
              <div className="flex flex-col gap-[2px] w-[150px] sm:w-[150px] h-[30px] sm:h-[44px] mx-8 sm:mx-10 mt-[-8px] sm:mt-[-10px]">
                {[...Array(10)].map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-[2px] w-full justify-center">
                    {[...Array(20)].map((_, colIndex) => {
                      // Calculate position from left to right (across all rows)
                      // Each position represents 0.5% of the total
                      const totalPosition = colIndex * 10 + rowIndex; // This makes it go left to right
                      const dotPercentage = totalPosition * 0.5; // Convert position to percentage (0-99.5%)
                      
                      // When there are four markets (team1, draw, team2, extra)
                      if (event?.has_sub_markets && event.sub_markets.length >= 4) {
                        // Special case: 4 submarkets, but display only top 3 colors
                        // Calculate total probability for normalization
                        const totalProb = (team1LastTrade || 0) + (drawLastTrade || 0) + (team2LastTrade || 0);
                        // Calculate normalized boundaries (percentages out of 100)
                        const team1NormBoundary = totalProb > 0 ? (team1LastTrade || 0) * 100 / totalProb : 33.33;
                        const drawNormBoundary = totalProb > 0 ? team1NormBoundary + ((drawLastTrade || 0) * 100 / totalProb) : 66.66;

                        // Determine color based on which section this dot falls into (0-100%)
                        if (dotPercentage < team1NormBoundary) {
                          // Team 1 section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: team1Colors.primary,
                                boxShadow: '0 0 6px ' + team1Colors.primary,
                              }}
                            />
                          );
                        } else if (dotPercentage < drawNormBoundary) {
                          // Draw section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: '#6B7280',
                                boxShadow: '0 0 6px #6B7280',
                              }}
                            />
                          );
                        } else {
                          // Team 2 section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: team2Colors.primary,
                                boxShadow: '0 0 6px ' + team2Colors.primary,
                              }}
                            />
                          );
                        }
                      } else if (event?.has_sub_markets && drawPrice !== null) {
                        // For three markets (team1, draw, team2)
                        // Calculate total probability for normalization
                        const totalProb = (team1LastTrade || 0) + (drawLastTrade || 0) + (team2LastTrade || 0);
                        // Calculate normalized boundaries (percentages out of 100)
                        const team1NormBoundary = totalProb > 0 ? (team1LastTrade || 0) * 100 / totalProb : 33.33;
                        const drawNormBoundary = totalProb > 0 ? team1NormBoundary + ((drawLastTrade || 0) * 100 / totalProb) : 66.66;

                        // Determine color based on which section this dot falls into (0-100%)
                        if (dotPercentage < team1NormBoundary) {
                          // Team 1 section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: team1Colors.primary,
                                boxShadow: '0 0 6px ' + team1Colors.primary,
                              }}
                            />
                          );
                        } else if (dotPercentage < drawNormBoundary) {
                          // Draw section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: '#6B7280',
                                boxShadow: '0 0 6px #6B7280',
                              }}
                            />
                          );
                        } else {
                          // Team 2 section
                          return (
                            <div
                              key={colIndex}
                              className="rounded-full animate-pulse"
                              style={{
                                width: '5px',
                                height: '5px',
                                backgroundColor: team2Colors.primary,
                                boxShadow: '0 0 6px ' + team2Colors.primary,
                              }}
                            />
                          );
                        }
                      } else {
                        // For two markets (binary market)
                        return (
                          <div
                            key={colIndex}
                            className="rounded-full animate-pulse"
                            style={{
                              width: '5px',
                              height: '5px',
                              backgroundColor: dotPercentage < (team1LastTrade || 50)
                                ? team1Colors.primary
                                : team2Colors.primary,
                              boxShadow: '0 0 6px ' + (dotPercentage < (team1LastTrade || 50)
                                ? team1Colors.primary
                                : team2Colors.primary),
                            }}
                          />
                        );
                      }
                    })}
                  </div>
                ))}
              </div>
              
              {/* Right percentage - Absolutely positioned to center vertically */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-[#2b2d2e]'} text-xs sm:text-base font-semibold ml-1 mt-2`}>
                {team2LastTrade}%
              </div>
            </div>
            {/* Increased margin for volume display to prevent overlap */}
            <div className="mt-4 sm:mt-6">
              <div className={`w-auto justify-start ${isDarkMode ? 'text-[#C5C5C5]/50' : 'text-[#2b2d2e]/50'} text-xs sm:text-base font-medium`}>
                Vol ${event?.total_pool_in_usd?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        )}

        {/* Right column - Team 2 */}
        <div className="flex flex-col items-center w-[40%] relative">
          {/* Team2 color square with short name if not official */}
          {!allowOfficial ? (
            <div
              className="flex items-center justify-center"
              style={{
                width: '70px',
                height: '70px',
                backgroundColor: team2Colors.primary,
                borderRadius: '12px',
                boxShadow: `0 0 8px ${team2Colors.primary}`,
              }}
            >
              <span
                style={{
                  color: getTextColor(team2Colors.primary),
                  fontWeight: 700,
                  fontSize: '2rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {event?.team2_short_name}
              </span>
            </div>
          ) : (
            <>
              {/* Blurred team2 logo background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-30">
                <img
                  src={event?.team2_image || "https://via.placeholder.com/90"}
                  alt=""
                  className="w-[90px] h-[90px] sm:w-[150px] sm:h-[150px] object-contain filter blur-[10px]"
                />
              </div>
              {/* Main team2 logo */}
              <img
                src={event?.team2_image || "https://via.placeholder.com/90"}
                alt={event?.team2_name}
                className="w-[45px] h-[45px] sm:w-[70px] sm:h-[70px] object-contain z-10 relative"
              />
            </>
          )}
          <div className="mt-2">
            <div
              className={`w-auto justify-start text-sm sm:text-[18px] font-medium ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-center`}
            >
              {allowOfficial ? event?.team2_name : getLastWord(event?.team2_name)}
            </div>
          </div>
        </div>
      </div>

      {/* Baseball Scores Section - Only show for baseball events */}
      {isBaseballEvent() && (() => {
        const scores = getBaseballScores();
        return scores ? (
          <div className="flex justify-center items-center mt-4 mb-3 z-10">
            <div className="flex items-center space-x-3">
              {/* Team 1 Score */}
              <div className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
                {scores.team1Score}
              </div>
              
              {/* Dash separator */}
              <div className={`text-xl sm:text-2xl font-medium ${isDarkMode ? 'text-[#C5C5C5]/60' : 'text-zinc-600'}`}>
                -
              </div>
              
              {/* Team 2 Score */}
              <div className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
                {scores.team2Score}
              </div>
              
            </div>
          </div>
        ) : null;
      })()}

      {/* Button row with responsive spacing */}
      <div className="flex justify-center items-center mt-4 mb-2 z-10 space-x-2 sm:space-x-10">
        {/* Yes button */}
        <div
          className="h-[36px] sm:h-[42px] px-3 sm:px-8 py-2 sm:py-3 rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-200 hover:brightness-90 active:brightness-85"
          style={{
            backgroundColor: team1Colors.primary,
          }}
          onClick={handleTeam1ButtonClick}
        >
          <div
            className="w-auto justify-center text-sm sm:text-base font-normal"
            style={{ color: getTextColor(team1Colors.primary) }}
          >
            {event?.team1_short_name} {team1Price !== null ? `${team1Price}¢` : ""}
          </div>
        </div>

        {event?.has_sub_markets ? (
          <div
            className="h-[36px] sm:h-[42px] px-3 sm:px-8 py-2 sm:py-3 rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-200 hover:brightness-90 active:brightness-85"
            style={{
              backgroundColor: "#6B7280",
              color: "#ffffff",
            }}
            onClick={handleDrawButtonClick}
          >
            <div
              className="w-auto justify-center text-sm sm:text-base font-normal"
              style={{ color: "#ffffff" }}
            >
              DRAW {drawPrice !== null ? `${drawPrice}¢` : ""}
            </div>
          </div>
        ) : null}

        {/* No button */}
        <div
          className="h-[36px] sm:h-[42px] px-3 sm:px-8 py-2 sm:py-3 rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-200 hover:brightness-90 active:brightness-85"
          style={{
            backgroundColor: team2Colors.primary,
          }}
          onClick={handleTeam2ButtonClick}
        >
          <div
            className="w-auto justify-center text-sm sm:text-base font-normal"
            style={{ color: getTextColor(team2Colors.primary) }}
          >
            {event?.team2_short_name} {team2Price !== null ? `${team2Price}¢` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayMatch;
