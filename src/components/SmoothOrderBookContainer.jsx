import React, { useState, useEffect } from 'react';
import './OrderBookAnimations.css';

/**
 * OrderBookRow - A wrapper component for individual order book rows with smooth transitions
 */
const OrderBookRow = ({ 
  type, // 'ask' or 'bid'
  price, 
  shares, 
  maxShares, 
  index, 
  isUpdating,
  isDarkMode,
  showLabel 
}) => {
  const [prevData, setPrevData] = useState({ price, shares });
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (prevData.price !== price || prevData.shares !== shares) {
      setHasChanged(true);
      setPrevData({ price, shares });
      
      // Reset animation flag after animation completes
      const timer = setTimeout(() => setHasChanged(false), 300);
      return () => clearTimeout(timer);
    }
  }, [price, shares, prevData]);

  const isAsk = type === 'ask';
  const colorClass = isAsk ? 'text-[#8d1f17]' : 'text-[#298c8c]';
  const bgColor = isAsk 
    ? (isDarkMode ? "rgba(141, 31, 23, 0.40)" : "rgba(141, 31, 23, 0.30)")
    : (isDarkMode ? "rgba(41, 140, 140, 0.40)" : "rgba(41, 140, 140, 0.30)");
  const hoverClass = isAsk 
    ? (isDarkMode ? 'hover:bg-[rgba(141,31,23,0.25)]' : 'hover:bg-[rgba(141,31,23,0.15)]')
    : (isDarkMode ? 'hover:bg-[rgba(41,140,140,0.25)]' : 'hover:bg-[rgba(41,140,140,0.15)]');

  return (
    <div
      className={`orderbook-row grid grid-cols-6 gap-4 py-2 relative z-10 cursor-pointer ${hoverClass} ${
        isDarkMode ? 'text-zinc-200' : ''
      } ${isUpdating ? 'updating' : ''} ${hasChanged ? 'orderbook-row-new' : ''}`}
      style={{
        animationDelay: `${index * 20}ms`,
      }}
    >
      {/* Label for first/last item */}
      {showLabel && (
        <div className={`absolute ${isAsk ? 'bottom-2' : 'top-2'} left-2 z-20`}>
          <div className={`w-[39px] h-[22px] ${isAsk ? 'bg-[#8d1f17]' : 'bg-[#298c8c]'} rounded-[3px] flex items-center justify-center`}>
            <div className="flex items-center justify-center w-[27px] h-2.5 text-[#fcfcfc] text-xs font-medium">
              {isAsk ? 'Asks' : 'Bids'}
            </div>
          </div>
        </div>
      )}
      
      {/* Background bar with smooth resize animation */}
      <div
        className={`orderbook-bar absolute top-0 left-0 h-full z-0 ${isUpdating ? 'updating' : ''} ${hasChanged ? 'orderbook-bar-animated' : ''}`}
        style={{
          backgroundColor: bgColor,
          width: `${((shares || 0) / maxShares) * 40}%`,
          transformOrigin: 'left center',
        }}
      />
      
      <div></div>
      <div></div>
      <div></div>
      
      {/* Price */}
      <div className={`orderbook-price font-medium relative z-10 ${colorClass}`}>
        {price}¢
      </div>
      
      {/* Shares */}
      <div className="orderbook-shares relative z-10">
        {shares.toLocaleString()}
      </div>
      
      {/* Total */}
      <div className="orderbook-total relative z-10">
        ${((price / 100) * shares).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
};

/**
 * SmoothOrderBookContainer - A container that handles smooth transitions for order book updates
 */
export const SmoothOrderBookContainer = ({ 
  asks = [], 
  bids = [], 
  isUpdating = false, 
  isDarkMode = false,
  spreadInfo = null
}) => {
  const maxShares = Math.max(
    ...asks.map((ask) => ask.shares || 0),
    ...bids.map((bid) => bid.shares || 0)
  );

  return (
    <div className={`orderbook-container ${isUpdating ? 'orderbook-updating fade-out' : 'orderbook-updating fade-in'}`}>
      {/* Asks Section */}
      <div className="relative">
        {asks.length > 0 ? (
          asks.map((ask, index) => (
            <OrderBookRow
              key={`ask-${ask.price}-${ask.shares}`}
              type="ask"
              price={ask.price}
              shares={ask.shares}
              maxShares={maxShares}
              index={index}
              isUpdating={isUpdating}
              isDarkMode={isDarkMode}
              showLabel={index === asks.length - 1}
            />
          ))
        ) : (
          <div className={`grid grid-cols-6 gap-4 py-2 text-center relative ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <div className="col-span-6 font-medium">No Asks</div>
          </div>
        )}
      </div>

      {/* Spread Row */}
      {spreadInfo && (
        <div className={`orderbook-stable-spread py-2 flex justify-between items-center border-t border-b ${
          isDarkMode ? 'border-zinc-800 text-zinc-400 bg-zinc-900/80' : 'border-zinc-200 text-zinc-500 bg-white/80'
        } z-10`}>
          <div></div><div></div><div></div><div></div><div></div>
          <div>
            Spread {spreadInfo ? `${spreadInfo}¢` : "--"}
          </div>
          <div></div><div></div><div></div><div></div><div></div>
        </div>
      )}

      {/* Bids Section */}
      <div className="relative">
        {bids.length > 0 ? (
          bids.map((bid, index) => (
            <OrderBookRow
              key={`bid-${bid.price}-${bid.shares}`}
              type="bid"
              price={bid.price}
              shares={bid.shares}
              maxShares={maxShares}
              index={index}
              isUpdating={isUpdating}
              isDarkMode={isDarkMode}
              showLabel={index === 0}
            />
          ))
        ) : (
          <div className={`grid grid-cols-6 gap-4 py-2 text-center ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <div className="col-span-6 font-medium">No Bids</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmoothOrderBookContainer;
