import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "../components/Dropdown";
import GreenButton from "./Buttons/GreenButton";
import RedButton from "./Buttons/RedButton";
import CustomColorButton from "./Buttons/CustomColorButton";
import LoginDialog from "./auth/LoginDialog";
import DatePickerDialog from "./DatePickerDialog";
import Loader from "./Loader"; // Import Loader component
import { postData } from "../services/apiServices";
import { useSelector } from "react-redux"; // Import useSelector for accessing theme
import logoDark from "../images/logo-dark-mode.svg";
import logoLight from "../images/logo-light-mode.svg";
import RegisterDialog from "./auth/RegisterDialog";
import { userDataAPI } from "../store/reducers/movieSlice";
// Helper function to determine if text should be white or black based on background color
const getContrastTextColor = (hexColor) => {
  // If no color is provided, return white as default
  if (!hexColor) return "#FFFFFF";

  // Remove the hash if it exists
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (perceived luminance)
  // Using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;

  // Return white for dark colors and black for light colors
  return brightness < 150 ? "#FFFFFF" : "#000000";
};

const MarketSideBar = ({
  selectedOption,
  onOptionSelect,
  selectedMarketId,
  event,
  hasSubMarkets,
  marketPrices, // Market prices for the currently selected submarket
  btn1,
  btn2,
  btn1Color,
  btn2Color,
  isLoadingColors = false,
  userPositions = [], // Add userPositions prop
}) => {
  const [category, setCategory] = useState("Market");
  const getInitialActiveTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get("tab");
    // Validate tabFromUrl to be either "Buy" or "Sell", default to "Buy"
    return tabFromUrl === "Buy" || tabFromUrl === "Sell" ? tabFromUrl : "Buy";
  };
  const [activeTab, setActiveTab] = useState(getInitialActiveTab());
  const [expiration, setExpiration] = useState(false);
  const [expirationType, setExpirationType] = useState("End of the Day");
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);
  const isLogin = useSelector((state) => state.user.isLogin);

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [yesBestAsk, setYesBestAsk] = useState(null);
  const [noBestAsk, setNoBestAsk] = useState(null);
  const [yesBestBid, setYesBestBid] = useState(null);
  const [noBestBid, setNoBestBid] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wiggleButton, setWiggleButton] = useState(false);
  const [yesPriceUpdated, setYesPriceUpdated] = useState(false);
  const [noPriceUpdated, setNoPriceUpdated] = useState(false);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === "dark"; // Check if dark mode is active

  // Metamask setup states
  const [metamaskSetupDialogOpen, setMetamaskSetupDialogOpen] = useState(false);
  const [proxyDeployed, setProxyDeployed] = useState(false);
  const [tradingEnabled, setTradingEnabled] = useState(false);
  const [tokenApproved, setTokenApproved] = useState(false);

  const orderTypeOptions = ["Market", "Limit"].map((type) => ({
    value: type.toLowerCase(),
    label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
  }));

  useEffect(() => {
    if (marketPrices) {
      const submarket = event?.sub_markets?.find(
        (m) => m._id === selectedMarketId
      );
      const side1 = submarket?.side_1 || "Yes";
      const side2 = submarket?.side_2 || "No";
      // Get the best ask and bid prices for side_1 and side_2 from the passed marketPrices prop
      const newSide1BestAsk = marketPrices[side1]?.bestAsk || null;
      const newSide2BestAsk = marketPrices[side2]?.bestAsk || null;
      const newSide1BestBid = marketPrices[side1]?.bestBid || null;
      const newSide2BestBid = marketPrices[side2]?.bestBid || null;
      // Only update state if there's a change to avoid unnecessary re-renders
      if (
        newSide1BestAsk !== yesBestAsk ||
        newSide1BestBid !== yesBestBid ||
        newSide2BestAsk !== noBestAsk ||
        newSide2BestBid !== noBestBid
      ) {
        // Track which prices changed for UI update effects
        const side1Changed =
          newSide1BestAsk !== yesBestAsk || newSide1BestBid !== yesBestBid;
        const side2Changed =
          newSide2BestAsk !== noBestAsk || newSide2BestBid !== noBestBid;
        // Set visual indicators for price updates
        if (side1Changed) {
          setYesPriceUpdated(true);
          setTimeout(() => setYesPriceUpdated(false), 1000);
        }
        if (side2Changed) {
          setNoPriceUpdated(true);
          setTimeout(() => setNoPriceUpdated(false), 1000);
        }
        setYesBestAsk(newSide1BestAsk);
        setNoBestAsk(newSide2BestAsk);
        setYesBestBid(newSide1BestBid);
        setNoBestBid(newSide2BestBid);
        // If an option is already selected, also update the limit price
        if (selectedOption) {
          if (selectedOption === side1) {
            setLimitPrice(
              activeTab === "Buy" ? newSide1BestAsk || 0 : newSide1BestBid || 0
            );
          } else if (selectedOption === side2) {
            setLimitPrice(
              activeTab === "Buy" ? newSide2BestAsk || 0 : newSide2BestBid || 0
            );
          }
        }
      }
    } else {
      // No market prices available, reset values
      setYesBestAsk(null);
      setNoBestAsk(null);
      setYesBestBid(null);
      setNoBestBid(null);
    }
  }, [marketPrices, selectedOption, activeTab]);

  // Check if user is logged in
  useEffect(() => {
    checkLoginStatus();

    // Add storage event listener to detect login/logout
    window.addEventListener("storage", handleStorageChange);

    // Add custom auth state change event listener
    window.addEventListener("auth-state-changed", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-state-changed", handleAuthStateChange);
    };
  }, []);

  // Function to check login status
  const checkLoginStatus = () => {
    const token = localStorage.getItem("UnomarketToken");
    const userDataStr = localStorage.getItem("user");

    if (token && userDataStr) {
      try {
        const parsedUserData = JSON.parse(userDataStr);
        setUserData(parsedUserData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };

  // Handle localStorage changes (from other tabs/windows)
  const handleStorageChange = (e) => {
    if (e.key === "token" || e.key === "user") {
      checkLoginStatus();
    }
  };

  // Add handler for auth state changes
  const handleAuthStateChange = (event) => {
    const { user } = event.detail;
    setUserData(user);
  };

  // Metamask signing functions
  const handleDeployProxy = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0].toLowerCase();
      if (account !== userData.wallet_address.toLowerCase()) {
        setErrorMessage("Connected wallet does not match user wallet");
        return;
      }

      const typedData = {
        types: {
          CreateProxy: [
            { name: "paymentToken", type: "address" },
            { name: "payment", type: "uint256" },
            { name: "paymentReceiver", type: "address" },
          ],
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
        },
        domain: {
          name: "Soundbet Contract Proxy Factory",
          chainId: "137",
          verifyingContract: "0xaacfeea03eb1561c4e67d661e40682bd20e3541b",
        },
        primaryType: "CreateProxy",
        message: {
          paymentToken: "0x0000000000000000000000000000000000000000",
          payment: "0",
          paymentReceiver: "0x0000000000000000000000000000000000000000",
        },
      };

      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(typedData)],
      });
      setProxyDeployed(true);
      localStorage.setItem("proxywallet", true);
    } catch (error) {
      console.error("Deploy proxy error:", error);
      setErrorMessage("Failed to deploy proxy wallet");
    }
  };

  const handleEnableTrading = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0].toLowerCase();
      if (account !== userData.wallet_address.toLowerCase()) {
        setErrorMessage("Connected wallet does not match user wallet");
        return;
      }

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const typedData = {
        types: {
          ClobAuth: [
            { name: "address", type: "address" },
            { name: "timestamp", type: "string" },
            { name: "nonce", type: "uint256" },
            { name: "message", type: "string" },
          ],
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
          ],
        },
        domain: {
          name: "ClobAuthDomain",
          version: "1",
          chainId: "137",
        },
        primaryType: "ClobAuth",
        message: {
          address: account,
          timestamp: timestamp,
          nonce: "0",
          message: "This message attests that I control the given wallet",
        },
      };

      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [account, JSON.stringify(typedData)],
      });
      setTradingEnabled(true);
      localStorage.setItem("enabletrade", true);
      // Send to backend if needed
    } catch (error) {
      console.error("Enable trading error:", error);
      setErrorMessage("Failed to enable trading");
    }
  };

  const handleApproveToken = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask not detected");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0].toLowerCase();
      if (account !== userData.wallet_address.toLowerCase()) {
        setErrorMessage("Connected wallet does not match user wallet");
        return;
      }

      const message =
        "0x33549ca31d2286f765df4f0870dbc0ba3f449a8a9de5dcd0f42fd29e7f07b52b";
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });
      setTokenApproved(true);
      localStorage.setItem("approvetoken", true);
      setMetamaskSetupDialogOpen(false);
      // Send to backend if needed
    } catch (error) {
      console.error("Approve token error:", error);
      setErrorMessage("Failed to approve token");
    }
  };
  const checkTrade = () => {
    if (isLogin) {
      const a = localStorage.getItem("proxywallet");
      const b = localStorage.getItem("enabletrade");
      const c = localStorage.getItem("approvetoken");
      return a && b && c;
    } else {
      return true;
    }
  };
  // useEffect(() => {
  //   const result = checkTrade();
  //   if (!result) {
  //     setMetamaskSetupDialogOpen(true);
  //   }
  // }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Update URL to persist tab state
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );

    // Update limit price based on new tab and currently selected option
    if (selectedOption) {
      // Use our state variables directly instead of getting from market info
      if (
        selectedOption ===
        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
      ) {
        // Set appropriate price based on tab: bestAsk for Buy, bestBid for Sell
        setLimitPrice(tab === "Buy" ? yesBestAsk || 0 : yesBestBid || 0);
      } else if (
        selectedOption ===
        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2
      ) {
        // Set appropriate price based on tab: bestAsk for Buy, bestBid for Sell
        setLimitPrice(tab === "Buy" ? noBestAsk || 0 : noBestBid || 0);
      }
    }
  };

  const handleNumberInput = (value, setter, min = 0, max = Infinity) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setter(min);
    } else {
      setter(Math.max(min, Math.min(max, numValue)));
    }
  };

  const handleIncrement = (currentValue, setter, increment) => {
    setter(Math.max(0, currentValue + increment));
  };

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
  };

  const handleLoginDialogClose = () => {
    setLoginDialogOpen(false);
    checkLoginStatus();
  };

  // Add event listener for position-sell-click event
  useEffect(() => {
    // Function to handle position sell click event
    const handlePositionSellClick = (event) => {
      const { marketId, side, shares, price } = event.detail;

      // Set the active tab to "Sell"
      setActiveTab("Sell");

      // Set the share count to the position's shares
      setShareCount(shares);

      // Calculate the amount based on shares and price
      const calculatedAmount = (shares * (price / 100)).toFixed(2);
      setAmount(parseFloat(calculatedAmount));

      // Set the limit price to the current price
      setLimitPrice(price);

      // Update category to "Limit" to ensure limit price is used
      setCategory("Limit");
    };

    // Add event listener
    window.addEventListener("position-sell-click", handlePositionSellClick);

    // Cleanup function
    return () => {
      window.removeEventListener(
        "position-sell-click",
        handlePositionSellClick
      );
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to clear error message after 5 seconds
  useEffect(() => {
    let timeoutId;
    if (errorMessage) {
      timeoutId = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  // Effect to handle wiggle animation
  useEffect(() => {
    let timeoutId;
    if (wiggleButton) {
      timeoutId = setTimeout(() => {
        setWiggleButton(false);
      }, 820); // Animation duration plus a bit more
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [wiggleButton]);

  // Custom handler for Yes/No button clicks that also sets the limit price
  const handleOptionSelect = (marketId, option, color1, color2) => {
    // Call the parent's onOptionSelect if provided
    if (onOptionSelect) {
      onOptionSelect(marketId, option, color1, color2);
    }

    // Set limit price based on selected option AND the active tab (Buy/Sell)
    if (
      option ===
      event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
    ) {
      // For Buy tab: use best ask price; For Sell tab: use best bid price
      setLimitPrice(activeTab === "Buy" ? yesBestAsk || 0 : yesBestBid || 0);
    } else if (
      option ===
      event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2
    ) {
      // For Buy tab: use best ask price; For Sell tab: use best bid price
      setLimitPrice(activeTab === "Buy" ? noBestAsk || 0 : noBestBid || 0);
    }
  };

  const [activeTitle,setActiveTitle] = useState("yes")



  const handleSubmit = async (title) => {
    // Construct the proper URL with leading slash

    setActiveTitle(title)
    const URL = `api/event/orders/${
      category === "Market" ? "market/" : ""
    }${activeTab.toLowerCase()}`; // Uses activeTab state
    const marketId = hasSubMarkets
      ? selectedMarketId
      : event.sub_markets[0]._id;

    // Validate required selections
    if (!selectedOption || (hasSubMarkets && !selectedMarketId)) {
      setErrorMessage(
        hasSubMarkets
          ? "Please select an option and market"
          : "Please select an option"
      );
      setWiggleButton(true);
      return;
    }

    // Validate input values
    if (
      (category === "Limit" && (limitPrice < 1 || limitPrice > 99)) ||
      shareCount <= 0 // Validate shares for all order types
    ) {
      setErrorMessage("Please enter valid values");
      setWiggleButton(true);
      return;
    }
    // console.log('!isLogin || !userData || !userData._id :>> ', !isLogin, !userData, userData._id);
    // Ensure user is logged in and we have the user ID
    if (!isLogin || !userData || !userData._id) {
      setLoginDialogOpen(true);
      return;
    }

    // Set submitting state to true
    setIsSubmitting(true);

    // Store current selection state to preserve after trade
    const currentMarketId = marketId;
    const currentOption = selectedOption;

    // Prepare the order data with consistent format
    const orderData = {
      event_id: event._id,
      market_id: marketId,
      side:
        selectedOption ===
        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
          ? event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
          : event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2,
      shares: parseInt(shareCount), // Always include shares
    };

    // Add limit-specific field
    if (category === "Limit") {
      orderData.price_per_share = parseFloat(limitPrice);
    }

    // Add expiration date in ISO string UTC format
    if (expiration) {
      if (expirationType === "Custom" && customDate) {
        // Convert the local date to UTC ISO string format for custom date
        orderData.expiration = customDate.toISOString();
      } else if (expirationType === "End of the Day") {
        // Set expiration to 11:59 PM of the current day in local time, converted to UTC
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM local time
        orderData.expiration = endOfDay.toISOString();
      }
    }

    try {
      const response = await postData(URL, orderData);

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("marketId", currentMarketId);
      searchParams.set("selection", currentOption);
      searchParams.set("tab", activeTab); // Persist activeTab to URL
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${searchParams.toString()}`
      );

      // Dispatch event to update market data everywhere
      if (response.success) {
        window.dispatchEvent(new Event("Soundbet-trade-success"));
        // window.location.reload();
      }

      setShareCount(0);
      setAmount(0);
      setLimitPrice(0);
      setErrorMessage(""); // Clear any existing errors
    } catch (error) {
      console.error("Order submission failed:");

      // Trigger button wiggle animation
      setWiggleButton(true);

      if (error.response) {
        console.error("Status code:", error.response.status);
        console.error("Response data:", error.response.data);

        // Set specific error message
        setErrorMessage(error.response.data.message || "Failed to place order");
      } else {
        console.error("Error:", error.message);
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
    dispatch(userDataAPI());
  };

  // Helper function to get the currently selected market info
  const getSelectedMarketInfo = () => {
    if (!event || !event.sub_markets || !selectedMarketId) {
      return null;
    }

    return event.sub_markets.find((market) => market._id === selectedMarketId);
  };

  // Helper function to get price text for Yes button
  const getYesPriceText = () => {
    if (isLoadingColors) return "Loading...";

    // Use the yesBestAsk state value which is updated from the marketPrices prop
    // Return team name/Yes first, then price if available
    const label = event?.sub_markets?.find(
      (m) => m._id === selectedMarketId
    )?.side_1;

    // Use price directly from our state (which is updated from props)
    // Show different price based on active tab - Ask for Buy, Bid for Sell
    const price = activeTab === "Buy" ? yesBestAsk : yesBestBid;

    if (price === null || price === undefined) {
      return label;
    }

    return `${label} ${price}¢`;
  };

  // Helper function to get price text for No button
  const getNoPriceText = () => {
    if (isLoadingColors) return "Loading...";

    // Return team name/No first, then price if available
    const label = event?.sub_markets?.find(
      (m) => m._id === selectedMarketId
    )?.side_2;

    // Use price directly from our state (which is updated from props)
    // Show different price based on active tab - Ask for Buy, Bid for Sell
    const price = activeTab === "Buy" ? noBestAsk : noBestBid;

    if (price === null || price === undefined) {
      return label;
    }

    return `${label} ${price}¢`;
  };

  // CSS class for wiggle animation
  const wiggleClass = wiggleButton ? "animate-wiggle" : "";

  // Get the selected market info
  const selectedMarket = getSelectedMarketInfo();

  // Add a new handler for expiration type change
  const handleExpirationTypeChange = (value) => {
    setExpirationType(value);

    // If user selects "Custom", automatically show the date picker
    if (value === "Custom") {
      // Set default time to tomorrow at noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0);
      setCustomDate(tomorrow);
      setShowDatePicker(true); // Show the date picker dialog immediately
    }
  };

  // Handle date change from the date picker dialog
  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    // Update expiration type to include the selected date
    setExpirationType("Custom");
  };

  // Format the date for display
  const formatDateTime = (date) => {
    return date.toLocaleString("en-UK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to get available units for selling
  const getAvailableUnits = () => {
    if (
      !userPositions ||
      !Array.isArray(userPositions) ||
      !selectedMarketId ||
      !selectedOption
    ) {
      return 0;
    }

    // Debug: Show structure of first position if available
    if (userPositions.length > 0) {
    }

    // Find positions for the current market and selected side
    const matchingPositions = userPositions.filter((position) => {
      return (
        position.marketId === selectedMarketId &&
        position.side.toLowerCase() === selectedOption.toLowerCase()
      );
    });

    // Sum up all shares for matching positions
    const totalShares = matchingPositions.reduce((total, position) => {
      return total + (position.shares || 0);
    }, 0);

    return totalShares;
  };
  const calculateToWin = () => {
    if (!shareCount) return 0;

    let result;

    // ✅ Buy Yes
    if (
      category === "Market" &&
      activeTab === "Buy" &&
      selectedOption === "Yes"
    ) {
      result = shareCount / (yesBestAsk / 100);
    }

    // ✅ Buy No
    else if (
      category === "Market" &&
      activeTab === "Buy" &&
      selectedOption === "No"
    ) {
      result = shareCount / (noBestAsk / 100);
    }

    // ✅ Sell Yes
    else if (
      category === "Market" &&
      activeTab === "Sell" &&
      selectedOption === "Yes"
    ) {
      result = shareCount * (yesBestBid / 100);
    }

    // ✅ Sell No
    else if (
      category === "Market" &&
      activeTab === "Sell" &&
      selectedOption === "No"
    ) {
      result = shareCount * (noBestBid / 100);
    }

    // ✅ Handle invalid, missing, or infinite results
    if (!isFinite(result) || result === 0) {
      return "No Orders";
    }

    return result;
  };

  return (
    <div
      className={`w-100 ${
        isDarkMode
          ? "bg-[#1A1B1E] text-[#C5C5C5] shadow-[0px_3px_9px_0px_rgba(0,0,0,0.3)]"
          : "bg-neutral-100 shadow-[0px_3px_9px_0px_rgba(131,131,131,0.18)]"
      } rounded-xl sticky top-[9rem] p-3 h-fit transition-all duration-300 ease-in-out`}>
      {/* {hasSubMarkets && selectedMarket && (
        <div className="flex justify-start gap-[5px] items-center mb-4">
          {selectedMarket.market_image ? (
            <img
              className="w-12 h-12 rounded ml-2"
              src={selectedMarket.market_image || ""}
              alt={selectedMarket.name || "Market"}
            />
          ) : (
            <div
              className={`w-12 h-12 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}></div>
          )}
          <div
            className={`${
              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
            } text-[10px] font-medium font-['IBMPlexSans']`}>
            {selectedMarket.name || "Market"}
          </div>
        </div>
      )} */}

      <div className="flex gap-2 items-center mb-2">
        <img
          className="w-12 h-12 sm:w-16 sm:h-16  rounded-[10px]"
          src={event.event_image || ""}
        />
        <div>
          <h1 className="text-[14px] sm:text-[14px] font-semibold">
            {event.event_title}
          </h1>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4 ">
          <h1
            className={`cursor-pointer text-[16px] transition-all duration-200 ease-in-out ${
              activeTab === "Buy"
                ? "text-[#4169E1] font-medium"
                : `${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  } font-medium`
            }`}
            onClick={() => handleTabChange("Buy")}>
            Buy
          </h1>
          <h1
            className={`cursor-pointer text-[16px] transition-all duration-200 ease-in-out ${
              activeTab === "Sell"
                ? "text-[#4169E1] font-medium"
                : `${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  } font-medium`
            }`}
            onClick={() => handleTabChange("Sell")}>
            Sell
          </h1>
        </div>
        <div>
          <Dropdown
            options={orderTypeOptions}
            value={orderTypeOptions.find(
              (opt) => opt.value === category.toLowerCase()
            )}
            onChange={(selectedOption) => {
              setCategory(
                selectedOption.value === "limit" ? "Limit" : "Market"
              );
            }}
          />
        </div>
      </div>

      <hr
        className={`mb-3 ${
          isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-300"
        }`}
      />

      {/* Show loader while colors are being extracted */}
      {isLoadingColors ? (
        <div className="py-6 flex flex-col items-center justify-center">
          <Loader size="medium" />
          <p
            className={`mt-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } text-sm`}>
            Loading team colors...
          </p>
        </div>
      ) : hasSubMarkets ? (
        <div className="my-3 flex justify-between gap-2">
          <GreenButton
            title={getYesPriceText() || "Yes"}
            className={`text-[16px] ${
              yesPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={
              selectedOption ===
              event?.sub_markets?.find((m) => m._id === selectedMarketId)
                ?.side_1
            }
            onClick={() =>
              handleOptionSelect(
                selectedMarketId,
                event?.sub_markets?.find((m) => m._id === selectedMarketId)
                  ?.side_1,
                btn1Color,
                btn2Color
              )
            }
          />
          <RedButton
            title={getNoPriceText() || "No"}
            className={`text-[16px] ${
              noPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={
              selectedOption ===
              event?.sub_markets?.find((m) => m._id === selectedMarketId)
                ?.side_2
            }
            onClick={() =>
              handleOptionSelect(
                selectedMarketId,
                event?.sub_markets?.find((m) => m._id === selectedMarketId)
                  ?.side_2,
                btn1Color,
                btn2Color
              )
            }
          />
        </div>
      ) : (
        <div className="my-3 flex justify-between gap-2">
          <CustomColorButton
            title={getYesPriceText() || event?.team1_short_name || "Yes"}
            className={`text-[16px] ${
              yesPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={
              selectedOption ===
              event?.sub_markets?.find((m) => m._id === selectedMarketId)
                ?.side_1
            }
            onClick={() =>
              handleOptionSelect(
                selectedMarketId || event?.sub_markets?.[0]?._id,
                event?.sub_markets?.find((m) => m._id === selectedMarketId)
                  ?.side_1,
                btn1Color,
                btn2Color
              )
            }
            activeColor={btn1Color || "#298C8C"}
            activeHoverColor={
              btn1Color ? btn1Color.replace(/^#/, "#") + "90" : "#237b7b"
            }
            textColor={btn1Color || "#298C8C"}
          />
          <CustomColorButton
            title={getNoPriceText() || event?.team2_short_name || "No"}
            className={`text-[16px] ${
              noPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={
              selectedOption ===
              event?.sub_markets?.find((m) => m._id === selectedMarketId)
                ?.side_2
            }
            onClick={() =>
              handleOptionSelect(
                selectedMarketId || event?.sub_markets?.[0]?._id,
                event?.sub_markets?.find((m) => m._id === selectedMarketId)
                  ?.side_2,
                btn1Color,
                btn2Color
              )
            }
            activeColor={btn2Color || "#8D1F17"}
            activeHoverColor={
              btn2Color ? btn2Color.replace(/^#/, "#") + "90" : "#7a1a13"
            }
            textColor={btn2Color || "#8D1F17"}
          />
        </div>
      )}

      {/* Only show form fields if colors are loaded */}
      {!isLoadingColors && (
        <>
          {category === "Limit" && activeTab === "Buy" && (
            <React.Fragment>
              <div
                className={`w-full h-12  flex justify-between items-center  mb-1 pt-1 pb-4 border-b border-[#C5C5C5]/30`}>
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169e1]"
                  }`}>
                  Limit Price
                </span>
                <div className="w-[150px] flex items-center border border-[#C5C5C5]/30 p-1 rounded justify-center">
                  <button
                    className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
                    onClick={() =>
                      handleIncrement(limitPrice, setLimitPrice, -1)
                    }>
                    <span className="text-[16px]">-</span>
                  </button>

                  <input
                    value={limitPrice || ""}
                    onChange={(e) =>
                      handleNumberInput(e.target.value, setLimitPrice, 0, 99)
                    }
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    placeholder="0"
                    className={`mx-2 w-6 text-right text-[16px] focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
                    }`}
                  />
                  <span className="text-[16px] mr-2">¢</span>
                  <button
                    className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
                    onClick={() =>
                      handleIncrement(limitPrice, setLimitPrice, 1)
                    }>
                    <span className="text-[16px]">+</span>
                  </button>
                </div>
              </div>

              <div
                className={`w-full h-12 pt-1 flex justify-between items-center  mb-2`}>
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169e1]"
                  }`}>
                  Shares
                </span>
                <input
                  value={shareCount || ""}
                  onChange={(e) =>
                    handleNumberInput(e.target.value, setShareCount)
                  }
                  type="number"
                  min="0"
                  placeholder="0"
                  className={`w-[150px] border border-[#C5C5C5]/30 p-1 rounded  text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                    isDarkMode ? " text-[#C5C5C5]" : "text-inherit"
                  }`}
                />
              </div>

              <div
                className={`w-full h-12 rounded-[5px] ${
                  isDarkMode ? "border-t-[#C5C5C5]/30" : "border-t-zinc-200"
                } border-t flex justify-between items-center  mb-1`}>
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169e1]"
                  }`}>
                  Set Expiration
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={expiration}
                    onChange={() => setExpiration(!expiration)}
                  />
                  <div
                    className={`w-9 h-5 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]`}></div>
                </label>
              </div>

              {expiration && (
                <div
                  className={`w-full h-12 rounded-[5px] ${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
                  } border flex justify-between items-center p-2 mb-3`}>
                  <Dropdown
                    options={["End of the Day", "Custom"]}
                    value={
                      expirationType === "Custom" && customDate
                        ? `${formatDateTime(customDate)}`
                        : expirationType
                    }
                    onChange={(value) => {
                      const baseValue = value.startsWith("Custom: ")
                        ? "Custom"
                        : value;
                      handleExpirationTypeChange(baseValue);
                    }}
                    width="260px"
                  />
                </div>
              )}

              <div className="w-full space-y-2 mb-3">
                <div className="flex justify-between">
                  <span
                    className={`text-[16px] ${
                      isDarkMode ? "text-[white]" : "text-[#4169E1]"
                    }`}>
                    Total
                  </span>
                  <span className="text-[16px]">
                    ${((shareCount * limitPrice) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-[16px] ${
                      isDarkMode ? "text-[white]" : "text-[#4169E1]"
                    }`}>
                    To Win
                  </span>
                  <span className="text-[18px] text-[#1447e6] font-bold">
                    ${shareCount.toFixed(2)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          )}

          {category === "Limit" && activeTab === "Sell" && (
            <React.Fragment>
              <div
                className={`w-full pt-1 h-12  flex justify-between items-center mb-3 pb-4 border-b border-[#C5C5C5]/30`}>
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169e1]"
                  }`}>
                  Limit Price
                </span>
                <div className="w-[150px] flex items-center border border-[#C5C5C5]/30 p-1 rounded justify-center">
                  <button
                    className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
                    onClick={() =>
                      handleIncrement(limitPrice, setLimitPrice, -1)
                    }>
                    <span className="text-[16px]">-</span>
                  </button>

                  <input
                    value={limitPrice || ""}
                    onChange={(e) =>
                      handleNumberInput(e.target.value, setLimitPrice, 0, 99)
                    }
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    placeholder="0"
                    className={`mx-2 w-6 text-right text-[16px] focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
                    }`}
                  />
                  <span className="text-[16px] mr-2">¢</span>
                  <button
                    className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
                    onClick={() =>
                      handleIncrement(limitPrice, setLimitPrice, 1)
                    }>
                    <span className="text-[16px]">+</span>
                  </button>
                </div>
              </div>

              <div className={`w-full ] pt-1  mb-3 `}>
                <div className="flex justify-between items-center h-8">
                  <span
                    className={`text-[16px] ${
                      isDarkMode ? "text-[white]" : "text-[#4169e1]"
                    }`}>
                    Shares
                  </span>
                  <input
                    value={shareCount || ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // For sell mode, check against available units
                      if (activeTab === "Sell") {
                        const availableUnits = getAvailableUnits();
                        const numValue = parseFloat(inputValue) || 0;
                        if (numValue <= availableUnits) {
                          handleNumberInput(inputValue, setShareCount);
                        }
                        // If user tries to enter more than available, don't update
                      } else {
                        // For buy mode, use normal validation
                        handleNumberInput(inputValue, setShareCount);
                      }
                    }}
                    type="number"
                    min="0"
                    max={activeTab === "Sell" ? getAvailableUnits() : undefined}
                    placeholder="0"
                    className={`w-[150px] border border-[#C5C5C5]/30 p-1 rounded  text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isDarkMode ? " text-[#C5C5C5]" : "text-inherit"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                {/* Left-aligned Available text */}
                <span
                  className={`text-[14px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169E1]"
                  }`}>
                  Available: {getAvailableUnits()}
                </span>

                {/* Right-aligned percentage buttons with space between */}
                <div className="flex items-center gap-2">
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(
                        Math.max(0, Math.floor(availableUnits * 0.25))
                      );
                    }}>
                    <span className="text-[12px]">25%</span>
                  </button>
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(
                        Math.max(0, Math.floor(availableUnits * 0.5))
                      );
                    }}>
                    <span className="text-[12px]">50%</span>
                  </button>
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(availableUnits);
                    }}>
                    <span className="text-[12px]">100%</span>
                  </button>
                </div>
              </div>

              <div
                className={`w-full h-12 rounded-[5px] ${
                  isDarkMode ? "border-t-[#C5C5C5]/30" : "border-t-zinc-200"
                } border-t flex justify-between items-center  mb-1`}>
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[white]" : "text-[#4169e1]"
                  }`}>
                  Set Expiration
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={expiration}
                    onChange={() => setExpiration(!expiration)}
                  />
                  <div
                    className={`w-9 h-5 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]`}></div>
                </label>
              </div>

              {expiration && (
                <div
                  className={`w-full h-12 rounded-[5px] ${
                    isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
                  } border flex justify-between items-center p-2 mb-3`}>
                  <Dropdown
                    options={["End of the Day", "Custom"]}
                    value={
                      expirationType === "Custom" && customDate
                        ? `${formatDateTime(customDate)}`
                        : expirationType
                    }
                    onChange={(value) => {
                      const baseValue = value.startsWith("Custom: ")
                        ? "Custom"
                        : value;
                      handleExpirationTypeChange(baseValue);
                    }}
                    width="260px"
                  />
                </div>
              )}

              <div className="w-full space-y-2 mb-3">
                <div className="flex justify-between">
                  <span
                    className={`text-[16px] ${
                      isDarkMode ? "text-[white]" : "text-[#4169e1]"
                    }`}>
                    You will receive
                  </span>
                  <span className="text-[18px] text-[#1447e6] font-bold">
                    ${((shareCount * limitPrice) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          )}
          {category === "Market" && (
            <React.Fragment>
              <div className="w-full h-12 rounded-[5px] flex justify-between items-center mb-3">
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[#fffff]" : "text-[#202020]"
                  }`}>
                  Amount
                </span>

                <div className="flex items-center">
                  <input
                    value={shareCount || ""}
                    onChange={(e) =>
                      handleNumberInput(e.target.value, setShareCount)
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`mr-2 text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
                    } transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="flex justify-between mb-3">
                <span
                  className={`text-[16px] ${
                    isDarkMode ? "text-[#fffff]" : "text-[#202020]"
                  }`}>
                  {/* 👇 Dynamic text based on activeTab */}
                  {activeTab === "Sell" ? "You'll receive" : "To Win"}
                </span>

                <span className="text-[20px] text-[#4169E1] font-bold">
                  {typeof calculateToWin() === "number"
                    ? `$${calculateToWin().toFixed(2)}`
                    : calculateToWin()}
                </span>
              </div>
            </React.Fragment>
          )}

          {category === "Market" && activeTab === "Sell" && (
            <React.Fragment>
              <div className={`w-full rounded-[5px]  p-2 mb-3`}>
                <div className="flex justify-between items-center h-8">
                  <span
                    className={`text-[16px] ${
                      isDarkMode ? "text-[white]" : "text-[#4169e1]"
                    }`}>
                    Shares
                  </span>
                  <input
                    value={shareCount || ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // For sell mode, check against available units
                      if (activeTab === "Sell") {
                        const availableUnits = getAvailableUnits();
                        const numValue = parseFloat(inputValue) || 0;
                        if (numValue <= availableUnits) {
                          handleNumberInput(inputValue, setShareCount);
                        }
                        // If user tries to enter more than available, don't update
                      } else {
                        // For buy mode, use normal validation
                        handleNumberInput(inputValue, setShareCount);
                      }
                    }}
                    type="number"
                    min="0"
                    max={activeTab === "Sell" ? getAvailableUnits() : undefined}
                    placeholder="0"
                    className={`mr-2 text-right text-[28px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 mb-3">
                {activeTab === "Sell" && getAvailableUnits() > 0 && (
                  <span
                    className={`text-[12px] ${
                      isDarkMode ? "text-[white]/70" : "text-[#4169E1]"
                    }`}>
                    Available: {getAvailableUnits()}
                  </span>
                )}
                <div className="w-full flex justify-end items-center gap-2">
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(
                        Math.max(0, Math.floor(availableUnits * 0.25))
                      );
                    }}>
                    <span className="text-[12px]">25%</span>
                  </button>
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(
                        Math.max(0, Math.floor(availableUnits * 0.5))
                      );
                    }}>
                    <span className="text-[12px]">50%</span>
                  </button>
                  <button
                    className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                      isDarkMode
                        ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                        : "border-zinc-300 hover:bg-gray-100"
                    } border flex justify-center items-center hover:cursor-pointer`}
                    onClick={() => {
                      const availableUnits = getAvailableUnits();
                      setShareCount(availableUnits);
                    }}>
                    <span className="text-[12px]">100%</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          )}

          <div className="w-full">
            {isLogin == true ? (
              selectedOption ===
              event?.sub_markets?.find((m) => m._id === selectedMarketId)
                ?.side_1 ? (
                <div className={wiggleClass}>
                  <CustomColorButton
                    title={
                      isSubmitting
                        ? "Processing..."
                        : `${activeTab === "Buy" ? "Buy" : "Sell"} ${
                            event?.sub_markets?.find(
                              (m) => m._id === selectedMarketId
                            )?.side_1
                          }`
                    }
                    isActive={!!selectedOption && !isSubmitting}
                    className="text-[16px]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    activeColor={
                      hasSubMarkets || !btn1Color ? "#298C8C" : btn1Color
                    }
                    activeHoverColor={
                      hasSubMarkets || !btn1Color
                        ? "#237b7b"
                        : btn1Color.replace(/^#/, "#") + "90"
                    }
                    textColor={
                      hasSubMarkets || !btn1Color ? "#298C8C" : btn1Color
                    }
                  />
                </div>
              ) : (
                <div className={wiggleClass}>
                  <CustomColorButton
                    title={
                      isSubmitting
                        ? "Processing..."
                        : `${activeTab === "Buy" ? "Buy" : "Sell"} ${
                            event?.sub_markets?.find(
                              (m) => m._id === selectedMarketId
                            )?.side_2
                          }`
                    }
                    isActive={!!selectedOption && !isSubmitting}
                    className="text-[16px]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    activeColor={
                      hasSubMarkets || !btn2Color ? "#8D1F17" : btn2Color
                    }
                    activeHoverColor={
                      hasSubMarkets || !btn2Color
                        ? "#7a1a13"
                        : btn2Color.replace(/^#/, "#") + "90"
                    }
                    textColor={
                      hasSubMarkets || !btn2Color ? "#8D1F17" : btn2Color
                    }
                  />

                 
                </div>
              )
            ) : (
              <button
                onClick={handleLoginClick}
                className={`w-full py-2  bg-[#FF4215]  rounded-full text-white text-[16px] ${
                  isDarkMode ? "text-[white]" : "text-[#4169e1]"
                } font-semibold hover:bg-[#FF4215] transition-colors`}>
                Login to Trade
              </button>
            )}
          </div>

          <div
            className={`w-full mt-[12px] text-[#e61919] text-center font-medium transition-opacity duration-300 ${
              errorMessage ? "opacity-100" : "opacity-0"
            }`}>
            {errorMessage || ""}
          </div>
        </>
      )}

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
        onClose={() => setRegisterDialogOpen(false)}
        onShowLogin={() => {
          setRegisterDialogOpen(false);
          setLoginDialogOpen(true);
        }}
      />
      {/* Date picker dialog */}
      <DatePickerDialog
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        date={customDate}
        onDateChange={(date) => {
          setCustomDate(date);
          // Update expiration type to include the selected date
          setExpirationType("Custom");
        }}
        title="Set Custom Expiration"
      />

      {/* Metamask Setup Dialog */}
      {metamaskSetupDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md w-full ${
              isDarkMode ? "bg-[#1A1B1E] text-white" : "bg-white"
            }`}>
            <h2 className="text-xl font-bold mb-4">MetaMask Wallet Setup</h2>
            {/* Placeholder for image */}
            <img
              src={logoLight}
              alt="Setup Image"
              width="100"
              height="100"
              className="mb-4"
            />{" "}
            {/* Replace with actual image path */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Deploy Proxy Wallet</span>
                {proxyDeployed ? (
                  <span className="text-green-500">Completed</span>
                ) : (
                  <button
                    onClick={handleDeployProxy}
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    Deploy
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Enable Trading</span>
                {tradingEnabled ? (
                  <span className="text-green-500">Completed</span>
                ) : (
                  <button
                    onClick={handleEnableTrading}
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    Enable
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Approve Token</span>
                {tokenApproved ? (
                  <span className="text-green-500">Completed</span>
                ) : (
                  <button
                    onClick={handleApproveToken}
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    Approve
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setMetamaskSetupDialogOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSideBar;
