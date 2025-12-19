import React from 'react';
import { useSelector } from 'react-redux';
import ThoughtsCardSkeleton from './ThoughtsCardSkeleton';
import ThoughtReplySkeleton from './ThoughtReplySkeleton';

const ThoughtDetailSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className="relative">
      <div className="relative">
        <div className="flex flex-col lg:flex-row relative max-w-full">
          {/* Left column with vertical borders */}
          <div className={`flex-1 min-w-0 relative lg:max-w-[calc(100%-360px)] border-l border-r ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}
               style={{ minHeight: 'calc(100vh)' }}>
            <div className="px-0 relative pt-32 sm:pt-40 md:pt-36">
              {/* Top divider line */}
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'} mb-4`}></div>
              
              <div className="mx-6">
                {/* Main thought skeleton */}
                <ThoughtsCardSkeleton />

                {/* Reply input skeleton */}
                <div className="relative w-full mt-4 animate-pulse">
                  <div className={`h-px w-full absolute top-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                  <div className="w-full px-6 py-3.5 flex justify-between items-center gap-4">
                    <div className={`h-4 w-32 rounded-md ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className={`h-px w-full absolute bottom-0 left-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                </div>

                {/* Reply skeletons */}
                {Array(3).fill().map((_, index) => (
                  <ThoughtReplySkeleton key={`reply-skeleton-${index}`} />
                ))}

                {/* Nested reply skeleton */}
                <ThoughtReplySkeleton isNested={true} />
              </div>
            </div>
          </div>
          
          {/* Right column: Hidden on mobile, keeps layout structure */}
          <div className="hidden lg:block lg:w-[360px] lg:shrink-0 relative">
            {/* Empty placeholder div to maintain layout */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThoughtDetailSkeleton;