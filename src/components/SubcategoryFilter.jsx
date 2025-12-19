import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from "react-redux"; // Import useSelector for theme

const SubcategoryFilter = ({ subcategories, selectedSubcategories, onSelectSubcategory }) => {
  // Get current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef(null);
  
  // State to track scroll position and determine if arrows should be shown
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Handle scroll event to determine arrow visibility
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < (container.scrollWidth - container.clientWidth - 10));
    }
  };
  
  // Scroll left/right on arrow click
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Add scroll event listener on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check for arrows
      handleScroll();
      
      // Check again after content might have changed
      setTimeout(handleScroll, 100);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [subcategories]);
  
  if (!subcategories || subcategories.length === 0) {
    return null; // Don't render if there are no subcategories
  }

  return (
    <div className="relative">
      {/* Left arrow with gradient overlay */}
      {showLeftArrow && (
        <>
          <div className={`absolute left-0 top-0 h-full w-15 z-[5] pointer-events-none transition-opacity duration-300 ${
            isDarkMode ? 'bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent' : 'bg-gradient-to-r from-white via-white/80 to-transparent'
          }`}></div>
          <button 
            onClick={scrollLeft}
            className={`absolute left-1 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
            }`}
            aria-label="Scroll left"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        </>
      )}
      
      {/* Scrollable container */}
      <div 
        className="flex items-center overflow-x-auto scrollbar-hide py-2 gap-2"
        ref={scrollContainerRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      <button
        onClick={() => onSelectSubcategory([])} // Passing empty array to signify "All"
        className={`rounded-full px-3 py-1 inline-flex items-center cursor-pointer transition-all duration-200 flex-shrink-0 mx-1 ${ // Added flex-shrink-0 and margin
          !selectedSubcategories.length // Active if no subcategory is selected (i.e., "All")
            ? isDarkMode 
              ? 'bg-blue-600/20 text-blue-400' // Matched DateFilter selected style (dark)
              : 'bg-blue-100 text-blue-600'    // Matched DateFilter selected style (light)
            : isDarkMode
              ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700' // Matched DateFilter unselected style (dark)
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700' // Matched DateFilter unselected style (light)
        }`}
      >
        <span className="text-sm font-medium">All</span> {/* Matched DateFilter text style */}
      </button>
      {subcategories.map((subcategory) => (
        <button
          key={subcategory.id}
          onClick={() => {
            // Toggle selection logic for multi-select
            if (selectedSubcategories.includes(subcategory.id)) {
              onSelectSubcategory(selectedSubcategories.filter(id => id !== subcategory.id));
            } else {
              onSelectSubcategory([...selectedSubcategories, subcategory.id]);
            }
          }}
          className={`rounded-full px-3 py-1 inline-flex items-center cursor-pointer transition-all duration-200 flex-shrink-0 mx-1 ${ // Added flex-shrink-0 and margin
            selectedSubcategories.includes(subcategory.id)
              ? isDarkMode 
                ? 'bg-blue-600/20 text-blue-400' // Matched DateFilter selected style (dark)
                : 'bg-blue-100 text-blue-600'    // Matched DateFilter selected style (light)
              : isDarkMode
                ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700' // Matched DateFilter unselected style (dark)
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700' // Matched DateFilter unselected style (light)
          }`}
        >
          <span className="text-sm font-medium">{subcategory.name}</span> {/* Matched DateFilter text style */}
        </button>
      ))}
      </div>
      
      {/* Right arrow with gradient overlay */}
      {showRightArrow && (
        <>
          <div className={`absolute right-0 top-0 h-full w-15 z-[5] pointer-events-none transition-opacity duration-300 ${
            isDarkMode ? 'bg-gradient-to-l from-[#121212] via-[#121212]/80 to-transparent' : 'bg-gradient-to-l from-white via-white/80 to-transparent'
          }`}></div>
          <button 
            onClick={scrollRight}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
            }`}
            aria-label="Scroll right"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        </>
      )}
    </div>
  );
};

export default SubcategoryFilter;