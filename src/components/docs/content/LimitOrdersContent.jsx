import React from 'react';

const LimitOrdersContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Limit Orders
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            What are Limit Orders?
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Limit orders on Soundbet allow users to buy or sell shares in a prediction market at a specific price or better, giving control over the trade's execution price. Priced in USDC (1 to 100 cents), users set a desired price for a specific outcome (e.g., "Yes" at 50 cents).
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The order only executes when the market price matches or improves upon the specified price, enabling strategic trading based on market trends. Limit orders are ideal for users aiming to capitalize on anticipated price movements without immediate execution.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Manage Limit Orders on the Market Page
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users can manage limit orders directly on the market page of a specific event. To place a limit order, select the outcome, enter the desired price and quantity, and set an optional expiration date for the order (e.g., 24 hours or until market resolution).
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The expiration ensures unexecuted orders are automatically canceled if not filled by the specified time. Users can view, modify, or cancel active limit orders from the market page's order section, ensuring flexibility in adapting to changing market conditions.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Cancellation of Limit Order
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Limit orders can be canceled on the market page under the active orders tab, where users can view all pending orders for that market and select "Cancel" for the desired order.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Alternatively, users can navigate to the "Open Orders" section on their portfolio page, which lists all active limit orders across all markets. Selecting an order and confirming cancellation removes it instantly, with no fees, allowing users to adjust their strategies or free up funds for other trades.
          </p>
        </section>


      </div>
    </div>
  );
};

export default LimitOrdersContent;