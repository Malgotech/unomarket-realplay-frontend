import React from "react";
import { useSelector } from "react-redux";
import flagIcon from "../images/flag-img.svg";
import logoDark from "../images/logo-dark-mode.svg";
import logoLight from "../images/logo-light-mode.svg";
import { IoMdArrowDropdown } from "react-icons/io";
import graphImg from "../images/graph-img.svg";
import { IoIosArrowForward } from "react-icons/io";
import Chart from "react-apexcharts";

const cards = [
  { id: 1, title: "Biden's approval rating drops to 42%", percentage: 26 },
  { id: 2, title: "Biden's approval rating drops to 42%", percentage: 26 },
  { id: 3, title: "Biden's approval rating drops to 42%", percentage: 26 },
];

const data = [
  {
    id: 1,
    date: "29",
    month: "Aug",
    title: "AVCVGTG",
    subtitle: "Legislative Assembly",
    parties: [
      { percentage: "50%", name: "HRPP", flag: flagIcon },
      { percentage: "30%", name: "XYZ", flag: flagIcon },
      { percentage: "20%", name: "ABC", flag: flagIcon },
    ],
  },
  {
    id: 2,
    date: "29",
    month: "Aug",
    title: "AVCVGTG",
    subtitle: "Legislative Assembly",
    parties: [
      { percentage: "50%", name: "HRPP", flag: flagIcon },
      { percentage: "30%", name: "XYZ", flag: flagIcon },
      { percentage: "20%", name: "ABC", flag: flagIcon },
    ],
  },
];

const Macro = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const value = 26; // dummy fixed value
  const radius = 50;
  const circumference = Math.PI * radius; // half circle length
  const offset = circumference - (value / 100) * circumference;

  return (
    <section className="w-full h-auto flex flex-col items-start justify-start gap-6">
      <h2
        className={` text-[26px] lg:text-[32px] font-bold   ${
          isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
        } `}>
        Global Elections
      </h2>

      <div
        className={`w-full max-h-full p-5 rounded-[8px] ${
          isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
        }`}>
        <div className="w-full flex justify-between items-center">
          <div className="max-w-full flex justify-start items-center gap-2">
            <img src={flagIcon} alt="flag" width={48} height={48} />

            <p
              className={`w-[200px] text-[16px] font-semibold ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}>
              {`What will trump say durting events with Soutrh Korean President on`.slice(
                0,
                40
              )}
              {`What will trump say durting events with Soutrh Korean President on`
                .length > 40 && "..."}
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

      <div className="w-full h-auto flex flex-col items-start justify-start gap-6">
        <div className="w-full  flex justify-between items-center">
          <h2
            className={` text-[26px] lg:text-[32px] font-bold   ${
              isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
            } `}>
            Key Elections
          </h2>

          <button className="w-[120px] h-[45px] bg-[#FFFFFF] flex justify-center items-center gap-1 rounded-[8px] text-[16px]  font-bold text-[#111113]">
            View All
            <IoIosArrowForward />
          </button>
        </div>
        <div className="w-full max-h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const offset =
              circumference - (card.percentage / 100) * circumference;

            return (
              <div
                key={card.id}
                className={`shadow-md rounded-xl p-6 ${
                  isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
                }`}>
                {/* Header */}
                <div className="w-full flex justify-start items-center gap-2">
                  <img src={flagIcon} alt="flag" width={30} height={30} />
                  <p
                    className={`text-[16px] font-normal flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}>
                    {card.title}
                  </p>
                </div>

                {/* Gauge */}
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
                  <span className="text-xl font-semibold -mt-6">
                    {card.percentage}%
                  </span>
                  {/* Label */}
                  <span className="text-gray-500 text-sm">chance</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-auto flex flex-col items-start justify-start gap-6">
        <div className="w-full  flex justify-between items-center">
          <h2
            className={` text-[26px] lg:text-[32px] font-bold   ${
              isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
            } `}>
            Economy
          </h2>

          <button className="w-[120px] h-[45px] bg-[#FFFFFF] flex justify-center items-center gap-1 rounded-[8px] text-[16px]  font-bold text-[#111113]">
            View All
            <IoIosArrowForward />
          </button>
        </div>

        <div className="w-full h-auto grid grid-cols-1 lg:grid-cols-2  gap-3">
          {data.map((item) => (
            <div
              key={item.id}
              className={`shadow-md rounded-xl p-6 ${
                isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
              }`}>
              {/* Header */}
              <div className="w-full h-auto flex justify-between items-center">
                <div className="w-fit flex justify-start items-center gap-3">
                  <p
                    className={`text-[24px] font-bold flex flex-col justify-start items-start leading-[30px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}>
                    {item.date}
                    <span className="text-[16px] !text-[#C5C5C5]">
                      {item.month}
                    </span>
                  </p>

                  <p
                    className={`text-[20px] font-bold flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}>
                    {item.title}
                    <span className="text-[16px] font-normal !text-[#C5C5C5]">
                      {item.subtitle}
                    </span>
                  </p>
                </div>
                <img src={flagIcon} width={48} height={48} alt="flag" />
              </div>

              {/* Progress Bars */}
              <div className="w-full h-auto flex flex-col items-start justify-start gap-2 mt-3">
                {item.parties.map((party, idx) => (
                  <div
                    key={idx}
                    className={`w-full h-14 rounded-[8px] relative overflow-hidden ${
                      isDarkMode ? "bg-[#09090B]" : "bg-[#EEEEEE]"
                    }`}>
                    <div
                      className="h-full bg-[#CFE7FC] rounded-[8px]"
                      style={{ width: party.percentage }}
                    />
                    <div className="w-full h-full absolute top-0 left-0 flex justify-start items-center gap-2 px-3">
                      <p className="text-[16px] font-semibold !text-[#7E7E80]">
                        {party.percentage}
                      </p>
                      <img
                        src={party.flag}
                        width={30}
                        height={30}
                        alt="flag"
                        className="rounded-full"
                      />
                      <p className="text-[16px] font-normal !text-[#7E7E80]">
                        {party.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>


      
      <div className="w-full h-auto flex flex-col items-start justify-start gap-6">
        <div className="w-full  flex justify-between items-center">
          <h2
            className={` text-[26px] lg:text-[32px] font-bold   ${
              isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
            } `}>
            Key Elections
          </h2>

          <button className="w-[120px] h-[45px] bg-[#FFFFFF] flex justify-center items-center gap-1 rounded-[8px] text-[16px]  font-bold text-[#111113]">
            View All
            <IoIosArrowForward />
          </button>
        </div>
        <div className="w-full max-h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const offset =
              circumference - (card.percentage / 100) * circumference;

            return (
              <div
                key={card.id}
                className={`shadow-md rounded-xl p-6 ${
                  isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
                }`}>
                {/* Header */}
                <div className="w-full flex justify-start items-center gap-2">
                  <img src={flagIcon} alt="flag" width={30} height={30} />
                  <p
                    className={`text-[16px] font-normal flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}>
                    {card.title}
                  </p>
                </div>

                {/* Gauge */}
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
                  <span className="text-xl font-semibold -mt-6">
                    {card.percentage}%
                  </span>
                  {/* Label */}
                  <span className="text-gray-500 text-sm">chance</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </section>
  );
};

export default Macro;
