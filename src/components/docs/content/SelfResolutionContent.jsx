import React from 'react';

const SelfResolutionContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Self-Resolution
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Self-Resolution in Sports Markets
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            For sports markets, Soundbet employs self-resolution mechanisms to streamline the process. Outcomes are automatically determined using official results from recognized sports organizations or data feeds (e.g., FIFA, NBA).
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Once the event concludes, the platform cross-references the result with these sources, resolving the market without manual intervention. This ensures rapid and accurate settlements, typically within minutes of the event's end, enhancing user trust and efficiency in sports-related markets.
          </p>
        </section>

        <section>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
            Self-Resolution by Soundbet
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            For non-sports markets or when a market's time limit expires, Soundbet can/will do self-resolution. The platform uses predefined sources specified in the market's rules to verify outcomes.
          </p>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            If the time limit is reached without a clear result (e.g., delayed event), Soundbet may extend the resolution period or resolve based on available data. Resolutions are finalized promptly, with funds credited to user accounts, ensuring transparency and fairness across all market types.
          </p>
        </section>


      </div>
    </div>
  );
};

export default SelfResolutionContent;