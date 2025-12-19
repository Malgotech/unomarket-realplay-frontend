import React from "react";

const LeagueCard = ({ league, isSelected, onClick, isDarkMode }) => {
  return (
    <div 
      onClick={() => onClick(league._id)}
      className={`rounded-[8px] p-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? isDarkMode 
            ? 'bg-blue-600/20 text-blue-400'
            : 'bg-blue-100 text-blue-600'
          : isDarkMode
            ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      {league.image ? (
        <img 
          src={league.image} 
          alt={league.name} 
          className="h-7 w-7 object-contain rounded-sm"
        />
      ) : (
        <div className={`h-7 w-7 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
          {league.name.charAt(0)}
        </div>  
      )}
      <span className="text-[16px] font-medium">{league.name}</span>
    </div>
  );
};

export default LeagueCard;
