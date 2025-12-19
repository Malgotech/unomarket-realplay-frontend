import React from 'react';
import { useSelector } from 'react-redux';

const ThoughtReplySkeleton = ({ isNested = false }) => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className={`mt-8 flex gap-8 relative ${isNested ? "" : ""} animate-pulse`}>
      <div className="relative">
        {/* Avatar skeleton */}
        <div className={`w-12 h-12 rounded-full min-w-12 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
      </div>
      
      {/* Nested reply connector line */}
      {isNested && (
        <div className={`absolute top-6 -left-8 w-8 h-[1px] ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`} />
      )}
      
      <div className="flex-1">
        {/* Header with username and date */}
        <div className="flex gap-4">
          <div className={`h-4 w-20 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          <div className={`h-3 w-16 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        </div>
        
        {/* Content skeleton */}
        <div className="mt-1 space-y-2">
          <div className={`h-4 w-full rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          <div className={`h-4 w-3/4 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center gap-4 mt-2">
          {/* Like button */}
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 w-6 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          </div>
          {/* Reply button */}
          <div className={`h-4 w-12 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
          {/* Show replies button (optional) */}
          <div className={`h-4 w-20 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtReplySkeleton;