import React from 'react';

const ResolutionOverviewContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Resolution Overview
      </h1>

      <div className="space-y-6">
        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          The resolution of prediction markets on Soundbet determines the final outcome of an event, settling all trades and distributing payouts in USDC. Once an event concludes, Soundbet verifies the outcome using predefined, trusted sources (e.g., official results or reputable data providers including the sources shared in the specific market) to ensure accuracy and fairness.
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Winning units (e.g., "Yes" for a correct outcome) are redeemed at 1 USDC each, while losing units resolve to 0. The process is transparent, with resolutions typically finalized within hours of the event's conclusion, though disputes may extend this timeline while keeping markets active.
        </p>


      </div>
    </div>
  );
};

export default ResolutionOverviewContent;