import React from 'react';

const MarketCreationContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Markets Creation
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Single Market
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet's market creation process allows administrators to establish prediction markets for diverse events, designed for clarity and engagement. Single Market Creation (Binary with 2 Options) involves setting up a market with two mutually exclusive outcomes, such as "Will Candidate A win the election?" with "Yes" or "No" units.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users propose the event, define the question, set a resolution date, and specify trusted sources for outcome verification.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Multiple Markets
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Markets with Multiple Eventualities involve complex events with multiple outcomes, each broken into binary options. For example, a market like "Which team will win the championship?" with four teams (A, B, C, D) creates four binary markets (e.g., "Will Team A win? Yes/No").
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Each binary pair operates independently, with units priced in USDC, allowing users to trade on specific outcomes while maintaining simplicity and liquidity across all options.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Triggers of Market Creation
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet carefully evaluates potential markets to ensure they are engaging, fair, and viable for trading.
          </p>

          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-blue-50 border border-blue-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-blue-800'}`}>
                Own Markets
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-blue-700'}`}>
                Every proposed market undergoes AI validation to assess the probability of its outcomes at the time of creation. The platform requires that each outcome (e.g., "Yes" or "No" in a binary market) has a balanced probability of at least 10%-15%, as determined by AI analysis of historical data, trends, and relevant factors. This ensures markets are competitive and attractive to traders, avoiding overly predictable events that could limit participation or skew trading dynamics.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-green-50 border border-green-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-green-800'}`}>
                User suggestions
              </h3>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-green-700'}`}>
                Soundbet encourages users to propose markets, fostering a diverse range of topics from sports to global events. When a user submits a market idea, including the question, outcomes, resolution date, and verification sources, Soundbet's AI system evaluates its feasibility, clarity, and potential for balanced trading. The AI checks for sufficient uncertainty, reliable resolution sources, and alignment with platform guidelines. Approved markets are then launched, allowing users to trade units, while unviable proposals are refined or rejected to maintain quality and trust in the platform.
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-green-700'}`}>
                To give suggestions, you may tag us on X, Bluesky or use #MyMarket on Discord. We monitor all the handles actively so we shall take notice of the market.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketCreationContent;