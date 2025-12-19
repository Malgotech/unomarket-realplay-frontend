import React, { useState, useEffect, useRef } from "react";
import Dropdown from "../components/Dropdown";
import CustomColorButton from "./Buttons/CustomColorButton";
import GreenButton from "./Buttons/GreenButton";
import RedButton from "./Buttons/RedButton";
import LoginDialog from "./auth/LoginDialog";
import DatePickerDialog from "./DatePickerDialog";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { FaAngleDown, FaCalendarDay } from "react-icons/fa6";
import { postData } from "../services/apiServices";
import { useDisconnect } from "wagmi";
import { userDataAPI } from "../store/reducers/movieSlice";
import CustomSubmitButton from "./Buttons/CustomSubmitButton";
import Toast from "./Toast";

const MarketSidebarNew = ({
  selectedOption,
  onOptionSelect,
  selectedMarketId,
  event,
  hasSubMarkets,
  marketPrices,
  btn1Color,
  btn2Color,
  isLoadingColors = false,
  userPositions = [],
  subMarket,
  setAddPositon,
  addPosition,
  showLimit,
  sidebar,
  setShowToast,
  toastMessage,
  setToastMessage,
  fetchUserPositions,
}) => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("Buy"); // "Buy" | "Sell"
  const ORDER_TYPES =
    activeTab == "Buy"
      ? [
          { value: "dollars", label: "Buy in Dollars" },
          { value: "contracts", label: "Buy in Contracts" },
          { value: "limit", label: "Limit Order" },
        ]
      : [
          { value: "contracts", label: "Sell in Contracts" },
          { value: "limit", label: "Limit Order" },
        ];
  const [orderType, setOrderType] = useState(showLimit ? "limit" : "dollars"); // "dollars" | "contracts" | "limit"

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

  // Optional: for price flash animation (if you still use it)
  //   const [yesPriceUpdated, setYesPriceUpdated] = useState(false);
  //   const [noPriceUpdated, setNoPriceUpdated] = useState(false);

  const isLogin = useSelector((s) => s.user.isLogin);
  const isDark = useSelector((s) => s.theme.value === "dark");

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
  const averagePrice = currentPrice ? currentPrice : "No Orders ";
  const estimatedCost =
    shares && currentPrice ? (shares * currentPrice) / 100 : "No Orders";
  const payout = shares;
  const profit = payout - estimatedCost;

  // Available shares for sell
  const availableShares = userPositions
    .filter((p) => p.marketId === selectedMarketId && p.side === selectedOption)
    .reduce((sum, p) => sum + p.shares, 0, 0);

  // Auto calculations
  useEffect(() => {
    console.log("calling", amount, shares);
    console.log("currentPrice", currentPrice);
    console.log("selectedOption", selectedOption);
    if (!currentPrice || !selectedOption) {
      return;
    }

    if (orderType === "dollars" && amount) {
      const calcShares = (parseFloat(amount) / (currentPrice / 100)).toFixed(4);
      console.log("calcShares", calcShares);
      setShares(calcShares);
    }

    if ((orderType === "contracts" || orderType === "limit") && shares) {
      const price = orderType === "limit" ? limitPrice : currentPrice;
      const cost = ((parseFloat(shares) * price) / 100).toFixed(2);
      setAmount(cost);
    }
  }, [
    amount,
    shares,
    currentPrice,
    limitPrice,
    orderType,
    selectedOption,
    activeTab,
  ]);

  const resetForm = () => {
    setAmount("");
    setShares("");
    setLimitPrice(0);
    setExpiration(false);
    setErrorMessage("");
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab == "Sell") {
      setOrderType("contracts");
    }
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
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
      // Your login dialog will open elsewhere or you can trigger it
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

    // UPDATED LIMIT PRICE VALIDATION (ALLOWS ANY NUMBER > 0)
    if (orderType === "limit") {
      // Basic validation for limit orders
      if (limitPrice <= 0) {
        setErrorMessage("Price must be greater than 0¢");
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
        return;
      }

      // Optional: Add maximum limit if needed
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
      console.log("shares", shares);
      finalShares = Math.floor(shares); // 4 decimal precision
      finalPrice = null; // Market order → no price needed
    } else if (orderType === "contracts") {
      finalShares = parseInt(shares);
      finalPrice = null; // Market order
    } else {
      // Limit Order
      finalShares = parseInt(shares);
      finalPrice = parseFloat(limitPrice); // Can be any number > 0
    }
    console.log("finalShares", finalShares);

    const URL = `api/event/orders/${
      orderType === "limit" ? "" : "market/"
    }${activeTab.toLowerCase()}`;

    const orderData = {
      event_id: event._id,
      market_id: marketId,
      side:
        selectedOption ===
        event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
          ? event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_1
          : event?.sub_markets?.find((m) => m._id === selectedMarketId)?.side_2,
      shares: finalShares,
    };

    // Only add price_per_share for Limit Orders
    if (orderType === "limit") {
      orderData.price_per_share = finalPrice;
    }

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
      console.log("response", response);
      if (response.success) {
        setShowToast(true);
        setToastMessage(response.message);
        window.dispatchEvent(new Event("Soundbet-trade-success"));
        console.log("event._id", event._id);
        fetchUserPositions(event._id);
        resetForm();
      }

      // Reset form
      setAmount("");
      setShares("");
      setLimitPrice(0); // Reset to 0 instead of ""
      setErrorMessage("");
      setAddPositon(!addPosition);
    } catch (error) {
      console.error("Order failed:", error);
      setWiggle(true);
      setErrorMessage(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }

    // Refresh user data (positions, balance, etc.)
    dispatch(userDataAPI());
  };

  const getSelectedMarketInfo = () => {
    if (!event || !event.sub_markets || !selectedMarketId) {
      return null;
    }

    return event.sub_markets.find((market) => market._id === selectedMarketId);
  };

  const selectedMarket = getSelectedMarketInfo();
  return (
    <>
      <div
        className={`
    2xl:w-full
    mx-auto
    p-5
    rounded-2xl
    sticky
    top-6
    transition-all
 
    ${isDark ? "bg-[#1A1B1E] text-gray-200" : "bg-white text-gray-800"}
    shadow-xl
  `}>
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
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}></div>
          )}
          <div
            className={`${
              isDark ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
            } text-[10px] font-medium font-['IBMPlexSans']`}>
            {selectedMarket.name || "Market"}
          </div>
        </div>
      )} */}

        {/* Header */}
        <div className="flex items-start   gap-2 mb-4">
          <img
            src={event.event_image || event.market_image}
            alt=""
            className="w-16 h-16 rounded-xl"
          />
          <h2 className="text-[13px] font-bold">
            {event.event_title || event.name}
          </h2>
        </div>

        <div className="w-full flex justify-start items-center gap-2">
          {hasSubMarkets && selectedMarket && (
            <p
              className={`text-[15px] font-bold transition text-[#FF4215]
              }`}>
              {activeTab === "Buy" ? "Buy" : "Sell"}
              <span className="mx-1">
                {selectedOption === side1 ? "yes" : "no"}
              </span>
              :
            </p>
          )}

          {/* <p className={`text-[15px] font-bold transition text-gray-500`}>
          {subMarket?.name}
        </p> */}

          {/* {!hasSubMarkets && selectedMarket && (
          <div className="flex justify-center  gap-[5px] items-center  ">
            {selectedMarket.market_image ? (
              <img
                className="w-8 h-8 rounded ml-2"
                src={selectedMarket.market_image || ""}
                alt={selectedMarket.name || "Market"}
              />
            ) : (
              <div
                className={`w-12 h-12 rounded ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}></div>
            )}
            <div
              className={`${
                isDark ? "text-[#C5C5C5]" : " transition text-gray-500"
              } text-[15px] font-bold`}>
              {selectedMarket.name || "Market"}
            </div>
          </div>
        )} */}

          {hasSubMarkets && selectedMarket && (
            <div className="flex justify-center gap-[5px] items-center  ">
              {/* {selectedMarket.market_image ? (
              <img
                className="w-8 h-8 rounded ml-2"
                src={selectedMarket.market_image || ""}
                alt={selectedMarket.name || "Market"}
              />
            ) : (
              <div
                className={`w-12 h-12 rounded ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}></div>
            )} */}
              <div
                className={`${
                  isDark ? "text-[#C5C5C5]" : " transition text-gray-500"
                } text-[15px] font-bold`}>
                {selectedMarket.name || "Market"}
              </div>
            </div>
          )}

          {!hasSubMarkets && !selectedMarket && (
            <div className="flex justify-start gap-[5px] items-center mb-4">
              {event.market_image ? (
                <img
                  className="w-8 h-8 rounded ml-2"
                  src={event.market_image}
                  alt={event.name}
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}></div>
              )}
              <div
                className={`${
                  isDark ? "text-[#C5C5C5]" : " transition text-gray-500"
                } text-[15px] font-bold`}>
                {event.name}
              </div>
            </div>
          )}
        </div>

        {/* Buy / Sell Tabs + Order Type */}
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            {["Buy", "Sell"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-[15px] font-bold transition ${
                  activeTab === tab ? "text-[#FF4215]" : "text-gray-500"
                }`}>
                {tab}
              </button>
            ))}
          </div>

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

        <hr
          className={`mb-6 ${isDark ? "border-gray-700" : "border-gray-300"}`}
        />

        {/* Yes / No Buttons - Keep your existing logic */}
        {isLoadingColors ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <Loader size="medium" />
            <p className="mt-3 text-gray-500 text-sm">Loading team colors...</p>
          </div>
        ) : hasSubMarkets ? (
          <div className="my-3 flex justify-between gap-2">
            <GreenButton
              title={`${side1} ${
                activeTab === "Buy"
                  ? yesAsk
                    ? yesAsk
                    : ""
                  : yesBid
                  ? yesBid
                  : ""
              }¢`}
              isActive={selectedOption === side1}
              onClick={() =>
                onOptionSelect?.(selectedMarketId, side1, subMarket)
              }
            />
            <RedButton
              title={`${side2} ${
                activeTab === "Buy" ? (noAsk ? noAsk : "") : noBid ? noBid : ""
              }¢`}
              isActive={selectedOption === side2}
              onClick={() =>
                onOptionSelect?.(selectedMarketId, side2, subMarket)
              }
            />
          </div>
        ) : (
          <div className="my-3 flex justify-between gap-2">
            <GreenButton
              title={`${side1} ${
                activeTab === "Buy"
                  ? yesAsk
                    ? yesAsk
                    : ""
                  : yesBid
                  ? yesBid
                  : ""
              }¢`}
              isActive={selectedOption === side1}
              onClick={() =>
                onOptionSelect?.(selectedMarketId, side1, subMarket)
              }
            />
            <RedButton
              title={`${side2} ${
                activeTab === "Buy" ? (noAsk ? noAsk : "") : noBid ? noBid : ""
              }¢`}
              isActive={selectedOption === side2}
              onClick={() =>
                onOptionSelect?.(selectedMarketId, side2, subMarket)
              }
            />
          </div>
        )}

        {/* 1. Buy in Dollars */}
        {orderType === "dollars" && (
          <div className="space-y-6">
            <div
              className={`flex justify-between items-center p-2 border-[1px] border-solid rounded-[5px] ${
                isDark ? "border-[#fff] " : "border-[rgba(0,0,0,0.1)] "
              } `}>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium">Doller ($)</span>
                <span
                  className={`text-[13px] text-nowrap font-medium text-[#007fff] `}>
                  Earn 3.5% Interest
                </span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$0"
                className={`w-48 text-right text-3xl font-bold bg-transparent border-none ${
                  isDark ? "border-gray-600" : "border-gray-400"
                } focus:border-blue-500 outline-none`}
              />
            </div>
            {amount && (
              <div className="space-y-2 animate-fadeIn">
                {/* Row 1 */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[13px] ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    {activeTab === "Buy" ? "odds" : "You'll pay"}
                  </span>
                  <span
                    className={`text-[13px] ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    {shares} chance
                  </span>
                </div>

                {/* Row 2 */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[13px] ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    Payout if yes
                  </span>
                  <span className="font-bold text-[30px] text-[#0ac285] ">
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
            {/* TOP INPUT BOX — EXACT UI FROM IMAGE */}
            <div className="border border-[#00d991] rounded-xl p-2 flex justify-between items-center">
              {/* Left side text */}
              <div>
                <p className="text-gray-700 text-[13px] font-medium">
                  Contracts
                </p>
                <p className="text-[#00b67a] text-sm font-medium">
                  Earn 3.5% Interest
                </p>
              </div>

              {/* Big numeric input */}
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                className="w-28 text-right text-4xl font-bold bg-transparent outline-none border-none"
              />
            </div>

            {/* BOTTOM INFO SECTION (always visible if shares > 0) */}
            {shares > 0 && (
              <div className="space-y-3">
                {/* Average Price */}
                <div className="flex justify-between  text-gray-600">
                  <span
                    className={`text-[13px] font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    Average price
                  </span>
                  <span
                    className={`text-[15px] font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    {averagePrice}¢
                  </span>
                </div>

                {/* Estimated Cost */}
                <div className="flex justify-between  text-gray-600">
                  <span
                    className={`flex items-center text-[13px] gap-1 font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    Estimated cost <span className="text-gray-400">ⓘ</span>
                  </span>
                  <span
                    className={`  font-semibold text-[15px]  ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    ${estimatedCost.toLocaleString()}
                  </span>
                </div>

                {/* Payout If Yes */}
                <div className="flex justify-between  text-gray-600">
                  <span
                    className={`flex items-center text-[13px] gap-1 font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
                    Payout if Yes <span className="text-gray-600">ⓘ</span>
                  </span>

                  <span
                    className={`font-semibold text-[15px]  ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    }`}>
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
                  isDark ? "text-[#fff]" : "text-[#00000080]"
                }`}>
                Your Position
              </p>
              <p className="text-[15px] font-medium text-[#aa00ff]">
                {availableShares}
              </p>
            </div>
            <div
              className={`h-[50px] border-[1px] border-solid bg-[#00000012] rounded-xl py-1 px-3 flex justify-between items-center ${
                isDark ? "border-[#fff] " : "border-[rgba(0,0,0,0.1)] "
              }`}>
              <div>
                <p
                  className={`text-[13px] font-medium ${
                    isDark ? "text-[#fff] " : "text-[#00000080] "
                  }`}>
                  Contracts
                </p>
              </div>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                className="w-28 text-right text-[15px] font-medium leading-[24px] bg-transparent outline-none border-none"
              />
            </div>

            {/* BOTTOM INFO SECTION (always visible if shares > 0) */}
            {shares > 0 && (
              <div className="space-y-3">
                {/* Average Price */}
                <div className="flex justify-between ">
                  <span
                    className={`text-[13px] font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    Average price
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    {averagePrice}¢
                  </span>
                </div>

                {/* Estimated Cost */}
                <div className="flex justify-between  text-gray-600">
                  <span className="flex items-center text-[13px] gap-1 font-semibold text-[#00000080]">
                    Estimated cost <span className="text-gray-400">ⓘ</span>
                  </span>
                  <span className="font-semibold text-[15px] text-[#000000e6]">
                    ${estimatedCost.toLocaleString()}
                  </span>
                </div>
                {currentPrice && (
                  <div className="flex justify-between  text-gray-600">
                    <span className="flex items-center text-[13px] gap-1 font-semibold text-[#00000080]">
                      You'll receive <span className="text-gray-600">ⓘ</span>
                    </span>

                    <span className="font-semibold text-[15px] text-[#000000e6] ">
                      ${payout.toLocaleString()}{" "}
                      <span className="text-[#0ac285] font-bold text-[15px]">
                        (+${profit.toLocaleString()})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Limit Order */}
        {orderType === "limit" && (
          <div className="space-y-6">
            <div className="border border-[#00d991] rounded-xl p-2 flex justify-between items-center">
              {/* Left side text */}
              <div>
                <p
                  className={` text-[13px] font-medium ${
                    isDark ? "text-[#fff]" : "text-gray-700"
                  } `}>
                  Contracts
                </p>
                <p className="text-[#00b67a] text-sm font-medium">
                  Earn 3.5% Interest
                </p>
              </div>

              {/* Big numeric input */}
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                className="w-28 text-right text-4xl font-bold bg-transparent outline-none border-none"
              />
            </div>

            {/* {shares && parseFloat(shares) > 0 && currentPrice && (
            <div className="text-green-500 text-sm font-medium">
              Earn {(100 - currentPrice).toFixed(1)}% Interest
            </div>
          )} */}

            <div className="relative">
              <div
                className={`flex justify-between p-2 items-center border-[1px] border-solid  rounded-[8px]  peer-focus:border-green-500 ${
                  isDark ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
                } `}>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[13px] font-medium ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    Limit price (¢)
                  </span>
                  <div
                    className="w-4 h-4 p-1 rounded-full border border-gray-400 flex items-center justify-center text-xs cursor-help"
                    title="Your order will only fill at this price or better">
                    i
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={limitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove non-digits except decimal point if needed
                      const numbersOnly = value.replace(/[^\d]/g, "");

                      if (numbersOnly === "") {
                        setLimitPrice(0);
                      } else {
                        // Convert to number, no limit
                        const num = parseInt(numbersOnly, 10);
                        setLimitPrice(num);
                      }
                    }}
                    onBlur={() => {
                      // Optional: Ensure minimum value on blur
                      if (limitPrice < 0) setLimitPrice(0);
                    }}
                    className={`w-[100px] text-right bg-none text-[15px] font-bold p-1 focus:outline-none transition-all border ${
                      limitPrice > 0 ? "border-green-500" : "border-gray-300"
                    }`}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full flex justify-between items-center rounded-xl border border-gray-300 p-4 cursor-pointer hover:border-purple-500 transition ${
                  isDark ? "bg-none " : "bg-white "
                }`}>
                <div className="flex items-center w-[auto]">
                  <p
                    className={`text-[13px]  font-medium  ${
                      isDark ? "text-[#fff]" : "text-[#00000080]"
                    } `}>
                    Expiration
                  </p>
                </div>

                <div className="flex justify-between items-center gap-1">
                  <div>
                    <div
                      className={`text-[13px]  font-medium  ${
                        isDark ? "text-[#fff]" : "text-[#00000080]"
                      } `}>
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
                    {/* {expirationType === "custom" && (
                    <div className="text-sm text-gray-500 mt-1">GMT+5:30</div>
                  )} */}
                  </div>

                  <button className="text-gray-400 hover:text-gray-600 active:rotate-180">
                    <FaAngleDown />
                  </button>
                </div>
              </div>

              {/* Dropdown Content — Only shows when clicked */}
              {showDatePicker && (
                <div
                  className={`rounded-xl border-none shadow-lg p-5 space-y-5 ${
                    isDark ? "bg-[#EDC4CE]/10" : "bg-white"
                  }`}>
                  {/* "At the scheduled event start" Info */}
                  <div
                    className={`text-center text-sm text-gray-600 dark:text-gray-400  rounded-lg py-3 border ${
                      isDark ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
                    } `}>
                    At the scheduled event start
                  </div>

                  {/* GTC / IOC Toggle Buttons */}
                  <div className="flex justify-center gap-3">
                    {["GTC", "12AM EST", "IOC"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          // Pass clicked value to input box
                          setExpirationType(option);

                          // Additional logic only for GTC
                          // if (option === "GTC") {
                          //   setShowDatePicker(false);
                          // }
                        }}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                          expirationType === option
                            ? "bg-black text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        {option}
                      </button>
                    ))}
                    <button className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Date & Time Pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Date Picker */}
                    {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" >
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          customDate
                            ? customDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : ""
                        }
                        readOnly
                        className={`w-full px-4 py-3 rounded-lg border  text-center font-medium cursor-pointer  ${
                    isDark ? "border-[#fff]" : "border-[rgba(0,0,0,0.1)]"
                  }  `}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div> */}

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
                          isDark
                            ? "border-[#fff] bg-gray-800 text-white"
                            : "border-[rgba(0,0,0,0.1)] bg-white text-gray-900"
                        }`}
                      />
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Time (GMT+5:30)
                      </label>
                      <div className="relative">
                        {/* Visible time display input */}
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
                            isDark
                              ? "border-[#fff] bg-gray-800 text-white"
                              : "border-[rgba(0,0,0,0.1)] bg-white text-gray-900"
                          }`}
                        />

                        {/* Hidden time input */}
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
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const newDate = new Date(customDate);
                              newDate.setHours(parseInt(hours, 10));
                              newDate.setMinutes(parseInt(minutes, 10));
                              setCustomDate(newDate);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          style={{ zIndex: 10 }}
                        />

                        {/* Clock icon */}
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          style={{ cursor: "pointer", zIndex: 5 }}
                          onClick={() => timePickerRef.current?.click()}>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
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

                  {/* Confirm Button */}
                  <button
                    onClick={() => {
                      setExpirationType("custom");
                      setShowDatePicker(false);
                    }}
                    className="w-full h-[50px] bg-orange-600 hover:bg-orange-700 text-white  rounded-xl text-[16px] font-bold">
                    Confirm Expiration
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${
                  isDark ? "text-[#fff]" : "text-gray-600"
                }`}>
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

        <div className={`mt-8 ${wiggle ? "animate-wiggle" : ""}`}>
          {isLogin ? (
            <CustomSubmitButton
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
              activeTab={activeTab}
              currentPrice={currentPrice}
              orderType = {orderType}
            />
          ) : (
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-xl text-xl font-bold">
              Login to Trade
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mt-4 font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    </>
  );
};

export default MarketSidebarNew;
