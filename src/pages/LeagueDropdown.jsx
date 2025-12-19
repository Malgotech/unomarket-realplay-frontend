import { useState, useRef, useEffect } from "react";

const LeagueDropdown = ({ 
  leagues, 
  selectedLeague, 
  onSelect, 
  isDarkMode 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLeagueData = leagues.find(league => league._id === selectedLeague);

  return (
    <div 
      ref={dropdownRef}
      className="relative w-48 z-40"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-[8px] p-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ${
          selectedLeague
            ? isDarkMode
              ? 'bg-blue-600/20 text-blue-400'
              : 'bg-blue-100 text-blue-600'
            : isDarkMode
            ? 'bg-zinc-800 text-[#C5C5C5] hover:bg-zinc-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {selectedLeagueData ? (
          <>
            {selectedLeagueData.image ? (
              <img 
                src={selectedLeagueData.image} 
                alt={selectedLeagueData.name} 
                className="h-7 w-7 object-contain rounded-sm"
              />
            ) : (
              <div className={`h-7 w-7 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'} flex items-center justify-center text-xs`}>
                {selectedLeagueData.name.charAt(0)}
              </div>  
            )}
            <span className="text-[16px] font-medium">{selectedLeagueData.name}</span>
          </>
        ) : (
          <span className="text-[16px] font-medium">Select a league</span>
        )}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-700'
          }`}
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 right-0 w-48 rounded-[8px] shadow-lg border ${
          isDarkMode 
            ? 'bg-zinc-800 border-zinc-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="py-1 max-h-60 overflow-auto">
            {leagues.map((league) => (
              <div
                key={league._id}
                onClick={() => {
                  onSelect(league._id);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                  selectedLeague === league._id
                    ? isDarkMode
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-zinc-700 text-[#C5C5C5]'
                    : 'hover:bg-gray-100 text-gray-700'
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueDropdown;