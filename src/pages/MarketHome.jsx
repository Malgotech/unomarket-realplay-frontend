// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useLocation } from "react-router-dom";
// // Navbar removed - now handled globally in App.jsx
// import Dropdown from "../components/Dropdown";
// import TradeCard from "../components/market_cards/TradeCard";
// import Question from "../components/market_cards/Question";
// import QuestionPieChart from "../components/market_cards/QuestionPieChart";
// import Loader from "../components/Loader";
// import SkeletonCard from "../components/SkeletonCard";
// import { fetchData } from "../services/apiServices";
// import SubcategoryFilter from "../components/SubcategoryFilter";
// import Footer from "../components/Footer";
// import { useSelector } from "react-redux"; // Get theme from redux
// import SEO from "../components/SEO";
// import { seoConfig } from "../utils/seoConfig";

// const MarketHome = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const [isRegionLoaded, setIsRegionLoaded] = useState(false);
//   const [isContentVisible, setIsContentVisible] = useState(false); // State for handling fade transition

//   // Get the category from URL parameters
//   const { category } = useParams();
//   const location = useLocation();

//   // Add subcategory filter state
//   const [selectedSubcategories, setSelectedSubcategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [loadingSubcategories, setLoadingSubcategories] = useState(true);

//   // Ref for the observer
//   const observer = useRef();
//   // Ref for the last element
//   const lastEventElementRef = useCallback(
//     (node) => {
//       if (loading || loadingMore) return;
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver(
//         (entries) => {
//           if (entries[0].isIntersecting && hasMore) {
//             loadMoreEvents();
//           }
//         },
//         { threshold: 0.5 }
//       );
//       if (node) observer.current.observe(node);
//     },
//     [loading, loadingMore, hasMore]
//   );

//   // Effect to load the selected region from localStorage
//   useEffect(() => {
//     const cachedRegion = localStorage.getItem("soundbetSelectedRegion");
//     setSelectedRegion(cachedRegion || "World");
//     setIsRegionLoaded(true);
//   }, []);

//   // Add event listener for region changes
//   useEffect(() => {
//     // Function to handle region change events
//     const handleRegionChange = (event) => {
//       const newRegion = event.detail.region;
//       console.log(
//         `MarketHome component detected region change to: ${newRegion}`
//       );
//       setSelectedRegion(newRegion);
//       // Reset page to 1 and refresh data when region changes
//       setPage(1);
//       GetEvents();
//     };

//     // Add event listener
//     window.addEventListener("soundbetRegionChanged", handleRegionChange);

//     // Clean up
//     return () => {
//       window.removeEventListener("soundbetRegionChanged", handleRegionChange);
//     };
//   }, []); // Empty dependency array ensures this only runs once on mount

//   // Function to get region ID from name
//   const getRegionId = (regionName) => {
//     if (!regionName || regionName === "World") return null;

//     try {
//       // Get the complete region data from localStorage
//       const regionsRaw = localStorage.getItem("soundbetRegionsMeta");

//       if (regionsRaw) {
//         const regions = JSON.parse(regionsRaw);
//         // Find the region by name
//         const region = regions.find(
//           (r) => r.name.toLowerCase() === regionName.toLowerCase()
//         );
//         if (region && region._id) {
//           console.log(`Found region ID for ${regionName}: ${region._id}`);
//           return region._id;
//         }
//       }
//     } catch (err) {
//       console.error("Error getting region ID:", err);
//     }

//     return null;
//   };

//   const normalizeCategoryKey = (value) => {
//     if (value === null || value === undefined) return "";
//     return value.toString().trim().toLowerCase();
//   };

//   const slugifyCategoryKey = (value) => {
//     const normalized = normalizeCategoryKey(value);
//     if (!normalized) return "";
//     return normalized.replace(/[\s_]+/g, "-");
//   };

//   const matchesCategoryIdentifier = (categoryItem, identifier) => {
//     if (!categoryItem) return false;

//     const normalizedIdentifier = normalizeCategoryKey(identifier);
//     const slugIdentifier = slugifyCategoryKey(identifier);

//     const possibleMatches = [
//       categoryItem.name,
//       categoryItem.id,
//       categoryItem._id,
//       categoryItem.slug,
//     ];

//     return possibleMatches.some((candidate) => {
//       if (candidate === null || candidate === undefined) return false;

//       const normalizedCandidate = normalizeCategoryKey(candidate);
//       if (normalizedCandidate && normalizedCandidate === normalizedIdentifier) {
//         return true;
//       }

//       const slugCandidate = slugifyCategoryKey(candidate);
//       return slugCandidate && slugCandidate === slugIdentifier;
//     });
//   };

//   const findCategoryMatch = (categoriesList, identifier) => {
//     if (!Array.isArray(categoriesList)) return null;
//     return categoriesList.find((item) =>
//       matchesCategoryIdentifier(item, identifier)
//     );
//   };

//   // Function to get category ID from name (using the cached categories)
//   const getCategoryId = (categoryName) => {
//     if (!categoryName) return "all";

//     const normalizedCategoryName = normalizeCategoryKey(categoryName);

//     // Handle special static categories
//     if (["trending", "all", "new"].includes(normalizedCategoryName)) {
//       return normalizedCategoryName;
//     }

//     try {
//       // Try to get categories from localStorage
//       const cachedData = localStorage.getItem("SoundbetCategories");
//       if (cachedData) {
//         const parsedData = JSON.parse(cachedData);
//         const categoriesList = Array.isArray(parsedData)
//           ? parsedData
//           : parsedData.categories || [];

//         const categoryObj = findCategoryMatch(categoriesList, categoryName);
//         if (categoryObj) {
//           return categoryObj.id || categoryObj._id || categoryName;
//         }
//       }
//     } catch (err) {
//       console.error("Error getting category ID:", err);
//     }

//     // Fallback to using the category name
//     return categoryName;
//   };

//   // Function to fetch subcategories based on current category
//   const fetchSubcategories = async () => {
//     setLoadingSubcategories(true);
//     try {
//       // First check if we have cached categories
//       const cachedData = localStorage.getItem("soundbetCategories");
//       if (cachedData) {
//         const parsedData = JSON.parse(cachedData);
//         const categories = Array.isArray(parsedData)
//           ? parsedData
//           : parsedData.categories || [];

//         // Find the current category
//         const currentCategory = findCategoryMatch(categories, category);

//         if (
//           currentCategory &&
//           currentCategory.subcategories &&
//           currentCategory.subcategories.length > 0
//         ) {
//           // Format subcategories to have the correct structure
//           const formattedSubcategories = currentCategory.subcategories.map(
//             (subcat) => ({
//               id: subcat._id,
//               name: subcat.name,
//               image: subcat.image,
//             })
//           );
//           setSubcategories(formattedSubcategories);
//           setLoadingSubcategories(false);
//           return;
//         }
//       }

//       // If no cached data or current category not found, fetch from API
//       const data = await fetchData("api/admin/categories");

//       if (data.success) {
//         // Cache the categories data
//         localStorage.setItem("soundbetCategories", JSON.stringify(data));

//         // Find the current category
//         const currentCategory = findCategoryMatch(data.categories, category);

//         if (
//           currentCategory &&
//           currentCategory.subcategories &&
//           currentCategory.subcategories.length > 0
//         ) {
//           // Format subcategories to have the correct structure
//           const formattedSubcategories = currentCategory.subcategories.map(
//             (subcat) => ({
//               id: subcat._id,
//               name: subcat.name,
//               image: subcat.image,
//             })
//           );
//           setSubcategories(formattedSubcategories);
//         } else {
//           setSubcategories([]);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching subcategories:", err);
//       setSubcategories([]);
//     } finally {
//       setLoadingSubcategories(false);
//     }
//   };

//   // Load subcategories when category changes
//   useEffect(() => {
//     fetchSubcategories();
//   }, [category]);

//   // Helper function to check if an event's subcategory is selected
//   const isSubcategorySelected = (subcategoryId) => {
//     if (!selectedSubcategories || selectedSubcategories.length === 0) {
//       // If no subcategories selected, show all subcategories
//       return true;
//     }

//     return selectedSubcategories.includes(subcategoryId);
//   };

//   const GetEvents = async () => {
//     // Don't proceed if region isn't loaded yet
//     if (!isRegionLoaded) return;

//     setLoading(true);
//     setIsContentVisible(false); // Hide content before loading new data
//     setError(null);
//     setPage(1);
//     try {
//       // Get the corresponding ID for the category from URL
//       const categoryId = getCategoryId(category);

//       // Build query parameters
//       let apiUrl = `api/event/events?filter=${categoryId}&page=1&limit=10`;

//       // Add region filter if not World
//       const regionId = getRegionId(selectedRegion);
//       if (regionId) {
//         apiUrl += `&regions=${regionId}`;
//       }

//       // Add subcategory filter if any selected
//       if (selectedSubcategories && selectedSubcategories.length > 0) {
//         apiUrl += `&subcategories=${selectedSubcategories.join(",")}`;
//       }

//       console.log(`Making API call with URL: ${apiUrl}`);

//       // Make API call with the parameters
//       const res = await fetchData(apiUrl);

//       if (res.events && Array.isArray(res.events)) {
//         setEvents(res.events);
//         setHasMore(res.events.length === 10); // If we got 10 items, there might be more
//       } else {
//         setEvents([]);
//         setHasMore(false);
//         setError("No events found");
//       }
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError("Failed to load events. Please try again later.");
//       setEvents([]);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//       // Delay making content visible for smooth transition
//       setTimeout(() => {
//         setIsContentVisible(true);
//       }, 50);
//     }
//   };

//   const loadMoreEvents = async () => {
//     if (loadingMore || !hasMore) return;

//     setLoadingMore(true);
//     try {
//       const nextPage = page + 1;
//       const categoryId = getCategoryId(category);

//       // Build query parameters
//       let apiUrl = `api/event/events?filter=${categoryId}&page=${nextPage}&limit=10`;

//       // Add region filter if not World
//       const regionId = getRegionId(selectedRegion);
//       if (regionId) {
//         apiUrl += `&regions=${regionId}`;
//       }

//       // Add subcategory filter if any selected
//       if (selectedSubcategories && selectedSubcategories.length > 0) {
//         apiUrl += `&subcategories=${selectedSubcategories.join(",")}`;
//       }

//       const res = await fetchData(apiUrl);

//       if (res.events && Array.isArray(res.events)) {
//         if (res.events.length > 0) {
//           setEvents((prev) => [...prev, ...res.events]);
//           setPage(nextPage);
//           setHasMore(res.events.length === 10); // If we got fewer than 10 items, we've reached the end
//         } else {
//           setHasMore(false);
//         }
//       } else {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error("Error loading more events:", err);
//       setError("Failed to load more events. Please try again later.");
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // Only call GetEvents when region is loaded and dependencies change
//   useEffect(() => {
//     if (isRegionLoaded) {
//       GetEvents();
//     }
//   }, [
//     category,
//     location.pathname,
//     selectedRegion,
//     isRegionLoaded,
//     selectedSubcategories,
//   ]);

//   // Get the current theme from Redux store
//   const theme = useSelector((state) => state.theme.value);
//   const isDarkMode = theme === "dark";

//   // Generate SEO data based on category
//   const getSEOConfig = () => {
//     switch (category) {
//       case "sports":
//         return seoConfig.sports;
//       case "tech":
//         return seoConfig.tech;
//       case "economy":
//         return seoConfig.economy;
//       case "business":
//         return seoConfig.business;
//       case "pop-culture":
//         return seoConfig.popCulture;
//       default:
//         return {
//           ...seoConfig.market,
//           title: category
//             ? `${
//                 category.charAt(0).toUpperCase() + category.slice(1)
//               } Markets - YOLFT`
//             : seoConfig.market.title,
//           url: `https://soundbet.online/market${
//             category ? `/${category}` : ""
//           }`,
//         };
//     }
//   };

//   return (
//     <div
//       className={`market-home-page w-full min-h-screen  flex justify-center items-start  ${
//         isDarkMode ? " " : ""
//       }`}>
//       <SEO {...getSEOConfig()} />
//       <main className="container w-full mx-0 px-4 pt-34 pb-24 sm:pt-40 md:pt-34 max-w-[1350px]">
//         <div className="w-full lg:mx-0 sm:mx-0">
//           {/* Subcategory filter section - with horizontal scrolling */}
//           {!loadingSubcategories && subcategories.length > 0 && (
//             <div className="mb-5 relative">
//               <SubcategoryFilter
//                 subcategories={subcategories}
//                 selectedSubcategories={selectedSubcategories}
//                 onSelectSubcategory={setSelectedSubcategories}
//               />
//             </div>
//           )}

//           {/* Loading state with skeleton UI */}
//           {loading && (
//             <div className="w-full min-h-screen mt-4 ">
//               <div className="w-full   grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//               </div>
//               <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//               </div>
//               <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//                 <SkeletonCard />
//               </div>
//             </div>
//           )}

//           {/* Events grid with improved fade-in animation */}
//           {!loading && events.length > 0 && (
//             <div
//               className={`grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-5 transition-opacity duration-600 ease-in-out ${
//                 isContentVisible ? "opacity-100" : "opacity-0"
//               }`}>
//               {events.map((id, index) => {
//                 // Add ref to the last element
//                 const isLastElement = index === events.length - 1;
//                 return (
//                   <div
//                     ref={isLastElement ? lastEventElementRef : null}
//                     key={id._id}
//                     className="transition-all duration-300 ease-in-out">
//                     {id.has_sub_markets && (
//                       <Question res={id} GetEvents={GetEvents} />
//                     )}
//                     {!id.has_sub_markets && (
//                       <QuestionPieChart res={id} GetEvents={GetEvents} />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Loading more indicator with skeleton UI */}
//           {loadingMore && (
//             <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5 animate-fade-in">
//               {Array(3)
//                 .fill()
//                 .map((_, index) => (
//                   <SkeletonCard key={`skeleton-more-${index}`} />
//                 ))}
//             </div>
//           )}

//           {/* No events found */}
//           {!loading && events.length === 0 && error && (
//             <div className="flex flex-col items-center justify-center h-[50vh] text-center">
//               <i
//                 className={`ri-bar-chart-line text-5xl mb-4 ${
//                   isDarkMode ? "text-gray-500" : "text-gray-400"
//                 }`}></i>
//               <h3
//                 className={`text-xl font-semibold mb-2 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                 No Markets Found
//               </h3>
//               <p
//                 className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
//                 No markets are available for the selected category in the chosen
//                 region.
//               </p>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Only show Footer on md and up */}
//       <div className="hidden md:block">
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default MarketHome;



import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
// Navbar removed - now handled globally in App.jsx
import Dropdown from "../components/Dropdown";
import TradeCard from "../components/market_cards/TradeCard";
import Question from "../components/market_cards/Question";
import QuestionPieChart from "../components/market_cards/QuestionPieChart";
import Loader from "../components/Loader";
import SkeletonCard from "../components/SkeletonCard";
import { fetchData } from "../services/apiServices";
import SubcategoryFilter from "../components/SubcategoryFilter";
import Footer from "../components/Footer";
import { useSelector } from "react-redux"; // Get theme from redux
import SEO from "../components/SEO";
import { seoConfig } from "../utils/seoConfig";

const MarketHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isRegionLoaded, setIsRegionLoaded] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false); // State for handling fade transition

  // Get the category from URL parameters
  const { category } = useParams();
  const location = useLocation();

  // Add subcategory filter state
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);

  // Ref for the observer
  const observer = useRef();
  // Ref for the last element
  const lastEventElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreEvents();
          }
        },
        { threshold: 0.5 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Effect to load the selected region from localStorage
  useEffect(() => {
    const cachedRegion = localStorage.getItem("soundbetSelectedRegion");
    setSelectedRegion(cachedRegion || "World");
    setIsRegionLoaded(true);
  }, []);

  // Add event listener for region changes
  useEffect(() => {
    // Function to handle region change events
    const handleRegionChange = (event) => {
      const newRegion = event.detail.region;
      setSelectedRegion(newRegion);
      // Reset page to 1 and refresh data when region changes
      setPage(1);
      GetEvents();
    };

    // Add event listener
    window.addEventListener("soundbetRegionChanged", handleRegionChange);

    // Clean up
    return () => {
      window.removeEventListener("soundbetRegionChanged", handleRegionChange);
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  // Function to get region ID from name
  const getRegionId = (regionName) => {
    if (!regionName || regionName === "World") return null;

    try {
      // Get the complete region data from localStorage
      const regionsRaw = localStorage.getItem("soundbetRegionsMeta");

      if (regionsRaw) {
        const regions = JSON.parse(regionsRaw);
        // Find the region by name
        const region = regions.find(
          (r) => r.name.toLowerCase() === regionName.toLowerCase()
        );
        if (region && region._id) {
          return region._id;
        }
      }
    } catch (err) {
      console.error("Error getting region ID:", err);
    }

    return null;
  };

  const normalizeCategoryKey = (value) => {
    if (value === null || value === undefined) return "";
    return value.toString().trim().toLowerCase();
  };

  const slugifyCategoryKey = (value) => {
    const normalized = normalizeCategoryKey(value);
    if (!normalized) return "";
    return normalized.replace(/[\s_]+/g, "-");
  };

  const matchesCategoryIdentifier = (categoryItem, identifier) => {
    if (!categoryItem) return false;

    const normalizedIdentifier = normalizeCategoryKey(identifier);
    const slugIdentifier = slugifyCategoryKey(identifier);

    const possibleMatches = [
      categoryItem.name,
      categoryItem.id,
      categoryItem._id,
      categoryItem.slug,
    ];

    return possibleMatches.some((candidate) => {
      if (candidate === null || candidate === undefined) return false;

      const normalizedCandidate = normalizeCategoryKey(candidate);
      if (normalizedCandidate && normalizedCandidate === normalizedIdentifier) {
        return true;
      }

      const slugCandidate = slugifyCategoryKey(candidate);
      return slugCandidate && slugCandidate === slugIdentifier;
    });
  };

  const findCategoryMatch = (categoriesList, identifier) => {
    if (!Array.isArray(categoriesList)) return null;
    return categoriesList.find((item) =>
      matchesCategoryIdentifier(item, identifier)
    );
  };

  // Function to get category ID from name (using the cached categories)
  const getCategoryId = (categoryName) => {
    if (!categoryName) return "all";

    const normalizedCategoryName = normalizeCategoryKey(categoryName);

    // Handle special static categories
    if (["trending", "all", "new"].includes(normalizedCategoryName)) {
      return normalizedCategoryName;
    }

    try {
      // Try to get categories from localStorage
      const cachedData = localStorage.getItem("SoundbetCategories");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const categoriesList = Array.isArray(parsedData)
          ? parsedData
          : parsedData.categories || [];

        const categoryObj = findCategoryMatch(categoriesList, categoryName);
        if (categoryObj) {
          return categoryObj.id || categoryObj._id || categoryName;
        }
      }
    } catch (err) {
      console.error("Error getting category ID:", err);
    }

    // Fallback to using the category name
    return categoryName;
  };

  // Function to fetch subcategories based on current category
  const fetchSubcategories = async () => {
    setLoadingSubcategories(true);
    try {
      // First check if we have cached categories
      const cachedData = localStorage.getItem("soundbetCategories");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const categories = Array.isArray(parsedData)
          ? parsedData
          : parsedData.categories || [];

        // Find the current category
        const currentCategory = findCategoryMatch(categories, category);

        if (
          currentCategory &&
          currentCategory.subcategories &&
          currentCategory.subcategories.length > 0
        ) {
          // Format subcategories to have the correct structure
          const formattedSubcategories = currentCategory.subcategories.map(
            (subcat) => ({
              id: subcat._id,
              name: subcat.name,
              image: subcat.image,
            })
          );
          setSubcategories(formattedSubcategories);
          setLoadingSubcategories(false);
          return;
        }
      }

      // If no cached data or current category not found, fetch from API
      const data = await fetchData("api/admin/categories");

      if (data.success) {
        // Cache the categories data
        localStorage.setItem("soundbetCategories", JSON.stringify(data));

        // Find the current category
        const currentCategory = findCategoryMatch(data.categories, category);

        if (
          currentCategory &&
          currentCategory.subcategories &&
          currentCategory.subcategories.length > 0
        ) {
          // Format subcategories to have the correct structure
          const formattedSubcategories = currentCategory.subcategories.map(
            (subcat) => ({
              id: subcat._id,
              name: subcat.name,
              image: subcat.image,
            })
          );
          setSubcategories(formattedSubcategories);
        } else {
          setSubcategories([]);
        }
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Load subcategories when category changes
  useEffect(() => {
    fetchSubcategories();
  }, [category]);

  // Helper function to check if an event's subcategory is selected
  const isSubcategorySelected = (subcategoryId) => {
    if (!selectedSubcategories || selectedSubcategories.length === 0) {
      // If no subcategories selected, show all subcategories
      return true;
    }

    return selectedSubcategories.includes(subcategoryId);
  };

  const GetEvents = async () => {
    // Don't proceed if region isn't loaded yet
    if (!isRegionLoaded) return;

    setLoading(true);
    setIsContentVisible(false); // Hide content before loading new data
    setError(null);
    setPage(1);
    try {
      // Get the corresponding ID for the category from URL
      const categoryId = getCategoryId(category);

      // Build query parameters
      let apiUrl = `api/event/events?filter=${categoryId}&page=1&limit=10`;

      // Add region filter if not World
      const regionId = getRegionId(selectedRegion);
      if (regionId) {
        apiUrl += `&regions=${regionId}`;
      }

      // Add subcategory filter if any selected
      if (selectedSubcategories && selectedSubcategories.length > 0) {
        apiUrl += `&subcategories=${selectedSubcategories.join(",")}`;
      }

      // Make API call with the parameters
      const res = await fetchData(apiUrl);

      if (res.events && Array.isArray(res.events)) {
        setEvents(res.events);
        setHasMore(res.events.length === 10); // If we got 10 items, there might be more
      } else {
        setEvents([]);
        setHasMore(false);
        setError("No events found");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
      setEvents([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      // Delay making content visible for smooth transition
      setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const categoryId = getCategoryId(category);

      // Build query parameters
      let apiUrl = `api/event/events?filter=${categoryId}&page=${nextPage}&limit=10`;

      // Add region filter if not World
      const regionId = getRegionId(selectedRegion);
      if (regionId) {
        apiUrl += `&regions=${regionId}`;
      }

      // Add subcategory filter if any selected
      if (selectedSubcategories && selectedSubcategories.length > 0) {
        apiUrl += `&subcategories=${selectedSubcategories.join(",")}`;
      }

      const res = await fetchData(apiUrl);

      if (res.events && Array.isArray(res.events)) {
        if (res.events.length > 0) {
          setEvents((prev) => [...prev, ...res.events]);
          setPage(nextPage);
          setHasMore(res.events.length === 10); // If we got fewer than 10 items, we've reached the end
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more events:", err);
      setError("Failed to load more events. Please try again later.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Only call GetEvents when region is loaded and dependencies change
  useEffect(() => {
    if (isRegionLoaded) {
      GetEvents();
    }
  }, [
    category,
    location.pathname,
    selectedRegion,
    isRegionLoaded,
    selectedSubcategories,
  ]);

  // Get the current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // Generate SEO data based on category
  const getSEOConfig = () => {
    switch (category) {
      case "sports":
        return seoConfig.sports;
      case "tech":
        return seoConfig.tech;
      case "economy":
        return seoConfig.economy;
      case "business":
        return seoConfig.business;
      case "pop-culture":
        return seoConfig.popCulture;
      default:
        return {
          ...seoConfig.market,
          title: category
            ? `${
                category.charAt(0).toUpperCase() + category.slice(1)
              } Markets - YOLFT`
            : seoConfig.market.title,
          url: `https://soundbet.online/market${
            category ? `/${category}` : ""
          }`,
        };
    }
  };

  // Function to get appropriate no data message based on category
  const getNoDataMessage = () => {
    // Get category display name
    const getCategoryDisplayName = () => {
      if (!category) return "All";
      const name = category.replace(/-/g, " ");
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const categoryName = getCategoryDisplayName();
    const regionName = selectedRegion || "World";

    // Check if subcategories are selected
    const hasSelectedSubcategories = selectedSubcategories.length > 0;

    if (hasSelectedSubcategories) {
      return {
        title: "No Markets Found",
        description: `No markets available for the selected ${categoryName.toLowerCase()} subcategories in ${regionName}.`,
        suggestion: "Try selecting different subcategories or clearing the filter.",
      };
    }

    // Return category-specific messages
    switch (category) {
      case "sports":
        return {
          title: "No Sports Markets Available",
          description: `There are currently no sports betting markets available for ${regionName}.`,
          suggestion: "Check back later for new sports events or try a different region.",
        };
      case "tech":
        return {
          title: "No Tech Markets Found",
          description: `No technology prediction markets available in ${regionName} right now.`,
          suggestion: "Tech markets are added regularly. Please check back soon!",
        };
      case "economy":
        return {
          title: "No Economic Markets",
          description: `No economic prediction markets available for ${regionName}.`,
          suggestion: "Economic markets are updated frequently. Try again later.",
        };
      case "business":
        return {
          title: "No Business Markets",
          description: `No business and finance markets available in ${regionName}.`,
          suggestion: "Business markets are added as events occur. Stay tuned!",
        };
      case "pop-culture":
        return {
          title: "No Pop Culture Markets",
          description: `No entertainment or pop culture markets available for ${regionName}.`,
          suggestion: "Pop culture markets are created for trending topics. Check back soon!",
        };
      case "politics":
        return {
          title: "No Political Markets",
          description: `No political prediction markets available in ${regionName}.`,
          suggestion: "Political markets are added around elections and major events.",
        };
      case "crypto":
        return {
          title: "No Crypto Markets",
          description: `No cryptocurrency markets available for ${regionName}.`,
          suggestion: "Crypto markets track major digital assets. More coming soon!",
        };
      default:
        return {
          title: "No Markets Found",
          description: `No prediction markets are currently available for ${categoryName} in ${regionName}.`,
          suggestion: "Try selecting a different category or region, or check back later.",
        };
    }
  };

  return (
    <div
      className={`market-home-page w-full min-h-screen    flex justify-center items-start  ${
        isDarkMode ? " " : ""
      }`}>
      <SEO {...getSEOConfig()} />
      <main className="container w-full mx-0 px-4  pb-24 pt-20  md:pt-34 max-w-[1350px]">
        <div className="w-full lg:mx-0 sm:mx-0">
          {/* Subcategory filter section - with horizontal scrolling */}
          {!loadingSubcategories && subcategories.length > 0 && (
            <div className="mb-5 relative">
              <SubcategoryFilter
                subcategories={subcategories}
                selectedSubcategories={selectedSubcategories}
                onSelectSubcategory={setSelectedSubcategories}
              />
            </div>
          )}

          {/* Loading state with skeleton UI */}
          {loading && (
            <div className="w-full min-h-screen mt-4 ">
              <div className="w-full   grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5 ml-1">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          )}

          {/* Events grid with improved fade-in animation */}
          {!loading && events.length > 0 && (
            <div
              className={`grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-5 transition-opacity duration-600 ease-in-out ${
                isContentVisible ? "opacity-100" : "opacity-0"
              }`}>
              {events.map((id, index) => {
                // Add ref to the last element
                const isLastElement = index === events.length - 1;
                return (
                  <div
                    ref={isLastElement ? lastEventElementRef : null}
                    key={id._id}
                    className="transition-all duration-300 ease-in-out">
                    {id.has_sub_markets && (
                      <Question res={id} GetEvents={GetEvents} />
                    )}
                    {!id.has_sub_markets && (
                      <QuestionPieChart res={id} GetEvents={GetEvents} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading more indicator with skeleton UI */}
          {loadingMore && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5 animate-fade-in">
              {Array(3)
                .fill()
                .map((_, index) => (
                  <SkeletonCard key={`skeleton-more-${index}`} />
                ))}
            </div>
          )}

          {/* No events found - with category-specific message */}
          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <i
                className={`ri-bar-chart-line text-5xl mb-4 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}></i>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                {getNoDataMessage().title}
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {getNoDataMessage().description}
              </p>
              {getNoDataMessage().suggestion && (
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {getNoDataMessage().suggestion}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Only show Footer on md and up */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default MarketHome;