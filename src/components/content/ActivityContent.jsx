import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchData } from "../../services/apiServices";

// Activity Skeleton Component
const ActivitySkeleton = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  return (
    <div className="flex justify-between items-center py-4 animate-pulse">
      <div className="flex items-center pl-6">
        <div className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        <div className="ml-3 sm:ml-6">
          <div className={`h-4 sm:h-5 w-32 sm:w-40 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} mb-2`}></div>
          <div className={`h-3 sm:h-4 w-48 sm:w-96 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      <div className={`w-8 sm:w-12 h-3 sm:h-4 rounded ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} pr-6`}></div>
    </div>
  );
};

const ActivityContent = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activityType, setActivityType] = useState("all");
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    fetchActivity();

    // Set content to visible after a short delay for a fade-in effect
    setTimeout(() => {
      setIsContentVisible(true);
    }, 100);
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
    <div className="relative">
      <div className="relative">
        <div className="flex flex-col lg:flex-row relative max-w-full">
          {/* Left column with vertical borders extending to include the title */}
          <div className={`flex-1 min-w-0 relative w-full  border-l border-r ${isDarkMode ? 'border-zinc-600' : 'border-gray-300'}`}
            style={{ minHeight: 'calc(100vh - 100px)' }}>
            {/* Page title inside the vertical borders */}
            <h1 className={`text-[17px] sm:text-[20px]  ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'} text-2xl font-medium mb-8 px-6 relative pt-0 sm:pt-0 md:pt-0`}>
              Activity Feed
            </h1>

            {/* Content wrapper with padding */}
            <div className="px-0 relative">
              {/* Top divider line */}
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>

              {/* Activity list */}
              <div className={`transition-opacity duration-500 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                {isLoading ? (
                  <div className="space-y-0">
                    {Array(8).fill().map((_, index) => (
                      <React.Fragment key={`skeleton-${index}`}>
                        <ActivitySkeleton />
                        {index < 7 && (
                          <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                        )}
                      </React.Fragment>
                    ))}
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
                    <div className="space-y-0">
                      {activityData.map((activity, index) => (
                        <React.Fragment key={activity.id}>
                          <div
                            className={`flex justify-between items-center py-4 flex-wrap gap-2 sm:flex-nowrap ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'} transition-colors`}
                          >
                            <div className="flex items-center pl-6">
                              {activity?.profile_image ?
                                <img
                                  src={activity?.profile_image}
                                  alt={activity?.name || "User"}
                                  className="w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full object-cover"
                                  onError={(e) => {
                                    // Prevent infinite error loop
                                    e.target.onerror = null;

                                    // Get parent element to replace img with div
                                    const parent = e.target.parentNode;
                                    if (parent) {
                                      // Create the custom profile circle with initial
                                      const wrapper = document.createElement('div');
                                      wrapper.className = `w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`;

                                      const initial = document.createElement('div');
                                      initial.className = `text-[15px] font-semibold ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`;
                                      initial.textContent = activity?.name?.charAt(0)?.toUpperCase() || 'U';

                                      wrapper.appendChild(initial);

                                      // Replace the img with our custom element
                                      parent.replaceChild(wrapper, e.target);
                                    }
                                  }}
                                />
                                :
                                <div className={`w-[38px] h-[38px] sm:w-[45px] sm:h-[45px] rounded-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                                  <div className={`text-[15px] font-semibold ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                                    {activity?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                </div>
                              }
                              <div className="ml-3 sm:ml-6">
                                <div className={`font-medium text-[15px] sm:text-[17px] ${isDarkMode ? 'text-[#C5C5C5]' : 'text-[#2b2d2e]'}`}>
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
                            <div className={`w-full sm:w-auto ${isDarkMode ? 'text-[#C5C5C5]/50' : 'text-[#2b2d2e]/50'} text-[14px] sm:text-[16px] font-normal text-right sm:text-right pr-6`}>
                              {formatDate(activity.created_at)}
                            </div>
                          </div>
                          {/* Add divider line between activities except for the last one */}
                          {index < activityData.length - 1 && (
                            <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-600' : 'bg-gray-300'}`}></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Hidden on mobile, keeps layout structure */}
          {/* <div className="hidden lg:block lg:w-[360px] lg:shrink-0">
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ActivityContent;