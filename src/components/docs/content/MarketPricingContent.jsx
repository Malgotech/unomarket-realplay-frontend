import React from 'react';

const MarketPricingContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Market Pricing and Free Float
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Pricing of the Market, Contract/Unit Creation, and Trading
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet's prediction market operates with a clear pricing mechanism and structured contract creation to facilitate seamless trading.
          </p>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <strong>Pricing of the Market:</strong> Market prices are set in USDC, ranging from 1 to 100 cents, directly reflecting the probability of an outcome. For instance, a "Yes" share priced at 60 cents indicates a 60% likelihood of that event occurring. Prices are driven by user trading activity and market sentiment, with Soundbet's centralized liquidity system ensuring stability and fair pricing. Soundbet does not interfere with the fair pricing mechanism or free float of contracts of the markets. It may reward market makers to generate ample liquidity in the markets both in number of contracts and their pricing, but not to influence the markets but to facilitate a fair and competitive trading of events.
          </p>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <strong>Contract/Unit Creation:</strong> Each market creates tradable units representing specific outcomes (e.g., "Yes" or "No" in a binary market). Upon market creation, users can put a bid of either of the binary outcomes and once the opposite outcomes match to make the pool 1 USDC or more, a contract is created. The user who bid for Yes will have one unit of "Yes" and the user who bid "No" will have one unit of No. Both the units will form one contract.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <strong>Trading:</strong> A user can buy shares to hold until resolution, earning 1 USDC per winning unit, or trade them actively to profit from price fluctuations. Trading remains open from market start to resolution, including during disputes, with Soundbet's platform ensuring liquidity and transparency for all transactions.
          </p>
        </section>


      </div>
    </div>
  );
};

export default MarketPricingContent;