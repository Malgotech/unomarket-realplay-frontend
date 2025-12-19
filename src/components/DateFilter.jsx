import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import useSelector for theme

const DateFilter = ({ selectedDates, onDateSelect }) => {
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
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    // Check if can scroll left
    setShowLeftArrow(container.scrollLeft > 0);
    
    // Check if can scroll right - calculate more precisely
    // Allow for a small margin of error (1px) to account for rounding issues
    const canScrollRight = Math.ceil(container.scrollLeft) < Math.floor(container.scrollWidth - container.clientWidth - 1);
    setShowRightArrow(canScrollRight);
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

  // Generate dates for the next 7 days starting from the current date
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = generateDates();
  
  // Format date as "5 May" or "Today" for today
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };
  
  // Check if a date is selected
  const isDateSelected = (date) => {
    if (!selectedDates || selectedDates.length === 0) return false;
    
    return selectedDates.some(selectedDate => 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Handle date selection with multi-select support
  const handleDateClick = (date) => {
    if (!onDateSelect) return;
    
    const isSelected = isDateSelected(date);
    let newSelectedDates = [...(selectedDates || [])];
    
    if (isSelected) {
      // Remove date if already selected
      newSelectedDates = newSelectedDates.filter(selectedDate => 
        !(date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear())
      );
    } else {
      // Add date if not already selected
      newSelectedDates.push(date);
    }
    
    onDateSelect(newSelectedDates);
  };
  
  // Add scroll event listener on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    // Function to handle both scroll and resize events
    const checkScrollability = () => {
      if (!container) return;
      
      // Give browser time to calculate accurate dimensions
      setTimeout(() => {
        // Check if scroll is needed at all
        const needsScroll = container.scrollWidth > container.clientWidth;
        
        // If no scroll is needed, hide both arrows
        if (!needsScroll) {
          setShowLeftArrow(false);
          setShowRightArrow(false);
          return;
        }
        
        // Otherwise check scroll position for arrow visibility
        setShowLeftArrow(container.scrollLeft > 0);
        const canScrollRight = Math.ceil(container.scrollLeft) < Math.floor(container.scrollWidth - container.clientWidth - 1);
        setShowRightArrow(canScrollRight);
      }, 50);
    };
    
    if (container) {
      // Initial check
      checkScrollability();
      
      // Add listeners
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      
      // Also check after potential content changes
      const contentChangeTimer = setTimeout(checkScrollability, 200);
      
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        clearTimeout(contentChangeTimer);
      };
    }
  }, []);
  
  return (
    <div className="relative flex items-center">
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
        ref={scrollContainerRef}
        className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
          // Removed mask image that was causing the fading issue
        }}
      >
        {dates.map((date, index) => {
          const isToday = index === 0;
          const isSelected = isDateSelected(date);
          
          return (
            <div 
              key={date.toISOString()} 
              onClick={() => handleDateClick(date)}
              className={`rounded-full px-3 py-1 inline-flex items-center cursor-pointer transition-all duration-200 flex-shrink-0 ${
                isSelected
                  ? isDarkMode 
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-blue-100 text-blue-600'
                  : isDarkMode
                    ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">
                {isToday ? 'Today' : formatDate(date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right scroll button - only show when can scroll right */}
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

export default DateFilter;