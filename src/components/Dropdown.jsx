import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux"; // Import useSelector for accessing theme

const Dropdown = ({
  title,
  options = [],
  func,
  border,
  value,
  onChange,
  placeholder,
  width = "160px",
  showLimit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  // Check if options are objects with value/label properties or simple strings
  const isObjectOptions = options.length > 0 && typeof options[0] === "object";

  // Initialize selected option based on provided value
  useEffect(() => {
    if (value !== undefined) {
      if (isObjectOptions) {
        // For object options, find the matching option or use the value directly if it's already an object
        if (typeof value === "object" && value !== null) {
          setSelectedOption(value);
        } else {
          const option = options.find((opt) => opt.value === value);
          setSelectedOption(option || options[0]);
        }
      } else {
        // For string options, just use the value
        setSelectedOption(value);
      }
    } else if (options.length > 0) {
      // Default to first option if no value is provided
      setSelectedOption(options[0]);
    }
  }, [value, options, isObjectOptions]);

  // Handle mouse leave to close dropdown
  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // Handle option selection
  const handleOptionSelect = (option, event) => {
    event.stopPropagation();
    setSelectedOption(option);
    setIsOpen(false);

    if (onChange) {
      if (isObjectOptions) {
        onChange(option);
      } else {
        // For string options, just pass the string value
        onChange(option);
      }
    } else if (func) {
      // Legacy support
      const mockEvent = {
        target: { value: isObjectOptions ? option.value : option },
      };
      func(mockEvent);
    }
  };
  // Get display text for selected option

  useEffect(() => {
    if (showLimit) {
      if (!selectedOption && options?.length > 1) {
        setSelectedOption(options[2]);
      }
    }
  }, [options]);

  const getDisplayText = () => {
    if (!selectedOption) return placeholder || "Select option";

    if (isObjectOptions) {
      const label = selectedOption.label;
      if (selectedOption.logo) return label;

      if (typeof label === "string") {
        return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      }
      return label;
    }

    if (typeof selectedOption === "string") {
      return (
        selectedOption.charAt(0).toUpperCase() +
        selectedOption.slice(1).toLowerCase()
      );
    }

    return selectedOption;
  };

  return (
    <div
      className="relative w-auto"
      ref={dropdownRef}
      onClick={() => {
        if (window.innerWidth < 768) {
          // Only trigger click for mobile (< md)
          setIsOpen(true);
        }
      }}
      onMouseEnter={() => {
        if (window.innerWidth >= 768) {
          // Only trigger hover for desktop (≥ md)
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) {
          // Only trigger hover close for desktop (≥ md)
          handleMouseLeave();
        }
      }}>
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded transition-colors duration-200 border border-transparent hover:cursor-pointer ${
          isDarkMode ? "text-[#C5C5C5]" : ""
        } hide-scrollbar`}>
        <div className="flex items-center">
          {isObjectOptions && selectedOption?.logo && (
            <img
              src={selectedOption.logo}
              alt={selectedOption.label}
              className="w-5 h-5 object-contain mr-2"
            />
          )}
          <span className="text-[15px] font-bold mr-1">{getDisplayText()}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          } ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown options with animation - right to left */}
      <div
        style={{ width }}
        className={`absolute right-0 top-full ${
          isDarkMode
            ? "bg-[#1A1B1E] border-[#2e2e2e]"
            : "bg-white border-gray-200"
        } rounded-lg border shadow-lg z-50 overflow-y-auto transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-60 opacity-100 translate-x-0"
            : "max-h-0 opacity-0 translate-x-2 pointer-events-none"
        }`}>
        <ul className="">
          {options.map((option, index) => {
            const optionValue = isObjectOptions ? option.value : option;
            const optionLabel = isObjectOptions ? option.label : option;
            const isSelected = isObjectOptions
              ? selectedOption && selectedOption.value === optionValue
              : selectedOption === option;

            // Preserve label case when logo provided
            const formattedLabel =
              isObjectOptions && option.logo
                ? optionLabel
                : typeof optionLabel === "string"
                ? optionLabel.charAt(0).toUpperCase() +
                  optionLabel.slice(1).toLowerCase()
                : optionLabel;

            return (
              <li
                key={index}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  isDarkMode
                    ? isSelected
                      ? "bg-[#FF4215] text-[#fff] font-medium"
                      : "hover:bg-[#f3866b] text-[#fff]"
                    : isSelected
                    ? "bg-[#FF4215] text-[#fff] font-medium"
                    : "hover:bg-gray-50"
                } ${index === 0 ? "rounded-t-md" : ""} ${
                  index === options.length - 1 ? "rounded-b-md" : ""
                }`}
                onClick={(e) => handleOptionSelect(option, e)}>
                <div className="flex items-center">
                  {isObjectOptions && option.logo && (
                    <img
                      src={option.logo}
                      alt={option.label}
                      className="w-5 h-5 object-contain mr-2"
                    />
                  )}
                  {formattedLabel}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
