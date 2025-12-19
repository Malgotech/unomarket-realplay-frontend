import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import useSelector to access theme state

const RedButton = (props) => {
  const [title, setTitle] = useState(props.title);
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(0);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  useEffect(() => {
    // If the title prop changes
    if (props.title !== title) {
      // Start fade out
      setVisible(false);

      // After fade out completes, update title and fade in
      const timer = setTimeout(() => {
        setTitle(props.title);
        setKey((prevKey) => prevKey + 1);
        setVisible(true);
      }, 300); // increased to match new transition duration

      return () => clearTimeout(timer);
    }
  }, [props.title, title]);

  return (
    <div
      className={`h-[50px] w-full px-2 py-3 rounded-[8px] inline-flex justify-center items-center gap-2.5 hover:cursor-pointer transition-all duration-200 ease-in-out hover:brightness-90 active:brightness-85 ${
        props.isActive
          ? "bg-[#FF161A]"
          : isDarkMode
          ? "bg-[#EDC4CE]/10"
          : "bg-[#e0e0e0]"
      } ${props.className || ""}`}
      onClick={props.onClick}
    >
      <div
        key={key}
        className={`justify-center text-base font-medium transition-all duration-300 ease-in-out ${
          props.isActive
            ? "text-[#fff]"
            : isDarkMode
            ? "text-[#fff]"
            : "text-[#000]"
        } ${visible ? "opacity-100" : "opacity-40"}`}
      >
        {title}
      </div>
    </div>
  );
};

export default RedButton;
