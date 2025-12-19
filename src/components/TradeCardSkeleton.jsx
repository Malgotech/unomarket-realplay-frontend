import React from 'react';
import { useSelector } from 'react-redux';

const TradeCardSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className={`${
      isDarkMode ? 'bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]' : 'bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]'
    } w-full rounded-xl p-4 h-[430px] flex flex-col`}>
      {/* Title and Image Section */}
      <div className="w-full flex justify-between mb-8 items-center">
        <div className="w-[90%]">
          <div className={`h-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse mb-2`}></div>
          <div className={`h-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse w-3/4`}></div>
        </div>
        <div className={`rounded w-[54px] h-[54px] ml-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} animate-pulse`}></div>
      </div>

      {/* Yes/No Buttons Section */}
      <div className="flex justify-between">
        <div className="w-[48%]">
          <div className={`h-10 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
        </div>
        <div className="w-[48%]">
          <div className={`h-10 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`w-full h-[350px] relative overflow-hidden mt-[20px] ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}>
      </div>

      {/* Bottom Info Section */}
      <div className="flex justify-between mt-4">
        <div className={`h-5 w-24 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
        <div className={`h-5 w-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}></div>
      </div>
    </div>
  );
};

export default TradeCardSkeleton;