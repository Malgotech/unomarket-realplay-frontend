import React from 'react';

const OverviewContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        What is Soundbet?
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Overview
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet is a centralized prediction marketplace platform that enables users to predict outcomes of future events using cryptocurrency. Covering a wide range of topics such as political elections, sports, economic trends, and pop culture, Soundbet allows users to buy and sell units representing the probability of specific outcomes.
          </p>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The platform operates with a user-friendly interface, leveraging a centralized system to manage trades while using crypto tokens like USDC for stability and ease of transactions. Soundbet harnesses collective user predictions to generate accurate probabilistic forecasts, serving as an innovative alternative to traditional betting or polling systems.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Accessible globally with a compatible cryptocurrency wallet, Soundbet provides a dynamic environment for both casual and professional predictors to engage in event-driven markets.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Why Soundbet?
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet's centralized infrastructure ensures streamlined operations, robust security, and a seamless user experience, making it accessible for those new to crypto-based prediction markets. Unlike decentralized platforms, Soundbet offers centralized oversight to enhance performance and user support while maintaining low fees.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The ability to create custom markets on diverse topics sets Soundbet apart, appealing to a broad audience. By incentivizing accurate predictions through financial stakes, Soundbet provides valuable insights for decision-makers across industries.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            How Predictions/Probabilities Move?
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            In Soundbet, predictions are reflected in unit prices, ranging from 0 to 1 USDC. For example, a "Yes" token priced at $0.60 implies a 60% probability of that outcome. Prices shift based on user trading activity, new information, or market sentiment.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Large trades can influence probabilities, and Soundbet's centralized liquidity mechanisms ensure smooth trading and market stability.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            How to Make Money on Soundbet?
          </h2>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users profit by purchasing units in outcomes that resolve correctly. For instance, buying a "Yes" unit at $0.30 that resolves to $1 yields a $0.70 profit per unit.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Users can also sell units before resolution to capitalize on price fluctuations, enabling flexible trading strategies.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Is Soundbet a House or Peer-to-Peer?
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            No, Soundbet is not a house-based system. It operates as a peer-to-peer platform within a centralized framework, where users trade directly with each other using crypto tokens, facilitated by Soundbet's infrastructure, ensuring a transparent and efficient betting environment without the platform setting odds or taking positions.
          </p>
        </section>
      </div>
    </div>
  );
};

export default OverviewContent;