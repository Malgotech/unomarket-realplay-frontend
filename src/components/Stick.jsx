import React, { useState } from "react";

const Stick = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  return (
    <div className="bg-[#f6f6f6] sticky top-[10rem] rounded-xl w-[30%] self-start p-5 shadow-lg shadow-zinc-600 h-fit">
      <div className="flex justify-between">
        <div className="flex text-xl gap-4 font-semibold">
          <h1
            className={`cursor-pointer ${
              activeTab === "Buy" ? "text-blue-600" : "text-black"
            }`}
            onClick={() => setActiveTab("Buy")} // Set "Buy" as active
          >
            Buy
          </h1>
          <h1
            className={`cursor-pointer ${
              activeTab === "Sell" ? "text-blue-600" : "text-black"
            }`}
            onClick={() => setActiveTab("Sell")}
          >
            Sell
          </h1>
        </div>
      </div>

      <hr className="my-3 text-zinc-300 border" />
      <div className="text-xl flex flex-col justify-between items-center p-4 ">
        <div className=" flex justify-between w-full">
          <h1>Total</h1>
          <h1>0</h1>
        </div>
        <div className=" flex justify-between w-full">
          <h1>To Win</h1>
          <h1>0</h1>
        </div>
      </div>

      <div className="text-xl flex flex-col justify-between items-center ">
        <button className="bg-[#0d9488] w-full py-3 rounded-md text-center text-white text-xl hover:cursor-pointer">
          Yes
        </button>
      </div>
    </div>
  );
};

export default Stick;
