import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// Navbar removed - now handled globally in App.jsx
import Sidebar from "../components/Sidebar";
import TwitterTrend from "../components/TwitterTrend";
import { fetchData } from "../services/apiServices";

const Activity = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === 'dark'; // Check if dark mode is active
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [navbarHeight, setNavbarHeight] = useState(112); // Default navbar height
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activityType, setActivityType] = useState("all");
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    fetchActivity();

    // Get the actual navbar height for accurate positioning
    setTimeout(() => {
      const navbar = document.querySelector('header');
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
      }
    }, 500);

    // Update navbar height on resize
    const handleResize = () => {
      const navbar = document.querySelector('header');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Set content to visible after a short delay for a fade-in effect
    setTimeout(() => {
      setIsContentVisible(true);
    }, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch activity data based on current page and filter
  useEffect(() => {
    fetchActivity();
  }, [currentPage, activityType]);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const response = await fetchData(`api/event/transactions?page=${currentPage}&limit=50&type=${activityType}`);
      if (response.success) {
        setActivityData(response.activities || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalActivities(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    if (type !== activityType) {
      setActivityType(type);
      setCurrentPage(1); // Reset to first page when changing filters
    }
  };

  // Format date to be more readable and show time in short format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    // If less than a minute, show in seconds
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }

    // If less than an hour, show in minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    // If less than a day, show in hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    // If less than a week, show in days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }

    // Otherwise show the full date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`activity-page min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}>
      <div className="max-w-[1330px] mx-auto relative">
        <div className="flex">
          {/* Sidebar placeholder to maintain layout with fixed sidebar */}
          <div className="hidden md:block md:w-[250px] shrink-0">
            {/* This is just a placeholder that takes up space */}
          </div>

          {/* Main scrollable content area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <main className="px-4 pt-32 sm:pt-40 md:pt-36 flex gap-5">
              {/* Main content area */}
              <div className="flex-1">
                {/* Page header with filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                  <h1 className={`${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-2xl font-medium`}>
                    Activity Feed
                  </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left column: Activity data */}
                  <div className="flex-1 min-w-0">
                    {/* Activity list */}
                    <div className={`transition-opacity duration-500 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                      {isLoading ? (
                        <div className={`flex justify-center py-8 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
                          <div className="animate-pulse">
                            Loading activity data...
                          </div>
                        </div>
                      ) : activityData.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <i className="ri-bar-chart-2-line text-4xl sm:text-5xl mb-4"></i>
                          <p className="text-base sm:text-lg text-center px-4">
                            No activity data available
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 rounded-md overflow-hidden ">
                            {activityData.map((activity) => (
                              <div
                                key={activity.id}
                                className={`flex justify-between items-center py-4 px-4 flex-wrap gap-2 sm:flex-nowrap ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'} transition-colors`}
                              >
                                <div className="flex items-center">
                                  {activity?.profile_image ?
                                    <img
                                      src={activity?.profile_image || "https://example.com/default-profile.jpg"}
                                      alt={activity?.name || "User"}
                                      className="w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://example.com/default-profile.jpg";
                                      }}
                                    />
                                    :
                                    <div className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'} animate-pulse`}></div>
                                  }
                                  <div className="ml-3 sm:ml-6">
                                    <div className={`font-medium text-[16px] sm:text-[18px] ${isDarkMode ? 'text-[#C5C5C5]' : 'text-[#2b2d2e]'}`}>
                                      {activity.name}
                                    </div>
                                    <div className={`max-w-full sm:max-w-[600px] ${isDarkMode ? 'text-[#C5C5C5]/80' : 'text-[#2b2d2e]'} text-[14px] sm:text-[16px] font-normal line-clamp-2 sm:line-clamp-1`}>
                                      {activity.comments}
                                    </div>
                                    {activity.event_title && (
                                      <div
                                        className="text-[#4169E1] text-xs sm:text-sm mt-1 hover:underline cursor-pointer"
                                        onClick={() => navigate(`/market/details/${activity.event_id}`)}
                                      >
                                        {activity.event_title}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className={`w-full sm:w-auto ${isDarkMode ? 'text-[#C5C5C5]/50' : 'text-[#2b2d2e]/50'} text-[14px] sm:text-[16px] font-normal text-right sm:text-right`}>
                                  {formatDate(activity.created_at)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
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
            right: 'calc((100% - 1330px) / 2)',
            top: `${navbarHeight + 32}px`,  // Added 16px spacing at the top
            height: `calc(100vh - ${navbarHeight + 64}px)`, // Added 32px for spacing (16px top + 16px bottom)
          }}
        >
          <div className="h-full ">
            <TwitterTrend
              title="Trend Watch"
              className="h-full py-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;