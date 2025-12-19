import React from 'react';
import { useSelector } from 'react-redux';

const TwitterTrendSkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className={`${
      isDarkMode ? 'bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]' : 'bg-[#f7f7f7] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]'
    } w-full h-full rounded-xl p-4 md:max-h-[1280px] xl:max-h-[678px] overflow-y-auto scrollbar-hide`}>
      {/* Title Section */}
      <div className="flex justify-between items-center mb-4">
        <div className={`h-6 w-32 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
        <div className={`h-6 w-24 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
      </div>

      {/* Trend Items */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <React.Fragment key={item}>
            <div className="px-5 py-3">
              <div className="flex flex-col gap-2">
                <div className={`h-5 w-3/4 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
                <div className={`h-4 w-1/2 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} rounded-md animate-pulse`}></div>
              </div>
            </div>
            {item < 8 && <hr className={isDarkMode ? 'border-zinc-800' : 'border-gray-200'} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TwitterTrendSkeleton;
