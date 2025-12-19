import React, { useState } from "react";

const DocsSidebar = ({ activeSection, setActiveSection, isDarkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    "getting-started": true,
    "prediction-markets": true,
    trading: true,
    resolution: true,
    faqs: true,
  });

  // Remove toggle functionality since all sections should always be expanded
  const toggleSection = (section) => {
    // All sections are always expanded, no toggling allowed
    return;
  };

  const menuItems = [
    {
      id: "overview",
      title: "What is Soundbet?",
      type: "single",
    },
    {
      id: "getting-started",
      title: "Sign-up and Deposit",
      type: "section",
      items: [
        { id: "signup", title: "Sign-Up" },
        { id: "deposits", title: "Deposits" },
        { id: "deposit-process", title: "Process of Deposit and Withdrawal" },
      ],
    },
    {
      id: "prediction-markets",
      title: "Prediction Markets",
      type: "section",
      items: [
        { id: "market-overview", title: "Market Overview" },
        { id: "market-creation", title: "Markets Creation" },
        { id: "market-pricing", title: "Market Pricing and Free Float" },
      ],
    },
    {
      id: "trading",
      title: "Trading on Prediction Markets",
      type: "section",
      items: [
        { id: "limit-orders", title: "Limit Orders" },
        { id: "market-orders", title: "Market Orders" },
        { id: "order-book", title: "Order Book" },
      ],
    },
    {
      id: "resolution",
      title: "Resolution of Prediction Markets",
      type: "section",
      items: [
        { id: "resolution-overview", title: "Overview" },
        { id: "propose-resolution", title: "How to Propose a Resolution" },
        { id: "self-resolution", title: "Self-Resolution" },
        { id: "dispute-resolution", title: "Dispute the Resolution" },
      ],
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      type: "single",
    },
  ];

  return (
    <div
      className={`w-full ${isDarkMode ? "bg-[#141414]" : "bg-white"
        } rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"
        } h-fit`}
    >
      <div className="p-6">
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
            }`}
        >
          Documentation
        </h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.type === "single" ? (
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === item.id
                    ? "bg-[#4169E1] text-white"
                    : isDarkMode
                      ? "text-[#C5C5C5] hover:bg-zinc-800"
                      : "text-zinc-700 hover:bg-gray-100"
                    }`}
                >
                  {item.title}
                </button>
              ) : (
                <div>
                  <div
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-default ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-700"
                      }`}
                  >
                    {item.title}
                  </div>

                  {expandedSections[item.id] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveSection(subItem.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === subItem.id
                            ? "bg-[#4169E1] text-white"
                            : isDarkMode
                              ? "text-zinc-400 hover:bg-zinc-800 hover:text-[#C5C5C5]"
                              : "text-zinc-600 hover:bg-gray-100 hover:text-zinc-700"
                            }`}
                        >
                          {subItem.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DocsSidebar;
