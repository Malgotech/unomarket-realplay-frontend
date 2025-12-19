import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import useSelector to access theme state

// Helper function to calculate contrast text color based on background color
const getContrastTextColor = (hexColor) => {
  // If no color is provided, return white as default
  if (!hexColor) return "#FFFFFF";

  // Remove the hash if it exists
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (perceived luminance)
  // Using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;

  // Return white for dark colors and black for light colors
  return brightness < 150 ? "#FFFFFF" : "#000000";
};

// Helper function to create a darker version of a color for non-selected state
const getDarkerColor = (hexColor) => {
  if (!hexColor) return "#444444";

  // Remove the hash if it exists
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Make the color darker by reducing RGB values
  r = Math.max(0, Math.floor(r * 0.65));
  g = Math.max(0, Math.floor(g * 0.65));
  b = Math.max(0, Math.floor(b * 0.65));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const CustomSubmitButton = (props) => {
  // Default to gray if no colors are provided
  const activeColor = props.activeColor || "#298C8C";
  const activeHoverColor = props.activeHoverColor || "#237b7b";

  // For non-active state, use a darker version of the color for better readability
  // Non-active state is shown on light gray background, so text should be darker
  const nonActiveTextColor = getDarkerColor(props.textColor || "#298C8C");

  // Get the appropriate text color for active state based on the background color
  const activeTextColor = getContrastTextColor(activeColor);

  const [title, setTitle] = useState(props.title);
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(0);

  // Get current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

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
        title === "Buy Yes" || title === "Sell Yes"
          ? "bg-[#009443]"
          : "bg-[#FF161A]"
      } ${props.className || ""}`}
      onClick={props.onClick}
      // style={props.isActive ? { backgroundColor: activeColor } : {}}
    >
      <div
        key={key}
        className={`justify-center text-base font-medium transition-all duration-300 ease-in-out ${
          visible ? "opacity-100" : "opacity-40"
        }`}
        style={
          props.isActive
            ? { color: activeTextColor }
            : { color: isDarkMode ? "#C5C5C5" : nonActiveTextColor }
        }>
          
        {props.orderType=="limit"?title:props.currentPrice?title:"No Orders, try Limit"}
      </div>
    </div>
  );
};

export default CustomSubmitButton;
