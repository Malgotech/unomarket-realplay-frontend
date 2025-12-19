import React from "react";
import { useSelector } from "react-redux";
import flagImg from "../images/flag-img.svg";

const data = [
  {
    id: 1,
    date: "29",
    month: "Aug",
    title: "AVCVGTG",
    subtitle: "Legislative Assembly",
    parties: [
      { percentage: "50%", name: "HRPP", flag: flagImg },
      { percentage: "30%", name: "XYZ", flag: flagImg },
      { percentage: "20%", name: "ABC", flag: flagImg },
    ],
  },
  {
    id: 2,
    date: "15",
    month: "Sep",
    title: "XYZ Event",
    subtitle: "General Election",
    parties: [
      { percentage: "40%", name: "Party A", flag: flagImg },
      { percentage: "35%", name: "Party B", flag: flagImg },
      { percentage: "25%", name: "Party C", flag: flagImg },
    ],
  },
  {
    id: 3,
    date: "15",
    month: "Sep",
    title: "XYZ Event",
    subtitle: "General Election",
    parties: [
      { percentage: "40%", name: "Party A", flag: flagImg },
      { percentage: "35%", name: "Party B", flag: flagImg },
      { percentage: "25%", name: "Party C", flag: flagImg },
    ],
  },
  {
    id: 4,
    date: "15",
    month: "Sep",
    title: "XYZ Event",
    subtitle: "General Election",
    parties: [
      { percentage: "40%", name: "Party A", flag: flagImg },
      { percentage: "35%", name: "Party B", flag: flagImg },
      { percentage: "25%", name: "Party C", flag: flagImg },
    ],
  },
  {
    id: 5,
    date: "15",
    month: "Sep",
    title: "XYZ Event",
    subtitle: "General Election",
    parties: [
      { percentage: "40%", name: "Party A", flag: flagImg },
      { percentage: "35%", name: "Party B", flag: flagImg },
      { percentage: "25%", name: "Party C", flag: flagImg },
    ],
  },
];


const BreakingNews = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  return (
    <section className="w-full h-auto flex flex-col items-start justify-start gap-6">
      <h2 className=" text-[26px] lg:text-[32px] font-bold text-[#111113]">
        Global Elections
      </h2>

       <div className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.map((item) => (
        <div
          key={item.id}
          className={`shadow-md rounded-xl p-6 ${
            isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
          }`}
        >
          {/* Header */}
          <div className="w-full h-auto flex justify-between items-center">
            <div className="w-fit flex justify-start items-center gap-3">
              <p
                className={`text-[24px] font-bold flex flex-col justify-start items-start leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                {item.date}
                <span className="text-[16px] !text-[#C5C5C5]">{item.month}</span>
              </p>

              <p
                className={`text-[20px] font-bold flex flex-col justify-start items-start leading-[26px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                {item.title}
                <span className="text-[16px] font-normal !text-[#C5C5C5]">
                  {item.subtitle}
                </span>
              </p>
            </div>
            <img src={flagImg} width={48} height={48} alt="flag" />
          </div>

          {/* Progress Bars */}
          <div className="w-full h-auto flex flex-col items-start justify-start gap-2 mt-3">
            {item.parties.map((party, idx) => (
              <div
                key={idx}
                className={`w-full h-14 rounded-[8px] relative overflow-hidden ${
                  isDarkMode ? "bg-[#09090B]" : "bg-[#EEEEEE]"
                }`}
              >
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
    </section>
  );
};

export default BreakingNews;
