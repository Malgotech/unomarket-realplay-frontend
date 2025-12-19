import React from "react";
import { useSelector } from "react-redux";

const SkeletonCard = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-[#1A1B1E] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
          : "bg-[#fff] shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
      } w-full rounded-[20px] animate-pulse p-4 h-[220px] flex flex-col justify-between`}
    >
      {/* Section 1: Title and image - fixed height */}
      <div className="w-full flex justify-between h-[60px] items-center">
         <div
          className={`rounded w-[54px] h-[54px] ml-2 ${
            isDarkMode ? "bg-zinc-800" : "bg-gray-300"
          } animate-pulse`}
        ></div>
        <div className="w-[65%]">
          <div
            className={`h-5 ${
              isDarkMode ? "bg-zinc-800" : "bg-gray-300"
            } rounded-md animate-pulse mb-2`}
          ></div>
          <div
            className={`h-5 ${
              isDarkMode ? "bg-zinc-800" : "bg-gray-300"
            } rounded-md animate-pulse w-3/4`}
          ></div>
        </div>
       
      </div>

      {/* Section 2: Yes/No options - flexible height */}
      <div className="flex-grow mt-4">
        <div className="flex justify-between mb-3">
          <div className="w-[48%]">
            <div
              className={`h-5 ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-300"
              } rounded-md animate-pulse`}
            ></div>
          </div>
          <div className="flex w-[48%] justify-end items-center">
            <div
              className={`h-8 w-[100px] ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-300"
              } rounded animate-pulse`}
            ></div>
          </div>
        </div>
        <div className="flex justify-between mb-3">
          <div className="w-[48%]">
            <div
              className={`h-5 ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-300"
              } rounded-md animate-pulse`}
            ></div>
          </div>
          <div className="flex w-[48%] justify-end items-center">
            <div
              className={`h-8 w-[100px] ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-300"
              } rounded animate-pulse`}
            ></div>
          </div>
        </div>
      </div>

      {/* Section 3: Volume and bookmark - fixed height */}
      <div className="flex justify-between mt-auto">
        <div
          className={`h-5 w-16 ${
            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
          } rounded-md animate-pulse`}
        ></div>
        <div
          className={`h-5 w-5 ${
            isDarkMode ? "bg-zinc-800" : "bg-gray-200"
          } rounded animate-pulse`}
        ></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
