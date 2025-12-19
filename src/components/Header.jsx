import React, { useState } from "react";
import up from "/up.svg";
import down from "/down.svg";

const Header = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const categories = [
    "Trending",
    "All",
    "New",
    "Politics",
    "Technology",
    "Sports",
    "Crypto",
    "Infinite",
    "Business & Technology",
    "Others",
  ];

  return (
    <header className="w-full border-b border-gray-200 bg-[#f6f6f6] backdrop-blur-sm fixed top-0 z-50 animate-fadeIn">
      <div className="container w-full mx-0 px-4">
        <div className="flex items-center justify-between h-14">
          <div>
            <div className="flex">
              <h1 className="font-bold text-2xl">UNOMARKET</h1>
              <div className="mt-0.5 ml-1">
                <img className="w-3" src={up} alt="" />
                <img className="w-3" src={down} alt="" />
              </div>
            </div>
          </div>

          <div></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
