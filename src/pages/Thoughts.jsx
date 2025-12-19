import React, { useState, useEffect } from "react";
// Navbar removed - now handled globally in App.jsx
import Header from "../components/Header";
import { Link } from "react-router-dom";
import ThoughtsCard from "../components/ThoughtsCard";
import CreateThoughtDialog from "../components/CreateThoughtDialog";
import Sidebar from "../components/Sidebar";
import TwitterTrend from "../components/TwitterTrend";
import { fetchData } from "../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector for theme

const Thoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [navbarHeight, setNavbarHeight] = useState(112); // Default navbar height set to 112px (28rem)
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  useEffect(() => {
    fetchThoughts();

    // Get the actual navbar height for accurate positioning
    setTimeout(() => {
      const navbar = document.querySelector("header");
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
      }
    }, 500); // Small delay to ensure navbar is fully rendered

    // Update navbar height on resize
    const handleResize = () => {
      const navbar = document.querySelector("header");
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchThoughts = async () => {
    try {
      const response = await fetchData("api/user/thoughts?page=1&limit=10");
      if (response.success) {
        setThoughts(response.thoughts);
      }
    } catch (error) {
      console.error("Error fetching thoughts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDialogClose = () => {
    setIsCreating(false);
    fetchThoughts(); // Refresh thoughts after creating new one
  };

  return (
    <div
      className={`thoughts-page w-full min-h-screen ${
        isDarkMode ? "bg-[#121212]" : ""
      }`}
    >
      <div className="max-w-[1330px] mx-auto relative">
        <div className="flex">
          {/* Sidebar placeholder to maintain layout with fixed sidebar */}
          <div className="hidden md:block md:w-[250px] shrink-0">
            {/* This is just a placeholder that takes up space */}
          </div>

          {/* Main scrollable content area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <main className="px-0 pt-32 sm:pt-40 md:pt-36 flex gap-5 relative">
              {/* Main content area */}
              <div
                className="flex-1 relative"
                style={{ minHeight: `calc(100vh - ${navbarHeight}px - 2rem)` }}
              >
                {/* Page title without the button */}
                <h1
                  className={`${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  } text-2xl font-medium mb-8`}
                >
                  Express Thoughts
                </h1>

                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left column: Thoughts section with Post button at the top */}
                  <div
                    className="flex-1 min-w-0 relative"
                    style={{ minHeight: "calc(100vh - 220px)" }}
                  >
                    {/* More visible border with contrasting background */}
                    <div
                      className={`absolute inset-0 ${
                        isDarkMode ? "bg-[#1A1A1A]" : "bg-[#F5F5F5]"
                      } border-l-[3px] border-r-[3px] ${
                        isDarkMode ? "border-blue-600" : "border-blue-500"
                      }`}
                    ></div>

                    {/* Content wrapper with padding */}
                    <div className="px-0 relative">
                      {/* Post button now at the top of the thoughts section */}
                      <div className="mb-5 flex justify-end mx-6">
                        <button
                          onClick={() => setIsCreating(true)}
                          className="w-24 h-9 px-4 py-1.5 bg-[#FF4215] rounded inline-flex justify-center items-center gap-2 overflow-hidden text-white text-sm font-medium   hover:cursor-pointer"
                        >
                          Post
                        </button>
                      </div>

                      {/* Thoughts list */}
                      {isLoading ? (
                        <div
                          className={`text-center py-4 mx-6 ${
                            isDarkMode ? "text-[#C5C5C5]" : ""
                          }`}
                        >
                          Loading thoughts...
                        </div>
                      ) : thoughts.length === 0 ? (
                        <div
                          className={`text-center py-4 mx-6 ${
                            isDarkMode ? "text-[#C5C5C5]" : ""
                          }`}
                        >
                          No thoughts yet
                        </div>
                      ) : (
                        <div className="thoughts-container mx-6">
                          {thoughts.map((thought, index) => (
                            <React.Fragment key={thought._id}>
                              <ThoughtsCard thoughtData={thought} />
                              {index < thoughts.length - 1 && (
                                <div
                                  className={`h-[3px] w-[calc(100%+3rem)] -ml-6 ${
                                    isDarkMode
                                      ? "border-blue-600"
                                      : "border-blue-500"
                                  } bg-current my-2`}
                                ></div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column: Hidden on mobile, keeps layout structure */}
                  <div className="hidden lg:block lg:w-[360px] lg:shrink-0">
                    {/* Empty placeholder div to maintain layout */}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Actual Sidebar component that's position fixed */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Twitter Trend component - fixed positioning with spacing at top and bottom */}
        <div
          className="hidden lg:block fixed right-0 w-[360px] overflow-hidden"
          style={{
            right: "calc((100% - 1330px) / 2)",
            top: `${navbarHeight + 32}px`, // Added 16px spacing at the top
            height: `calc(100vh - ${navbarHeight + 64}px)`, // Added 32px for spacing (16px top + 16px bottom)
          }}
        >
          <div className="h-full">
            <TwitterTrend title="Trend Watch" className="h-full py-0" />
          </div>
        </div>
      </div>

      <CreateThoughtDialog
        open={isCreating}
        onClose={handleCreateDialogClose}
      />
    </div>
  );
};

export default Thoughts;
