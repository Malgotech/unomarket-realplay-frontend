import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Added Redux imports
import { toggleTheme } from "../store/reducers/themeSlice"; // Import toggleTheme action
import up from "/up.svg";
import down from "/down.svg";
import LoginDialog from "./auth/LoginDialog";
import RegisterDialog from "./auth/RegisterDialog";
import { fetchData, postData } from "../services/apiServices";
import logoDark from "../images/unologo.svg";
import logoLight from "../images/unologo-dark.svg";
import magic from "../lib/magic";
import Toast from "./Toast";
import { useDisconnect } from "wagmi";
import { CircularProgress } from "@mui/material";
import { userDataAPI } from "../store/reducers/movieSlice";
import unoCoin from "../images/uno-coin.svg";

const scrollbarHideStyles = {
  scrollbarWidth: "none",
  msOverflowStyle: "none", // For IE and Edge
};

// For webkit browsers (Chrome, Safari, newer versions of Edge)
const scrollbarHideStylesWebkit = {
  "::-webkit-scrollbar": {
    display: "none",
  },
};

const Navbar = () => {
  const isLogin = useSelector((state) => state.user.isLogin);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { disconnect } = useDisconnect();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedMainTab, setSelectedMainTab] = useState("Live");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const handleEvent = () => {
    navigate("/events");
  };
  // Initialize categories with cached data immediately to prevent layout shift
  const [categories, setCategories] = useState(() => {
    try {
      const cachedData = localStorage.getItem("SoundbetCategories");
      const cachedTimestamp = localStorage.getItem(
        "SoundbetCategoriesTimestamp"
      );
      const currentTime = new Date().getTime();
      const cacheExpired =
        !cachedTimestamp || currentTime - parseInt(cachedTimestamp) > 3600000;

      if (cachedData && !cacheExpired) {
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData;
        }
      }
    } catch (e) {
      console.error("Error parsing cached categories:", e);
    }
    return ["Trending", "All", "New"]; // Fallback to static categories
  });
  // Removed isLoading state as we now start with static categories to prevent layout shifts
  const [user, setUser] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  // New state variables for search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchResultsRef = useRef(null);
  const searchInputRef = useRef(null);
  // Dashboard and wallet values
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  // Update regions state to include only World as static
  const [regions, setRegions] = useState(["World"]);
  const [selectedRegion, setSelectedRegion] = useState("World");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionDropdownRef = useRef(null);
  const regionButtonRef = useRef(null);
  // Add state for settings menu
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsButtonRef = useRef(null);
  const settingsMenuRef = useRef(null);
  // Add state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const [logosLoaded, setLogosLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Create link elements to preload the images
    const preloadLight = document.createElement("link");
    const preloadDark = document.createElement("link");

    preloadLight.rel = "preload";
    preloadLight.as = "image";
    preloadLight.href = "/soundbet-beta-logo-light.png";

    preloadDark.rel = "preload";
    preloadDark.as = "image";
    preloadDark.href = "/soundbet-beta-logo-dark.png";

    document.head.appendChild(preloadLight);
    document.head.appendChild(preloadDark);

    const preloadImages = async () => {
      const lightLogo = new Image();
      const darkLogo = new Image();

      const loadPromises = [
        new Promise((resolve) => {
          lightLogo.onload = resolve;
          lightLogo.onerror = resolve;
          lightLogo.src = "/soundbet-beta-logo-light.png";
        }),
        new Promise((resolve) => {
          darkLogo.onload = resolve;
          darkLogo.onerror = resolve;
          darkLogo.src = "/soundbet-beta-logo-dark.svg";
        }),
      ];

      await Promise.all(loadPromises);
      setLogosLoaded(true);
    };

    // Set a timeout to show logos even if preload fails
    const fallbackTimeout = setTimeout(() => {
      setLogosLoaded(true);
    }, 100); // Show after 100ms regardless

    preloadImages().then(() => {
      clearTimeout(fallbackTimeout);
    });

    return () => {
      clearTimeout(fallbackTimeout);
      // Clean up preload links
      if (document.head.contains(preloadLight)) {
        document.head.removeChild(preloadLight);
      }
      if (document.head.contains(preloadDark)) {
        document.head.removeChild(preloadDark);
      }
    };
  }, []);

  // Load cached values on initial render
  useEffect(() => {
    // Load cached region selection
    const cachedRegion = localStorage.getItem("SoundbetSelectedRegion");
    if (cachedRegion) {
      setSelectedRegion(cachedRegion);
    }

    // Load cached portfolio value
    const cachedPortfolio = localStorage.getItem("SoundbetPortfolioValue");
    if (cachedPortfolio) {
      setPortfolioValue(parseFloat(cachedPortfolio) || 0);
    }

    // Load cached wallet balance
    const cachedWallet = localStorage.getItem("SoundbetWalletBalance");
    if (cachedWallet) {
      setWalletBalance(parseFloat(cachedWallet) || 0);
    }
  }, []);

  // Fetch regions from API
  useEffect(() => {
    const getRegions = async () => {
      try {
        // Check if we have cached regions and they're not expired
        const cachedRegionsData = localStorage.getItem("SoundbetRegions");
        const cachedRegionsMeta = localStorage.getItem("SoundbetRegionsMeta");
        const cachedRegionsTimestamp = localStorage.getItem(
          "SoundbetRegionsTimestamp"
        );
        const currentTime = new Date().getTime();

        // Cache valid for 1 hour (3600000 milliseconds)
        const cacheExpired =
          !cachedRegionsTimestamp ||
          currentTime - parseInt(cachedRegionsTimestamp) > 3600000;

        // Use cached data if available and not expired
        if (cachedRegionsData && cachedRegionsMeta && !cacheExpired) {
          try {
            const parsedData = JSON.parse(cachedRegionsData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setRegions(["World", ...parsedData]);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached regions:", e);
          }
        }

        // If cache expired or invalid, fetch from API
        const response = await fetchData("api/user/regions");
        if (response.status && response.data.regions) {
          // Extract region names from API response for the dropdown
          const apiRegionNames = response.data.regions.map(
            (region) => region.name
          );

          // Update state with World + API regions
          setRegions(["World", ...apiRegionNames]);

          // Cache the region names for the dropdown
          localStorage.setItem(
            "SoundbetRegions",
            JSON.stringify(apiRegionNames)
          );

          // Cache the complete region data (with IDs) for API calls
          localStorage.setItem("SoundbetMeta", JSON.stringify(response.data));
          localStorage.setItem("SoundbetTimestamp", currentTime.toString());
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    };

    getRegions();
  }, []);

  // Handle region change
  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);

    // Cache the selected region
    localStorage.setItem("SoundbetSelectedRegion", region);

    // Dispatch a custom event to notify other components about the region change
    const regionChangeEvent = new CustomEvent("SoundbetRegionChanged", {
      detail: { region },
    });
    window.dispatchEvent(regionChangeEvent);

    // Additional logic for filtering portfolio by region could be added here
  };

  // Close region dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target) &&
        regionButtonRef.current &&
        !regionButtonRef.current.contains(event.target)
      ) {
        setShowRegionDropdown(false);
      }
    }

    if (showRegionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRegionDropdown]);

  // Function to fetch user's financial data (portfolio and wallet)
  const fetchUserFinancialData = async (forceApi = false) => {
    if (userData.success && userData.stats) {
      setPortfolioValue(userData.stats.portfolio || 0);
      setWalletBalance(userData.stats.wallet || 0);
      localStorage.setItem(
        "SoundbetfolioValue",
        (userData.stats.portfolio || 0).toString()
      );
      localStorage.setItem(
        "SoundbetWalletBalance",
        (userData.stats.wallet || 0).toString()
      );
      localStorage.setItem(
        "SoundbetTimestamp",
        new Date().getTime().toString()
      );
    }
    return;
  };

  // Fetch categories from API or use cached data (only if not already loaded from cache)
  useEffect(() => {
    const getCategories = async () => {
      // Static categories to always keep
      const staticCategories = ["Trending", "All", "New"];

      // If we already have more than static categories, skip API call unless cache is expired
      if (categories.length > staticCategories.length) {
        const cachedTimestamp = localStorage.getItem(
          "SoundbetCategoriesTimestamp"
        );
        const currentTime = new Date().getTime();
        const cacheExpired =
          !cachedTimestamp || currentTime - parseInt(cachedTimestamp) > 3600000;

        if (!cacheExpired) {
          return; // Skip API call if we have cached data and it's not expired
        }
      }

      // Fetch from API only if needed
      try {
        const response = await fetchData("api/admin/categories");
        if (response.status && response.data.categories) {
          const apiCategories = response.data.categories.map(
            (category) => category.name
          );
          const combinedCategories = [
            ...staticCategories,
            ...apiCategories.filter((cat) => !staticCategories.includes(cat)),
          ];

          // Only update if we have more categories than current
          if (combinedCategories.length > categories.length) {
            setCategories(combinedCategories);
          }

          // Cache the data
          localStorage.setItem(
            "SoundbetCategories",
            JSON.stringify(combinedCategories)
          );
          localStorage.setItem(
            "SoundbetCategoriesTimestamp",
            new Date().getTime().toString()
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Keep the current categories if API fails
      }
    };

    // Only fetch if we don't have cached categories or if they're expired
    const shouldFetch = categories.length <= 3; // Only static categories
    if (shouldFetch) {
      getCategories();
    }
  }, []); // Remove categories dependency to prevent re-fetching

  // Set initial tab based on current URL
  useEffect(() => {
    const path = location.pathname.substring(1).replace(/-/g, " ");

    // Handle market/[category] routes
    if (path.startsWith("market/")) {
      setSelectedMainTab("Markets");
      const categoryPath = path.substring("market/".length);
      // Find the matching category
      const currentCategory = categories.find(
        (category) => category.toLowerCase() === categoryPath.toLowerCase()
      );

      if (currentCategory) {
        setSelectedTab(currentCategory);
      }
    }
    // Handle root path
    else if (path === "") {
      setSelectedMainTab("Live");
      setSelectedTab("Trending");
    }
    // Handle thoughts path
    else if (path.startsWith("thoughts")) {
      setSelectedMainTab("Thoughts");
    }
    // Handle direct category paths (legacy support)
    else {
      const currentCategory = categories.find(
        (category) => category.toLowerCase() === path.toLowerCase()
      );

      if (currentCategory) {
        if (!["Trending", "All", "New"].includes(currentCategory)) {
          setSelectedMainTab("Markets");
        } else if (currentCategory === "Trending") {
          setSelectedMainTab("Live");
        }
        setSelectedTab(currentCategory);
      }
    }
  }, [location.pathname, categories]);

  // Click outside handler to close the profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }

    // Add event listener when menu is shown
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Click outside handler to close search results
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is on a search result item
      const isSearchResultItem = event.target.closest(".search-result-item");

      // Only close if the click is outside search results AND search input
      // AND not on a search result item
      if (
        !isSearchResultItem &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    }

    // Add event listener when search results are shown
    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  // Handle search input change with debouncing
  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetchData(
          `api/event/events?search=${encodeURIComponent(query)}`
        );
        if (response.events && Array.isArray(response.events)) {
          setSearchResults(response.events.slice(0, 5)); // Limit to 5 results
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error("Error searching events:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid excessive API calls
    const debounceTimer = setTimeout(() => {
      if (query) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleCategoryClick = (category) => {
    setSelectedTab(category);

    // Static categories routing
    if (category === "Trending") {
      setSelectedMainTab("Live");
      navigate("/"); // Trending goes to home page
    }
    // All other categories route to market/[category]
    else {
      setSelectedMainTab("Markets");
      const categoryPath = category
        .toLowerCase()
        .replace(/ & /g, "-")
        .replace(/\s+/g, "-");
      navigate(`/market/${categoryPath}`);
    }
  };

  const handleMainTabClick = (tab) => {
    setSelectedMainTab(tab);

    if (tab === "Live") {
      // When clicking Live, go to homepage and select Trending
      navigate("/");
      setSelectedTab("Trending");
    } else if (tab === "Markets") {
      // When clicking Markets, go to market page
      // If current tab is Trending, switch to All, otherwise keep current tab
      if (selectedTab === "Trending") {
        setSelectedTab("All");
        navigate("/market/all");
      } else {
        const categoryPath = selectedTab
          .toLowerCase()
          .replace(/ & /g, "-")
          .replace(/\s+/g, "-");
        navigate(`/market/${categoryPath}`);
      }
    } else if (tab === "Thoughts") {
      navigate("/thoughts");
    }
  };

  const handleLogoClick = () => {
    // When clicking logo, go to homepage and select Trending
    navigate("/");
    setSelectedMainTab("Live");
    setSelectedTab("Trending");
  };

  const isMainTabActive = (tab) => {
    return selectedMainTab === tab;
  };

  const handleLoginClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault(); // Prevent navigation to /login if it's an event
    }
    setLoginDialogOpen(true);
  };

  const handleLoginDialogClose = () => {
    setLoginDialogOpen(false);
  };

  const handleSignUpClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setRegisterDialogOpen(true);
  };

  const handleRegisterDialogClose = () => {
    setRegisterDialogOpen(false);
  };
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  // const handleLogout = () => {
  //   // Clear user data and token
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   setisLogin(false);
  //   setUser(null);
  //   setShowProfileMenu(false);
  //   // Redirect to home page after logout
  //   navigate("/");
  // };
  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const handleLogout = async () => {
    try {
      disconnect();

      localStorage.removeItem("UnomarketToken");
      localStorage.removeItem("user");
      setUser(null);
      setShowToast(true);
      setShowProfileMenu(false);
      setToastMessage("Successfully logged out");
      navigate("/");

      // Optional: refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMenuItemClick = (destination) => {
    setShowProfileMenu(false);
    switch (destination) {
      case "profile":
        navigate("/dashboard");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "notifications":
        navigate("/notifications");
        break;
      case "bookmarks":
        navigate("/bookmarks");
        break;
      case "docs":
        navigate("/docs");
        break;
      case "terms":
        // Handle terms of use
        navigate("/terms");
        break;

      default:
        break;
    }
  };

  // Handle event click in search results
  const handleEventClick = (eventId) => {
    // Add more visible debugging

    // Reset search state
    setShowSearchResults(false);
    setQuery("");

    // Use a slight timeout to ensure the navigation happens after state updates
    setTimeout(() => {
      navigate(`/market/details/${eventId}`);
    }, 50);
  };

  // Format price as percentage with % sign
  const formatPrice = (price) => {
    if (!price && price !== 0) return "--";
    return `${price}%`;
  };

  // Listen for the custom 'open-login-dialog' event and open the login dialog when received.
  useEffect(() => {
    const handleOpenLoginDialog = () => {
      setLoginDialogOpen(true);
      closeMobileMenu(); // Make sure mobile menu is closed when dialog opens
    };
    window.addEventListener("open-login-dialog", handleOpenLoginDialog);
    return () => {
      window.removeEventListener("open-login-dialog", handleOpenLoginDialog);
    };
  }, []);

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle mobile login
  const handleMobileLogin = () => {
    closeMobileMenu(); // Close the mobile menu first
    setLoginDialogOpen(true); // Open login dialog
  };

  // Handle mobile signup
  const handleMobileSignup = () => {
    closeMobileMenu(); // Close the mobile menu first
    setRegisterDialogOpen(true); // Open register dialog
    handleSignUpClick({ preventDefault: () => { } }); // Open signup dialog
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSettingsMenu &&
        settingsButtonRef.current &&
        settingsMenuRef.current &&
        !settingsButtonRef.current.contains(event.target) &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsMenu]);

  return (
    <header
      className={`w-full border-b flex flex-col lg:flex-row justify-center items-center ${isDarkMode ? "border-zinc-800" : "border-gray-200"
        } fixed top-0 z-[100] ${isDarkMode ? "bg-[#09090b]" : "bg-[#FFFFFF]"} ${isDarkMode
          ? "shadow-[0px_4px_12px_0px_rgba(0,0,0,0.5)]"
          : "shadow-[0px_4px_12px_0px_rgba(137,137,137,0.25)]"
        } max-[1100px]:h-auto min-[1101px]:h-28 transition-all duration-300`}>
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <div
        className={`container w-full mx-0 px-4  ${isDarkMode ? "bg-[#09090b]" : "bg-[#FFFFFF]"
          } max-w-[1350px] transition-all duration-300`}>
        {/* Desktop Navigation */}
        <div className="max-[1100px]:hidden h-full flex flex-col justify-center">
          {/* Top Navigation Row */}
          <div className="flex justify-between items-center mx-4 pt-3">
            {/* Left Side - Logo and Main Nav */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div
                  className="h-[26px] mb-1 cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
                  style={{ minWidth: "80px", minHeight: "26px" }}
                  onClick={handleLogoClick}>
                  <img
                    src={isDarkMode ? logoLight : logoDark}
                    alt="soundbet"
                    className={`h-[36px] transition-all duration-300 ${logosLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    style={{ minWidth: "80px" }}
                    loading="eager"
                  />
                  {!logosLoaded && (
                    <div
                      className={`absolute h-[26px] ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                        } rounded animate-pulse`}
                      style={{ minWidth: "80px" }}
                    />
                  )}
                </div>
              </div>
              <nav
                className={`ml-4 flex items-center gap-3 text-[16px] ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
                  }`}
                style={{ minWidth: "200px" }}>
                <button
                  className={`transition-all duration-300 text-sm text-[#FF3366] font-bold hover:text-[#FF6699] hover:scale-105 px-2 py-1 rounded-md ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-blue-50"
                    }`}>
                  Live
                </button>
                <button
                  onClick={() => handleMainTabClick("Markets")}
                  className={`transition-all duration-300 text-sm  hover:cursor-pointer px-2 py-1 rounded-md ${isMainTabActive("Markets")
                      ? "text-white bg-[#FF161A] font-bold shadow-lg"
                      : `font-medium ${isDarkMode
                        ? "text-[#C5C5C5] hover:bg-zinc-800/50"
                        : "text-zinc-700 hover:bg-blue-50"
                      }`
                    }`}>
                  Markets
                </button>
                <button
                  onClick={() => handleMainTabClick("Thoughts")}
                  className={`transition-all duration-300 text-sm hover:cursor-pointer px-2 py-1 rounded-md ${isMainTabActive("Thoughts")
                      ? "text-white bg-[#FF161A] font-bold shadow-lg"
                      : `font-medium ${isDarkMode
                        ? "text-[#C5C5C5] hover:bg-zinc-800/50"
                        : "text-zinc-700 hover:bg-blue-50"
                      }`
                    }`}>
                  Idea
                </button>
                {/* <button
                  onClick={() => handleEvent("Thoughts")}
                  className={`
    animate-zoomGlow
    transition-all duration-300
    text-sm hover:cursor-pointer
    px-2 py-1 rounded-md text-white bg-[#FF532A]
    ${isMainTabActive("Thoughts") ? "font-bold shadow-lg" : "font-medium"}
  `}>
                  Create Events
                </button> */}
              </nav>
            </div>

            {/* Center - Search Bar */}

            {/* Right Side - Dashboard, Wallet and Profile */}
            <div className="flex items-center gap-4">
              {/* Search bar - always visible */}
              <div className="relative">
                <i className="text-zinc-400 text-[16px] ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2"></i>
                <input
                  ref={searchInputRef}
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                  type="text"
                  placeholder="Search Events & Market Trends"
                  className={`border w-[300px] h-10 rounded-lg transition-all duration-300 ${isDarkMode
                      ? "bg-[#141414] border-zinc-700 text-[#C5C5C5] focus:ring-2 focus:ring-[#5B8BF7]"
                      : "bg-white border-zinc-300 text-zinc-700 focus:ring-2 focus:ring-[#4169E1]"
                    } px-11 text-[16px] focus:outline-none focus:border-transparent shadow-sm`}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                      e.preventDefault();
                      setShowSearchResults(false);
                      navigate(
                        `/market/search?q=${encodeURIComponent(query.trim())}`
                      );
                    }
                  }}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div
                    ref={searchResultsRef}
                    className={`w-[300px] absolute top-full mt-[6px] ${isDarkMode ? "bg-[#232429]" : "bg-white"
                      } rounded-lg shadow-xl border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                      } overflow-hidden z-50 transition-all duration-300`}>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 border-t-2 border-[#4169E1] rounded-full animate-spin"></div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div
                        className={`py-10 text-center ${isDarkMode ? "text-zinc-500" : "text-[#2b2d2e]/50"
                          } text-sm font-normal`}>
                        No results found
                      </div>
                    ) : (
                      <>
                        <div className="">
                          {/* Search Results List for desktop */}
                          {searchResults.map((event, index) => (
                            <div
                              key={event._id}
                              className={`search-result-item flex items-center p-3 transition-all duration-200 ${isDarkMode
                                  ? "hover:bg-[#2D2E33]"
                                  : "hover:bg-blue-50"
                                } cursor-pointer`}
                              onClick={() => {
                                navigate(`/market/details/${event._id}`);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  navigate(`/market/details/${event._id}`);
                                }
                              }}>
                              {/* Fixed size image container */}
                              <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden mr-3">
                                {event.event_image ? (
                                  <img
                                    src={event.event_image}
                                    alt={event.event_title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"></div>
                                )}
                              </div>

                              {/* Market name with ellipsis */}
                              <div className="flex-grow min-w-0">
                                <div
                                  className={`${isDarkMode
                                      ? "text-[#C5C5C5]"
                                      : "text-[#2b2d2e]"
                                    } text-[14px] font-normal truncate`}>
                                  {event.event_title}
                                </div>
                              </div>

                              {/* Right-aligned percentage (mandatory) */}
                              <div className="flex-shrink-0 ml-4 w-[70px] text-right">
                                {event.has_sub_markets ? (
                                  (() => {
                                    const query =
                                      searchInputRef.current?.value.toLowerCase() ||
                                      "";
                                    const matchingSubmarketIndex =
                                      event.sub_markets.findIndex(
                                        (submarket) =>
                                          submarket.name &&
                                          submarket.name
                                            .toLowerCase()
                                            .includes(query)
                                      );

                                    const submarketIndex =
                                      matchingSubmarketIndex !== -1
                                        ? matchingSubmarketIndex
                                        : 0;

                                    return (
                                      <>
                                        <div
                                          className={`text-[14px] font-bold ${isDarkMode
                                              ? "text-white"
                                              : "text-[#4169E1]"
                                            }`}>
                                          {event.sub_markets[submarketIndex]
                                            .lastTradedYesPrice
                                            ? `${event.sub_markets[submarketIndex].lastTradedYesPrice}%`
                                            : "--"}
                                        </div>
                                        {event.sub_markets[submarketIndex]
                                          ?.name && (
                                            <div className="text-[11px] text-zinc-500 truncate">
                                              {
                                                event.sub_markets[submarketIndex]
                                                  .name
                                              }
                                            </div>
                                          )}
                                      </>
                                    );
                                  })()
                                ) : (
                                  <div
                                    className={`text-[14px] font-bold ${isDarkMode
                                        ? "text-white"
                                        : "text-[#4169E1]"
                                      }`}>
                                    {event.sub_markets[0].lastTradedYesPrice
                                      ? `${event.sub_markets[0].lastTradedYesPrice}%`
                                      : "--"}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Region selector - always visible */}
              <div className="relative">
                <div
                  ref={regionButtonRef}
                  onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                  className="flex items-center gap-1 cursor-pointer transition-all duration-200 hover:opacity-80">
                  <span
                    className={`text-[14px] font-medium ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                      }`}>
                    {selectedRegion}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-3 h-3 transition-transform ${isDarkMode ? "text-[#C5C5C5]" : ""
                      } ${showRegionDropdown ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {/* Region dropdown menu */}
                {showRegionDropdown && (
                  <div
                    ref={regionDropdownRef}
                    className={`absolute top-full mt-1 w-[130px] ${isDarkMode ? "bg-[#232429]" : "bg-white"
                      } rounded-lg shadow-xl py-0 z-[1000] transition-all duration-300 border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                      }`}>
                    {regions.map((region) => (
                      <div
                        key={region}
                        className={`transition-all duration-200 ${isDarkMode ? "hover:bg-[#2D2E33]" : "hover:bg-blue-50"
                          } cursor-pointer w-full`}
                        onClick={() => handleRegionChange(region)}>
                        <div
                          className={`px-3 py-2 text-[13px] font-medium ${selectedRegion === region
                              ? "text-white bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"
                              : isDarkMode
                                ? "text-[#C5C5C5]"
                                : "text-[#2b2d2e]"
                            }`}>
                          {region}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dashboard and Wallet - only shown when logged in */}
              {isLogin == true && (
                <>
                  {/* Dashboard Value */}

                  <div
                    onClick={() => navigate("/dashboard")}
                    className={`flex flex-col items-center h-10 rounded-lg justify-center px-3 cursor-pointer transition-all duration-200 ${isDarkMode ? "hover:bg-[#2D2E33]" : "hover:bg-blue-100"
                      }`}>
                    <span
                      className={`text-[16px] font-bold flex gap-1 ${isDarkMode ? "text-[#FF532A]" : "text-[#FF532A]"
                        }`}>
                      {/* <img src={unoCoin} alt="unocoin" width={18} height={18} /> */} $
                      {user?.stats?.portfolio.toFixed(2).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-zinc-500">Portfolio</span>
                  </div>

                  {/* Wallet Value */}

                  <>
                    {/* {user?.stats?.usable_wallet < 0.1 ? (
                      <button
                        className={` w-[90px] h-[35px] rounded-[12px] bg-[#FF532A] text-[14px] font-bold  ${
                          isDarkMode ? "text-[#000]" : "text-[#fff]"
                        } }`}
                        onClick={handleRecharge}
                      >
                        Add Balance
                      </button>
                    ) : (
                      <div
                        onClick={() => navigate("/dashboard")}
                        className={`flex flex-col items-center h-10 rounded-lg justify-center px-3 cursor-pointer transition-all duration-200 ${
                          isDarkMode
                            ? "hover:bg-[#2D2E33]"
                            : "hover:bg-blue-100"
                        }`}
                      >
                       <span
                      className={`text-[16px] font-bold flex gap-1 ${
                        isDarkMode ? "text-[#FF532A]" : "text-[#FF532A]"
                      }`}
                    >
                     
                      <img src={unoCoin} alt="unocoin" width={18} height={18}  />
                          {user?.stats?.usable_wallet
                            .toFixed(2)
                            .toLocaleString()}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Wallet
                        </span>
                      </div>
                    )} */}

                    <div
                      onClick={() => navigate("/dashboard")}
                      className={`flex flex-col items-center h-10 rounded-lg justify-center px-3 cursor-pointer transition-all duration-200 ${isDarkMode ? "hover:bg-[#2D2E33]" : "hover:bg-blue-100"
                        }`}>
                      <span
                        className={`text-[16px] font-bold flex gap-1 ${isDarkMode ? "text-[#FF532A]" : "text-[#FF532A]"
                          }`}>
                        {/* <img
                          src={unoCoin}
                          alt="unocoin"
                          width={18}
                          height={18}
                        /> */} $
                        {user?.stats?.usable_wallet.toFixed(2).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-zinc-500">Wallet</span>
                    </div>
                  </>
                </>
              )}

              <div className="flex gap-3  ">
                {isLogin ? (
                  <div className="relative">
                    <div
                      ref={profileButtonRef}
                      className={`w-[38px] h-[38px] transition-all duration-300 hover:scale-110 ${isDarkMode ? "bg-[#2D2E33]" : "bg-blue-100"
                        } rounded-full cursor-pointer border ${isDarkMode ? "border-zinc-700" : "border-blue-200"
                        } flex items-center justify-center overflow-hidden`}
                      onClick={handleProfileClick}>
                      {user?.user?.profileImage ? (
                        <img
                          src={user?.user?.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className={`font-bold ${isDarkMode ? "text-white" : "text-[#4169E1]"
                            }`}>
                          {user?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Profile dropdown menu */}
                    {showProfileMenu && (
                      <div
                        ref={profileMenuRef}
                        className={`fixed right-auto mt-2 w-[170px] ${isDarkMode
                            ? "bg-[#232429] text-[#C5C5C5]"
                            : "bg-white"
                          } rounded-lg shadow-xl py-0 z-[1000] overflow-visible border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                          } transition-all duration-300`}
                        style={{
                          top: profileButtonRef.current
                            ? profileButtonRef.current.getBoundingClientRect()
                              .bottom + 5
                            : "auto",
                          right: profileButtonRef.current
                            ? window.innerWidth -
                            profileButtonRef.current.getBoundingClientRect()
                              .right
                            : "auto",
                          maxHeight: "calc(100vh - 150px)",
                          overflowY: "auto",
                        }}>
                        {/* Profile dropdown menu items */}
                        <div
                          className={`transition-all duration-200 ${isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                          onClick={() => handleMenuItemClick("profile")}>
                          <div
                            className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-left h-full`}>
                            Dashboard
                          </div>
                        </div>

                        {/* Watchlist */}
                        <div
                          className={`transition-all duration-200 ${isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                          onClick={() => handleMenuItemClick("bookmarks")}>
                          <div
                            className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-left h-full`}>
                            Bookmarks
                          </div>
                        </div>

                        {/* Theme Toggle */}
                        <div
                          className={`transition-all duration-200 ${isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                          onClick={() => dispatch(toggleTheme())}>
                          <div
                            className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-between h-full`}>
                            <span>Dark Theme</span>
                            <div
                              className={`w-8 h-4 ${isDarkMode
                                  ? "bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"
                                  : "bg-gray-300"
                                } rounded-full relative transition-all duration-300`}>
                              <div
                                className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-transform ${isDarkMode
                                    ? "translate-x-4"
                                    : "translate-x-0.5"
                                  }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Terms of Use */}
                        <div
                          className={`transition-all duration-200 ${isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                          onClick={() => handleMenuItemClick("terms")}>
                          <div
                            className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-left h-full`}>
                            Terms of Use
                          </div>
                        </div>

                        {/* Docs */}
                        {/* <div
                          className={`transition-all duration-200 ${
                            isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                          } cursor-pointer w-full`}
                          onClick={() => handleMenuItemClick("docs")}>
                          <div
                            className={`px-3 py-2.5 ${
                              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                            } text-[13px] font-medium flex items-center justify-between h-full`}>
                            <span>Documentation</span>
                          </div>
                        </div> */}

                        {/* Spacer */}
                        <div
                          className={`border-t ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                            }`}></div>

                        {/* Logout - Last item */}
                        <div
                          className={`transition-all duration-200 ${isDarkMode
                              ? "hover:bg-[#2D2E33]"
                              : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                          onClick={handleLogout}>
                          <div
                            className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-left h-full`}>
                            {isLoading ? (
                              <span className="flex items-center">
                                <CircularProgress
                                  size={16}
                                  color="inherit"
                                  sx={{ mr: 1 }}
                                />
                                Logging out...
                              </span>
                            ) : (
                              "Logout"
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className={`bg-transparent border border-[#FF532A] rounded-lg py-2 px-6 flex justify-center items-center text-[16px] transition-all duration-300 hover:bg-[#FF532A] hover:to-[#2FBAA3] hover:text-white hover:shadow-lg ${isDarkMode ? "text-[#ffff]" : "text-[#000]"
                        }   `}>
                      Login
                    </button>
                    {/* <button
                      onClick={handleSignUpClick}
                      className="bg-[#FF532A] to-[#2FBAA3] rounded-lg py-2 px-6 flex justify-center items-center text-white text-[16px] transition-all duration-300 hover:from-[#2D5CD0] hover:to-[#34C9AA] hover:shadow-lg"
                    >
                      Sign Up
                    </button> */}

                    <div className="relative">
                      <div
                        ref={settingsButtonRef}
                        onClick={handleSettingsClick}
                        className={`w-[38px] h-[38px] transition-all duration-300 hover:scale-110 ${isDarkMode ? "bg-[#2D2E33]" : "bg-blue-100"
                          } rounded-full cursor-pointer flex items-center justify-center overflow-hidden border ${isDarkMode ? "border-zinc-700" : "border-blue-200"
                          }`}>
                        <i className="ri-menu-line text-xl"></i>
                      </div>

                      {showSettingsMenu && (
                        <div
                          ref={settingsMenuRef}
                          className={`fixed right-auto mt-2 w-[170px] ${isDarkMode
                              ? "bg-[#232429] text-[#C5C5C5]"
                              : "bg-white"
                            } rounded-lg shadow-xl py-0 z-[1000] overflow-visible border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                            } transition-all duration-300`}
                          style={{
                            top: settingsButtonRef.current
                              ? settingsButtonRef.current.getBoundingClientRect()
                                .bottom + 5
                              : "auto",
                            right: settingsButtonRef.current
                              ? window.innerWidth -
                              settingsButtonRef.current.getBoundingClientRect()
                                .right
                              : "auto",
                          }}>
                          <div
                            className={`transition-all duration-200 ${isDarkMode
                                ? "hover:bg-[#2D2E33]"
                                : "hover:bg-blue-50"
                              } cursor-pointer w-full`}
                            onClick={() => dispatch(toggleTheme())}>
                            <div
                              className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                                } text-[13px] font-medium flex items-center justify-between h-full`}>
                              <span>Dark Theme</span>
                              <div
                                className={`w-8 h-4 ${isDarkMode
                                    ? "bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"
                                    : "bg-gray-300"
                                  } rounded-full relative transition-all duration-300`}>
                                <div
                                  className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-transform ${isDarkMode
                                      ? "translate-x-4"
                                      : "translate-x-0.5"
                                    }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            className={`transition-all duration-200 ${isDarkMode
                                ? "hover:bg-[#2D2E33]"
                                : "hover:bg-blue-50"
                              } cursor-pointer w-full`}
                            onClick={() => handleMenuItemClick("terms")}>
                            <div
                              className={`px-3 py-2.5 ${isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                                } text-[13px] font-medium flex items-center justify-left h-full`}>
                              Terms of Use
                            </div>
                          </div>

                          {/* <div
                            className={`transition-all duration-200 ${
                              isDarkMode
                                ? "hover:bg-[#2D2E33]"
                                : "hover:bg-blue-50"
                            } cursor-pointer w-full`}
                            onClick={() => handleMenuItemClick("docs")}>
                            <div
                              className={`px-3 py-2.5 ${
                                isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                              } text-[13px] font-medium flex items-center justify-between h-full`}>
                              <span>Documentation</span>
                            </div>
                          </div> */}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="mt-4 px-4  ">
            <div
              className="flex items-center overflow-x-auto scrollbar-hide pb-2 -mb-2 gap-1"
              style={{ scrollSnapType: "x mandatory" }}>
              {categories.map((category, index) => {
                const indexOfNew = categories.indexOf("New");
                return (
                  <React.Fragment key={category}>
                    <button
                      style={{
                        fontFamily:
                          "'IBMPlexSans', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                      className={`text-sm capitalize  px-2 whitespace-nowrap transition-all duration-300   ${selectedTab === category
                          ? ` rounded-lg font-bold   ${isDarkMode ? "text-[#ffff]" : "text-[#000]"
                          }`
                          : `font-medium  rounded-lg ${isDarkMode
                            ? "text-[#C5C5C5] hover:bg-[#2D2E33]"
                            : "text-[#7E7E80] hover:text-[#000]"
                          }`
                        }`}
                      onClick={() => handleCategoryClick(category)}>
                      {category}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation (1100px and below) */}
        <div className="min-[1101px]:hidden py-3  ">
          <div className="flex justify-between items-center px-4">
            <div
              className="h-[28px] cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
              style={{ minWidth: "85px", minHeight: "28px" }}
              onClick={handleLogoClick}>
              <img
                src={isDarkMode ? logoLight : logoDark}
                alt="SOUNDBET"
                className={`h-[28px] transition-all duration-300 ${logosLoaded ? "opacity-100" : "opacity-0"
                  }`}
                style={{ minWidth: "85px" }}
                loading="eager"
              />
              {!logosLoaded && (
                <div
                  className={`absolute h-[28px] ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                    } rounded animate-pulse`}
                  style={{ minWidth: "85px" }}
                />
              )}
            </div>
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 transition-all duration-300 hover:scale-110">
              <i
                className={`ri-menu-line text-2xl ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}></i>
            </button>
          </div>

          {/* Mobile Side Drawer */}
          <div
            className={`fixed inset-0 z-[1000] transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            onClick={closeMobileMenu}>
            {/* Dark Overlay */}
            <div
              className={`absolute inset-0 ${isDarkMode ? "bg-black/70" : "bg-black/50"
                } transition-all duration-300`}></div>

            {/* Drawer */}
            <div
              className={`absolute top-0 left-0 h-full w-[280px] ${isDarkMode
                  ? "bg-gradient-to-b from-[#1A1B1E] to-[#2A2B32]"
                  : "bg-gradient-to-b from-white to-blue-50"
                } transform transition-all duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } shadow-xl`}
              onClick={(e) => e.stopPropagation()}>
              {/* Logo and Menu header */}
              <div className="p-4 border-b border-gray-200">
                {/* soundbet Logo */}
                <div className="flex justify-center mb-6">
                  <div
                    className="h-8 flex items-center justify-center transition-transform hover:scale-105"
                    style={{ minWidth: "90px", minHeight: "32px" }}>
                    <img
                      src={isDarkMode ? logoLight : logoDark}
                      alt="soundbet Logo"
                      className={`h-8 transition-all duration-300 ${logosLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      style={{ minWidth: "90px" }}
                      loading="eager"
                    />
                    {!logosLoaded && (
                      <div
                        className={`absolute h-8 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                          } rounded animate-pulse`}
                        style={{ minWidth: "90px" }}
                      />
                    )}
                  </div>
                </div>

                {isLogin ? (
                  // Show user info if logged in
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 transition-all duration-300 hover:scale-110 ${isDarkMode ? "bg-[#2D2E33]" : "bg-blue-100"
                        } rounded-full flex items-center justify-center border ${isDarkMode ? "border-zinc-700" : "border-blue-200"
                        }`}>
                      {user?.user?.profileImage ? (
                        <img
                          src={user?.user?.profile_image}
                          alt={user?.user?.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-[#4169E1]"
                            }`}>
                          {user?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-medium ${isDarkMode ? "text-white" : "text-zinc-800"
                          }`}>
                        {user?.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.user?.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show login/signup buttons if not logged in
                  <div className="flex flex-col gap-3">
                    {/* <button
                      onClick={handleSignUpClick}
                      className="bg-[#FF532A] to-[#2FBAA3] rounded-lg py-2 px-6 flex justify-center items-center text-white text-[16px] transition-all duration-300 hover:from-[#2D5CD0] hover:to-[#34C9AA] hover:shadow-lg"
                    >
                      Sign Up
                    </button> */}
                    <button
                      onClick={handleMobileLogin}
                      className={`border border-[#FF532A] rounded-lg py-2.5 text-base transition-all duration-300 hover:bg-[#FF532A]  hover:to-[#2FBAA3] hover:text-white hover:shadow-lg w-full ${isDarkMode ? "text-[#fff]" : "text-[#000]"
                        } `}>
                      Login
                    </button>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div
                className={`overflow-y-auto ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}>
                {/* Dashboard - Only show if logged in */}
                {isLogin == true && (
                  <>
                    <div
                      onClick={() => {
                        navigate("/dashboard");
                        closeMobileMenu();
                      }}
                      className={`px-4 py-3 flex items-center gap-3 transition-all duration-200  ${isDarkMode
                          ? "text-white hover:bg-[#2D2E33]"
                          : "text-zinc-800 hover:bg-blue-100"
                        } cursor-pointer`}>
                      <i className="ri-user-line text-xl"></i>
                      <span>Dashboard</span>
                    </div>
                    <div
                      onClick={() => {
                        navigate("/bookmarks");
                        closeMobileMenu();
                      }}
                      className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isDarkMode
                          ? "text-white hover:bg-[#2D2E33]"
                          : "text-zinc-800 hover:bg-blue-100"
                        } cursor-pointer`}>
                      <i className="ri-bookmark-line text-xl"></i>
                      <span>Bookmarks</span>
                    </div>
                  </>
                )}

                {/* Common menu items */}
                <div
                  onClick={() => dispatch(toggleTheme())}
                  className={`px-4 py-3 flex items-center justify-between transition-all duration-200 ${isDarkMode
                      ? "text-white hover:bg-[#2D2E33]"
                      : "text-zinc-800 hover:bg-blue-100"
                    } cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <i
                      className={`${isDarkMode ? "ri-moon-line" : "ri-sun-line"
                        } text-xl`}></i>
                    <span>Dark Theme</span>
                  </div>
                  <div
                    className={`w-8 h-4 ${isDarkMode
                        ? "bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"
                        : "bg-gray-300"
                      } rounded-full relative transition-all duration-300`}>
                    <div
                      className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-0.5"
                        }`}
                    />
                  </div>
                </div>

                {/* Terms of Use */}
                <div
                  onClick={() => {
                    navigate("/terms");
                    closeMobileMenu();
                  }}
                  className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isDarkMode
                      ? "text-white hover:bg-[#2D2E33]"
                      : "text-zinc-800 hover:bg-blue-100"
                    } cursor-pointer`}>
                  <i className="ri-file-list-line text-xl"></i>
                  <span>Terms of Use</span>
                </div>

                {/* Docs */}
                {/* <div
                  onClick={() => {
                    navigate("/docs");
                    closeMobileMenu();
                  }}
                  className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                    isDarkMode
                      ? "text-white hover:bg-[#2D2E33]"
                      : "text-zinc-800 hover:bg-blue-100"
                  } cursor-pointer`}
                >
                  <i className="ri-file-text-line text-xl"></i>
                  <span>Docs</span>
                </div> */}

                {/* Privacy */}
                {/* <div
                  onClick={() => {
                    navigate("/privacy");
                    closeMobileMenu();
                  }}
                  className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                    isDarkMode
                      ? "text-white hover:bg-[#2D2E33]"
                      : "text-zinc-800 hover:bg-blue-100"
                  } cursor-pointer`}
                >
                  <i className="ri-shield-keyhole-line text-xl"></i>
                  <span>Privacy</span>
                </div> */}

                {/* <div
                  onClick={() => {
                    navigate("/investors");
                    closeMobileMenu();
                  }}
                  className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                    isDarkMode
                      ? "text-white hover:bg-[#2D2E33]"
                      : "text-zinc-800 hover:bg-blue-100"
                  } cursor-pointer`}
                >
                  <i className="ri-line-chart-line text-xl"></i>
                  <span>Investors</span>
                </div> */}

                {isLogin == true && (
                  <div
                    onClick={handleLogout}
                    className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isDarkMode
                        ? "text-white hover:bg-[#2D2E33]"
                        : "text-zinc-800 hover:bg-blue-100"
                      } cursor-pointer border-t ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                      }`}>
                    <i className="ri-logout-box-line text-xl"></i>
                    <span>
                      {isLoading ? (
                        <span className="flex items-center">
                          <CircularProgress
                            size={16}
                            color="inherit"
                            sx={{ mr: 1 }}
                          />
                          Logging out...
                        </span>
                      ) : (
                        "Logout"
                      )}
                    </span>
                  </div>
                )}

                {/* Footer Social Links */}
                <div
                  className={`px-4 py-4 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                    } border-t ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                    } mt-4`}>
                  <div className="text-sm font-medium mb-3">
                    Connect with us
                  </div>
                  <div className="flex space-x-5">
                    <a
                      href="mailto:beta@soundbet.com"
                      aria-label="Email"
                      className="text-xl transition-all duration-300  hover:scale-110">
                      <i className="ri-mail-line"></i>
                    </a>
                    <a
                      href="https://x.com/soundbetofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter/X"
                      className="text-xl transition-all duration-300  hover:scale-110">
                      <i className="ri-twitter-x-line"></i>
                    </a>
                    <a
                      href="https://www.instagram.com/soundbetofficial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-xl transition-all duration-300  hover:scale-110">
                      <i className="ri-instagram-line"></i>
                    </a>
                    <a
                      href="https://tiktok.com/soundbetofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="text-xl transition-all duration-300  hover:scale-110">
                      <i className="ri-tiktok-line"></i>
                    </a>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    © Unomarket {new Date().getFullYear()}
                  </div>
                </div>

                {/* Logout for logged in users */}
                {isLogin == true && (
                  <div
                    onClick={handleLogout}
                    className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isDarkMode
                        ? "text-white hover:bg-[#2D2E33]"
                        : "text-zinc-800 hover:bg-blue-100"
                      } cursor-pointer border-t ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                      }`}>
                    <i className="ri-logout-box-line text-xl"></i>
                    <span>
                      {isLoading ? (
                        <span className="flex items-center">
                          <CircularProgress
                            size={16}
                            color="inherit"
                            sx={{ mr: 1 }}
                          />
                          Logging out...
                        </span>
                      ) : (
                        "Logout"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {location.pathname == "/search" && (
        <div className="pb-4 inline lg:hidden">
          <div className="flex items-center gap-4">
            {/* Search bar - always visible */}
            <div className="relative">
              <i className="text-zinc-400 text-[16px] ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2"></i>
              <input
                ref={searchInputRef}
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                type="text"
                placeholder="Search Events & Market Trends"
                className={`border w-[300px] h-10 rounded-lg transition-all duration-300 ${isDarkMode
                    ? "bg-[#141414] border-zinc-700 text-[#C5C5C5] focus:ring-2 focus:ring-[#5B8BF7]"
                    : "bg-white border-zinc-300 text-zinc-700 focus:ring-2 focus:ring-[#4169E1]"
                  } px-11 text-[16px] focus:outline-none focus:border-transparent shadow-sm`}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    e.preventDefault();
                    setShowSearchResults(false);
                    navigate(
                      `/market/search?q=${encodeURIComponent(query.trim())}`
                    );
                  }
                }}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div
                  ref={searchResultsRef}
                  className={`w-[300px] absolute top-full mt-[6px] ${isDarkMode ? "bg-[#232429]" : "bg-white"
                    } rounded-lg shadow-xl border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
                    } overflow-hidden z-50 transition-all duration-300`}>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-5 h-5 border-t-2 border-[#4169E1] rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div
                      className={`py-10 text-center ${isDarkMode ? "text-zinc-500" : "text-[#2b2d2e]/50"
                        } text-sm font-normal`}>
                      No results found
                    </div>
                  ) : (
                    <>
                      <div className="">
                        {/* Search Results List for desktop */}
                        {searchResults.map((event, index) => (
                          <div
                            key={event._id}
                            className={`search-result-item flex items-center p-3 transition-all duration-200 ${isDarkMode
                                ? "hover:bg-[#2D2E33]"
                                : "hover:bg-blue-50"
                              } cursor-pointer`}
                            onClick={() => {
                              navigate(`/market/details/${event._id}`);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                navigate(`/market/details/${event._id}`);
                              }
                            }}>
                            {/* Fixed size image container */}
                            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden mr-3">
                              {event.event_image ? (
                                <img
                                  src={event.event_image}
                                  alt={event.event_title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-[#4169E1] to-[#5B8BF7]"></div>
                              )}
                            </div>

                            {/* Market name with ellipsis */}
                            <div className="flex-grow min-w-0">
                              <div
                                className={`${isDarkMode
                                    ? "text-[#C5C5C5]"
                                    : "text-[#2b2d2e]"
                                  } text-[14px] font-normal truncate`}>
                                {event.event_title}
                              </div>
                            </div>

                            {/* Right-aligned percentage (mandatory) */}
                            <div className="flex-shrink-0 ml-4 w-[70px] text-right">
                              {event.has_sub_markets ? (
                                (() => {
                                  const query =
                                    searchInputRef.current?.value.toLowerCase() ||
                                    "";
                                  const matchingSubmarketIndex =
                                    event.sub_markets.findIndex(
                                      (submarket) =>
                                        submarket.name &&
                                        submarket.name
                                          .toLowerCase()
                                          .includes(query)
                                    );

                                  const submarketIndex =
                                    matchingSubmarketIndex !== -1
                                      ? matchingSubmarketIndex
                                      : 0;

                                  return (
                                    <>
                                      <div
                                        className={`text-[14px] font-bold ${isDarkMode
                                            ? "text-white"
                                            : "text-[#4169E1]"
                                          }`}>
                                        {event.sub_markets[submarketIndex]
                                          .lastTradedYesPrice
                                          ? `${event.sub_markets[submarketIndex].lastTradedYesPrice}%`
                                          : "--"}
                                      </div>
                                      {event.sub_markets[submarketIndex]
                                        ?.name && (
                                          <div className="text-[11px] text-zinc-500 truncate">
                                            {
                                              event.sub_markets[submarketIndex]
                                                .name
                                            }
                                          </div>
                                        )}
                                    </>
                                  );
                                })()
                              ) : (
                                <div
                                  className={`text-[14px] font-bold ${isDarkMode ? "text-white" : "text-[#4169E1]"
                                    }`}>
                                  {event.sub_markets[0].lastTradedYesPrice
                                    ? `${event.sub_markets[0].lastTradedYesPrice}%`
                                    : "--"}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={handleLoginDialogClose}
        onShowRegister={() => {
          handleLoginDialogClose();
          setRegisterDialogOpen(true);
        }}
      />
      <RegisterDialog
        open={registerDialogOpen}
        onClose={handleRegisterDialogClose}
        onShowLogin={() => {
          handleRegisterDialogClose();
          setLoginDialogOpen(true);
        }}
      />
    </header>
  );
};

export default Navbar;
