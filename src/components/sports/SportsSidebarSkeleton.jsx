import React from 'react';

const SportsSidebarSkeleton = ({ isDarkMode }) => {
  return (
    <div className={`${isDarkMode ? 'bg-[#1A1B1E]' : 'bg-neutral-100'} rounded-xl p-4 ${isDarkMode ? 'shadow-[0px_0px_9px_1.8px_rgba(0,0,0,0.3)]' : 'shadow-[0px_0px_9px_1.8px_rgba(87,87,87,0.18)]'} h-auto relative`}>
      <div className="flex justify-between items-center mb-4">
        <div className={`h-6 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
        <div className={`w-10 h-10 rounded ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} animate-pulse`}></div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-4">
          <div className={`h-5 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
          <div className={`h-5 w-12 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
        </div>
        <div className={`h-8 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      </div>
      <hr className={`my-3 ${isDarkMode ? "border-zinc-800" : "border-zinc-300"}`} />
      <div className="my-4 flex justify-between gap-2">
        <div className={`w-1/2 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
        <div className={`w-1/2 h-10 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      </div>
      <div className="mt-5">
        <div className={`h-5 w-32 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse mb-2`}></div>
        <div className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      </div>
      <div className="mt-5">
        <div className={`h-5 w-40 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse mb-2`}></div>
        <div className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      </div>
      <div className="mt-5">
        <div className={`h-5 w-24 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse mb-2`}></div>
        <div className={`h-10 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      </div>
      <div className={`mt-6 h-12 w-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"} rounded-md animate-pulse`}></div>
      
      {/* Terms and Conditions */}
      <div className="absolute w-full text-center text-[12px] sm:text-[12px] font-normal top-full mt-3 left-0">
        By Trading, you accept our{' '}
        <a
          href="/terms"
          className="underline text-[#4169E1] hover:text-blue-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of use
        </a>
      </div>
    </div>
  );
};

export default SportsSidebarSkeleton;
