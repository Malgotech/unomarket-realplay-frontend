import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchData } from "../../services/apiServices";

// Utility function to format expiration time
const formatExpirationTime = (expirationTimestamp) => {
  if (!expirationTimestamp) {
    return "No Expiration";
  }

  const now = new Date().getTime();
  const expiration = new Date(expirationTimestamp).getTime();
  const timeDiff = expiration - now;

  if (timeDiff <= 0) {
    return "Expired";
  }

  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `in ${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `in ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return "Expires soon";
  }
};

const PositionsSection = ({
  eventId,
  onSellClick,
  onCancelOrderClick,
  onPositionsUpdate, // New callback to expose positions data
  showSection = true,
  initialPositionsLoaded = false,
  userPositions = [], // Receive positions as props
  userOrders = [], // Receive orders as props
}) => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // State management
  const [positionsActiveTab, setPositionsActiveTab] = useState("Positions");
  const [availableTabs, setAvailableTabs] = useState({
    positions: false,
    orders: false,
  });
  const [isPositionsSectionOpen, setIsPositionsSectionOpen] = useState(true);
  const [isPositionsSectionAnimating, setIsPositionsSectionAnimating] =
    useState(false);

  const positionsSectionContentRef = useRef(null);

  // Refresh data function for trade success events
  const refreshData = async () => {
    if (!eventId) return;

    try {
      // Fetch fresh positions data
      const positionsResponse = await fetchData(`api/event/positions?eventId=${eventId}`);
      if (positionsResponse.success && onPositionsUpdate) {
        onPositionsUpdate(positionsResponse.positions);
      }

      // Fetch fresh orders data - this will be handled by parent component
      // The parent will update the userOrders prop which will trigger a re-render
    } catch (error) {
      console.error("Error refreshing positions data:", error);
    }
  };

  // Toggle positions section collapse/expand
  const togglePositionsSection = () => {
    if (isPositionsSectionAnimating) return;

    setIsPositionsSectionAnimating(true);
    const content = positionsSectionContentRef.current;

    if (isPositionsSectionOpen) {
      // Closing - animate to 0 height
      if (content) {
        const currentHeight = content.scrollHeight;
        content.style.height = `${currentHeight}px`;
        content.offsetHeight;
        requestAnimationFrame(() => {
          content.style.height = "0px";
        });
        setTimeout(() => {
          setIsPositionsSectionOpen(false);
        }, 50);
      }
    } else {
      // Opening - animate from 0 to auto height
      if (content) {
        setIsPositionsSectionOpen(true);
        requestAnimationFrame(() => {
          content.style.height = "0px";
          content.offsetHeight;
          const targetHeight = content.scrollHeight;
          requestAnimationFrame(() => {
            content.style.height = `${targetHeight}px`;
          });
          setTimeout(() => {
            if (content) {
              content.style.height = "auto";
            }
          }, 500);
        });
      }
    }

    setTimeout(() => {
      setIsPositionsSectionAnimating(false);
    }, 500);
  };

  // Determine which tabs to show based on data availability
  useEffect(() => {
    console.log('userPositions', userPositions)
    const hasPositions = userPositions && userPositions.length > 0;
    const hasOrders = userOrders && userOrders.length > 0;

    setAvailableTabs({
      positions: hasPositions,
      orders: hasOrders,
    });

    // Set default tab based on available data
    if (hasPositions && !hasOrders) {
      setPositionsActiveTab("Positions");
    } else if (!hasPositions && hasOrders) {
      setPositionsActiveTab("Orders");
    }
  }, [userPositions, userOrders]);

  // Listen for trade success events to refresh data
  useEffect(() => {
    const handleTradeSuccess = async () => {
      await refreshData();
    };

    window.addEventListener("soundbet-trade-success", handleTradeSuccess);
    return () =>
      window.removeEventListener("soundbet-trade-success", handleTradeSuccess);
  }, [eventId]);

  // Don't render if no data or not initialized
  if (
    !showSection ||
    !initialPositionsLoaded ||
    (!availableTabs.positions && !availableTabs.orders)
  ) {
    return null;
  }

  return (
    <div
      className={`rounded-[5px] border ${isDarkMode ? "border-[#C5C5C5]/30" : "border-[#efefef]"
        } mt-6`}
    >
      <div className="">
        <div
          className={`flex justify-between items-center cursor-pointer`}
          onClick={togglePositionsSection}
        >
          <div className="flex">
            {availableTabs.positions && (
              <button
                className={`py-2 px-4 text-center font-medium text-[18px] hover:cursor-pointer ${positionsActiveTab === "Positions"
                    ? isDarkMode
                      ? "text-zinc-100"
                      : "text-zinc-700"
                    : isDarkMode
                      ? "text-zinc-500"
                      : "text-zinc-400"
                  } transition-colors duration-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPositionsActiveTab("Positions");
                }}
              >
                Positions
              </button>
            )}

            {availableTabs.orders && (
              <button
                className={`py-2 px-4 text-center font-medium text-[18px] hover:cursor-pointer ${positionsActiveTab === "Orders"
                    ? isDarkMode
                      ? "text-zinc-100"
                      : "text-zinc-700"
                    : isDarkMode
                      ? "text-zinc-500"
                      : "text-zinc-400"
                  } transition-colors duration-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPositionsActiveTab("Orders");
                }}
              >
                Orders
              </button>
            )}
          </div>

          {/* Collapse/Expand Button */}
          <div className="ml-auto p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"
                } transform transition-transform duration-500 ${isPositionsSectionOpen ? "rotate-180" : "rotate-0"
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Collapsible Content Area */}
        <div
          ref={positionsSectionContentRef}
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isPositionsSectionAnimating ? "pointer-events-none" : ""
            }`}
          style={{
            height: isPositionsSectionOpen ? "auto" : "0px",
          }}
        >
          {/* Desktop Headers */}
          <div className="hidden md:flex justify-between items-center mt-4 mb-2 px-4">
            {positionsActiveTab === "Positions" ? (
              <>
                <div
                  className={`w-[130px] ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Side
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Units
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Latest
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Initial
                </div>
                <div
                  className={`w-[150px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Current
                </div>
              </>
            ) : (
              <>
                <div
                  className={`w-[130px] ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Side
                </div>
                <div
                  className={`w-[80px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Action
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Units
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Price
                </div>
                <div
                  className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Total
                </div>
                <div
                  className={`w-[120px] text-center ${isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    } text-base font-light`}
                >
                  Expiration
                </div>
              </>
            )}
            <div className="w-[140px] flex justify-end"></div>
          </div>

          {/* Separator after title - Desktop only */}
          <hr
            className={`hidden md:block ${isDarkMode ? "border-[#C5C5C5]/30" : "border-[#efefef]"
              }`}
          />

          {/* Content based on active tab */}
          {positionsActiveTab === "Positions" &&
            userPositions.length > 0 &&
            userPositions.map((position, index) => (
              <div key={position.id}>
                {/* Mobile Card View */}
                <div className="md:hidden">
                  <div
                    className={`p-4 mb-3 rounded-lg ${isDarkMode ? "bg-[#1E1E1E]" : "bg-white"
                      } shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div
                          className={`w-[60px] h-[30px] ${position.side === position.side_1
                              ? "bg-[#009443]"
                              : "bg-[#FF161A]"
                            } rounded-[5px] inline-flex justify-center items-center gap-2.5 mr-2`}
                        >
                          <div
                            className={`${position.side === position.side_1
                                ? "text-[#fff]"
                                : "text-[#fff]"
                              } text-xs font-normal`}
                          >
                            {position.side}
                          </div>
                        </div>
                        {position.has_sub_markets && (
                          <div
                            className={`text-sm ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              }`}
                          >
                            {position.marketName}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-right ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                          } font-medium`}
                      >
                        {position.shares} Units
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Latest
                        </div>
                        <div
                          className={`${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            }`}
                        >
                          {position.currentPricePerShare.toFixed(0)}¢
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Initial
                        </div>
                        <div
                          className={`${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            }`}
                        >
                          ${position?.initialTotalPrice?.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Current
                        </div>
                        <div
                          className={
                            position.percentageChange >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          ${position.currentTotalPrice.toFixed(2)}
                          <div className="text-xs">
                            ({position.percentageChange >= 0 ? "+" : ""}
                            {position.percentageChange.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <div
                        className="w-[60px] h-[30px] bg-[#FF161A] rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-[#FF161A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSellClick && onSellClick(position);
                        }}
                      >
                        <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                          Sell 
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:flex justify-between items-center py-4 px-4">
                  <div className="w-[130px] flex items-center">
                    <div
                      className={`w-[60px] h-[30px] ${position.side === position.side_1
                          ? "bg-[#009443]"
                          : "bg-[#FF161A]"
                        } rounded-[5px] inline-flex justify-center items-center gap-2.5`}
                    >
                      <div
                        className={`justify-center ${position.side === position.side_1
                            ? "text-[#fff]"
                            : "text-[#fff]"
                          } text-xs font-normal`}
                      >
                        {position.side}
                      </div>
                    </div>
                    {position.has_sub_markets && (
                      <div
                        className="ml-2 text-xs truncate max-w-[60px]"
                        title={position.marketName}
                      >
                        {position.marketName}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    {position.shares}
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    {position.currentPricePerShare.toFixed(0)}¢
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    ${position?.initialTotalPrice?.toFixed(2)}
                  </div>
                  <div
                    className={`w-[150px] text-center text-base font-light flex items-center justify-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      }`}
                  >
                    ${position.currentTotalPrice.toFixed(2)}
                    <span
                      className={
                        position.percentageChange >= 0
                          ? "text-green-600 ml-1"
                          : "text-red-600 ml-1"
                      }
                    >
                      ({position.percentageChange >= 0 ? "+" : ""}
                      {position.percentageChange.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-[140px] flex justify-end">
                    <div
                      className="w-[60px] h-[30px] bg-[#FF161A] rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-[#FF161A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSellClick && onSellClick(position);
                      }}
                    >
                      <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                        Sell 
                      </div>
                    </div>
                  </div>
                </div>

                {index < userPositions.length - 1 && (
                  <hr
                    className={`hidden md:block ${isDarkMode ? "border-[#C5C5C5]/30" : "border-[#efefef]"
                      }`}
                  />
                )}
              </div>
            ))}

          {/* Orders content */}
          {positionsActiveTab === "Orders" &&
            userOrders.length > 0 &&
            userOrders.map((order, index) => (
              <div key={order.id}>
                {/* Mobile Card View for Orders */}
                <div className="md:hidden">
                  <div
                    className={`p-4 mb-3 rounded-lg ${isDarkMode ? "bg-[#1E1E1E]" : "bg-white"
                      } shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div
                          className={`w-[60px] h-[30px] ${order.outcome === order.side_1
                                ? "bg-[#009443]"
                              : "bg-[#FF161A]"
                            } rounded-[5px] inline-flex justify-center items-center gap-2.5 mr-2`}
                        >
                          <div
                            className={`${order.outcome === order.side_1
                             ? "text-[#fff]"
                                : "text-[#fff]"
                              } text-xs font-normal`}
                          >
                            {order.outcome}
                          </div>
                        </div>
                        {order.has_sub_markets && (
                          <div
                            className={`text-sm ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              }`}
                          >
                            {order.marketName}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            } mb-1`}
                        >
                          {order.side}
                        </div>
                        <div
                          className={`text-right ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            } font-medium`}
                        >
                          {order.shares} Units
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Price
                        </div>
                        <div
                          className={`${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            }`}
                        >
                          {order.price.toFixed(0)}¢
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Total
                        </div>
                        <div
                          className={`${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            }`}
                        >
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xs ${isDarkMode
                              ? "text-[#C5C5C5]/50"
                              : "text-[#2b2d2e]/50"
                            }`}
                        >
                          Expiration
                        </div>
                        <div
                          className={`text-base ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            }`}
                        >
                          {formatExpirationTime(order.expirationTimestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <div
                        className="w-[60px] h-[30px] bg-red-600 rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelOrderClick && onCancelOrderClick(order.id);
                        }}
                      >
                        <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                          Cancel
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View for Orders */}
                <div className="hidden md:flex justify-between items-center py-4 px-4">
                  <div className="w-[130px] flex items-center">
                    <div
                      className={`w-[60px] h-[30px] ${order.outcome === order.side_1
                          ? "bg-[#298c8c]/30"
                          : "bg-[#8d1f17]/30"
                        } rounded-[5px] inline-flex justify-center items-center gap-2.5`}
                    >
                      <div
                        className={`justify-center ${order.outcome === order.side_1
                            ? "text-[#298c8c]"
                            : "text-[#8d1f17]"
                          } text-xs font-normal`}
                      >
                        {order.outcome}
                      </div>
                    </div>
                    {order.has_sub_markets && (
                      <div
                        className="ml-2 text-xs truncate max-w-[60px]"
                        title={order.marketName}
                      >
                        {order.marketName}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-[80px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    <span
                      className={`px-2 py-1 rounded text-xs ${order.side === "Buy"
                          ? isDarkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-green-100 text-green-800"
                          : isDarkMode
                            ? "bg-red-900/30 text-red-400"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {order.side}
                    </span>
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    {order.shares}
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    {order.price.toFixed(0)}¢
                  </div>
                  <div
                    className={`w-[100px] text-center ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                      } text-base font-light flex items-center justify-center`}
                  >
                    ${order.total.toFixed(2)}
                  </div>
                  <div
                    className={`w-[120px] text-center text-base font-light flex items-center justify-center`}
                  >
                    <span
                      className={`text-base ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                        }`}
                    >
                      {formatExpirationTime(order.expirationTimestamp)}
                    </span>
                  </div>
                  <div className="w-[140px] flex justify-end">
                    <div
                      className="w-[60px] h-[30px] bg-red-600 rounded-[5px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelOrderClick && onCancelOrderClick(order.id);
                      }}
                    >
                      <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                        Cancel
                      </div>
                    </div>
                  </div>
                </div>

                {index < userOrders.length - 1 && (
                  <hr
                    className={`hidden md:block ${isDarkMode ? "border-[#C5C5C5]/30" : "border-[#efefef]"
                      }`}
                  />
                )}
              </div>
            ))}

          {/* Empty state messages */}
          {positionsActiveTab === "Positions" && userPositions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No positions found for this event.</p>
            </div>
          )}

          {positionsActiveTab === "Orders" && userOrders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No open orders found for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionsSection;
