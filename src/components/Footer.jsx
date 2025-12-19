import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Footer = () => {
  // Get the current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // State to track visibility
  const [isVisible, setIsVisible] = useState(false);

  // Function to toggle footer visibility
  const toggleFooter = () => {
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    // Show footer after a short delay when the page loads
    const initialTimer = setTimeout(() => {
      setIsVisible(true);

      // Then hide it again after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }, 1000);

    // Simple scroll handler that shows the footer when scrolling
    const handleScroll = () => {
      setIsVisible(true);

      // Clear any existing hide timer
      if (window.footerHideTimer) {
        clearTimeout(window.footerHideTimer);
      }

      // Set a new timer to hide the footer after scrolling stops
      window.footerHideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(initialTimer);
      if (window.footerHideTimer) {
        clearTimeout(window.footerHideTimer);
      }
    };
  }, []);

  return (
    <>
      <footer
        className={`fixed bottom-0 left-0 right-0 border-t z-40 transition-all duration-300 ease-in-out ${
          isDarkMode
            ? "border-gray-800 bg-[#121212] text-gray-400"
            : "border-gray-200 bg-white text-gray-600"
        } py-3 shadow-md ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        }`}
      >
        <div className="container w-full mx-0 px-8 max-w-[1350px] flex flex-wrap justify-between items-center text-xs">
          <div className="flex flex-wrap items-center space-x-4">
            <span className="font-medium">
              © Soundbet {new Date().getFullYear()}
            </span>
            <a href="#" className="hover:underline">
              Terms of Use
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="/docs" className="hover:underline">
              Documentation
            </a>
            {/* <a href="#" className="hover:underline">Careers</a> */}
            <a href="#" className="hover:underline">
              Investors
            </a>
          </div>
          <div className="flex space-x-3 mt-2 sm:mt-0">
            <a href="mailto:beta@soundbet.com" aria-label="Email">
              <i className="ri-mail-line text-sm"></i>
            </a>
            {/* Discord link commented as requested */}
            {/* <a href="#" aria-label="Discord"><i className="ri-discord-line text-sm"></i></a> */}
            <a
              href="https://x.com/soundbetofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter/X"
            >
              <i className="ri-twitter-x-line text-sm"></i>
            </a>
            <a
              href="https://www.instagram.com/soundbetofficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="ri-instagram-line text-sm"></i>
            </a>
            <a
              href="https://tiktok.com/soundbetofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <i className="ri-tiktok-line text-sm"></i>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
