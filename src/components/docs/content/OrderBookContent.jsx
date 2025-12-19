import React from 'react';

const OrderBookContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Order Book
      </h1>

      <div className="space-y-6">
        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          The Order Book on Soundbet is a real-time display of all active buy and sell limit orders for a specific prediction market, showing the prices and quantities of shares users are willing to trade.
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Priced in USDC (1 to 100 cents), it reflects the market's depth, with buy orders (bids) and sell orders (asks) listed in ascending and descending order, respectively.
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Users leverage the order book to analyze market sentiment, identify price trends, and make informed trading decisions. It helps set strategic limit orders, gauge liquidity, and anticipate price movements, enhancing transparency and efficiency in trading.
        </p>


      </div>
    </div>
  );
};

export default OrderBookContent;