import React from 'react';

const MarketOverviewContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Prediction Markets
      </h1>

      <div className="space-y-8">
        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Soundbet's prediction market operates as a peer-to-peer platform within a centralized framework, allowing users to trade on future event outcomes using USDC. Below is a comprehensive guide to how the prediction market functions.
        </p>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Market Creation
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet administrators can create markets for various events, such as elections, sports, or economic outcomes. Users can suggest creation of a new market they wish to trade by paying a fee of USDC [].
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Each market includes specific outcomes (e.g., "Yes" or "No") represented by units. Markets are set up with clear rules, deadlines, and resolution criteria, ensuring transparency. Users can propose custom markets, subject to platform approval, enabling diverse and engaging trading opportunities.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Price Calculation
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Share prices reflect the probability of an outcome, ranging from 1 cent to 100 cents in USDC. For example, a "Yes" unit priced at 60 cents indicates a 60% probability of that outcome occurring.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Prices are determined by real time supply and demand, influenced by user trades and market sentiment. Soundbet's centralized liquidity mechanisms ensure stable and fair pricing, allowing users to buy or sell shares at any time. Soundbet does not trade markets itself.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Active Trading
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Once a market is created on Soundbet, users can trade units, known as shares, representing specific outcomes (e.g., "Yes" or "No") from the market's start until its resolution. These shares are priced in USDC, ranging from 1 to 100 cents, reflecting the probability of the outcome.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users can buy shares to hold until resolution for potential payouts (e.g., $1 per winning share) or trade them actively to profit from price fluctuations driven by market sentiment. Trading remains open throughout the market's lifecycle, including during disputes, ensuring continuous liquidity and engagement until the final outcome is confirmed.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Resolution of Markets
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Once an event concludes, the market resolves based on the verified outcome. Winning units (e.g., "Yes" if the event occurs) are redeemed at 100 cents (1 USDC), while losing units resolve to 0.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet uses trusted sources or predefined criteria to determine outcomes, ensuring accuracy. Funds are distributed to users' accounts promptly after resolution, typically within hours.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Clarification on Rules
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            If a market's rules or outcome criteria are unclear, Soundbet provides clarifications through its support team or public announcements. Users can request clarification via the platform's helpdesk before or during trading. Clear rules ensure all participants understand the market's terms, minimizing confusion and maintaining fairness.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Disputes
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users can file disputes if they believe a market's resolution is incorrect. Two dispute windows are available: the first within 12 hours of resolution, and the second within 36 hours after the first window closes. Disputes are reviewed by soundbet's resolution team, using verified data to ensure fair outcomes.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Active Markets During a dispute
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            During a dispute, market trading remains active, allowing users to continue buying and selling shares. This ensures liquidity and engagement while disputes are resolved. soundbet's centralized oversight guarantees that trading continues smoothly, with any adjustments applied post-dispute to reflect the final outcome.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MarketOverviewContent;