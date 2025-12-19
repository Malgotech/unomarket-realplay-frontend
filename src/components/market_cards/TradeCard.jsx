import React, { useState, useEffect } from "react";
import ActivityChartMiniVisx from "../charts/ActivityChartMiniVisx";
import { useNavigate } from "react-router-dom";
import { postData } from "../../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector to access theme state
import bookmarkFilled from "/Yolft Bookmark Light (2).svg";
import bookmark from "/Yolft Bookmark Light (1).svg";
import { useToast } from "../../context/ToastContext";
import { FaRegStar, FaSquare } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { IoCopyOutline, IoPlayCircleOutline } from "react-icons/io5";
const TradeCard = ({ res,GetEvents }) => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active
  const [showCopied, setShowCopied] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
console.log('selectedOption :>> ', selectedOption);
  // Set initial bookmarked state from res data when component mounts
  useEffect(() => {
    if (res && res.isBookmarked !== undefined) {
      setIsBookmarked(res.isBookmarked);
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
        content_id: res._id,
      });

      if (response.status) {
        setIsBookmarked(!isBookmarked); // Toggle the state after successful API call
        showSuccessToast(
          isBookmarked
            ? "Market removed from bookmarks"
            : "Market added to bookmarks"
        );
        GetEvents()
      } else {
        console.error("Failed to toggle bookmark:", response.message);
      }
    } catch (error) {
      showErrorToast("Failed to bookmark the event")
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

  // Handle Yes button click
  const handleYesClick = (e) => {
    e.stopPropagation(); // Prevent card click event from triggering
    setSelectedOption("yes");
    if (res.sub_markets && res.sub_markets.length > 0) {
      const firstMarketId = res.sub_markets[0]._id;
      const firstMarket = res.sub_markets[0];
      navigate(
        `/market/details/${res._id}?marketId=${firstMarketId}&selection=${firstMarket.side_1}`
      );
    } else {
      navigate(`/market/details/${res._id}`);
    }
  };

  // Handle No button click
  const handleNoClick = (e) => {
    e.stopPropagation(); // Prevent card click event from triggering
    setSelectedOption("no");
    if (res.sub_markets && res.sub_markets.length > 0) {
      const firstMarketId = res.sub_markets[0]._id;
      const firstMarket = res.sub_markets[0];
      navigate(
        `/market/details/${res._id}?marketId=${firstMarketId}&selection=${firstMarket.side_2}`
      );
    } else {
      navigate(`/market/details/${res._id}`);
    }
  };

  // Handle card click (default to Yes for first submarket)
  const handleCardClick = () => {
    if (res.sub_markets && res.sub_markets.length > 0) {
      const firstMarketId = res.sub_markets[0]._id;
      const firstMarket = res.sub_markets[0];
      let defaultSelection = selectedOption;
      if (!defaultSelection) {
        defaultSelection = firstMarket.side_1;
      } else {
        defaultSelection =
          defaultSelection === "yes" ? firstMarket.side_1 : firstMarket.side_2;
      }
      navigate(
        `/market/details/${res._id}?marketId=${firstMarketId}&selection=${defaultSelection}`
      );
    } else {
      navigate(`/market/details/${res._id}`);
    }
  };

  // Calculate potential gains for display
  const calculatePotentialGains = (side) => {
    const firstMarket = res.sub_markets && res.sub_markets[0];
    if (!firstMarket || !firstMarket.marketPrices) return null;

    const marketPrices = firstMarket.marketPrices;
    const sideKey = side === "yes" ? "Yes" : "No";
    const bestAsk = marketPrices[sideKey]?.bestAsk;

    if (!bestAsk) return null;

    // Investment amount (fixed at $100 for display)
    const investmentAmount = 100;
    // Price per share in dollars (bestAsk is in cents)
    const pricePerShare = bestAsk / 100;
    // Number of shares that can be bought
    const sharesBought = investmentAmount / pricePerShare;
    // Potential return if won (each share pays $1 if correct)
    const potentialReturn = sharesBought * 1;

    return {
      investment: investmentAmount,
      return: potentialReturn,
      profit: potentialReturn - investmentAmount,
    };
  };

  // Check if we have gains data to show
  const hasGainsData = () => {
    const firstMarket = res.sub_markets && res.sub_markets[0];
    if (!firstMarket || firstMarket.status === "settled") return false;

    const yesGains = calculatePotentialGains("yes");
    const noGains = calculatePotentialGains("no");

    // Show if at least one side has data
    return yesGains || noGains;
  };

  // Helper to render volume/age logic
  const renderVolume = () => {
    const pool = res.total_pool_in_usd;
    const startDate = res.sub_markets?.[0]?.start_date || res.createdAt;
    const daysOld = startDate
      ? Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 0;
    if (pool < 10000) {
      if (daysOld < 7) {
        return (
          <img
            src="/soundbet Vector.svg"
            alt="Yolft"
            style={{ display: "inline", height: 18, verticalAlign: "middle" }}
          />
        );
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
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      /* Unified Card Style Variant D (from QuestionPieChart) */
      className={` w-full rounded-xl p-4 relative hover:cursor-pointer h-[430px] flex flex-col justify-between transition-all duration-300 overflow-hidden
       
        ${isDarkMode
          ? "inner-card-gradient bg-[#111113] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_10px_-2px_rgba(0,0,0,0.55),0_14px_34px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_6px_14px_-2px_rgba(0,0,0,0.65),0_20px_46px_-8px_rgba(0,0,0,0.75)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.08)_inset,0_0_36px_-10px_rgba(255,255,255,0.10)_inset]"
          : "bg-[rgb(247,247,247)] shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_10px_-2px_rgba(0,0,0,0.10),0_14px_34px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.16),0_6px_16px_-2px_rgba(0,0,0,0.14),0_22px_52px_-10px_rgba(0,0,0,0.18)] hover:after:opacity-100 after:[box-shadow:0_0_0_1px_rgba(255,255,255,0.85)_inset,0_0_36px_-12px_rgba(0,0,0,0.06)_inset]"
        }
      `}
    >
      {/* Title and Image Section */}
      <div className="w-full flex justify-between mb-2 items-center">
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

      {/* Chart Section - removing extra spacing */}
      <div className={`w-full h-[320px] relative overflow-hidden   rounded`}>
        <div className="w-full h-full">
          <ActivityChartMiniVisx eventData={res} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Bottom Info Section - positioned directly after chart */}
      <div className="flex justify-between mt-2 mb-2">
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
              let selection = selectedOption;
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
            <IoCopyOutline
              className={`${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                }`}
            />
          </div>

          {/* {showCopied && (
            <div
              className={`absolute z-5 bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded flex items-center justify-center ${isDarkMode
                  ? "bg-white/30 text-white backdrop-blur-[10px] rounded-lg p-4 shadow-md"
                  : "bg-[#dfe0e0] text-zinc-700"
                }`}
            >
              URL copied to clipboard!
            </div>
          )} */}

          <div
            onClick={handleBookmarkToggle}
            className={`rounded flex items-center px-1 justify-around transition-all duration-200 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
              }`}
          >
            {isBookmarked ? (
              <FaStar
                className={`${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                  }`}
              />
            ) : (
              <FaRegStar
                className={` ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                  }`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Yes/No Buttons Section */}
      <div className="flex justify-between relative mb-[30px]">
        <div className="w-[48%]">
          <button
            onClick={handleYesClick}
            className={`group ${selectedOption === "yes"
              ? "bg-[#028C8033] text-[#A2FFF7]"
              : "bg-[#298C8C4D] text-[#0d9488]"
              } ${isDarkMode
                ? "bg-[#028C8033] text-[#A2FFF7]"
                : "bg-[#298C8C4D] text-[#0d9488]"
              } w-full py-1 rounded-md text-center text-lg flex items-center justify-center transition-all duration-300 hover:bg-[#0d9488] hover:text-white`}
          >
            <IoPlayCircleOutline className="text-[18px] mr-1 mt-1 group-hover:animate-pulse flex items-center justify-center" />

            {res.sub_markets && res.sub_markets[0]
              ? res.sub_markets[0].side_1
              : "Yes"}
          </button>
        </div>
        <div className="w-[48%]">
          <button
            onClick={handleNoClick}
            className={`group ${selectedOption === "no"
              ? "bg-[#8D1F1733] text-[#FF483B]"
              : "bg-[#8D1F1733] text-[#8D1F17]"
              } ${isDarkMode
                ? "bg-[#8D1F1733] text-[#FF483B]"
                : "bg-[#FAD1CE] text-[#8D1F17]"
              } w-full py-1 rounded-md text-center font-bold text-lg flex items-center justify-center transition-all duration-300 hover:bg-[#8d1f17] hover:text-white`}
          >
            <FaSquare className="text-[14px] mr-1 mt-1 group-hover:animate-pulse flex items-center justify-center" />

            {res.sub_markets && res.sub_markets[0]
              ? res.sub_markets[0].side_2
              : "No"}
          </button>
        </div>

        {/* Potential gains display - always visible */}
        {hasGainsData() &&
          (() => {
            const yesGains = calculatePotentialGains("yes");
            const noGains = calculatePotentialGains("no");

            return (
              <div className="absolute top-full left-0 right-0 mt-2 flex justify-between">
                <div className="w-[48%] text-[13px] text-center whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200 delay-75">
                  {yesGains ? (
                    <>
                      <span
                        className={
                          isDarkMode ? "text-white/70" : "text-gray-600"
                        }
                      >
                        ${yesGains.investment}
                      </span>
                      <span
                        className={`mx-1 ${isDarkMode ? "text-white/70" : "text-gray-600"
                          }`}
                      >
                        →
                      </span>
                      <span className="text-amber-500/80 font-semibold">
                        ${Math.round(yesGains.return)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={isDarkMode ? "text-white/40" : "text-gray-400"}
                    >
                      No Orders
                    </span>
                  )}
                </div>
                <div className="w-[48%] text-[13px] text-center whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200 delay-100">
                  {noGains ? (
                    <>
                      <span
                        className={
                          isDarkMode ? "text-white/70" : "text-gray-600"
                        }
                      >
                        ${noGains.investment}
                      </span>
                      <span
                        className={`mx-1 ${isDarkMode ? "text-white/70" : "text-gray-600"
                          }`}
                      >
                        →
                      </span>
                      <span className="text-amber-500/80 font-semibold">
                        ${Math.round(noGains.return)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={isDarkMode ? "text-white/40" : "text-gray-400"}
                    >
                      No Orders
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
      </div>

      {/* Chart Section - removing extra spacing */}
      {/* <div
        className={`w-full h-[320px] relative overflow-hidden mt-[30px] ${isDarkMode ? "bg-[#1A1B1E]" : ""
          } rounded`}
      >
        <div className="w-full h-full">
          <ActivityChartMiniVisx eventData={res} />
        </div>
      </div> */}

      {/* Bottom Info Section - positioned directly after chart */}
      <div className="flex justify-between mt-4">
        {/* <h1
          className={`text-[14px] ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
            }`}
        >
          {renderVolume()}
        </h1> */}
        <div className="flex">
          <div
            className={`rounded flex items-center px-1 justify-center transition-all duration-200 cursor-pointer ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-[#dfe0e0]"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              const firstMarket = res.sub_markets && res.sub_markets[0];
              let selection = selectedOption;
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
            <i
              className={`ri-share-2-line ${isDarkMode ? "text-[#C5C5C5]/50" : "text-zinc-500"
                }`}
              onClick={handleCopyUrl}></i>
          </div>

          {showCopied && (
            <div
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded flex items-center justify-center ${isDarkMode
                ? "bg-zinc-800 text-[#C5C5C5]"
                : "bg-[#dfe0e0] text-zinc-700"
                }`}
            >
              URL copied to clipboard!
            </div>
          )}

          {/* <div
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default TradeCard;