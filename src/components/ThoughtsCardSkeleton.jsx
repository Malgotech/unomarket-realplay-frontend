import React from 'react';
import { useSelector } from 'react-redux';

const ThoughtsCardSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className="p-5 flex gap-2 animate-pulse">
      <div className="w-full h-full flex flex-col justify-between">
        {/* Header section with avatar and user info */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex justify-center items-center gap-2">
            {/* Avatar skeleton */}
            <div className={`w-15 h-15 rounded-xl ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
            <div className="">
              <div className="flex items-center gap-3">
                {/* Username skeleton */}
                <div className={`h-5 w-24 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
                {/* Timestamp skeleton */}
                <div className={`h-3 w-16 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              </div>
              {/* Category skeleton (optional) */}
              <div className={`h-4 w-20 rounded-md mt-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="my-1 min-h-[44px] space-y-2">
          <div className={`h-4 w-full rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          <div className={`h-4 w-3/4 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        </div>

        <div className="flex justify-between">
          <div>
            {/* Event title skeleton (optional) */}
            <div className="mb-4">
              <div className={`h-5 w-32 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
            </div>
            
            {/* Action buttons skeleton */}
            <div className="flex gap-4 mt-2 items-center">
              {/* Like button skeleton */}
              <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
                <div className={`h-4 w-6 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              </div>
              {/* Reply button skeleton */}
              <div className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
                <div className={`h-4 w-6 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
          
          {/* Buy button skeleton (optional) */}
          <div className="flex flex-col justify-end items-end">
            <div className={`h-9 w-16 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtsCardSkeleton;