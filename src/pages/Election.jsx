import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";
import newsIcon from "../images/breaking-news-icon.svg";
import earthIcon from "../images/earth-icon.svg";
import sportsIcon from "../images/sports-icon.svg";
import fedIcon from "../images/fed-icon.svg";

const Election = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const location = useLocation();

  return (
    <div
      className={`sports-page w-full  max-h-full lg:min-h-screen  ${
        isDarkMode ? "bg-[#121212]" : ""
      }`}
    >
      <main className="container w-full mx-0 px-2 sm:px-4 pt-34  pb-16 sm:pt-34  md:pt-34 max-w-[1500px]">
        <div className="w-full h-auto flex flex-col lg:flex-row justify-start items-start gap-5">
          {/* Sidebar */}
          <section className="w-full lg:w-[250px] h-auto flex flex-col justify-start items-start gap-4 sm:static lg:sticky top-33">
            <p className="text-[18px] font-semibold text-[#7E7E80]">
              Dashboards
            </p>

            <div className="w-full h-auto flex flex-row lg:flex-col justify-start items-start gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <Link
                to="elections"
                className={`w-fit  lg:w-full h-10 lg:h-14 rounded-[8px] whitespace-nowrap  text-[16px] font-medium text-[#7E7E80]  flex justify-start items-center gap-2 px-5 
                    ${isDarkMode ? "text-[#ffff]" : " "}
                       ${
                         location.pathname === "/market/elections"
                           ? "bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)] !text-[#fff] "
                           : " "
                       }`}
              >
                <img
                  src={newsIcon}
                  alt="news"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      location.pathname === "/market/elections"
                        ? "brightness(0) saturate(100%) invert(99%) sepia(0%) saturate(5593%) hue-rotate(265deg) brightness(122%) contrast(90%)"
                        : "",
                  }}
                />
                Breaking News
              </Link>

              <Link
                to="macro"
                className={`w-fit lg:w-full h-10 lg:h-14 rounded-[8px] text-[16px]  whitespace-nowrap  font-medium text-[#7E7E80]  flex justify-start items-center gap-2 px-5 
                        ${isDarkMode ? "text-[#ffff]" : " "}
                       ${
                         location.pathname === "/market/macro"
                           ? "bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)] !text-[#fff]"
                           : " "
                       }`}
              >
                <img
                  src={earthIcon}
                  alt="earth"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      location.pathname === "/market/macro"
                        ? "brightness(0) saturate(100%) invert(99%) sepia(0%) saturate(5593%) hue-rotate(265deg) brightness(122%) contrast(90%)"
                        : "",
                  }}
                />
                Macro
              </Link>

              <Link
                to="sports-live"
                className={`w-fit lg:w-full  h-10 lg:h-14 rounded-[8px] text-[16px]  whitespace-nowrap font-medium  text-[#7E7E80] flex justify-start items-center gap-2 px-5 
                        ${isDarkMode ? "text-[#ffff]" : "text-[#7E7E80]"}
                       ${
                         location.pathname === "/market/sports-live"
                           ? "bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)] !text-[#fff]"
                           : " "
                       }`}
              >
                <img
                  src={sportsIcon}
                  alt="sports"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      location.pathname === "/market/sports-live"
                        ? "brightness(0) saturate(100%) invert(99%) sepia(0%) saturate(5593%) hue-rotate(265deg) brightness(122%) contrast(90%)"
                        : "",
                  }}
                />
                Sports
              </Link>
              <Link
                to="fed-rates"
                className={`w-fit lg:w-full  h-10 lg:h-14 rounded-[8px] text-[16px]  whitespace-nowrap font-medium  text-[#7E7E80] flex justify-start items-center gap-2 px-5 
                        ${isDarkMode ? "text-[#ffff]" : "text-[#7E7E80]"}
                       ${
                         location.pathname === "/market/fed-rates"
                           ? "bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)] !text-[#fff]"
                           : " "
                       }`}
              >
                <img
                  src={fedIcon}
                  alt="fed"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      location.pathname === "/market/fed-rates"
                        ? "brightness(0) saturate(100%) invert(99%) sepia(0%) saturate(5593%) hue-rotate(265deg) brightness(122%) contrast(90%)"
                        : "",
                  }}
                />
                Fed Rates
              </Link>
            </div>
          </section>

          {/* Right content will change */}
          <section className="flex-1 w-full">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Election;
