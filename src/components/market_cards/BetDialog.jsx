import React, { useState } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import MarketSideBar from "../MarketSideBar";
import { useSelector } from "react-redux";
import MarketSidebarNew from "../MarketSidebarNew";

const BetDialog = ({
  onClose,
  open,
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
  showLimit
}) => {
  const [side, setSide] = useState("buy");
  const [yesNo, setYesNo] = useState("yes");
  const [contracts, setContracts] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);
  const [expiration, setExpiration] = useState("gtc");
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  console.log('rrrrrrrrrrrrrrr', event)


  if (!open) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropProps={{
        style: { backgroundColor: "transparent", backdropFilter: "none" },
      }}
      data-lenis-prevent>
      {/* <MarketSideBar /> */}

      <div
        className={`  w-full lg:w-[400px] ${
          isDarkMode ? "bg-[#1A1B1E] text-gray-200" : "bg-white text-gray-800"
        }`}>
        <MarketSidebarNew
          selectedOption={selectedOption}
          // fetchUserPositions={fetchUserPositions}
          onOptionSelect={onOptionSelect}
          selectedMarketId={selectedMarketId}
          event={event}
          hasSubMarkets={hasSubMarkets}
          marketPrices={marketPrices}
          userPositions={userPositions}
          subMarket={subMarket}
          setAddPositon={setAddPositon}
          addPosition={addPosition}
          showLimit={showLimit}
        />
      </div>

      {/* <div className="hidden w-100 bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm text-gray-600">
              Top artist on Spotify this year?
            </p>
            <p className="font-semibold text-blue-600">Buy Yes · Bad Bunny</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSide("buy")}
            className={`px-4 py-1 rounded-full border ${
              side === "buy"
                ? "bg-green-100 text-green-600 border-green-400"
                : isDarkMode
                ? "bg-red-500 text-white border-none"
                : "bg-gray-100 text-gray-700 border-none"
            }`}>
            Buy
          </button>

          <button
            onClick={() => setSide("sell")}
            className={`px-4 py-1 rounded-full border ${
              side === "sell"
                ? "bg-red-100 text-red-600 border-none"
                : "bg-gray-100 border-none"
            }`}>
            Sell
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setYesNo("yes")}
            className={`w-full py-3 rounded-lg font-semibold ${
              yesNo === "yes"
                ? "bg-[#009443] text-white"
                : "bg-gray-100 text-gray-700"
            }`}>
            Yes
          </button>

          <button
            onClick={() => setYesNo("no")}
            className={`w-full py-3 rounded-lg font-semibold ${
              yesNo === "no"
                ? "bg-purple-100 text-purple-600"
                : "bg-gray-100 text-gray-700"
            }`}>
            No 2¢
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Contracts</label>
          <div className="flex items-center justify-between border rounded-lg px-3 py-2 mt-1">
            <input
              type="number"
              className="w-full outline-none"
              value={contracts}
              onChange={(e) => setContracts(e.target.value)}
            />
            <span className="text-xs text-green-600">Earn 3.5% Interest</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Limit price (¢)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">Expiration</label>

          <div className="flex items-center gap-2">
            {["gtc", "12am", "ioc"].map((opt) => (
              <button
                key={opt}
                onClick={() => setExpiration(opt)}
                className={`px-4 py-2 rounded-lg border text-sm capitalize ${
                  expiration === opt
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 border-gray-300 text-gray-700"
                }`}>
                {opt === "gtc" ? "GTC" : opt === "12am" ? "12AM EST" : "IOC"}
              </button>
            ))}

            <button className="p-2 border rounded-lg bg-gray-100 text-gray-600">
              📅
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <input type="checkbox" id="rest" />
          <label htmlFor="rest" className="text-sm text-gray-600">
            Submit as resting order only
          </label>
        </div>

        <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg">
          Buy
        </button>
      </div> */}
    </Dialog>
  );
};

export default BetDialog;
