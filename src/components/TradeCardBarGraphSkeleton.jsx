import React from 'react';
import { useSelector } from 'react-redux';

const TradeCardBarGraphSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className={`w-full rounded-xl p-4 hover:cursor-pointer transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]' 
        : 'bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]'
    } h-[430px] flex flex-col`}>
      {/* Title and Image */}
      <div className="w-full flex justify-between mb-1 items-center">
        <div className="w-[90%]">
          <div className={`h-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse mb-2`}></div>
          <div className={`h-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse w-3/4`}></div>
        </div>
        <div className={`rounded w-[54px] h-[54px] ml-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} animate-pulse`}></div>
      </div>

      {/* Markets Selection - Two rows */}
      <div className="mt-3">
        {[1, 2].map((index) => (
          <div key={index} className="mt-3 flex justify-between">
            <div className="w-[48%]">
              <div className={`h-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
            </div>
            <div className="flex w-[48%] justify-end items-center">
              <div className={`h-8 w-[100px] ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="w-full flex justify-end mb-3 mt-3">
        <div className={`h-6 w-20 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}></div>
      </div>

      {/* Graph Container */}
      <div className="w-full h-[160px] flex justify-center relative overflow-visible mb-4">
        <div className="flex w-full">
          {/* Left side - images */}
          <div className="flex flex-col justify-between pr-1">
            {[1, 2].map((index) => (
              <div key={index} className="flex items-center mb-9">
                <div className={`w-12 h-11 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}></div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={`rounded h-full ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-300'} w-1 mx-2`}></div>

          {/* Right side - bars */}
          <div className="pl-1 py-2 flex flex-col justify-between h-full w-full">
            {[1, 2].map((index) => (
              <div key={index} className="mb-2 w-full">
                <div className={`h-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse mb-1`}></div>
                <div className={`h-3 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse w-3/4`}></div>
                <div className={`h-3 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse w-1/2 mt-1`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="flex justify-between mt-auto">
        <div className={`h-5 w-24 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
        <div className={`h-5 w-5 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`}></div>
      </div>
    </div>
  );
};

export default TradeCardBarGraphSkeleton;