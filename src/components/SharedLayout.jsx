import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
// Navbar removed - now handled globally in App.jsx
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import TwitterTrend from "./TwitterTrend";

const SharedLayout = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const [navbarHeight, setNavbarHeight] = useState(112); // Default navbar height
  const [rightOffset, setRightOffset] = useState(80); // Better default right offset
  const [isPositioned, setIsPositioned] = useState(false); // Track if positioning is calculated

  useEffect(() => {
    // Function to calculate positioning
    const calculatePositioning = () => {
      const navbar = document.querySelector("header");
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
      }

      // Find the profile button for right alignment
      const profileButton =
        document.querySelector('header [ref="profileButtonRef"]') ||
        document.querySelector("header .rounded-full");
      if (profileButton) {
        const rect = profileButton.getBoundingClientRect();
        const rightSpace = window.innerWidth - rect.right;
        setRightOffset(rightSpace);
        setIsPositioned(true);
      }
    };

    // Initial calculation with shorter delay
    setTimeout(calculatePositioning, 100);

    // Update measurements on resize
    const handleResize = () => {
      calculatePositioning();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`container w-full min-h-screen max-w-[1000px] 2xl:max-w-[1330px] ${
        isDarkMode ? "bg-[#121212]" : "bg-none0"
      }`}
      style={{ minHeight: "calc(100vh + 1px)" }}
    >
      <MobileSidebar />
      <div className="container mx-auto    px-4 pt-20 md:pt-30 pb-24 max-w-[1000px] 2xl:max-w-[1330px] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between">
          {/* Sidebar placeholder to maintain layout with fixed sidebar */}
          <div className="hidden md:block md:w-[250px] shrink-0">
            {/* This is just a placeholder that takes up space */}
          </div>

          {/* Main scrollable content area */}
          <div className="flex-1">
            <main className="flex gap-5 ">
              {/* Main content area - this will be replaced by the Outlet */}
              <div className="flex-1 ml-[50px]  md:ml-0    "  >
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        {/* Actual Sidebar component that's position fixed */}
        <div className="hidden md:block ">
          <Sidebar />
        </div>

        {/* Twitter Trend component - fixed positioning with spacing at top and bottom */}
        {/* <div
          className={`hidden lg:block fixed w-[360px] overflow-hidden transition-all duration-300 ease-out ${
            isPositioned ? "opacity-100" : "opacity-0"
          }`}
          style={{
            right: `${rightOffset}px`,
            
            top: `${navbarHeight + 32}px`,  
            height: `calc(100vh - ${navbarHeight + 64}px)`,  
          }}
        >
          <div className="h-full">
            <TwitterTrend
              title="Trend Watch"
              className="h-full py-0"
              isThoughts={true}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default SharedLayout;
