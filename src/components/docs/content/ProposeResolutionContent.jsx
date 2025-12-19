import React from 'react';

const ProposeResolutionContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        How to Propose a Resolution
      </h1>

      <div className="space-y-6">
        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Users can propose a resolution if they believe the outcome is clear but not yet finalized by Soundbet. To do so, they submit a proposal through the platform's interface, paying a refundable bond in USDC (set by Soundbet to deter frivolous claims).
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          The proposal includes evidence, such as links to trusted sources. Soundbet's resolution team reviews the proposal, and if accepted, the bond is refunded, and the market resolves accordingly. If rejected, the bond may be forfeited, depending on the proposal's validity.
        </p>


      </div>
    </div>
  );
};

export default ProposeResolutionContent;