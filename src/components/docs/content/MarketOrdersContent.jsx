import React from 'react';

const MarketOrdersContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Market Orders
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            What are Market Orders?
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Market orders on Soundbet enable users to buy or sell shares in a prediction market at the current market price, ensuring instant execution. Priced in USDC, these orders are filled immediately based on available liquidity, making them ideal for users seeking quick trades without waiting for specific price points.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Market orders prioritize speed, but the execution price may vary slightly due to real-time market fluctuations, offering convenience for time-sensitive trading decisions.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Manage Market Orders on Market Tile or Market Page
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users can place market orders either from the market tile on Soundbet's homepage or the detailed market page. On the market tile, select the outcome and quantity, then confirm the order for instant execution at the current price.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            On the market page, users access the order interface, input the desired quantity, and submit the market order, which executes immediately using available shares. This streamlined process ensures rapid participation in active markets.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Cancellation of Market Order
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Market orders, due to their instant execution, cannot be canceled once submitted, as they are filled immediately at the prevailing market price.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            However, if a user mistakenly refers to a limit order as a market order, they can cancel it on the market page's Orders tab or the "Open Orders" section of the portfolio page. Selecting the limit order and confirming cancellation removes it instantly, allowing users to adjust their trading approach without incurring fees.
          </p>
        </section>


      </div>
    </div>
  );
};

export default MarketOrdersContent;