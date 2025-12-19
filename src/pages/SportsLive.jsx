import React, { useState } from "react";
import { useSelector } from "react-redux";
import flagIcon from "../images/flag-img.svg";

const data = [
  {
    id: 1,
    date: "29",
    month: "Aug",
    title: "Home Run Leader",
    subtitle: "Legislative Assembly",
  },
  {
    id: 2,
    date: "17",
    month: "Sep",
    title: "Home Run Leader",
    subtitle: "General Election",
  },
  {
    id: 3,
    date: "15",
    month: "Sep",
    title: "Home Run Leader",
    subtitle: "General Election",
  },
];

const SportsLive = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  const [active, setActive] = useState("MLB");

  return (
    <section className="w-full h-auto flex flex-col items-start justify-start gap-3">
      <h2
        className={` text-[26px] lg:text-[32px] font-bold   ${
          isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
        } `}
      >
        Sports Dashboard
      </h2>

      <div className="w-full flex justify-start items-center gap-2">
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "MLB"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("MLB")}
        >
          MLB
        </button>
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "WNBA"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("WNBA")}
        >
          WNBA
        </button>
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "NFL"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("NFL")}
        >
          NFL
        </button>
        <button
          className={`w-[100px] h-[40px] rounded-[4px] text-[16px] font-bold   ${
            active == "EPL"
              ? "bg-[#CDDAF9] text-[#0F358A]"
              : "bg-transparent text-[#7E7E80]"
          }`}
          onClick={() => setActive("EPL")}
        >
          EPL
        </button>
      </div>

      <div
        className={`w-full max-h-full p-5 rounded-[8px] ${
          isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
        }`}
      >
        <div className="w-full flex justify-between items-center">
          <div className="max-w-full flex flex-col justify-start items-starts gap-2">
            <p
              className={`text-[28px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}
            >
              World Series Champion
            </p>
          </div>
        </div>
        <div className="max-w-full flex flex-col justify-start items-starts gap-2 mt-6">
          <div className="-w-full flex justify-between items-center gap-2">
            <div className="max-w-full flex justify-start items-center gap-2">
              <img src={flagIcon} alt="team" width={48} height={48} />
              <p
                className={`text-[18px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                Arsenal
              </p>
            </div>

            <div className="w-[40%] h-2 rounded-full  overflow-hidden">
              <div
                className="bg-[#0F358A] h-full rounded-full "
                style={{ width: "60%" }}
              />
            </div>
            <p
              className={`text-[22px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}
            >
              90%
            </p>
          </div>

          <div className="-w-full flex justify-between items-center gap-2">
            <div className="max-w-full flex justify-start items-center gap-2">
              <img src={flagIcon} alt="team" width={48} height={48} />
              <p
                className={`text-[18px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                Arsenal
              </p>
            </div>

            <div className="w-[40%] h-2 rounded-full  overflow-hidden">
              <div
                className="bg-[#F38629] h-full rounded-full "
                style={{ width: "60%" }}
              />
            </div>
            <p
              className={`text-[22px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}
            >
              90%
            </p>
          </div>

          <div className="-w-full flex justify-between items-center gap-2">
            <div className="max-w-full flex justify-start items-center gap-2">
              <img src={flagIcon} alt="team" width={48} height={48} />
              <p
                className={`text-[18px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                Arsenal
              </p>
            </div>

            <div className="w-[40%] h-2 rounded-full  overflow-hidden">
              <div
                className="bg-[#3B9168] h-full rounded-full "
                style={{ width: "60%" }}
              />
            </div>
            <p
              className={`text-[22px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}
            >
              90%
            </p>
          </div>

          <div className="-w-full flex justify-between items-center gap-2">
            <div className="max-w-full flex justify-start items-center gap-2">
              <img src={flagIcon} alt="team" width={48} height={48} />
              <p
                className={`text-[18px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                Arsenal
              </p>
            </div>

            <div className="w-[40%] h-2 rounded-full  overflow-hidden">
              <div
                className="bg-[#B2002A] h-full rounded-full "
                style={{ width: "60%" }}
              />
            </div>
            <p
              className={`text-[22px] font-semibold flex flex-col justify-start items-start leading-[30px] ${
                isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
              }`}
            >
              90%
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => (
          <div
            key={item.id}
            className={`shadow-md rounded-xl p-6 ${
              isDarkMode ? "bg-[#1a1b1e]" : "bg-[#FAFAFA]"
            }`}
          >
            {/* Header */}
            <div className="w-full h-auto flex flex-col justify-start items-center">
              <p
                className={`w-full text-[20px] font-bold flex flex-col justify-start items-start leading-[26px] ${
                  isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                }`}
              >
                {item.title}
              </p>

              <div className="w-full flex flex-col justify-start items-center gap-2 mt-4">
                <div className="w-full flex  justify-between items-center gap-2">
                  <p
                    className={`  text-[16px] font-medium flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}
                  >
                    Arsenal
                  </p>
                  <p
                    className={`  text-[16px] font-medium flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}
                  >
                    809%
                  </p>
                </div>
                <div className="w-full flex  justify-between items-center gap-2">
                  <p
                    className={`  text-[16px] font-medium flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}
                  >
                    Arsenal
                  </p>
                  <p
                    className={`  text-[16px] font-medium flex flex-col justify-start items-start leading-[26px] ${
                      isDarkMode ? "text-[#FAFAFA]" : "text-[#111113]"
                    }`}
                  >
                    809%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SportsLive;
