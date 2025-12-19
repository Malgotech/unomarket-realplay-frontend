import React from 'react';
import { useSelector } from 'react-redux';

const ThoughtsComposerSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className="mb-5 p-4 mx-6 animate-pulse">
      {/* User avatar and name skeleton */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar skeleton */}
        <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        {/* Username skeleton */}
        <div className={`h-5 w-24 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
      </div>
      
      {/* Textarea skeleton */}
      <div className={`w-full h-10 rounded-lg ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} mb-3`}></div>
      
      {/* Post button skeleton */}
      <div className="flex justify-end">
        <div className={`h-10 w-16 rounded-lg ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default ThoughtsComposerSkeleton;