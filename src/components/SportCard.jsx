import React from "react";

const SportCard = ({ props, selectedSubcategories = [], onSubcategorySelect, isSelected, onClick, isDarkMode }) => {
  const toggleSelection = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    const isCurrentlySelected = selectedSubcategories.includes(props.id);
    
    if (onSubcategorySelect) {
      if (isCurrentlySelected) {
        // Remove from selection
        onSubcategorySelect(selectedSubcategories.filter(id => id !== props.id));
      } else {
        // Add to selection
        onSubcategorySelect([...selectedSubcategories, props.id]);
      }
    }
  };
  
  // Use the isSelected prop from parent instead of internal state
  const isCardSelected = isSelected || selectedSubcategories.includes(props.id);
  
  return (
    <div 
      onClick={toggleSelection}
      className={`rounded-[8px] p-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ${
        isCardSelected
          ? isDarkMode 
            ? 'bg-blue-600/20 text-blue-400'
            : 'bg-blue-100 text-blue-600'
          : isDarkMode
            ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      {props.image ? (
        <img 
          src={props.image} 
          alt={props.name} 
          className="h-7 w-7 object-contain rounded-sm"
        />
      ) : (
        <div className={`h-7 w-7 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
          {props.name.charAt(0)}
        </div>  
      )}
      <span className="text-[16px] font-medium">{props.name}</span>
    </div>
  );
};

export default SportCard;
