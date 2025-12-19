import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector } from "react-redux";
import flagIcon from "../images/flag-img.svg";
import logoDark from "../images/logo-dark-mode.svg";
import logoLight from "../images/logo-light-mode.svg";
import graphImg from "../images/bar-chart-img.svg";
import linegraphImg from "../images/line-chart-img.svg";

const FedRates = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const value = 26; // dummy fixed value
  const radius = 50;
  const circumference = Math.PI * radius; // half circle length
  const offset = circumference - (value / 100) * circumference;

  const [active, setActive] = useState("sep");
  return (
    <section className="w-full h-auto flex flex-col items-start justify-start gap-3">
      <h2
        className={` text-[26px] lg:text-[32px] font-bold   ${
          isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
        } `}>
        Fed Rates
      </h2>
      <p
        className={` text-[16px]   font-medium   ${
          isDarkMode ? "text-[#FAFAFA]" : "text-[#7E7E80]"
        } `}>
        What will the Fed do at the upcoming meetings?
      </p>

      <div className="w-full flex justify-start items-center gap-2">
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "sep"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("sep")}>
          Sep 17
        </button>
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "oct"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("oct")}>
          Oct 17
        </button>
      </div>

      <div
        className={`w-full max-h-full rounded-xl p-6 mt-4 flex justify-between items-center gap-3 ${
          isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
        }`}>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-3  ">
          <div className="max-w-full h-auto flex flex-col justify-start items-start gap-3">
            <p
              className={`text-[16px] font-normal flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              EXPECTED DECISION
            </p>
            <p
              className={`text-[28px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              Cut by 25 bps
            </p>
          </div>

          <div className="flex flex-col items-center mt-3">
            <svg className="w-32 h-16" viewBox="0 0 120 60">
              {/* Background track */}
              <path
                d="M10,60 A50,50 0 0,1 110,60"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <path
                d="M10,60 A50,50 0 0,1 110,60"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>

            {/* Percentage text */}
            <span className="text-xl font-semibold -mt-6">44%</span>
            {/* Label */}
            <span className="text-gray-500 text-sm">chance</span>
          </div>

          <div className="max-w-full flex flex-col lg:flex-row justify-end items-center gap-1 lg:gap-3  ">
            <p
              className={`text-[12px] lg:text-[16px] font-bold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#7E7E80]"
              }`}>
              EXPECTED DECISION
            </p>

            <div className="max-w-full flex  justify-end items-center gap-1 lg:gap-3  ">
              <div
                className={`w-[51px] h-[60px] rounded-[8px] flex flex-col justify-center items-center gap-1 ${
                  isDarkMode ? "!bg-[#09090B]" : "!bg-[#EEEEEE]"
                }`}>
                <p
                  className={`text-[16px] font-bold  ${
                    isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                  }`}>
                  22
                </p>
                <p
                  className={`text-[14px] font-bold   ${
                    isDarkMode ? "text-[#7E7E80]" : "text-[#7E7E80]"
                  }`}>
                  days
                </p>
              </div>
              <div
                className={`w-[51px] h-[60px] rounded-[8px] flex flex-col justify-center items-center gap-1 ${
                  isDarkMode ? "!bg-[#09090B]" : "!bg-[#EEEEEE]"
                }`}>
                <p
                  className={`text-[16px] font-bold  ${
                    isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                  }`}>
                  22
                </p>
                <p
                  className={`text-[14px] font-bold   ${
                    isDarkMode ? "text-[#7E7E80]" : "text-[#7E7E80]"
                  }`}>
                  days
                </p>
              </div>
              <div
                className={`w-[51px] h-[60px] rounded-[8px] flex flex-col justify-center items-center gap-1 ${
                  isDarkMode ? "!bg-[#09090B]" : "!bg-[#EEEEEE]"
                }`}>
                <p
                  className={`text-[16px] font-bold  ${
                    isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                  }`}>
                  22
                </p>
                <p
                  className={`text-[14px] font-bold   ${
                    isDarkMode ? "text-[#7E7E80]" : "text-[#7E7E80]"
                  }`}>
                  days
                </p>
              </div>
              <div
                className={`w-[51px] h-[60px] rounded-[8px] flex flex-col justify-center items-center gap-1 ${
                  isDarkMode ? "!bg-[#09090B]" : "!bg-[#EEEEEE]"
                }`}>
                <p
                  className={`text-[16px] font-bold  ${
                    isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                  }`}>
                  22
                </p>
                <p
                  className={`text-[14px] font-bold   ${
                    isDarkMode ? "text-[#7E7E80]" : "text-[#7E7E80]"
                  }`}>
                  days
                </p>
              </div>
              <div
                className={`w-[51px] h-[60px] rounded-[8px] flex flex-col justify-center items-center gap-1 ${
                  isDarkMode ? "!bg-[#09090B]" : "!bg-[#EEEEEE]"
                }`}>
                <p
                  className={`text-[16px] font-bold  ${
                    isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                  }`}>
                  22
                </p>
                <p
                  className={`text-[14px] font-bold   ${
                    isDarkMode ? "text-[#7E7E80]" : "text-[#7E7E80]"
                  }`}>
                  days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full max-h-full p-5 rounded-[8px] ${
          isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
        }`}>
        <div className="w-full flex justify-between items-center">
          <div className="max-w-full flex flex-col justify-start items-starts gap-2">
            <p
              className={`text-[28px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              Fed Rates
            </p>

            <p
              className={`text-[16px] font-normal flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              Wed Sep 17, 2025 FOMC Meeting
            </p>
          </div>
          <img
            src={isDarkMode ? logoDark : logoLight}
            alt="soundbet"
            className={`h-[36px] transition-opacity duration-200 `}
            style={{ minWidth: "80px" }}
            loading="eager"
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start gap-5 mt-8">
          <p
            className={`max-w-full flex justify-start items-center gap-2    text-[16px] font-semibold ${
              isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
            }`}>
            11% chance
            <span className="max-w-full text-[12px] flex justify-start items-center ">
              <IoMdArrowDropdown className=" text-[16px]" /> 10%
            </span>
          </p>

          <img src={graphImg} alt="graph" width={1210} height={288} />
        </div>
      </div>

      <div
        className={`w-full max-h-full p-5 rounded-[8px] ${
          isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
        }`}>
        <div className="w-full flex justify-between items-center">
          <div className="max-w-full flex flex-col justify-start items-starts gap-2">
            <p
              className={`text-[28px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              Odds Over Time
            </p>

            <div className="max-w-full max-h-full flex justify-start items-center gap-2">
              <p
                className={`text-[16px] font-normal flex   justify-start items-center gap-1 leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}>
                <span className="w-2 h-2 rounded-full bg-[#F7AF72]" />
                25 bps cut 77%
              </p>
              <p
                className={`text-[16px] font-normal flex  justify-start items-center gap-1 leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}>
                <span className="w-2 h-2 rounded-full bg-[#274ECC]" />
                No change 19%
              </p>
            </div>
          </div>
          <img
            src={isDarkMode ? logoDark : logoLight}
            alt="soundbet"
            className={`h-[36px] transition-opacity duration-200 `}
            style={{ minWidth: "80px" }}
            loading="eager"
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start gap-5 mt-8">
          <img src={linegraphImg} alt="graph" width={1210} height={288} />
        </div>
      </div>
    </section>
  );
};

export default FedRates;
