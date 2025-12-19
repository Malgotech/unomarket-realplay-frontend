import React from 'react';

const SportCardSkeleton = ({ isDarkMode }) => {
  return (
    <div className={`rounded-[8px] p-2 flex items-center gap-2 animate-pulse ${
      isDarkMode 
        ? 'bg-zinc-800' 
        : 'bg-gray-100'
    }`}>
      {/* Image skeleton */}
      <div className={`h-7 w-7 rounded-sm ${
        isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'
      }`}></div>
      
      {/* Text skeleton */}
      <div className={`h-4 rounded-md ${
        isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'
      }`} style={{ width: `${Math.random() * 20 + 60}px` }}></div>
    </div>
  );
};

export default SportCardSkeleton;