import React from 'react';

const DisputeResolutionContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Dispute the Resolution
      </h1>

      <div className="space-y-8">
        <section>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            If users believe a market's resolution is incorrect, they can dispute it by submitting a challenge through Soundbet's platform, requiring a refundable bond in USDC to ensure serious claims.
          </p>

          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            The dispute must be filed within the designated windows: the first within 12 hours of resolution, and the second within 36 hours after the first window closes. Users provide evidence, such as links to credible sources, to support their claim.
          </p>

          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet's resolution team reviews the dispute, cross-referencing with trusted data. If the dispute is upheld, the bond is refunded, and the market outcome is corrected; otherwise, the bond may be forfeited. Trading remains active during disputes, ensuring market liquidity.
          </p>
        </section>



        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Additional Clarification (on Market Rules After Market Creation)
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            After a market is created on Soundbet, additional clarification on market rules may be necessary to ensure transparency and fairness. If ambiguities arise regarding the event, outcomes, or resolution criteria, users can seek clarification through the platform's Discord server.
          </p>
          <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Soundbet's support team reviews the query and, if needed, provides updated details or references to the predefined trusted sources outlined in the market's setup. Clarifications are communicated publicly via the market's page or user notifications to maintain consistency. This process ensures all participants understand the rules, fostering trust and informed trading throughout the market's lifecycle.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <strong>Important Note:</strong> Soundbet can itself provide clarification on any ambiguity on the market page itself. We strive to do the best effort not to alter the nature of the market altogether by introducing a new contingency on the binary outcomes.
          </p>
        </section>


      </div>
    </div>
  );
};

export default DisputeResolutionContent;