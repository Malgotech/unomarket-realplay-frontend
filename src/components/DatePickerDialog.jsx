import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  Button, 
  Typography,
  IconButton,
  Box
} from "@mui/material";
// Using simple icons for the date navigation
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight
} from "react-icons/fi";
import { format, addMonths, subMonths, addYears, subYears, parseISO } from "date-fns";

const DatePickerDialog = ({ isOpen, onClose, date, onDateChange, title = "Set Custom Expiration" }) => {
  const initialDate = date || new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  
  // Format time for input value - HH:MM 24-hour format
  const formatTimeForInput = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const [timeValue, setTimeValue] = useState(formatTimeForInput(initialDate));
  
  // Reset state when dialog opens with a new date
  useEffect(() => {
    if (isOpen) {
      const newDate = date || new Date();
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
      setTimeValue(formatTimeForInput(newDate));
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      // Create a new date with the selected date and time
      const newDate = new Date(selectedDate);
      
      // Parse the time value (HH:MM format)
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      
      // Check if the date is valid before calling onDateChange
      if (!isNaN(newDate.getTime())) {
        onDateChange(newDate);
        onClose();
        return;
      }
      
      // Fallback to just using the selected date
      onDateChange(selectedDate);
      onClose();
    } catch (error) {
      console.error("Error setting date/time:", error);
      onDateChange(selectedDate);
      onClose();
    }
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Preserve the current time when selecting a new date
    const [hours, minutes] = timeValue.split(':').map(Number);
    newDate.setHours(hours || 0, minutes || 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevYear = () => {
    setCurrentMonth(subYears(currentMonth, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(addYears(currentMonth, 1));
  };

  const handleTimeChange = (e) => {
    setTimeValue(e.target.value);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    const days = [];
    
    // Fill in days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div 
          key={`prev-${i}`} 
          className="py-2 px-3 text-gray-300"
        >
          {/* Empty placeholder */}
        </div>
      );
    }

    // Current month's days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      days.push(
        <div 
          key={day}
          className={`py-2 px-3 cursor-pointer text-center text-base ${
            isSelected 
              ? 'rounded-md bg-[#4169e1] text-white font-bold'
              : isToday
              ? 'font-bold text-[#4169e1] border border-[#4169e1] rounded-md'
              : isPast 
              ? 'text-gray-400' 
              : 'text-gray-800 hover:bg-gray-100 hover:rounded-md'
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "#ffffff",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          maxWidth: "380px",
          width: "95%"
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Date Title */}
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: "#2b2d2e",
            fontWeight: "bold",
            mb: 2,
            fontFamily: "'IBMPlexSans', -apple-system, sans-serif"
          }}
        >
          {title}
        </Typography>

        {/* Month Navigation */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          mb: 2,
        }}>
          <IconButton onClick={handlePrevYear} sx={{ color: "#4169e1" }}>
            <FiChevronsLeft />
          </IconButton>
          <IconButton onClick={handlePrevMonth} sx={{ color: "#4169e1" }}>
            <FiChevronLeft />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#2b2d2e", 
              mx: 2, 
              fontFamily: "'IBMPlexSans', -apple-system, sans-serif",
              minWidth: "120px", 
              textAlign: "center" 
            }}
          >
            {format(currentMonth, "MMMM yyyy")}
          </Typography>
          <IconButton onClick={handleNextMonth} sx={{ color: "#4169e1" }}>
            <FiChevronRight />
          </IconButton>
          <IconButton onClick={handleNextYear} sx={{ color: "#4169e1" }}>
            <FiChevronsRight />
          </IconButton>
        </Box>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 text-center mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 mb-5">
          {renderCalendar()}
        </div>

        {/* Time Section */}
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: "#2b2d2e",
            fontWeight: "bold",
            mb: 2,
            fontFamily: "'IBMPlexSans', -apple-system, sans-serif"
          }}
        >
          Time
        </Typography>

        {/* Browser's native time picker */}
        <div className="mb-6">
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full p-3 text-xl font-medium bg-gray-50 rounded-md border border-gray-200 text-gray-800   focus:outline-none focus:border-[#4169e1]"
          />
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleSave}
          fullWidth
          sx={{
            backgroundColor: "#4169e1",
            color: "white",
            py: 1.5,
            fontWeight: "bold",
            fontSize: "16px",
            textTransform: "none",
            borderRadius: "6px",
            fontFamily: "'IBMPlexSans', -apple-system, sans-serif",
            '&:hover': {
              backgroundColor: "#3258d3"
            }
          }}
        >
          Apply
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DatePickerDialog;