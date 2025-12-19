import React from 'react';

const DepositsContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Deposits
      </h1>

      <div className="space-y-6">
        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Soundbet provides flexible deposit options for funding accounts with crypto tokens like USDC, ensuring stability. Users can connect compatible wallets, such as MetaMask, for seamless transfers with minimal steps, authorizing transactions directly.
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Alternatively, users can copy Soundbet's unique wallet address from their dashboard and send tokens manually from an external wallet, offering control for advanced users.
        </p>

        <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
          Both methods are secure, with funds typically available for trading within seconds to a few minutes, depending on blockchain confirmations. Clear instructions and support guide users, ensuring a smooth deposit process for all, whether novices or seasoned crypto traders.
        </p>

      </div>
    </div>
  );
};

export default DepositsContent;