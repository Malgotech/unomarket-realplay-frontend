import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const MobileSidebar = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isLogin = useSelector((state) => state.user.isLogin);


  // Set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === '/thoughts') {
      setActiveItem('home');
    } else if (currentPath === '/thoughts/latest') {
      setActiveItem('commentary');
    } else if (currentPath === '/thoughts/market-ideas') {
      setActiveItem('marketideas');
    } else if (currentPath === '/activity') {
      setActiveItem('activity');
    }

    // else if (currentPath === '/bookmarks') {
    //   setActiveItem('bookmark');
    // }

    else if (currentPath === '/profile') {
      setActiveItem('profile');
    } else if (currentPath.startsWith('/thought/detail/')) {
      // For thought detail pages, highlight commentary since they're related to discussions
      setActiveItem('commentary');
    } else {
      // Default to home for thoughts-related paths
      setActiveItem('home');
    }
  }, [location.pathname]);

  // Mobile sidebar menu items
  const menuItems = [
    { id: "home", icon: "/homeIcon.svg", label: "Home", path: "/thoughts" },
    { id: "commentary", icon: "/replyIcon.svg", label: "Commentary", path: "/thoughts/latest" },
    { id: "marketideas", icon: "/market-ideas.svg", label: "Market Ideas", path: "/thoughts/market-ideas" },
    { id: "activity", icon: "/Streamline Graph.svg", label: "Activity", path: "/activity" },
    // { id: "bookmark", icon: "/bookmarkIcon.svg", label: "Bookmark", path: "/bookmarks" },
    { id: "profile", icon: "/profileIcon.svg", label: "Profile", path: "/profile" },
  ];

  const handleMenuItemClick = (item, event) => {
    // Only check for bookmark or profile
    if ((item.id === "bookmark" || item.id === "profile")) {
      // Check login status (token or user in localStorage)

      if (!isLogin) {
        event.preventDefault();
        window.dispatchEvent(new Event("open-login-dialog"));
        return;
      }
    }
    setActiveItem(item.id);
  };

  // Only show on thoughts-related pages
  const shouldShowSidebar = () => {
    const thoughtsPages = ['/thoughts', '/thoughts/latest', '/thoughts/market-ideas', '/activity', '/bookmarks', '/profile', '/thought/detail/'];
    return thoughtsPages.some(page => location.pathname.startsWith(page));
  };

  if (!shouldShowSidebar()) {
    return null;
  }

  return (
    <div className={`fixed left-0 top-[7rem] w-16 h-[calc(100vh-7rem)] ${isDarkMode ? 'bg-[#1A1B1E] border-zinc-600' : 'bg-white border-gray-300'} border-r flex flex-col items-center py-4 z-10 md:hidden`}>
      <nav className="w-full">
        <ul className="space-y-3 w-full flex flex-col items-center">
          {menuItems.map((item) => (
            <li key={item.id} className="w-full flex justify-center">
              <Link
                to={item.path}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${activeItem === item.id
                  ? isDarkMode
                    ? "text-blue-400 bg-blue-900/20"
                    : "text-blue-600 bg-blue-50"
                  : isDarkMode
                    ? "text-[#C5C5C5] hover:text-[#C5C5C5]/80 hover:bg-zinc-800"
                    : "text-zinc-800 hover:text-zinc-500 hover:bg-gray-100"
                  }`}
                onClick={(e) => handleMenuItemClick(item, e)}
                title={item.label}
              >
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className={`w-5 h-5 transition-all ${isDarkMode
                    ? 'filter invert brightness-75 contrast-150'
                    : activeItem === item.id
                      ? 'filter brightness-0 saturate-100 invert-[37%] sepia-[92%] saturate-[2612%] hue-rotate-[217deg] brightness-[98%] contrast-[95%]'
                      : ''
                    }`}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileSidebar;