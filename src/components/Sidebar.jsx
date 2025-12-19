import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("thoughts");
  const [leftOffset, setLeftOffset] = useState(0);
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const location = useLocation();
          const isLogin = useSelector((state) => state.user.isLogin);
  

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === "/thoughts") {
      setActiveItem("home");
    } else if (currentPath === "/thoughts/latest") {
      setActiveItem("commentary");
    } else if (currentPath === "/thoughts/market-ideas") {
      setActiveItem("marketideas");
    } else if (currentPath === "/activity") {
      setActiveItem("activity");
    } else if (currentPath === "/bookmarks") {
      setActiveItem("bookmark");
    } else if (currentPath === "/dashboard") {
      setActiveItem("profile");
    } else {
      setActiveItem("home");
    }
  }, [location.pathname]);

  useEffect(() => {
    const calculateSidebarPosition = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth > 1350) {
        const containerLeftMargin = (windowWidth - 1350) / 2;
        setLeftOffset(containerLeftMargin);
      } else {
        setLeftOffset(0);
      }
    };

    calculateSidebarPosition();
    window.addEventListener("resize", calculateSidebarPosition);

    return () => {
      window.removeEventListener("resize", calculateSidebarPosition);
    };
  }, []);

  const menuItems = [
    { id: "home", icon: "/homeIcon.svg", label: "Home", path: "/thoughts" },
    { id: "commentary", icon: "/replyIcon.svg", label: "Commentary", path: "/thoughts/latest" },
    { id: "marketideas", icon: "/market-ideas.svg", label: "Market Ideas", path: "/thoughts/market-ideas" },
    { id: "activity", icon: "/Streamline Graph.svg", label: "Activity", path: "/activity" },
    // { id: "bookmark", icon: "/bookmarkIcon.svg", label: "Bookmark", path: "/bookmarks" },
    { id: "profile", icon: "/profileIcon.svg", label: "Profile", path: "/dashboard" },
  ];

  const handleMenuItemClick = (item, event) => {
    if (item.id === "bookmark" || item.id === "profile") {
      if (!isLogin) {
        event.preventDefault();
        window.dispatchEvent(new Event("open-login-dialog"));
        return;
      }
    }
    setActiveItem(item.id);
  };

  return (
    <div
      className={`fixed top-[7rem] self-start min-w-[70px] md:min-w-[230px] lg:min-w-[230px] h-[calc(100vh-7rem)] flex flex-col justify-start px-4 py-8 hidden md:flex 
      transition-all duration-500`}
    >
      <h2
        className={`${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"} text-[30px] font-medium mb-8 ml-[2px] hidden md:block`}
      >
        Menu
      </h2>
      <nav className="w-full">
        <ul className="space-y-3 w-full">
          {menuItems.map((item) => (
            <li key={item.id} className="w-full">
              <Link
                to={item.path}
                onClick={(e) => handleMenuItemClick(item, e)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 w-full relative
                  ${activeItem === item.id
                    ? "text-white bg-[#FF161A] shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : isDarkMode
                      ? "text-[#C5C5C5] hover:text-white hover:bg-[#FF161A] hover:to-[#2FBAA3]/90 hover:shadow-md hover:shadow-blue-500/20"
                      : "text-zinc-800 hover:text-white  hover:bg-[#FF161A] hover:shadow-md hover:shadow-blue-400/20"
                  }
                `}
              >
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className={`transition-all w-[20px] h-[20px]
                    ${activeItem === item.id
                      ? "filter invert brightness-0 saturate-100 contrast-200"
                      : "group-hover:filter group-hover:invert group-hover:brightness-0 group-hover:saturate-100 group-hover:contrast-200"
                    }`}
                />
                <span className="font-medium text-[18px] whitespace-nowrap overflow-hidden text-ellipsis hidden md:inline">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Links */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-zinc-800 hidden md:block lg:hidden">
        <div className="flex flex-col space-y-3">
          <Link to="/terms" className={`text-sm ${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            Terms of Use
          </Link>
          <Link to="/privacy" className={`text-sm ${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            Privacy
          </Link>
          <Link to="/help" className={`text-sm ${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            Help
          </Link>
          <Link to="/investors" className={`text-sm ${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            Investors
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 mt-4">
          <a href="mailto:beta@soundbet.com" aria-label="Email" className={`${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            <i className="ri-mail-line"></i>
          </a>
          <a href="https://x.com/soundbetofficial" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className={`${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            <i className="ri-twitter-x-line"></i>
          </a>
          <a href="https://www.instagram.com/soundbetofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            <i className="ri-instagram-line"></i>
          </a>
          <a href="https://tiktok.com/soundbetofficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={`${isDarkMode ? "text-[#C5C5C5] hover:text-white" : "text-zinc-600 hover:text-[#274ECC]"}`}>
            <i className="ri-tiktok-line"></i>
          </a>
        </div>

        <div className={`text-xs mt-4 ${isDarkMode ? "text-[#C5C5C5]/70" : "text-zinc-500"}`}>
          © SOUNDBET {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
