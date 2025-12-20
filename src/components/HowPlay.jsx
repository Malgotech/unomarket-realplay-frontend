import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import img1 from "../images/modal-img-1.svg";
import img2 from "../images/modal-img-2.svg";
import img3 from "../images/modal-img-3.svg";
import img4 from "../images/modal-img-4.svg";
import { useSwiper } from "swiper/react";

import funImg from "../images/fun-play.svg";
import realImg from "../images/real-play.svg";

// SlideContent component with Next button functionality
function SlideContent({ img, title, desc, isDarkMode, isLast, setShowMethod }) {
  const swiper = useSwiper();

  const handleNextClick = () => {
    if (isLast) {
      setShowMethod(true);
    } else {
      swiper.slideNext();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gradient Icon Box */}
      <div className="p-[1px] rounded-[12px] bg-gradient-to-br from-[#FFAE35] via-[#FF532A] to-[#FF161A]">
        <div
          className={`rounded-[12px] w-[120px] h-[120px] flex items-center justify-center ${
            isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
          } backdrop-blur-[170.677001953125px]`}>
          <img src={img} alt="icon" width={60} height={60} />
        </div>
      </div>

      {/* Text */}
      <p
        className={`text-[20px] font-bold ${
          isDarkMode ? "text-[#C5C5C5]" : "text-[#202020]"
        }`}>
        {title}
      </p>

      <p
        className={`text-[16px] font-semibold text-center leading-6 ${
          isDarkMode ? "text-[#C5C5C5]" : "text-[#202020]"
        }`}>
        {desc}
      </p>

      <button
        onClick={handleNextClick}
        className="mt-6 w-[200px] h-10 bg-[#FF4215] rounded-full text-[16px] font-normal text-white hover:bg-[#ff532a] transition-colors">
        {isLast ? "Get Started" : "Next"}
      </button>
    </div>
  );
}

export default function HowPlay({
  open,
  handleClose,
  setShowMethod,
  showMethod,
}) {
  const themeMode = useSelector((state) => state.theme.value);
  const isDarkMode = themeMode === "dark";

  const [playMethod, setPlayMethod] = React.useState();

  const slides = [
    {
      img: img1,
      title: "Browse Markets",
      desc: "Explore live questions like price predictions, event outcomes, sports results, and more.",
    },
    {
      img: img2,
      title: "Place Your Prediction",
      desc: "Choose Yes or No based on what you believe will happen. The price represents the probability.",
    },
    {
      img: img3,
      title: "Track Your Position",
      desc: "Monitor your predictions in real-time as market prices fluctuate based on incoming information.",
    },
    {
      img: img4,
      title: "Claim Your Rewards",
      desc: "When the market resolves, if you predicted correctly, claim your winnings instantly!",
    },
  ];

  const handleSelectMethod = (item) => {
    if (item == "real") {
      setPlayMethod(item);
      localStorage.setItem("playmode", item);
      handleClose();
    } else {
      window.open("https://fun.uno.market");
      handleClose();
    }
  };

  const handleModalClose = () => {
    handleClose();

    setTimeout(() => {
      setShowMethod(false);
    }, 1000);
  };

  const handleCloseAll = () => {
    handleClose();
    setShowMethod(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseAll}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "visible",
          maxHeight: "none",
          height: "auto",
        },
      }}>
      <div
        className={`w-full h-auto rounded-2xl how-modal ${
          isDarkMode ? "bg-[#1a1a1a]" : "bg-[#ffffff]"
        } shadow-lg p-4 lg:p-10`}>
        <div className="w-full flex flex-col justify-center items-center">
          {showMethod ? (
            <h1
              className={`text-[24px] lg:text-[32px] font-semibold ${
                isDarkMode ? "text-[#C5C5C5]" : "text-black"
              }`}>
              Choose how you want to
              <span className="text-[#FF4215]"> Play </span>
            </h1>
          ) : (
            <h1
              className={`text-[24px] lg:text-[32px] font-semibold ${
                isDarkMode ? "text-[#C5C5C5]" : "text-black"
              }`}>
              How
              <span className="text-[#FF4215]"> UnoMarket </span>
              Works
            </h1>
          )}
        </div>

        {showMethod ? (
          <div className="w-full h-auto flex flex-col items-center justify-center gap-2">
            <div className="w-full h-auto flex justify-center items-center gap-2 mt-10">
              <button
                className={`w-[150px] h-[150px] rounded-[12px] border-4 border-[#E6E6E6] flex flex-col items-center justify-center gap-4 ${
                  isDarkMode ? "bg-[#fff]" : ""
                } ${playMethod == "fun" ? "border-[#FF4215]" : ""} `}
                onClick={() => handleSelectMethod("fun")}>
                <img src={funImg} alt="fun" width={100} height={100} />

                <p className="text-[#000] font-bold">Fun</p>
              </button>

              <button
                className={`w-[150px] h-[150px] rounded-[12px] border-4 border-[#E6E6E6] flex flex-col items-center justify-center gap-4 ${
                  isDarkMode ? "bg-[#fff]" : ""
                } ${playMethod == "real" ? "border-[#FF4215]" : ""} `}
                onClick={() => handleSelectMethod("real")}>
                <img src={realImg} alt="real" width={100} height={100} />

                <p className="text-[#000] font-bold">Real</p>
              </button>
            </div>

            {/* <button
              onClick={handleModalClose}
              className="mt-6 w-[200px] h-10 bg-[#FF4215] rounded-full text-[16px] font-normal text-white hover:bg-[#ff532a] transition-colors">
              Get Started
            </button> */}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={40}
            className="mt-10">
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <SlideContent
                  img={slide.img}
                  title={slide.title}
                  desc={slide.desc}
                  isDarkMode={isDarkMode}
                  isLast={index === slides.length - 1}
                  setShowMethod={setShowMethod}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </Dialog>
  );
}
