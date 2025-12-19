// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import Dropdown from "./Dropdown";
// import GreenButton from "./Buttons/GreenButton";
// import RedButton from "./Buttons/RedButton";
// import CustomColorButton from "./Buttons/CustomColorButton";
// import LoginDialog from "./auth/LoginDialog";
// import Loader from "./Loader";
// import { postData } from "../services/apiServices";
// import RegisterDialog from "./auth/RegisterDialog";
// import { userDataAPI } from "../store/reducers/movieSlice";

// const MobileTradingPanel = ({
//   selectedOption,
//   onOptionSelect,
//   selectedMarketId,
//   event,
//   hasSubMarkets,
//   marketPrices,
//   btn1,
//   btn2,
//   btn1Color,
//   btn2Color,
//   isLoadingColors = false,
//   userPositions = [],
// }) => {
//   // Reuse state management from MarketSideBar
//   const [category, setCategory] = useState("Market");
 
//    const getInitialActiveTab = () => {
//      const params = new URLSearchParams(window.location.search);
//      const tabFromUrl = params.get("tab");
//      // Validate tabFromUrl to be either "Buy" or "Sell", default to "Buy"
//      return tabFromUrl === "Buy" || tabFromUrl === "Sell" ? tabFromUrl : "Buy";
//    };
//    const [activeTab, setActiveTab] = useState(getInitialActiveTab());
//    // console.log('activeTab :>> ', activeTab);
//    const [expiration, setExpiration] = useState(false);
//    const [expirationType, setExpirationType] = useState("End of the Day");
//    const [customDate, setCustomDate] = useState(new Date());
//    const [showDatePicker, setShowDatePicker] = useState(false);
//    const [shareCount, setShareCount] = useState(0);
//    const [amount, setAmount] = useState(0);
//    const [limitPrice, setLimitPrice] = useState(0);
//    const isLogin = useSelector((state) => state.user.isLogin);
 
//    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
//    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
 
//    const [userData, setUserData] = useState(null);
//    const [yesBestAsk, setYesBestAsk] = useState(null);
//    const [noBestAsk, setNoBestAsk] = useState(null);
//    // console.log('noBestAsk :>> ', noBestAsk);
//    const [yesBestBid, setYesBestBid] = useState(null);
//    // console.log('yesBestBid :>> ', yesBestBid);
//    const [noBestBid, setNoBestBid] = useState(null);
//    // console.log('noBestBid :>> ', noBestBid);
//    const [errorMessage, setErrorMessage] = useState("");
//    const [isSubmitting, setIsSubmitting] = useState(false);
//    const [wiggleButton, setWiggleButton] = useState(false);
//    const [yesPriceUpdated, setYesPriceUpdated] = useState(false);
//    // console.log('yesPriceUpdated :>> ', yesPriceUpdated);
//    const [noPriceUpdated, setNoPriceUpdated] = useState(false);
//    const theme = useSelector((state) => state.theme.value); // Get current theme
//    const isDarkMode = theme === "dark"; // Check if dark mode is active
 
//    // Metamask setup states
//    const [metamaskSetupDialogOpen, setMetamaskSetupDialogOpen] = useState(false);
//    const [proxyDeployed, setProxyDeployed] = useState(false);
//    const [tradingEnabled, setTradingEnabled] = useState(false);
//    const [tokenApproved, setTokenApproved] = useState(false);
 
//    // console.log('MarketSideBar - Received props:', {
//    //   hasSubMarkets,
//    //   marketId: selectedMarketId,
//    //   option: selectedOption,
//    //   btn1,
//    //   btn2,
//    //   btn1Color,
//    //   btn2Color,
//    //   eventId: event?._id,
//    //   team1_short_name: event?.team1_short_name,
//    //   team2_short_name: event?.team2_short_name,
//    //   marketPrices: marketPrices
//    // });
 
//    // Dropdown options with first character capitalization
//    const orderTypeOptions = ["Market", "Limit"].map((type) => ({
//      value: type.toLowerCase(),
//      label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
//    }));
 
//    // Effect to update local state when marketPrices changes
//    useEffect(() => {
//      if (marketPrices) {
//        // Get the current submarket to determine dynamic sides
//        const submarket = event?.sub_markets?.find(
//          (m) => m._id === selectedMarketId
//        );
//        const side1 = submarket?.side_1 || "Yes";
//        const side2 = submarket?.side_2 || "No";
//        // Get the best ask and bid prices for side_1 and side_2 from the passed marketPrices prop
//        const newSide1BestAsk = marketPrices[side1]?.bestAsk || null;
//        const newSide2BestAsk = marketPrices[side2]?.bestAsk || null;
//        const newSide1BestBid = marketPrices[side1]?.bestBid || null;
//        const newSide2BestBid = marketPrices[side2]?.bestBid || null;
//        // Only update state if there's a change to avoid unnecessary re-renders
//        if (
//          newSide1BestAsk !== yesBestAsk ||
//          newSide1BestBid !== yesBestBid ||
//          newSide2BestAsk !== noBestAsk ||
//          newSide2BestBid !== noBestBid
//        ) {
//          // Track which prices changed for UI update effects
//          const side1Changed =
//            newSide1BestAsk !== yesBestAsk || newSide1BestBid !== yesBestBid;
//          const side2Changed =
//            newSide2BestAsk !== noBestAsk || newSide2BestBid !== noBestBid;
//          // Set visual indicators for price updates
//          if (side1Changed) {
//            setYesPriceUpdated(true);
//            setTimeout(() => setYesPriceUpdated(false), 1000);
//          }
//          if (side2Changed) {
//            setNoPriceUpdated(true);
//            setTimeout(() => setNoPriceUpdated(false), 1000);
//          }
//          setYesBestAsk(newSide1BestAsk);
//          setNoBestAsk(newSide2BestAsk);
//          setYesBestBid(newSide1BestBid);
//          setNoBestBid(newSide2BestBid);
//          // If an option is already selected, also update the limit price
//          if (selectedOption) {
//            if (selectedOption === side1) {
//              setLimitPrice(
//                activeTab === "Buy" ? newSide1BestAsk || 0 : newSide1BestBid || 0
//              );
//            } else if (selectedOption === side2) {
//              setLimitPrice(
//                activeTab === "Buy" ? newSide2BestAsk || 0 : newSide2BestBid || 0
//              );
//            }
//          }
//        }
//      } else {
//        // No market prices available, reset values
//        setYesBestAsk(null);
//        setNoBestAsk(null);
//        setYesBestBid(null);
//        setNoBestBid(null);
//      }
//    }, [marketPrices, selectedOption, activeTab]);
 
//    // Check if user is logged in
//    useEffect(() => {
//      checkLoginStatus();
 
//      // Add storage event listener to detect login/logout
//      window.addEventListener("storage", handleStorageChange);
 
//      // Add custom auth state change event listener
//      window.addEventListener("auth-state-changed", handleAuthStateChange);
 
//      return () => {
//        window.removeEventListener("storage", handleStorageChange);
//        window.removeEventListener("auth-state-changed", handleAuthStateChange);
//      };
//    }, []);
 
//    // Function to check login status
//    const checkLoginStatus = () => {
//      const token = localStorage.getItem("UnomarketToken");
//      const userDataStr = localStorage.getItem("user");
 
//      if (token && userDataStr) {
//        try {
//          const parsedUserData = JSON.parse(userDataStr);
//          setUserData(parsedUserData);
//        } catch (e) {
//          console.error("Error parsing user data:", e);
//          setUserData(null);
//        }
//      } else {
//        setUserData(null);
//      }
//    };
 
//    // Handle localStorage changes (from other tabs/windows)
//    const handleStorageChange = (e) => {
//      if (e.key === "token" || e.key === "user") {
//        checkLoginStatus();
//      }
//    };
 
//    // Add handler for auth state changes
//    const handleAuthStateChange = (event) => {
//      const { user } = event.detail;
//      setUserData(user);
//    };
 
//    // Metamask signing functions
//    const handleDeployProxy = async () => {
//      if (!window.ethereum) {
//        setErrorMessage("MetaMask not detected");
//        return;
//      }
//      try {
//        const accounts = await window.ethereum.request({
//          method: "eth_requestAccounts",
//        });
//        const account = accounts[0].toLowerCase();
//        if (account !== userData.wallet_address.toLowerCase()) {
//          setErrorMessage("Connected wallet does not match user wallet");
//          return;
//        }
 
//        const typedData = {
//          types: {
//            CreateProxy: [
//              { name: "paymentToken", type: "address" },
//              { name: "payment", type: "uint256" },
//              { name: "paymentReceiver", type: "address" },
//            ],
//            EIP712Domain: [
//              { name: "name", type: "string" },
//              { name: "chainId", type: "uint256" },
//              { name: "verifyingContract", type: "address" },
//            ],
//          },
//          domain: {
//            name: "Soundbet Contract Proxy Factory",
//            chainId: "137",
//            verifyingContract: "0xaacfeea03eb1561c4e67d661e40682bd20e3541b",
//          },
//          primaryType: "CreateProxy",
//          message: {
//            paymentToken: "0x0000000000000000000000000000000000000000",
//            payment: "0",
//            paymentReceiver: "0x0000000000000000000000000000000000000000",
//          },
//        };
 
//        const signature = await window.ethereum.request({
//          method: "eth_signTypedData_v4",
//          params: [account, JSON.stringify(typedData)],
//        });
//        setProxyDeployed(true);
//        localStorage.setItem("proxywallet", "true");
//        // Here you might want to send the signature to your backend if needed
//      } catch (error) {
//        console.error("Deploy proxy error:", error);
//        setErrorMessage("Failed to deploy proxy wallet");
//      }
//    };
 
//    const handleEnableTrading = async () => {
//      if (!window.ethereum) {
//        setErrorMessage("MetaMask not detected");
//        return;
//      }
//      try {
//        const accounts = await window.ethereum.request({
//          method: "eth_requestAccounts",
//        });
//        const account = accounts[0].toLowerCase();
//        if (account !== userData.wallet_address.toLowerCase()) {
//          setErrorMessage("Connected wallet does not match user wallet");
//          return;
//        }
 
//        const timestamp = Math.floor(Date.now() / 1000).toString();
//        const typedData = {
//          types: {
//            ClobAuth: [
//              { name: "address", type: "address" },
//              { name: "timestamp", type: "string" },
//              { name: "nonce", type: "uint256" },
//              { name: "message", type: "string" },
//            ],
//            EIP712Domain: [
//              { name: "name", type: "string" },
//              { name: "version", type: "string" },
//              { name: "chainId", type: "uint256" },
//            ],
//          },
//          domain: {
//            name: "ClobAuthDomain",
//            version: "1",
//            chainId: "137",
//          },
//          primaryType: "ClobAuth",
//          message: {
//            address: account,
//            timestamp: timestamp,
//            nonce: "0",
//            message: "This message attests that I control the given wallet",
//          },
//        };
 
//        const signature = await window.ethereum.request({
//          method: "eth_signTypedData_v4",
//          params: [account, JSON.stringify(typedData)],
//        });
//        setTradingEnabled(true);
//        localStorage.setItem("enabletrade", "true");
//        // Send to backend if needed
//      } catch (error) {
//        console.error("Enable trading error:", error);
//        setErrorMessage("Failed to enable trading");
//      }
//    };
 
//    const handleApproveToken = async () => {
//      if (!window.ethereum) {
//        setErrorMessage("MetaMask not detected");
//        return;
//      }
//      try {
//        const accounts = await window.ethereum.request({
//          method: "eth_requestAccounts",
//        });
//        const account = accounts[0].toLowerCase();
//        if (account !== userData.wallet_address.toLowerCase()) {
//          setErrorMessage("Connected wallet does not match user wallet");
//          return;
//        }
 
//        const message =
//          "0x33549ca31d2286f765df4f0870dbc0ba3f449a8a9de5dcd0f42fd29e7f07b52b";
//        const signature = await window.ethereum.request({
//          method: "personal_sign",
//          params: [message, account],
//        });
//        setTokenApproved(true);
//        localStorage.setItem("approvetoken", "true");
//        setMetamaskSetupDialogOpen(false);
//        // Send to backend if needed
//      } catch (error) {
//        console.error("Approve token error:", error);
//        setErrorMessage("Failed to approve token");
//      }
//    };
 
//    const handleTabChange = (tab) => {
//      setActiveTab(tab);
 
//      // Update URL to persist tab state
//      const searchParams = new URLSearchParams(window.location.search);
//      searchParams.set("tab", tab);
//      window.history.replaceState(
//        {},
//        "",
//        `${window.location.pathname}?${searchParams.toString()}`
//      );
 
//      // Update limit price based on new tab and currently selected option
//      if (selectedOption) {
//        // Use our state variables directly instead of getting from market info
//        if (
//          selectedOption ===
//          event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
//        ) {
//          // Set appropriate price based on tab: bestAsk for Buy, bestBid for Sell
//          setLimitPrice(tab === "Buy" ? yesBestAsk || 0 : yesBestBid || 0);
//        } else if (
//          selectedOption ===
//          event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2
//        ) {
//          // Set appropriate price based on tab: bestAsk for Buy, bestBid for Sell
//          setLimitPrice(tab === "Buy" ? noBestAsk || 0 : noBestBid || 0);
//        }
//      }
//    };
 
//    const handleNumberInput = (value, setter, min = 0, max = Infinity) => {
//      const numValue = parseFloat(value);
//      if (isNaN(numValue)) {
//        setter(min);
//      } else {
//        setter(Math.max(min, Math.min(max, numValue)));
//      }
//    };
 
//    const handleIncrement = (currentValue, setter, increment) => {
//      setter(Math.max(0, currentValue + increment));
//    };
 
//    const handleLoginClick = () => {
//      setLoginDialogOpen(true);
//    };
 
//    const handleLoginDialogClose = () => {
//      setLoginDialogOpen(false);
//      checkLoginStatus();
//    };
 
//    // Add event listener for position-sell-click event
//    useEffect(() => {
//      // Function to handle position sell click event
//      const handlePositionSellClick = (event) => {
//        const { marketId, side, shares, price } = event.detail;
 
//        // Set the active tab to "Sell"
//        setActiveTab("Sell");
 
//        // Set the share count to the position's shares
//        setShareCount(shares);
 
//        // Calculate the amount based on shares and price
//        const calculatedAmount = (shares * (price / 100)).toFixed(2);
//        setAmount(parseFloat(calculatedAmount));
 
//        // Set the limit price to the current price
//        setLimitPrice(price);
 
//        // Update category to "Limit" to ensure limit price is used
//        setCategory("Limit");
//      };
 
//      // Add event listener
//      window.addEventListener("position-sell-click", handlePositionSellClick);
 
//      // Cleanup function
//      return () => {
//        window.removeEventListener(
//          "position-sell-click",
//          handlePositionSellClick
//        );
//      };
//    }, []); // Empty dependency array means this effect runs once on mount
 
//    // Effect to clear error message after 5 seconds
//    useEffect(() => {
//      let timeoutId;
//      if (errorMessage) {
//        timeoutId = setTimeout(() => {
//          setErrorMessage("");
//        }, 5000);
//      }
//      return () => {
//        if (timeoutId) clearTimeout(timeoutId);
//      };
//    }, [errorMessage]);
 
//    // Effect to handle wiggle animation
//    useEffect(() => {
//      let timeoutId;
//      if (wiggleButton) {
//        timeoutId = setTimeout(() => {
//          setWiggleButton(false);
//        }, 820); // Animation duration plus a bit more
//      }
//      return () => {
//        if (timeoutId) clearTimeout(timeoutId);
//      };
//    }, [wiggleButton]);
 
//    // Custom handler for Yes/No button clicks that also sets the limit price
//    const handleOptionSelect = (marketId, option, color1, color2) => {
//      console.log(
//        "marketId, option, color1, color2 :>> ",
//        marketId,
//        option,
//        color1,
//        color2
//      );
//      // Call the parent's onOptionSelect if provided
//      if (onOptionSelect) {
//        onOptionSelect(marketId, option, color1, color2);
//      }
 
//      // Set limit price based on selected option AND the active tab (Buy/Sell)
//      if (
//        option ===
//        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
//      ) {
//        // For Buy tab: use best ask price; For Sell tab: use best bid price
//        setLimitPrice(activeTab === "Buy" ? yesBestAsk || 0 : yesBestBid || 0);
//      } else if (
//        option ===
//        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2
//      ) {
//        // For Buy tab: use best ask price; For Sell tab: use best bid price
//        setLimitPrice(activeTab === "Buy" ? noBestAsk || 0 : noBestBid || 0);
//      }
//    };
 
//    const handleSubmit = async () => {
//      // Construct the proper URL with leading slash
//      const URL = `api/event/orders/${category === "Market" ? "market/" : ""
//        }${activeTab.toLowerCase()}`; // Uses activeTab state
//      const marketId = hasSubMarkets
//        ? selectedMarketId
//        : event.sub_markets[0]._id;
 
//      // Validate required selections
//      if (!selectedOption || (hasSubMarkets && !selectedMarketId)) {
//        setErrorMessage(
//          hasSubMarkets
//            ? "Please select an option and market"
//            : "Please select an option"
//        );
//        setWiggleButton(true);
//        return;
//      }
 
//      // Validate input values
//      if (
//        (category === "Limit" && (limitPrice < 1 || limitPrice > 99)) ||
//        shareCount <= 0 // Validate shares for all order types
//      ) {
//        setErrorMessage("Please enter valid values");
//        setWiggleButton(true);
//        return;
//      }
//      // console.log('!isLogin || !userData || !userData._id :>> ', !isLogin, !userData, userData._id);
//      // Ensure user is logged in and we have the user ID
//      if (!isLogin || !userData || !userData._id) {
//        setLoginDialogOpen(true);
//        return;
//      }
 
//      // Set submitting state to true
//      setIsSubmitting(true);
 
//      // Store current selection state to preserve after trade
//      const currentMarketId = marketId;
//      const currentOption = selectedOption;
 
//      // Prepare the order data with consistent format
//      const orderData = {
//        event_id: event._id,
//        market_id: marketId,
//        side:
//          selectedOption ===
//            event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
//            ? event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
//            : event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2,
//        shares: parseInt(shareCount), // Always include shares
//      };
 
//      // Add limit-specific field
//      if (category === "Limit") {
//        orderData.price_per_share = parseFloat(limitPrice);
//      }
 
//      // Add expiration date in ISO string UTC format
//      if (expiration) {
//        if (expirationType === "Custom" && customDate) {
//          // Convert the local date to UTC ISO string format for custom date
//          orderData.expiration = customDate.toISOString();
//        } else if (expirationType === "End of the Day") {
//          // Set expiration to 11:59 PM of the current day in local time, converted to UTC
//          const endOfDay = new Date();
//          endOfDay.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM local time
//          orderData.expiration = endOfDay.toISOString();
//        }
//      }
 
//      try {
//        const response = await postData(URL, orderData);
 
//        const searchParams = new URLSearchParams(window.location.search);
//        searchParams.set("marketId", currentMarketId);
//        searchParams.set("selection", currentOption);
//        searchParams.set("tab", activeTab); // Persist activeTab to URL
//        window.history.replaceState(
//          {},
//          "",
//          `${window.location.pathname}?${searchParams.toString()}`
//        );
 
//        // Dispatch event to update market data everywhere
//        if (response.success) {
//          window.dispatchEvent(new Event("Soundbet-trade-success"));
//          window.location.reload();
//        }
 
//        setShareCount(0);
//        setAmount(0);
//        setLimitPrice(0);
//        setErrorMessage(""); // Clear any existing errors
//      } catch (error) {
//        console.error("Order submission failed:");
 
//        // Trigger button wiggle animation
//        setWiggleButton(true);
 
//        if (error.response) {
//          console.error("Status code:", error.response.status);
//          console.error("Response data:", error.response.data);
 
//          // Set specific error message
//          setErrorMessage(error.response.data.message || "Failed to place order");
//        } else {
//          console.error("Error:", error.message);
//          setErrorMessage("Network error. Please try again.");
//        }
//      } finally {
//        setIsSubmitting(false);
//      }
//      dispatch(userDataAPI());
//    };
 
//    // Helper function to get the currently selected market info
//    const getSelectedMarketInfo = () => {
//      if (!event || !event.sub_markets || !selectedMarketId) {
//        return null;
//      }
 
//      return event.sub_markets.find((market) => market._id === selectedMarketId);
//    };
 
//    // Helper function to get price text for Yes button
//    const getYesPriceText = () => {
//      if (isLoadingColors) return "Loading...";
 
//      // Use the yesBestAsk state value which is updated from the marketPrices prop
//      // Return team name/Yes first, then price if available
//      const label = event?.sub_markets?.find(
//        (m) => m._id === selectedMarketId
//      )?.side_1;
 
//      // Use price directly from our state (which is updated from props)
//      // Show different price based on active tab - Ask for Buy, Bid for Sell
//      const price = activeTab === "Buy" ? yesBestAsk : yesBestBid;
 
//      if (price === null || price === undefined) {
//        return label;
//      }
 
//      return `${label} ${price}¢`;
//    };
 
//    // Helper function to get price text for No button
//    const getNoPriceText = () => {
//      if (isLoadingColors) return "Loading...";
 
//      // Return team name/No first, then price if available
//      const label = event?.sub_markets?.find(
//        (m) => m._id === selectedMarketId
//      )?.side_2;
 
//      // Use price directly from our state (which is updated from props)
//      // Show different price based on active tab - Ask for Buy, Bid for Sell
//      const price = activeTab === "Buy" ? noBestAsk : noBestBid;
 
//      if (price === null || price === undefined) {
//        return label;
//      }
 
//      return `${label} ${price}¢`;
//    };
 
//    // CSS class for wiggle animation
//    const wiggleClass = wiggleButton ? "animate-wiggle" : "";
 
//    // Get the selected market info
//    const selectedMarket = getSelectedMarketInfo();
 
//    // Add a new handler for expiration type change
//    const handleExpirationTypeChange = (value) => {
//      setExpirationType(value);
 
//      // If user selects "Custom", automatically show the date picker
//      if (value === "Custom") {
//        // Set default time to tomorrow at noon
//        const tomorrow = new Date();
//        tomorrow.setDate(tomorrow.getDate() + 1);
//        tomorrow.setHours(12, 0, 0);
//        setCustomDate(tomorrow);
//        setShowDatePicker(true); // Show the date picker dialog immediately
//      }
//    };
 
//    // Handle date change from the date picker dialog
//    const handleCustomDateChange = (date) => {
//      setCustomDate(date);
//      // Update expiration type to include the selected date
//      setExpirationType("Custom");
//    };
 
//    // Format the date for display
//    const formatDateTime = (date) => {
//      return date.toLocaleString("en-UK", {
//        day: "numeric",
//        month: "short",
//        year: "numeric",
//        hour: "numeric",
//        minute: "2-digit",
//        hour12: true,
//      });
//    };
 
//    // Helper function to get available units for selling
//    const getAvailableUnits = () => {
//      if (
//        !userPositions ||
//        !Array.isArray(userPositions) ||
//        !selectedMarketId ||
//        !selectedOption
//      ) {
//        return 0;
//      }
 
//      // Debug: Show structure of first position if available
//      if (userPositions.length > 0) {
//      }
 
//      // Find positions for the current market and selected side
//      const matchingPositions = userPositions.filter((position) => {
//        return (
//          position.marketId === selectedMarketId &&
//          position.side.toLowerCase() === selectedOption.toLowerCase()
//        );
//      });
 
//      // Sum up all shares for matching positions
//      const totalShares = matchingPositions.reduce((total, position) => {
//        return total + (position.shares || 0);
//      }, 0);
 
//      return totalShares;
//    };
//    // ✅ Correct calculation (divide by yesBestAsk / 100)
//    const calculateToWin = () => {
//      if (!shareCount) return 0;
 
//      // ✅ Buy Yes
//      if (category === "Market" && activeTab === "Buy" && selectedOption === "Yes") {
//        return shareCount / (yesBestAsk / 100);
//      }
 
//      // ✅ Buy No
//      if (category === "Market" && activeTab === "Buy" && selectedOption === "No") {
//        return shareCount / (noBestAsk / 100);
//      }
 
//      // ✅ Sell Yes
//      if (category === "Market" && activeTab === "Sell" && selectedOption === "Yes") {
//        return shareCount * (yesBestBid / 100);
//      }
 
//      // ✅ Sell No
//      if (category === "Market" && activeTab === "Sell" && selectedOption === "No") {
//        return shareCount * (noBestBid / 100);
//      }
 
//      return 0;
//    };
 
 
//   return (
//     <div className={`w-full px-4 ${isDarkMode ? "bg-[#1A1B1E]" : "bg-white"}`}>
//       {hasSubMarkets && selectedMarket && (
//         <div className="flex justify-between items-center mb-4">
//           <div
//             className={`text-[20px] font-medium ${
//               isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
//             }`}
//           >
//             {selectedMarket.name || "Market"}
//           </div>
//           {selectedMarket.market_image ? (
//             <img
//               className="w-12 h-12 rounded"
//               src={selectedMarket.market_image || ""}
//               alt={selectedMarket.name || "Market"}
//             />
//           ) : (
//             <div className="w-12 h-12 rounded bg-gray-200"></div>
//           )}
//         </div>
//       )}

//       <div className="flex justify-between items-center">
//         <div className="flex gap-4">
//           <h1
//             className={`cursor-pointer text-[16px] transition-all duration-200 ease-in-out hover:text-blue-500 ${
//               activeTab === "Buy"
//                 ? "text-blue-600 font-semibold"
//                 : isDarkMode
//                 ? "text-[#C5C5C5] font-normal"
//                 : "text-black font-normal"
//             }`}
//             onClick={() => handleTabChange("Buy")}
//           >
//             Buy
//           </h1>
//           <h1
//             className={`cursor-pointer text-[16px] transition-all duration-200 ease-in-out hover:text-blue-500 ${
//               activeTab === "Sell"
//                 ? "text-blue-600 font-semibold"
//                 : isDarkMode
//                 ? "text-[#C5C5C5] font-normal"
//                 : "text-black font-normal"
//             }`}
//             onClick={() => handleTabChange("Sell")}
//           >
//             Sell
//           </h1>
//         </div>
//         <div>
//           <Dropdown
//             options={orderTypeOptions}
//             value={orderTypeOptions.find(
//               (opt) => opt.value === category.toLowerCase()
//             )}
//             onChange={(selectedOption) => {
//               setCategory(
//                 selectedOption.value === "limit" ? "Limit" : "Market"
//               );
//             }}
//           />
//         </div>
//       </div>

//       <hr
//         className={`my-3 ${isDarkMode ? "border-zinc-800" : "border-zinc-300"}`}
//       />

//       {isLoadingColors ? (
//         <div className="py-6 flex flex-col items-center justify-center">
//           <Loader size="medium" />
//           <p className="mt-3 text-gray-500 text-sm">Loading team colors...</p>
//         </div>
//       ) : hasSubMarkets ? (
//         <div className="my-3 flex justify-between gap-2">
//           <GreenButton
//             title={getYesPriceText() || "Yes"}
//             className={`text-[16px] ${
//               yesPriceUpdated ? "animate-flash-highlight" : ""
//             }`}
//             isActive={
//               selectedOption ===
//               event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                 ?.side_1
//             }
//             onClick={() =>
//               handleOptionSelect(
//                 selectedMarketId,
//                 event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                   ?.side_1,
//                 btn1Color,
//                 btn2Color
//               )
//             }
//           />
//           <RedButton
//             title={getNoPriceText() || "No"}
//             className={`text-[16px] ${
//               noPriceUpdated ? "animate-flash-highlight" : ""
//             }`}
//             isActive={
//               selectedOption ===
//               event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                 ?.side_2
//             }
//             onClick={() =>
//               handleOptionSelect(
//                 selectedMarketId,
//                 event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                   ?.side_2,
//                 btn1Color,
//                 btn2Color
//               )
//             }
//           />
//         </div>
//       ) : (
//         <div className="my-3 flex justify-between gap-2">
//           <CustomColorButton
//             title={getYesPriceText() || event?.team1_short_name || "Yes"}
//             className={`text-[16px] ${
//               yesPriceUpdated ? "animate-flash-highlight" : ""
//             }`}
//             isActive={
//               selectedOption ===
//               event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                 ?.side_1
//             }
//             onClick={() =>
//               handleOptionSelect(
//                 selectedMarketId || event?.sub_markets?.[0]?._id,
//                 event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                   ?.side_1,
//                 btn1Color,
//                 btn2Color
//               )
//             }
//             activeColor={btn1Color || "#298C8C"}
//             activeHoverColor={
//               btn1Color ? btn1Color.replace(/^#/, "#") + "90" : "#237b7b"
//             }
//             textColor={btn1Color || "#298C8C"}
//           />
//           <CustomColorButton
//             title={getNoPriceText() || event?.team2_short_name || "No"}
//             className={`text-[16px] ${
//               noPriceUpdated ? "animate-flash-highlight" : ""
//             }`}
//             isActive={
//               selectedOption ===
//               event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                 ?.side_2
//             }
//             onClick={() =>
//               handleOptionSelect(
//                 selectedMarketId || event?.sub_markets?.[0]?._id,
//                 event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                   ?.side_2,
//                 btn1Color,
//                 btn2Color
//               )
//             }
//             activeColor={btn2Color || "#8D1F17"}
//             activeHoverColor={
//               btn2Color ? btn2Color.replace(/^#/, "#") + "90" : "#7a1a13"
//             }
//             textColor={btn2Color || "#8D1F17"}
//           />
//         </div>
//       )}

//       {!isLoadingColors && (
//         <>
//           {category === "Limit" && activeTab === "Buy" && (
//             <React.Fragment>
//               <div
//                 className={`w-full h-12  flex justify-between items-center  mb-1 pt-1 pb-4 border-b border-[#C5C5C5]/30`}
//               >
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Limit Price
//                 </span>
//                 <div className="w-[150px] flex items-center border border-[#C5C5C5]/30 p-1 rounded justify-center">
//                   <button
//                     className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
//                     onClick={() =>
//                       handleIncrement(limitPrice, setLimitPrice, -1)
//                     }
//                   >
//                     <span className="text-[16px]">-</span>
//                   </button>

//                   <input
//                     value={limitPrice || ""}
//                     onChange={(e) =>
//                       handleNumberInput(e.target.value, setLimitPrice, 0, 99)
//                     }
//                     type="number"
//                     min="1"
//                     max="99"
//                     step="1"
//                     placeholder="0"
//                     className={`mx-2 w-6 text-right text-[16px] focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                       isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
//                     }`}
//                   />
//                   <span className="text-[16px] mr-2">¢</span>
//                   <button
//                     className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
//                     onClick={() =>
//                       handleIncrement(limitPrice, setLimitPrice, 1)
//                     }
//                   >
//                     <span className="text-[16px]">+</span>
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className={`w-full h-12 pt-1 flex justify-between items-center  mb-2`}
//               >
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Shares
//                 </span>
//                 <input
//                   value={shareCount || ""}
//                   onChange={(e) =>
//                     handleNumberInput(e.target.value, setShareCount)
//                   }
//                   type="number"
//                   min="0"
//                   placeholder="0"
//                   className={`w-[150px] border border-[#C5C5C5]/30 p-1 rounded  text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                     isDarkMode ? " text-[#C5C5C5]" : "text-inherit"
//                   }`}
//                 />
//               </div>

//               <div
//                 className={`w-full h-12 rounded-[5px] ${
//                   isDarkMode ? "border-t-[#C5C5C5]/30" : "border-t-zinc-200"
//                 } border-t flex justify-between items-center  mb-1`}
//               >
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Set Expiration
//                 </span>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={expiration}
//                     onChange={() => setExpiration(!expiration)}
//                   />
//                   <div
//                     className={`w-9 h-5 ${
//                       isDarkMode ? "bg-gray-700" : "bg-gray-200"
//                     } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]`}
//                   ></div>
//                 </label>
//               </div>

//               {expiration && (
//                 <div
//                   className={`w-full h-12 rounded-[5px] ${
//                     isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
//                   } border flex justify-between items-center p-2 mb-3`}
//                 >
//                   <Dropdown
//                     options={["End of the Day", "Custom"]}
//                     value={
//                       expirationType === "Custom" && customDate
//                         ? `${formatDateTime(customDate)}`
//                         : expirationType
//                     }
//                     onChange={(value) => {
//                       const baseValue = value.startsWith("Custom: ")
//                         ? "Custom"
//                         : value;
//                       handleExpirationTypeChange(baseValue);
//                     }}
//                     width="260px"
//                   />
//                 </div>
//               )}

//               <div className="w-full space-y-2 mb-3">
//                 <div className="flex justify-between">
//                   <span
//                     className={`text-[16px] ${
//                       isDarkMode ? "text-[white]" : "text-[#4169E1]"
//                     }`}
//                   >
//                     Total
//                   </span>
//                   <span className="text-[16px]">
//                     ${((shareCount * limitPrice) / 100).toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span
//                     className={`text-[16px] ${
//                       isDarkMode ? "text-[white]" : "text-[#4169E1]"
//                     }`}
//                   >
//                     To Win
//                   </span>
//                   <span className="text-[18px] text-[#1447e6] font-bold">
//                     ${shareCount.toFixed(2)}
//                   </span>
//                 </div>
//               </div>
//             </React.Fragment>
//           )}

//           {category === "Limit" && activeTab === "Sell" && (
//             <React.Fragment>
//               <div
//                 className={`w-full pt-1 h-12  flex justify-between items-center mb-3 pb-4 border-b border-[#C5C5C5]/30`}
//               >
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Limit Price
//                 </span>
//                 <div className="w-[150px] flex items-center border border-[#C5C5C5]/30 p-1 rounded justify-center">
//                   <button
//                     className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
//                     onClick={() =>
//                       handleIncrement(limitPrice, setLimitPrice, -1)
//                     }
//                   >
//                     <span className="text-[16px]">-</span>
//                   </button>

//                   <input
//                     value={limitPrice || ""}
//                     onChange={(e) =>
//                       handleNumberInput(e.target.value, setLimitPrice, 0, 99)
//                     }
//                     type="number"
//                     min="1"
//                     max="99"
//                     step="1"
//                     placeholder="0"
//                     className={`mx-2 w-6 text-right text-[16px] focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                       isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
//                     }`}
//                   />
//                   <span className="text-[16px] mr-2">¢</span>
//                   <button
//                     className={`w-7 h-7 flex items-center justify-center  hover:cursor-pointer`}
//                     onClick={() =>
//                       handleIncrement(limitPrice, setLimitPrice, 1)
//                     }
//                   >
//                     <span className="text-[16px]">+</span>
//                   </button>
//                 </div>
//               </div>

//               <div className={`w-full ] pt-1  mb-3 `}>
//                 <div className="flex justify-between items-center h-8">
//                   <span
//                     className={`text-[16px] ${
//                       isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                     }`}
//                   >
//                     Shares
//                   </span>
//                   <input
//                     value={shareCount || ""}
//                     onChange={(e) => {
//                       const inputValue = e.target.value;
//                       // For sell mode, check against available units
//                       if (activeTab === "Sell") {
//                         const availableUnits = getAvailableUnits();
//                         const numValue = parseFloat(inputValue) || 0;
//                         if (numValue <= availableUnits) {
//                           handleNumberInput(inputValue, setShareCount);
//                         }
//                         // If user tries to enter more than available, don't update
//                       } else {
//                         // For buy mode, use normal validation
//                         handleNumberInput(inputValue, setShareCount);
//                       }
//                     }}
//                     type="number"
//                     min="0"
//                     max={activeTab === "Sell" ? getAvailableUnits() : undefined}
//                     placeholder="0"
//                     className={`w-[150px] border border-[#C5C5C5]/30 p-1 rounded  text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                       isDarkMode ? " text-[#C5C5C5]" : "text-inherit"
//                     }`}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mb-3">
//                 {/* Left-aligned Available text */}
//                 <span
//                   className={`text-[14px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169E1]"
//                   }`}
//                 >
//                   Available: {getAvailableUnits()}
//                 </span>

//                 {/* Right-aligned percentage buttons with space between */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(
//                         Math.max(0, Math.floor(availableUnits * 0.25))
//                       );
//                     }}
//                   >
//                     <span className="text-[12px]">25%</span>
//                   </button>
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(
//                         Math.max(0, Math.floor(availableUnits * 0.5))
//                       );
//                     }}
//                   >
//                     <span className="text-[12px]">50%</span>
//                   </button>
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(availableUnits);
//                     }}
//                   >
//                     <span className="text-[12px]">100%</span>
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className={`w-full h-12 rounded-[5px] ${
//                   isDarkMode ? "border-t-[#C5C5C5]/30" : "border-t-zinc-200"
//                 } border-t flex justify-between items-center  mb-1`}
//               >
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Set Expiration
//                 </span>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={expiration}
//                     onChange={() => setExpiration(!expiration)}
//                   />
//                   <div
//                     className={`w-9 h-5 ${
//                       isDarkMode ? "bg-gray-700" : "bg-gray-200"
//                     } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]`}
//                   ></div>
//                 </label>
//               </div>

//               {expiration && (
//                 <div
//                   className={`w-full h-12 rounded-[5px] ${
//                     isDarkMode ? "border-[#C5C5C5]/30" : "border-zinc-200"
//                   } border flex justify-between items-center p-2 mb-3`}
//                 >
//                   <Dropdown
//                     options={["End of the Day", "Custom"]}
//                     value={
//                       expirationType === "Custom" && customDate
//                         ? `${formatDateTime(customDate)}`
//                         : expirationType
//                     }
//                     onChange={(value) => {
//                       const baseValue = value.startsWith("Custom: ")
//                         ? "Custom"
//                         : value;
//                       handleExpirationTypeChange(baseValue);
//                     }}
//                     width="260px"
//                   />
//                 </div>
//               )}

//               <div className="w-full space-y-2 mb-3">
//                 <div className="flex justify-between">
//                   <span
//                     className={`text-[16px] ${
//                       isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                     }`}
//                   >
//                     You will receive
//                   </span>
//                   <span className="text-[18px] text-[#1447e6] font-bold">
//                     ${((shareCount * limitPrice) / 100).toFixed(2)}
//                   </span>
//                 </div>
//               </div>
//             </React.Fragment>
//           )}
//           {category === "Market" && (
//             <React.Fragment>
//               <div className="w-full h-12 rounded-[5px] flex justify-between items-center mb-3">
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   Amount
//                 </span>

//                 <div className="flex items-center">
//                   <input
//                     value={shareCount || ""}
//                     onChange={(e) =>
//                       handleNumberInput(e.target.value, setShareCount)
//                     }
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     placeholder="0.00"
//                     className={`mr-2 text-right text-[20px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                       isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
//                     } transition-all duration-300`}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-between mb-3">
//                 <span
//                   className={`text-[16px] ${
//                     isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                   }`}
//                 >
//                   {/* 👇 Dynamic text based on activeTab */}
//                   {activeTab === "Sell" ? "You'll receive" : "To Win"}
//                 </span>

//                 <span className="text-[24px] text-[#4169E1] font-bold">
//                   ${calculateToWin().toFixed(2)}
//                 </span>
//               </div>
//             </React.Fragment>
//           )}

//           {category === "Market" && activeTab === "Sell" && (
//             <React.Fragment>
//               <div className={`w-full rounded-[5px]  p-2 mb-3`}>
//                 <div className="flex justify-between items-center h-8">
//                   <span
//                     className={`text-[16px] ${
//                       isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                     }`}
//                   >
//                     Shares
//                   </span>
//                   <input
//                     value={shareCount || ""}
//                     onChange={(e) => {
//                       const inputValue = e.target.value;
//                       // For sell mode, check against available units
//                       if (activeTab === "Sell") {
//                         const availableUnits = getAvailableUnits();
//                         const numValue = parseFloat(inputValue) || 0;
//                         if (numValue <= availableUnits) {
//                           handleNumberInput(inputValue, setShareCount);
//                         }
//                         // If user tries to enter more than available, don't update
//                       } else {
//                         // For buy mode, use normal validation
//                         handleNumberInput(inputValue, setShareCount);
//                       }
//                     }}
//                     type="number"
//                     min="0"
//                     max={activeTab === "Sell" ? getAvailableUnits() : undefined}
//                     placeholder="0"
//                     className={`mr-2 text-right text-[28px] font-bold focus:outline-none appearance-none [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
//                       isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
//                     }`}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-between items-center gap-2 mb-3">
//                 {activeTab === "Sell" && getAvailableUnits() > 0 && (
//                   <span
//                     className={`text-[12px] ${
//                       isDarkMode ? "text-[white]/70" : "text-[#4169E1]"
//                     }`}
//                   >
//                     Available: {getAvailableUnits()}
//                   </span>
//                 )}
//                 <div className="w-full flex justify-end items-center gap-2">
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(
//                         Math.max(0, Math.floor(availableUnits * 0.25))
//                       );
//                     }}
//                   >
//                     <span className="text-[12px]">25%</span>
//                   </button>
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(
//                         Math.max(0, Math.floor(availableUnits * 0.5))
//                       );
//                     }}
//                   >
//                     <span className="text-[12px]">50%</span>
//                   </button>
//                   <button
//                     className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
//                       isDarkMode
//                         ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
//                         : "border-zinc-300 hover:bg-gray-100"
//                     } border flex justify-center items-center hover:cursor-pointer`}
//                     onClick={() => {
//                       const availableUnits = getAvailableUnits();
//                       setShareCount(availableUnits);
//                     }}
//                   >
//                     <span className="text-[12px]">100%</span>
//                   </button>
//                 </div>
//               </div>
//             </React.Fragment>
//           )}

//           <div className="w-full">
//             {isLogin == true ? (
//               selectedOption ===
//               event?.sub_markets?.find((m) => m._id === selectedMarketId)
//                 ?.side_1 ? (
//                 <div className={wiggleClass}>
//                   <CustomColorButton
//                     title={
//                       isSubmitting
//                         ? "Processing..."
//                         : `${activeTab === "Buy" ? "Buy" : "Sell"} ${
//                             event?.sub_markets?.find(
//                               (m) => m._id === selectedMarketId
//                             )?.side_1
//                           }`
//                     }
//                     isActive={!!selectedOption && !isSubmitting}
//                     className="text-[16px]"
//                     onClick={handleSubmit}
//                     disabled={isSubmitting}
//                     activeColor={
//                       hasSubMarkets || !btn1Color ? "#298C8C" : btn1Color
//                     }
//                     activeHoverColor={
//                       hasSubMarkets || !btn1Color
//                         ? "#237b7b"
//                         : btn1Color.replace(/^#/, "#") + "90"
//                     }
//                     textColor={
//                       hasSubMarkets || !btn1Color ? "#298C8C" : btn1Color
//                     }
//                   />
//                 </div>
//               ) : (
//                 <div className={wiggleClass}>
//                   <CustomColorButton
//                     title={
//                       isSubmitting
//                         ? "Processing..."
//                         : `${activeTab === "Buy" ? "Buy" : "Sell"} ${
//                             event?.sub_markets?.find(
//                               (m) => m._id === selectedMarketId
//                             )?.side_2
//                           }`
//                     }
//                     isActive={!!selectedOption && !isSubmitting}
//                     className="text-[16px]"
//                     onClick={handleSubmit}
//                     disabled={isSubmitting}
//                     activeColor={
//                       hasSubMarkets || !btn2Color ? "#8D1F17" : btn2Color
//                     }
//                     activeHoverColor={
//                       hasSubMarkets || !btn2Color
//                         ? "#7a1a13"
//                         : btn2Color.replace(/^#/, "#") + "90"
//                     }
//                     textColor={
//                       hasSubMarkets || !btn2Color ? "#8D1F17" : btn2Color
//                     }
//                   />
//                 </div>
//               )
//             ) : (
//               <button
//                 onClick={handleLoginClick}
//                 className={`w-full py-2  bg-[linear-gradient(49.36deg,#274ECC_35.12%,#2FBAA3_100%)]  rounded text-white text-[16px] ${
//                   isDarkMode ? "text-[white]" : "text-[#4169e1]"
//                 } font-semibold hover:bg-blue-700 transition-colors`}
//               >
//                 Login to Trade
//               </button>
//             )}
//           </div>

//           <div
//             className={`w-full mt-[12px] text-[#e61919] text-center font-medium transition-opacity duration-300 ${
//               errorMessage ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             {errorMessage || ""}
//           </div>
//         </>
//       )}

//       <LoginDialog
//         open={loginDialogOpen}
//         onClose={handleLoginDialogClose}
//         onShowRegister={() => {
//           handleLoginDialogClose();
//           setRegisterDialogOpen(true);
//         }}
//       />
//       <RegisterDialog
//         open={registerDialogOpen}
//         onClose={() => setRegisterDialogOpen(false)}
//         onShowLogin={() => {
//           setRegisterDialogOpen(false);
//           setLoginDialogOpen(true);
//         }}
//       />
//     </div>
//   );
// };

// export default MobileTradingPanel;



import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Dropdown from "./Dropdown";
import GreenButton from "./Buttons/GreenButton";
import RedButton from "./Buttons/RedButton";
import CustomColorButton from "./Buttons/CustomColorButton";
import LoginDialog from "./auth/LoginDialog";
import DatePickerDialog from "./DatePickerDialog";
import Loader from "./Loader";
import { postData } from "../services/apiServices";
import RegisterDialog from "./auth/RegisterDialog";
import { userDataAPI } from "../store/reducers/movieSlice";
import { FaAngleDown, FaCalendarDay } from "react-icons/fa6";

const ORDER_TYPES = [
  { value: "dollars", label: "Buy in Dollars" },
  { value: "contracts", label: "Buy in Contracts" },
  { value: "limit", label: "Limit Order" },
];

const MobileTradingPanel = ({
  selectedOption,
  onOptionSelect,
  selectedMarketId,
  event,
  hasSubMarkets,
  marketPrices,
  btn1,
  btn2,
  btn1Color,
  btn2Color,
  isLoadingColors = false,
  userPositions = [],
  subMarket,
  setAddPositon,
  addPosition,
  showLimit = false,
}) => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("Buy");
  const [orderType, setOrderType] = useState(showLimit ? "limit" : "dollars");
  const [amount, setAmount] = useState("");
  const [shares, setShares] = useState("");
  const [limitPrice, setLimitPrice] = useState(0);
  const [expiration, setExpiration] = useState(false);
  const [expirationType, setExpirationType] = useState("End of the Day");
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const timePickerRef = useRef(null);

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [yesPriceUpdated, setYesPriceUpdated] = useState(false);
  const [noPriceUpdated, setNoPriceUpdated] = useState(false);

  const isLogin = useSelector((s) => s.user.isLogin);
  const theme = useSelector((s) => s.theme.value);
  const isDarkMode = theme === "dark";

  // Market & Sides
  const market = event?.sub_markets?.find((m) => m._id === selectedMarketId);
  const side1 = market?.side_1 || "Yes";
  const side2 = market?.side_2 || "No";

  // Prices
  const yesAsk = marketPrices?.[side1]?.bestAsk;
  const yesBid = marketPrices?.[side1]?.bestBid;
  const noAsk = marketPrices?.[side2]?.bestAsk;
  const noBid = marketPrices?.[side2]?.bestBid;

  const bestAsk = selectedOption === side1 ? yesAsk : noAsk;
  const bestBid = selectedOption === side1 ? yesBid : noBid;
  const currentPrice = activeTab === "Buy" ? bestAsk : bestBid;

  // Available shares for sell
  const availableShares = userPositions
    .filter((p) => p.marketId === selectedMarketId && p.side === selectedOption)
    .reduce((sum, p) => sum + p.shares, 0);

  // Auto calculations
  useEffect(() => {
    if (!currentPrice || !selectedOption) return;

    if (orderType === "dollars" && amount) {
      const calcShares = (parseFloat(amount) / (currentPrice / 100)).toFixed(4);
      setShares(calcShares);
    }

    if ((orderType === "contracts" || orderType === "limit") && shares) {
      const price = orderType === "limit" ? limitPrice : currentPrice;
      const cost = ((parseFloat(shares) * price) / 100).toFixed(2);
      setAmount(cost);
    }
  }, [amount, shares, currentPrice, limitPrice, orderType, selectedOption, activeTab]);

  // Price update effects
  useEffect(() => {
    if (marketPrices) {
      const newSide1BestAsk = marketPrices[side1]?.bestAsk || null;
      const newSide2BestAsk = marketPrices[side2]?.bestAsk || null;
      const newSide1BestBid = marketPrices[side1]?.bestBid || null;
      const newSide2BestBid = marketPrices[side2]?.bestBid || null;

      // Track price changes for UI effects
      const side1Changed = newSide1BestAsk !== yesAsk || newSide1BestBid !== yesBid;
      const side2Changed = newSide2BestAsk !== noAsk || newSide2BestBid !== noBid;

      if (side1Changed) {
        setYesPriceUpdated(true);
        setTimeout(() => setYesPriceUpdated(false), 1000);
      }
      if (side2Changed) {
        setNoPriceUpdated(true);
        setTimeout(() => setNoPriceUpdated(false), 1000);
      }
    }
  }, [marketPrices]);

  // Check login status
  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-state-changed", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-state-changed", handleAuthStateChange);
    };
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("UnomarketToken");
    const userDataStr = localStorage.getItem("user");

    if (token && userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr));
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };

  const handleStorageChange = (e) => {
    if (e.key === "token" || e.key === "user") {
      checkLoginStatus();
    }
  };

  const handleAuthStateChange = (event) => {
    const { user } = event.detail;
    setUserData(user);
  };

  const resetForm = () => {
    setAmount("");
    setShares("");
    setLimitPrice(0);
    setExpiration(false);
    setErrorMessage("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
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

  const handleOptionSelect = (marketId, option, color1, color2) => {
    if (onOptionSelect) {
      onOptionSelect(marketId, option, color1, color2);
    }

    // Set limit price based on selection
    if (option === side1) {
      setLimitPrice(activeTab === "Buy" ? yesAsk || 0 : yesBid || 0);
    } else if (option === side2) {
      setLimitPrice(activeTab === "Buy" ? noAsk || 0 : noBid || 0);
    }
  };

  const handleSubmit = async () => {
    // === VALIDATION ===
    if (!selectedOption) {
      setErrorMessage("Please select Yes or No");
      setWiggle(true);
      setTimeout(() => setWiggle(false), 800);
      return;
    }

    if (!isLogin) {
      setLoginDialogOpen(true);
      return;
    }

    // Validate inputs based on order type
    if (orderType === "dollars" && (!amount || parseFloat(amount) <= 0)) {
      setErrorMessage("Please enter a valid amount");
      setWiggle(true);
      setTimeout(() => setWiggle(false), 800);
      return;
    }

    if (
      (orderType === "contracts" || orderType === "limit") &&
      (!shares || parseFloat(shares) <= 0)
    ) {
      setErrorMessage("Please enter valid shares");
      setWiggle(true);
      setTimeout(() => setWiggle(false), 800);
      return;
    }

    if (orderType === "limit") {
      if (limitPrice <= 0) {
        setErrorMessage("Price must be greater than 0¢");
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
        return;
      }

      if (limitPrice > 9999) {
        setErrorMessage("Maximum price is 9999¢ ($99.99)");
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
        return;
      }
    }

    // For Sell + Contracts/Limit → don't allow more than available
    if (
      activeTab === "Sell" &&
      (orderType === "contracts" || orderType === "limit")
    ) {
      const sharesToSell = parseFloat(shares) || 0;
      if (sharesToSell > availableShares) {
        setErrorMessage(`You only have ${availableShares} shares available`);
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
        return;
      }
    }

    setIsSubmitting(true);

    const marketId = hasSubMarkets
      ? selectedMarketId
      : event.sub_markets[0]._id;

    // Determine final shares and price
    let finalShares, finalPrice;

    if (orderType === "dollars") {
      finalShares = Math.floor(parseFloat(shares) * 10000) / 10000;
      finalPrice = null;
    } else if (orderType === "contracts") {
      finalShares = parseInt(shares);
      finalPrice = null;
    } else {
      // Limit Order
      finalShares = parseInt(shares);
      finalPrice = parseFloat(limitPrice);
    }

    // Build URL
    const URL = `api/event/orders/${
      orderType === "limit" ? "" : "market/"
    }${activeTab.toLowerCase()}`;

    const orderData = {
      event_id: event._id,
      market_id: marketId,
      side: selectedOption === side1 ? side1 : side2,
      shares: finalShares,
    };

    // Only add price_per_share for Limit Orders
    if (orderType === "limit") {
      orderData.price_per_share = finalPrice;
    }

    // Add expiration if enabled (only for Limit)
    if (orderType === "limit" && expiration) {
      if (expirationType === "Custom" && customDate) {
        orderData.expiration = customDate.toISOString();
      } else if (expirationType === "End of the Day") {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        orderData.expiration = endOfDay.toISOString();
      }
    }

    try {
      const response = await postData(URL, orderData);

      // Keep URL state
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("marketId", marketId);
      searchParams.set("selection", selectedOption);
      searchParams.set("tab", activeTab);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${searchParams.toString()}`
      );

      if (response.success) {
        window.dispatchEvent(new Event("Soundbet-trade-success"));
        resetForm();
      }

      // Reset form
      setAmount("");
      setShares("");
      setLimitPrice(0);
      setErrorMessage("");
      if (setAddPositon) {
        setAddPositon(!addPosition);
      }
    } catch (error) {
      console.error("Order failed:", error);
      setWiggle(true);
      setErrorMessage(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }

    // Refresh user data
    dispatch(userDataAPI());
  };

  const getSelectedMarketInfo = () => {
    if (!event || !event.sub_markets || !selectedMarketId) {
      return null;
    }
    return event.sub_markets.find((market) => market._id === selectedMarketId);
  };

  const selectedMarket = getSelectedMarketInfo();

  // Helper functions for price display
  const getYesPriceText = () => {
    if (isLoadingColors) return "Loading...";
    const price = activeTab === "Buy" ? yesAsk : yesBid;
    if (price === null || price === undefined) return side1;
    return `${side1} ${price}¢`;
  };

  const getNoPriceText = () => {
    if (isLoadingColors) return "Loading...";
    const price = activeTab === "Buy" ? noAsk : noBid;
    if (price === null || price === undefined) return side2;
    return `${side2} ${price}¢`;
  };

  // Calculate profit/payout for contracts
  const averagePrice = 41.68;
  const estimatedCost = (parseFloat(shares) || 0) * 0.4168 * 100;
  const payout = parseFloat(shares) || 0;
  const profit = payout - estimatedCost;

  // Calculate to win for market orders
  const calculateToWin = () => {
    if (!shares) return 0;

    if (activeTab === "Buy" && selectedOption === side1) {
      return (parseFloat(shares) || 0) / ((yesAsk || 1) / 100);
    }

    if (activeTab === "Buy" && selectedOption === side2) {
      return (parseFloat(shares) || 0) / ((noAsk || 1) / 100);
    }

    if (activeTab === "Sell" && selectedOption === side1) {
      return (parseFloat(shares) || 0) * ((yesBid || 0) / 100);
    }

    if (activeTab === "Sell" && selectedOption === side2) {
      return (parseFloat(shares) || 0) * ((noBid || 0) / 100);
    }

    return 0;
  };

  const wiggleClass = wiggle ? "animate-wiggle" : "";

  return (
    <div data-lenis-prevent className={`w-full px-4 ${isDarkMode ? "bg-[#1A1B1E]" : "bg-white"}`}>
      {/* Header */}
      {hasSubMarkets && selectedMarket && (
        <div className="flex justify-between items-center mb-4">
          <div
            className={`text-[20px] font-medium ${
              isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
            }`}
          >
            {selectedMarket.name || "Market"}
          </div>
          {selectedMarket.market_image ? (
            <img
              className="w-12 h-12 rounded"
              src={selectedMarket.market_image || ""}
              alt={selectedMarket.name || "Market"}
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-200"></div>
          )}
        </div>
      )}

      {/* Event Info */}
      <div className="flex items-start gap-2 mb-4">
        <img
          src={event.event_image || event.market_image}
          alt=""
          className="w-16 h-16 rounded-xl"
        />
        <h2 className="text-[13px] font-bold">
          {event.event_title || event.name}
        </h2>
      </div>

      {/* Buy/Sell Tabs & Order Type Dropdown */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {["Buy", "Sell"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`cursor-pointer text-[16px] transition-all duration-200 ease-in-out hover:text-[#FF532A] ${
                activeTab === tab
                  ? "text-[#FF532A] font-semibold"
                  : isDarkMode
                  ? "text-[#C5C5C5] font-normal"
                  : "text-black font-normal"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div>
          <Dropdown
            options={ORDER_TYPES}
            value={ORDER_TYPES.find((o) => o.value === orderType)}
            onChange={(opt) => {
              setOrderType(opt.value);
              setAmount("");
              setShares("");
              setLimitPrice(0);
            }}
            showLimit={showLimit}
          />
        </div>
      </div>

      <hr
        className={`my-3 ${isDarkMode ? "border-zinc-800" : "border-zinc-300"}`}
      />

      {/* Yes/No Buttons */}
      {isLoadingColors ? (
        <div className="py-6 flex flex-col items-center justify-center">
          <Loader size="medium" />
          <p className="mt-3 text-gray-500 text-sm">Loading team colors...</p>
        </div>
      ) : hasSubMarkets ? (
        <div className="my-3 flex justify-between gap-2">
          <GreenButton
            title={getYesPriceText()}
            className={`text-[16px] ${
              yesPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={selectedOption === side1}
            onClick={() =>
              handleOptionSelect(selectedMarketId, side1, btn1Color, btn2Color)
            }
          />
          <RedButton
            title={getNoPriceText()}
            className={`text-[16px] ${
              noPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={selectedOption === side2}
            onClick={() =>
              handleOptionSelect(selectedMarketId, side2, btn1Color, btn2Color)
            }
          />
        </div>
      ) : (
        <div className="my-3 flex justify-between gap-2">
          <CustomColorButton
            title={getYesPriceText()}
            className={`text-[16px] ${
              yesPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={selectedOption === side1}
            onClick={() =>
              handleOptionSelect(
                selectedMarketId || event?.sub_markets?.[0]?._id,
                side1,
                btn1Color,
                btn2Color
              )
            }
            activeColor={btn1Color || "#298C8C"}
            activeHoverColor={
              btn1Color ? btn1Color.replace(/^#/, "#") + "90" : "#237b7b"
            }
            textColor="#fff"
          />
          <CustomColorButton
            title={getNoPriceText()}
            className={`text-[16px] ${
              noPriceUpdated ? "animate-flash-highlight" : ""
            }`}
            isActive={selectedOption === side2}
            onClick={() =>
              handleOptionSelect(
                selectedMarketId || event?.sub_markets?.[0]?._id,
                side2,
                btn1Color,
                btn2Color
              )
            }
            activeColor={btn2Color || "#8D1F17"}
            activeHoverColor={
              btn2Color ? btn2Color.replace(/^#/, "#") + "90" : "#7a1a13"
            }
            textColor="#fff"
          />
        </div>
      )}

      {/* 1. Buy in Dollars */}
      {orderType === "dollars" && (
        <div className="space-y-6">
          <div
            className={`flex justify-between items-center p-2 border-[1px] border-solid rounded-[5px] ${
              isDarkMode ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium">Dollars ($)</span>
              <span className="text-[13px] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#00d991] via-[#078a51] to-[#00d991]">
                Earn 3.5% Interest
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0"
              className={`w-28 text-right text-3xl font-bold bg-transparent border-none ${
                isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
              } focus:outline-none`}
            />
          </div>
          {amount && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span
                  className={`text-[13px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  {activeTab === "Buy" ? "odds" : "You'll pay"}
                </span>
                <span
                  className={`text-[13px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  {shares} chance
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-[13px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Payout if yes
                </span>
                <span className="font-bold text-[30px] text-[#0ac285]">
                  ${amount || "0"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Buy in Contracts */}
      {orderType === "contracts" && activeTab === "Buy" && (
        <div className="space-y-6">
          <div className="border border-[#00d991] rounded-xl p-2 flex justify-between items-center">
            <div>
              <p
                className={`text-[13px] font-medium ${
                  isDarkMode ? "text-[#fff]" : "text-gray-700"
                }`}
              >
                Contracts
              </p>
              <p className="text-[#00b67a] text-sm font-medium">
                Earn 3.5% Interest
              </p>
            </div>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className={`w-28 text-right text-4xl font-bold bg-transparent outline-none border-none ${
                isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
              }`}
            />
          </div>
          {shares > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span
                  className={`text-[13px] font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Average price
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  {averagePrice}¢
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span
                  className={`flex items-center text-[13px] gap-1 font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Estimated cost <span className="text-gray-400">ⓘ</span>
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  ${estimatedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span
                  className={`flex items-center text-[13px] gap-1 font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Payout if Yes <span className="text-gray-600">ⓘ</span>
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  ${payout.toLocaleString()}{" "}
                  <span className="text-[#0ac285] font-bold text-[15px]">
                    (+${profit.toLocaleString()})
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {orderType === "contracts" && activeTab === "Sell" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-1">
            <p
              className={`text-[13px] font-medium ${
                isDarkMode ? "text-[#fff]" : "text-[#00000080]"
              }`}
            >
              Your Position
            </p>
            <p className="text-[15px] font-medium text-[#aa00ff]">
              {availableShares > 0 ? availableShares + " shares" : "None"}
            </p>
          </div>
          <div
            className={`h-[50px] border-[1px] border-solid bg-[#00000012] rounded-xl py-1 px-3 flex justify-between items-center ${
              isDarkMode ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
            }`}
          >
            <div>
              <p
                className={`text-[13px] font-medium ${
                  isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                }`}
              >
                Contracts
              </p>
            </div>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className={`w-28 text-right text-[15px] font-medium leading-[24px] bg-transparent outline-none border-none ${
                isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
              }`}
            />
          </div>
          {shares > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span
                  className={`text-[13px] font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Average price
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  {averagePrice}¢
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span
                  className={`flex items-center text-[13px] gap-1 font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Estimated cost <span className="text-gray-400">ⓘ</span>
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  ${estimatedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span
                  className={`flex items-center text-[13px] gap-1 font-semibold ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Payout if Yes <span className="text-gray-600">ⓘ</span>
                </span>
                <span
                  className={`font-semibold text-[15px] ${
                    isDarkMode ? "text-[#fff]" : "text-[#000000e6]"
                  }`}
                >
                  ${payout.toLocaleString()}{" "}
                  <span className="text-[#0ac285] font-bold text-[15px]">
                    (+${profit.toLocaleString()})
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Limit Order */}
      {orderType === "limit" && (
        <div className="space-y-6">
          <div className="border border-[#00d991] rounded-xl p-2 flex justify-between items-center">
            <div>
              <p
                className={`text-[13px] font-medium ${
                  isDarkMode ? "text-[#fff]" : "text-gray-700"
                }`}
              >
                Contracts
              </p>
              <p className="text-[#00b67a] text-sm font-medium">
                Earn 3.5% Interest
              </p>
            </div>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className={`w-28 text-right text-4xl font-bold bg-transparent outline-none border-none ${
                isDarkMode ? "text-[#C5C5C5]" : "text-inherit"
              }`}
            />
          </div>

          <div className="relative">
            <div
              className={`flex justify-between p-2 items-center border-[1px] border-solid rounded-[8px] peer-focus:border-green-500 ${
                isDarkMode ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[13px] font-medium ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Limit price (¢)
                </span>
                <div
                  className="w-4 h-4 p-1 rounded-full border border-gray-400 flex items-center justify-center text-xs cursor-help"
                  title="Your order will only fill at this price or better"
                >
                  i
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={limitPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numbersOnly = value.replace(/[^\d]/g, "");
                    if (numbersOnly === "") {
                      setLimitPrice(0);
                    } else {
                      const num = parseInt(numbersOnly, 10);
                      setLimitPrice(num);
                    }
                  }}
                  onBlur={() => {
                    if (limitPrice < 0) setLimitPrice(0);
                  }}
                  className={`w-[100px] text-right bg-none text-[15px] font-bold p-1 focus:outline-none transition-all border ${
                    limitPrice > 0 ? "border-green-500" : "border-gray-300"
                  } ${isDarkMode ? "text-[#C5C5C5]" : "text-inherit"}`}
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full flex justify-between items-center rounded-xl border border-gray-300 p-4 cursor-pointer hover:border-purple-500 transition ${
                isDarkMode ? "bg-none" : "bg-white"
              }`}
            >
              <div className="flex items-center w-[auto]">
                <p
                  className={`text-[13px] font-medium ${
                    isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                  }`}
                >
                  Expiration
                </p>
              </div>
              <div className="flex justify-between items-center gap-1">
                <div>
                  <div
                    className={`text-[13px] font-medium ${
                      isDarkMode ? "text-[#fff]" : "text-[#00000080]"
                    }`}
                  >
                    {expirationType === "custom" && customDate
                      ? customDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }) +
                        " · " +
                        customDate
                          .toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(" ", "")
                      : expirationType}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 active:rotate-180">
                  <FaAngleDown />
                </button>
              </div>
            </div>

            {showDatePicker && (
              <div
                className={`rounded-xl border-none shadow-lg p-5 space-y-5 ${
                  isDarkMode ? "bg-[#EDC4CE]/10" : "bg-white"
                }`}
              >
                <div
                  className={`text-center text-sm text-gray-600 dark:text-gray-400 rounded-lg py-3 border ${
                    isDarkMode ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
                  }`}
                >
                  At the scheduled event start
                </div>

                <div className="flex justify-center gap-3">
                  {["GTC", "12AM EST", "IOC"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setExpirationType(option);
                      }}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                        expirationType === option
                          ? "bg-black text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  <button className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <input
                      type="date"
                      value={customDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCustomDate(new Date(e.target.value));
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full h-[50px] px-2 py-0 rounded-lg border text-start font-medium ${
                        isDarkMode
                          ? "border-[#fff] bg-gray-800 text-white"
                          : "border-[rgba(0,0,0,0.1)] bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time (GMT+5:30)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          customDate
                            ? customDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : ""
                        }
                        readOnly
                        onClick={() => timePickerRef.current?.click()}
                        className={`w-full px-4 py-3 rounded-lg border text-center font-medium cursor-pointer ${
                          isDarkMode
                            ? "border-[#fff] bg-gray-800 text-white"
                            : "border-[rgba(0,0,0,0.1)] bg-white text-gray-900"
                        }`}
                      />
                      <input
                        ref={timePickerRef}
                        type="time"
                        value={
                          customDate
                            ? `${customDate
                                .getHours()
                                .toString()
                                .padStart(2, "0")}:${customDate
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}`
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(customDate);
                            newDate.setHours(parseInt(hours, 10));
                            newDate.setMinutes(parseInt(minutes, 10));
                            setCustomDate(newDate);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ zIndex: 10 }}
                      />
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        style={{ cursor: "pointer", zIndex: 5 }}
                        onClick={() => timePickerRef.current?.click()}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setExpirationType("custom");
                    setShowDatePicker(false);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-xl text-xl font-bold"
                >
                  Confirm Expiration
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`text-sm ${isDarkMode ? "text-[#fff]" : "text-gray-600"}`}
            >
              Submit as resting order only
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border border-gray-400 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Percentage buttons for sell orders */}
      {activeTab === "Sell" && (orderType === "contracts" || orderType === "limit") && availableShares > 0 && (
        <div className="flex justify-between items-center gap-2 mb-3">
          <span
            className={`text-[14px] ${
              isDarkMode ? "text-[white]" : "text-[#4169E1]"
            }`}
          >
            Available: {availableShares}
          </span>
          <div className="flex items-center gap-2">
            {[25, 50, 100].map((percentage) => (
              <button
                key={percentage}
                className={`w-12 h-7 px-3 py-1 rounded-[5px] ${
                  isDarkMode
                    ? "border-[#C5C5C5]/30 hover:bg-[#333333]"
                    : "border-zinc-300 hover:bg-gray-100"
                } border flex justify-center items-center hover:cursor-pointer`}
                onClick={() => {
                  const newShares = Math.max(0, Math.floor(availableShares * (percentage / 100)));
                  setShares(newShares);
                }}
              >
                <span className="text-[12px]">{percentage}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className={`mt-8 ${wiggleClass}`}>
        {isLogin ? (
          <CustomColorButton
            title={
              isSubmitting
                ? "Processing..."
                : `${activeTab} ${selectedOption || ""}`
            }
            isActive={!!selectedOption && !isSubmitting}
            onClick={handleSubmit}
            disabled={isSubmitting}
            activeColor={selectedOption === side1 ? btn1Color : btn2Color}
            textColor="#fff"
            className="w-full py-5 text-xl font-bold rounded-xl"
          />
        ) : (
          <button
            onClick={handleLoginClick}
            className={`w-full py-5 bg-[#FF532A] rounded-xl text-white text-xl font-bold`}
          >
            Login to Trade
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm text-center mt-4 font-medium">
          {errorMessage}
        </p>
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
        onClose={() => setRegisterDialogOpen(false)}
        onShowLogin={() => {
          setRegisterDialogOpen(false);
          setLoginDialogOpen(true);
        }}
      />
    </div>
  );
};

export default MobileTradingPanel;