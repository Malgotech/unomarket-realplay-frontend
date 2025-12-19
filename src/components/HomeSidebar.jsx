import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { TbArrowBigRightLineFilled } from "react-icons/tb";
import { fetchData, postData } from "../services/apiServices";
import { useNavigate } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";
import { useToast } from "../context/ToastContext";

const SkeletonWatchlist = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  return (
    <div className="w-full h-auto flex flex-col justify-start items-center gap-2">
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="w-full">
          <div
            className={`w-full h-auto flex justify-between items-center gap-1 p-2 rounded ${
              isDarkMode ? "bg-[#2F2F2F]" : "bg-[#E9E9E9]"
            } animate-pulse`}>
            <div className="w-[200px] flex flex-col gap-2">
              <div
                className={`h-[14px] w-3/4 rounded ${
                  isDarkMode ? "bg-[#3D3D3D]" : "bg-[#D5D5D5]"
                }`}></div>
              <div
                className={`h-[12px] w-1/2 rounded ${
                  isDarkMode ? "bg-[#3D3D3D]" : "bg-[#D5D5D5]"
                }`}></div>
            </div>

            <div
              className={`h-[18px] w-[40px] rounded ${
                isDarkMode ? "bg-[#3D3D3D]" : "bg-[#D5D5D5]"
              }`}></div>
          </div>

          {/* Sub Market Skeletons */}
          {[1, 2, 3].map((__, subIndex) => (
            <div
              key={subIndex}
              className={`w-full pl-4 h-auto flex justify-between items-center gap-1 p-2 rounded mt-1 ${
                isDarkMode ? "bg-[#2F2F2F]" : "bg-[#F3F3F3]"
              } animate-pulse`}>
              <div className="w-[200px] flex flex-col gap-2">
                <div
                  className={`h-[12px] w-3/4 rounded ${
                    isDarkMode ? "bg-[#3D3D3D]" : "bg-[#DCDCDC]"
                  }`}></div>
                <div
                  className={`h-[10px] w-1/2 rounded ${
                    isDarkMode ? "bg-[#3D3D3D]" : "bg-[#DCDCDC]"
                  }`}></div>
              </div>

              <div
                className={`h-[14px] w-[30px] rounded ${
                  isDarkMode ? "bg-[#3D3D3D]" : "bg-[#DCDCDC]"
                }`}></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const HomeSidebar = ({ setAddBookMark , addBookmark, handlesidebar, sidebar, addPosition }) => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const [active, setActive] = useState("watchlist");
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [position, setPosition] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
 const [isBookmarked, setIsBookmarked] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();
  const [loader,setLoader] = useState(false)

  const handleActive = (item) => {
    setActive(item);
  };

  const fetchBookmarkedEvents = async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const res = await fetchData(`api/user/bookmarks/events?page=1&limit=20`);

      if (res.success && res.events && Array.isArray(res.events)) {
        setBookmarkedEvents(res.events);

        // Check if there are more pages
        if (res.pagination && res.pagination.totalPages) {
          setHasMore(res.pagination.currentPage < res.pagination.totalPages);
        } else {
          setHasMore(false);
        }
      } else {
        setBookmarkedEvents([]);
        setHasMore(false);
        setError("No bookmarked events found");
      }
    } catch (err) {
      console.error("Error fetching bookmarked events:", err);
      setError("Failed to load bookmarked events. Please try again later.");
      setBookmarkedEvents([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedEvents();
  }, [addBookmark]);

  const handleCardClick = (item) => {
    // Only navigate if trading panel is not showing
    if (
      bookmarkedEvents.sub_markets &&
      bookmarkedEvents.sub_markets.length > 0
    ) {
      const firstMarketId = bookmarkedEvents.sub_markets[0]._id;
      const firstMarket = bookmarkedEvents.sub_markets[0];
      let defaultSelection = selectedMarkets[firstMarketId];
      if (!defaultSelection) {
        defaultSelection = firstMarket.side_1;
      } else {
        defaultSelection =
          defaultSelection === "yes" ? firstMarket.side_1 : firstMarket.side_2;
      }
      navigate(
        `/market/details/${item}?marketId=${firstMarketId}&selection=${defaultSelection}`
      );
    } else {
      navigate(`/market/details/${item}`);
    }
  };


  const fetchPositions = async (page = 1, limit = 10) => {
    try {
      const response = await fetchData(
        `api/event/positions?page=${page}&limit=${limit}`
      );
      setPosition(response?.positions);
      return response; // Return the entire response which now has positions and pagination
    } catch (error) {
      console.error("Error in fetchPositions:", error);
      return {
        success: false,
        positions: [],
        pagination: { totalPositions: 0, currentPage: 1, totalPages: 1 },
      };
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [addPosition]);

  const handleNavigate = (id) => {
    navigate(`/market/details/${id}`);
  };


 
 

  const handleBookmarkToggle = async ( item  ) => {
 setLoader(true)
    try {
      const response = await postData("api/user/bookmarks", {
        type: "event",
        content_id: item,
      });

      if (response.status) {
        setIsBookmarked(!isBookmarked);
        showSuccessToast(
          isBookmarked
            ? "Market removed from bookmarks"
            : "Market added to bookmarks"
        );

        setAddBookMark(!addBookmark);
         setLoader(false)

      } else {
        setLoader(false)
        showErrorToast("failed to Bookmark event");
        console.error("Failed to toggle bookmark:", response.message);
      }
    } catch (error) {
      setLoader(false)
      showErrorToast(error.message);
      console.error("Error toggling bookmark:", error);
    }  
  };

  return (
    <aside
      className={`fixed top-[112px] left-0 h-screen  p-[10px] hidden xl:inline
              ${sidebar ? "w-[300px]" : "w-[50px]"}   ${
        isDarkMode
          ? "shadow-[0px_4px_12px_0px_rgba(0,0,0,0.5)] bg-[#1a1a1a] "
          : "shadow-[0px_4px_12px_0px_rgba(137,137,137,0.25)]"
      }
              overflow-hidden transition-all duration-300`}>
      <div
        className={`w-full h-auto flex justify-between items-center   ${
          !sidebar && "justify-center"
        }`}>
        <div
          className={`w-full h-auto flex justify-start items-center gap-1  ${
            !sidebar && "hidden"
          } `}>
          <button
            onClick={() => handleActive("watchlist")}
            className={`w-full h-8 px-3 text-sm font-semibold rounded-full
          ${active === "watchlist" ? "bg-[#FF532A] text-white" : ""}
          
          ${
            isDarkMode
              ? " bg-[#1a1a1a] text-[#ffff]"
              : "bg-[#E9E9E9]  text-black"
          }
        `}>
            Bookmarks
          </button>

          {/* Survivor */}
          <button
            onClick={() => handleActive("portfolio")}
            className={`w-full h-8 px-3 text-sm font-semibold rounded-full
          ${active === "portfolio" ? "bg-[#FF532A] text-white" : ""}
          
          ${
            isDarkMode
              ? " bg-[#1a1a1a] text-[#ffff]"
              : "bg-[#E9E9E9]  text-black"
          }
        `}>
            Portfolio
          </button>
        </div>

        <button
          className="m-4   bg-none rounded transition-transform duration-300"
          onClick={handlesidebar}>
          <TbArrowBigRightLineFilled
            className={`text-2xl transition-transform duration-300 text-[#7E7E80] ${
              sidebar ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {
        loader && <SkeletonWatchlist/>
      }

      {!loader && 
      <div className={`w-full h-auto ${!sidebar && "hidden"}`}>
        {active === "watchlist" && (
          <div
            data-lenis-prevent
            className="w-full h-[calc(100vh-100px)] pb-[140px] scrollbar-hide  flex flex-col items-start justify-start gap-2 overflow-y-scroll">
            {bookmarkedEvents && bookmarkedEvents.length > 0 ? (
              bookmarkedEvents.map((event) => (
                <div key={event._id} className="w-full relative">
                  <IoCloseCircle className="absolute cursor-pointer top-0 right-0 text-red-600" onClick={()=>handleBookmarkToggle(event._id)} />

                  <div
                    onClick={() => handleCardClick(event?._id)}
                    className={`w-full h-auto flex justify-between items-center gap-1 p-2 rounded cursor-pointer ${
                      isDarkMode ? "hover:bg-none " : "hover:bg-[#E9E9E9]"
                    }`}>
                    <p
                      className={`mr-2 flex flex-col justify-start items-start gap-1 text-[15px] truncate w-[200px] ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}
                      title={event?.event_title}>
                      {event?.event_title}
                      <span
                        className={`mr-2 text-[13px] font-bold ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}>
                        {event?.event_title}
                      </span>
                    </p>

                    <span
                      className={`text-[18px] font-bold ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      {Number(event?.total_pool_in_usd).toFixed(1)}$
                    </span>
                  </div>

                  {/* Sub Markets */}
                  {/* {event?.sub_markets?.map((market) => (
                    <div
                      key={market._id}
                      onClick={() => handleCardClick(market._id)}
                      className={`w-full pl-4 h-auto flex justify-between items-center gap-1 p-2 rounded cursor-pointer ${
                        isDarkMode ? "hover:bg-none " : "hover:bg-[#F3F3F3]"
                      }`}>
                      <p
                        className={`mr-2 flex flex-col justify-start items-start gap-1 text-[14px] truncate w-[200px] ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}
                        title={market?.name}>
                        {market?.name}
                        <span
                          className={`text-[12px] font-semibold ${
                            isDarkMode ? "text-[#C5C5C5]" : "text-black"
                          }`}>
                          Yes / No
                        </span>
                      </p>

                      <span
                        className={`text-[16px] font-bold ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}>
                        ${market?.bond_amount}
                      </span>
                    </div>
                  ))} */}
                </div>
              ))
            ) : (
              <p
                className={`w-full h-20 flex justify-center items-center text-[16px] font-semibold mt-4 ${
                  isDarkMode ? "text-[#C5C5C5]" : "text-black"
                }`}>
                No Open Watchlist
              </p>
            )}
          </div>
        )}

        {active === "portfolio" && (
          <div
            data-lenis-prevent
            className="w-full h-[calc(100vh-100px)]  pb-[140px] scrollbar-hide flex flex-col items-start justify-start gap-2 overflow-y-scroll">
            {position && position.length > 0 ? (
              position.map((item) => (
                <div
                  key={item.eventId}
                  className="w-full flex flex-col justify-start items-start gap-1 cursor-pointer p-2"
                  onClick={() => handleNavigate(item?.eventId)}>
                  <div className="w-full flex justify-start items-center gap-1">
                    <img
                      src={item.eventImageUrl}
                      alt="img"
                      width={30}
                      height={30}
                    />
                    <p
                      className={`text-[14px] truncate w-[200px] ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      {item.eventName}
                    </p>
                    <div
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.side === "Yes"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {item.side}
                    </div>
                  </div>

                  <div className="w-full flex flex-col justify-start items-start gap-1">
                    <span
                      className={`mr-2 text-[13px] font-bold ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      {item.marketName}
                    </span>

                    <span
                      className={`mr-2 text-[13px] font-bold ${
                        isDarkMode ? "text-[#C5C5C5]" : "text-black"
                      }`}>
                      In Val: {item.currentTotalPrice.toFixed(0)}¢
                    </span>

                    <span
                      className={`flex text-[12px] ${
                        item.percentageChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                      <span
                        className={`mr-2 text-[13px] font-bold ${
                          isDarkMode ? "text-[#C5C5C5]" : "text-black"
                        }`}>
                        Curr Avg:
                      </span>

                      <span className="flex flex-col">
                        ${item.currentTotalPrice.toFixed(2)} (
                        {item.percentageChange >= 0 ? "+" : ""}
                        {item.percentageChange.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-[#C5C5C5]" : "text-black"
                }`}>
                No data found
              </p>
            )}
          </div>
        )}
      </div>
      }       
      
    </aside>
  );
};

export default HomeSidebar;
