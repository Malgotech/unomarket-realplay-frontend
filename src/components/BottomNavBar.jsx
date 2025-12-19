import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoMdStats } from "react-icons/io";

const BottomNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const isActive = (route) => {
    if (route === "/" && path === "/") return true;
    if (route !== "/" && path.startsWith(route)) return true;
    return false;
  };

  const activeColor = "#4169e1"; // Active icon color
  const inactiveColor = "#2b2d2e"; // Inactive icon color

  const isLogin = useSelector((state) => state.user.isLogin);

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleProfileClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      window.dispatchEvent(new Event("open-login-dialog"));
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-[1100px]:block hidden">
      <div
        className={`w-full py-3 ${
          isDarkMode
            ? "bg-[#1A1B1E] shadow-[0px_-1px_9px_0px_rgba(0,0,0,0.3)]"
            : "bg-[#f6f6f6] shadow-[0px_-1px_9px_0px_rgba(137,137,137,0.12)]"
        } flex justify-between items-center overflow-hidden px-4`}>
        {/* Home Icon */}

        <Link to="/" className="w-7 h-7 flex items-center justify-center">
          <img
            src="/home.svg"
            alt="Home"
            className="w-7 h-7 ml-3"
            style={{
              filter: isActive("/")
                ? "brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(3613%) hue-rotate(343deg) brightness(100%) contrast(101%)"
                : isDarkMode
                ? "invert(78%) sepia(11%) saturate(124%) hue-rotate(179deg) brightness(89%) contrast(91%)"
                : "none",
            }}
          />
        </Link>

        {/* Markets Icon */}
        <Link
          to="/market/all"
          className="w-7 h-7 flex items-center justify-center">
          <IoMdStats
            className="w-7 h-7"
            style={{
              filter: isActive("/market")
                ? "brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(3613%) hue-rotate(343deg) brightness(100%) contrast(101%)"
                : isDarkMode
                ? "invert(78%) sepia(11%) saturate(124%) hue-rotate(179deg) brightness(89%) contrast(91%)"
                : "none",
            }}
          />
        </Link>

        <div
          onClick={handleSearchClick}
          className="w-7 h-7 flex items-center justify-center cursor-pointer">
          <img
            src="/search.svg"
            alt="Search"
            className="w-7 h-7"
            style={{
              filter: isActive("/search")
                ? "brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(3613%) hue-rotate(343deg) brightness(100%) contrast(101%)"
                : isDarkMode
                ? "invert(78%) sepia(11%) saturate(124%) hue-rotate(179deg) brightness(89%) contrast(91%)"
                : "none",
            }}
          />
        </div>

        {/* Thoughts Icon */}
        <Link
          to="/thoughts"
          className="w-7 h-7 flex items-center justify-center">
          <img
            src="/thoughts.svg"
            alt="Thoughts"
            className="w-7 h-7"
            style={{
              filter: isActive("/thoughts")
                ? "brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(3613%) hue-rotate(343deg) brightness(100%) contrast(101%)"
                : isDarkMode
                ? "invert(78%) sepia(11%) saturate(124%) hue-rotate(179deg) brightness(89%) contrast(91%)"
                : "none",
            }}
          />
        </Link>

        {/* Profile Icon */}
        <div
          onClick={handleProfileClick}
          className="w-7 h-7 flex items-center justify-center cursor-pointer">
          <img
            src="/profile.svg"
            alt="Profile"
            className="w-7 h-7 mr-1"
            style={{
              filter: isActive("/dashboard")
                ? "brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(3613%) hue-rotate(343deg) brightness(100%) contrast(101%)"
                : isDarkMode
                ? "invert(78%) sepia(11%) saturate(124%) hue-rotate(179deg) brightness(89%) contrast(91%)"
                : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;
