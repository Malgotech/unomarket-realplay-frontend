import React, { useEffect, useState, useCallback } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import QRCodeStyling from "qr-code-styling";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { fetchData } from "../../services/apiServices";
import logoDark from "../../images/unologo.svg";
import logoLight from "../../images/unologo-dark.svg";
import unoCoin from "../../images/uno-coin.svg";


const DepositWalletDialog = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";
  const [depositStatus, setDepositStatus] = useState(null);
  const [networkList, setNetworkList] = useState([]);
  const [defaultNetwork, setDefaultNetwork] = useState("");
  const [currencyList, setCurrencyList] = useState([]);
  const [currencies, setCurrencies] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [depositData, setDepositData] = useState({ address: "", tag: "" });
  const [qrCode, setQrCode] = useState("");
  const qrRef = useRef(null);
  const qrInstanceRef = useRef(null);
  const [defaultCurrencyList, setDefaultCurrencyList] = useState({
    currencySymbol: "ETH",
    image: "",
  });
  const [curCurrencySymbol, setCurCurrencySymbol] = useState("");
  const [tokenOpen, setTokenOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

 const CHAINS = ["BNB", "ETH", "POL", "SOL", "TRX"];

const callDeposit = useCallback(async (chain) => {
  console.log("Checking chain:", chain);
  try {
    const data = await fetchData(`api/wallet/depositcheck?chain=${chain}`);
    console.log(`Response for ${chain}:`, data);
  } catch (err) {
    console.error(`Error checking ${chain}:`, err);
  }
}, []);

const runDepositSequence = useCallback(async () => {
  console.log("Starting deposit check sequence...");

  // Get the last saved index (default 0)
  let startIndex = parseInt(localStorage.getItem("deposit_check_index") || "0", 10);

  for (let i = startIndex; i < CHAINS.length; i++) {
    const chain = CHAINS[i];
    console.log(`Running deposit check for ${chain} (index: ${i})`);

    await callDeposit(chain);

    // Save progress
    localStorage.setItem("deposit_check_index", i.toString());

    // Wait 20 seconds before next chain
    if (i < CHAINS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }

  console.log("Deposit check sequence completed.");

  // Reset for the next cycle
  localStorage.setItem("deposit_check_index", "0");
}, [callDeposit]);
 useEffect(() => {
  runDepositSequence();

  const interval = setInterval(runDepositSequence, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [runDepositSequence]);


  /** -------------------------------
   * API Functions
   * ------------------------------- */
  const NETWORK_META = {
    ERC20: {
      name: "Ethereum (ERC-20)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    },
    BEP20: {
      name: "BSC (BEP-20)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    },
    TRC20: {
      name: "TRON (TRC-20)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
    },
    POL20: {
      name: "Polygon (PoS)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/28321.png",
    },
    BEP2: {
      name: "BNB Beacon Chain (BEP-2)",
      image: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    },
    SOL: {
      name: "Solana (SPL)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    },
    SOLANA: {
      name: "Solana (SPL)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    },
    AVAXC: {
      name: "Avalanche C-Chain (ERC-20)",
      image: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    },
    OPT: {
      name: "Optimism",
      image: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
    },
    ARB: {
      name: "Arbitrum One",
      image: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    },
    BASE: {
      name: "Base",
      image: "https://cryptologos.cc/logos/base-base-logo.png",
    },
    TON: {
      name: "TON",
      image: "https://cryptologos.cc/logos/toncoin-ton-logo.png",
    },
    SUI: {
      name: "Sui",
      image: "https://cryptologos.cc/logos/sui-sui-logo.png",
    },
    APT: {
      name: "Aptos",
      image: "https://cryptologos.cc/logos/aptos-apt-logo.png",
    },
    // fallbacks / aliases
    ETH: {
      name: "Ethereum (ERC-20)",
      image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    BSC: {
      name: "BNB Smart Chain (BEP-20)",
      image: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    },
    POLYGON: {
      name: "Polygon (PoS)",
      image: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    },
    MATIC: {
      name: "Polygon (PoS)",
      image: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    },
  };

  const getNetworkMeta = (basecoin) => {
    const key = String(basecoin || "")
      .trim()
      .toUpperCase();
    if (NETWORK_META[key]) return NETWORK_META[key];
    if (/ERC/.test(key)) return NETWORK_META.ERC20;
    if (/BEP/.test(key)) return NETWORK_META.BEP20;
    if (/TRC/.test(key)) return NETWORK_META.TRC20;
    if (/POL|MATIC|POLY/.test(key)) return NETWORK_META.POL20;
    if (/SPL|SOL|SOLANA/.test(key)) return NETWORK_META.SOL;

    return { name: key || "Unknown", image: null };
  };

  const getParticularCurrency = useCallback(async (networkId) => {
    try {
      setLoading(true);
      const res = await fetchData("api/wallet/getParticularCurrency", {
        CurrencyID: networkId,
      });
      if (res.status && res.data) {
        setLoaderStatus(true);
        setDepositStatus(res.data.depositEnable === 1);
        setCurrencies(res.data);
        if (res.data.basecoin == "Coin") {
          setNetworkName({
            name: res.data.currencySymbolCode,
            image: res.data.image,
            isbase: true,
          });
        } else {
          const meta = getNetworkMeta(res.data.basecoin);
          setNetworkName({ name: meta.name, image: meta.image, isbase: false });
        }
      }
    } catch (err) {
      console.error("getParticularCurrency error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (networkId) => {
    try {
      setLoading(true);

      const value = { CurrencyID: networkId };
      const result = await fetchData("api/wallet/createAddress", value);
      if (result.status && result.data) {
        setDepositData(result.data);
        setLoaderStatus(true);
        setQrCode(
          `https://image-charts.com/chart?cht=qr&chs=150x150&chl=${result.data.address}&choe=UTF-8&chld=L`
        );
      }
      setLoading(false);
    } catch (err) {
      console.error("createAddress error:", err);
    }
  }, []);

  const getWalletCurrencies = useCallback(async () => {
    try {
      const res = await fetchData("api/wallet/getwalletCurrency");
      if (res.status && res.data) {
        const currencyArray = res.data.map((item) => ({
          value: item._id,
          currencySymbol: item.currencySymbol,
          image: item.image,
          currencyName: item.currencyName,
          depositEnable: item.depositEnable,
          ids: item.ids || [],
        }));
        setCurrencyList(currencyArray);
        if (!currencyId && currencyArray.length > 0) {
          handleCurrencyChange(currencyArray[0].currencySymbol);
        }
      }
    } catch (err) {
      console.error("getWalletCurrencies error:", err);
    }
  }, [currencyId]);
  const handleCurrencyChange = useCallback(
    async (symbol) => {
      setCurrencyId(symbol);
      try {
        const res = await fetchData("api/wallet/getwalletCurrency");
        if (res.status && res.data) {
          const currency = res.data.find((c) => c.currencySymbol === symbol);
          if (!currency) return;
          setDefaultCurrencyList({
            currencySymbol: currency.currencySymbol,
            image: currency.image,
          });
          setNetworkList(currency.ids);
          setCurCurrencySymbol(currency.currencySymbol);
          const firstEnabled = currency.ids.find((n) => n.depositEnable === 1);
          if (firstEnabled) {
            setDefaultNetwork(firstEnabled._id);
            createAddress(firstEnabled._id);
            getParticularCurrency(firstEnabled._id);
          } else {
            setDepositStatus(false);
          }
        }
        setChainOpen(false);
      } catch (err) {
        console.error("handleCurrencyChange error:", err);
      }
    },
    [createAddress, getParticularCurrency]
  );

  const handleNetworkChange = useCallback(
    (networkId) => {
      setChainOpen(false);
      setDefaultNetwork(networkId);
      getParticularCurrency(networkId);
      createAddress(networkId);
    },
    [createAddress, getParticularCurrency]
  );
  const handleCopyAddress = useCallback(async () => {
    if (!depositData.address) return;
    try {
      await navigator.clipboard.writeText(depositData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = depositData.address;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (fallbackErr) {
        console.error("Failed to copy address:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  }, [depositData.address]);

  useEffect(() => {
    getWalletCurrencies();
  }, [getWalletCurrencies]);

  useEffect(() => {
    if (!depositData.address || !qrRef.current) return;

    const displaySize = 150;
    const internalSize = displaySize * 2;
    const qrColor = isDark ? "#ffffff" : "#0ea5e9";
    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling({
        width: internalSize,
        height: internalSize,
        type: "svg",
        data: depositData.address,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
        },
        dotsOptions: {
          color: qrColor,
          type: "dots",
        },
        backgroundOptions: {
          color: isDark ? "#27272a" : "#ffffff",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
        },
        cornersDotOptions: {
          type: "dot",
        },
        qrOptions: {
          errorCorrectionLevel: "H",
        },
      });

      qrInstanceRef.current.append(qrRef.current);

      const el = qrRef.current.querySelector("svg, canvas");
      if (el) {
        el.style.width = `${displaySize}px`;
        el.style.height = `${displaySize}px`;
        el.style.display = "block";

        // For SVG, apply shape-rendering to reduce anti-alias hairlines and
        // add a tiny stroke matching the dot color to close gaps at some zoom levels.
        if (el.tagName && el.tagName.toLowerCase() === "svg") {
          try {
            el.setAttribute("shape-rendering", "crispEdges");
            el.style.shapeRendering = "crispEdges";
            const fillColor = qrColor;
            const bgColor = isDark ? "#27272a" : "#ffffff";
            // Apply a minimal stroke to module shapes only; skip the background rect
            el.querySelectorAll("rect, path, circle, g").forEach((node) => {
              try {
                const nodeFill = node.getAttribute && node.getAttribute("fill");
                const nodeWidth =
                  node.getAttribute && node.getAttribute("width");
                const nodeHeight =
                  node.getAttribute && node.getAttribute("height");
                // Skip the background rect (full-size) or any node whose fill equals background
                if (
                  (nodeWidth &&
                    nodeHeight &&
                    (parseInt(nodeWidth) === internalSize ||
                      parseInt(nodeHeight) === internalSize)) ||
                  (nodeFill && nodeFill.toLowerCase() === bgColor.toLowerCase())
                ) {
                  return;
                }
                node.setAttribute("stroke", fillColor);
                node.setAttribute("stroke-width", "0.2");
                node.setAttribute("stroke-linejoin", "round");
                node.setAttribute("vector-effect", "non-scaling-stroke");
              } catch (e) {
                // ignore individual node errors
              }
            });
          } catch (err) {
            // no-op if DOM manipulation fails
            console.warn("QR SVG tweak failed:", err);
          }
        }
      }
    } else {
      // Update existing instance
      qrInstanceRef.current.update({
        data: depositData.address,
        // image intentionally omitted; we'll overlay the app logo with rounded corners via CSS
        dotsOptions: { color: isDark ? "#ffffff" : "#000000" },
        backgroundOptions: { color: isDark ? "#27272a" : "#ffffff" },
      });

      // Make sure the rendered element remains scaled to displaySize
      const el = qrRef.current.querySelector("svg, canvas");
      if (el) {
        el.style.width = `${displaySize}px`;
        el.style.height = `${displaySize}px`;
        if (el.tagName && el.tagName.toLowerCase() === "svg") {
          try {
            el.setAttribute("shape-rendering", "crispEdges");
            el.style.shapeRendering = "crispEdges";
            const fillColor = qrColor;
            const bgColor = isDark ? "#27272a" : "#ffffff";
            el.querySelectorAll("rect, path, circle, g").forEach((node) => {
              try {
                const nodeFill = node.getAttribute && node.getAttribute("fill");
                const nodeWidth =
                  node.getAttribute && node.getAttribute("width");
                const nodeHeight =
                  node.getAttribute && node.getAttribute("height");
                if (
                  (nodeWidth &&
                    nodeHeight &&
                    (parseInt(nodeWidth) === internalSize ||
                      parseInt(nodeHeight) === internalSize)) ||
                  (nodeFill && nodeFill.toLowerCase() === bgColor.toLowerCase())
                ) {
                  return;
                }
                node.setAttribute("stroke", fillColor);
                node.setAttribute("stroke-width", "0.2");
                node.setAttribute("stroke-linejoin", "round");
                node.setAttribute("vector-effect", "non-scaling-stroke");
              } catch (e) { }
            });
          } catch (err) {
            console.warn("QR SVG tweak failed:", err);
          }
        }
      }
    }

    return () => {
      // leave QR node; QRCodeStyling manages inner content. No extra cleanup required.
    };
  }, [depositData.address, defaultCurrencyList.image, isDark]);

  return (
    <div
      className={`w-full rounded-lg flex flex-col items-start gap-4 px-[1px] ${isDark ? "text-white" : "text-zinc-800"
        }`}>
      {/* Token & Chain Select */}
      <div className="w-full flex justify-between gap-4">
        {/* Token Dropdown */}
        <div className="flex-1 relative">
          <span
            className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"}`}>
            Available Tokens
          </span>
          {!currencyList || currencyList.length === 0 ? (
            <div className="mt-1">
              <div
                className={`${isDark ? "bg-zinc-700" : "bg-gray-100"
                  } h-10 rounded-md w-full animate-pulse`}></div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setTokenOpen(!tokenOpen);
                  setChainOpen(false);
                }}
                className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-md text-sm ${isDark
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-white border border-gray-300 text-zinc-800"
                  }`}>
                <div className="flex items-center gap-2">
                  <img
                    src={defaultCurrencyList.image}
                    alt={defaultCurrencyList.currencySymbol}
                    className="w-5 h-5"
                  />
                  <span className="uppercase">
                    {defaultCurrencyList.currencySymbol &&
                      defaultCurrencyList.currencySymbol.toLowerCase() === "coin"
                      ? networkName.name || defaultCurrencyList.currencySymbol
                      : defaultCurrencyList.currencySymbol}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-150 ${tokenOpen ? "rotate-180" : "rotate-0"
                    } ${isDark ? "text-gray-400" : "text-gray-600"}`}
                />
              </button>

              <div
                className={`absolute w-full mt-1 rounded-md shadow-lg z-10 transition-all duration-150 transform origin-top ${tokenOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  } ${isDark
                    ? "bg-zinc-800 border border-zinc-700"
                    : "bg-white border border-gray-300"
                  }`}>
                {currencyList.map((currency, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      handleCurrencyChange(currency.currencySymbol);
                      setTokenOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${isDark
                      ? "text-white hover:bg-zinc-700"
                      : "text-zinc-800 hover:bg-gray-100"
                      }`}>
                    <img
                      src={currency.image}
                      alt={currency.currencySymbol}
                      className="w-5 h-5"
                    />
                    <span className="uppercase">
                      {currency.currencySymbol &&
                        currency.currencySymbol.toLowerCase() === "coin"
                        ? currency.ids?.find((n) => n.depositEnable === 1)
                          ?.basecoin || currency.currencySymbol
                        : currency.currencySymbol}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chain Dropdown */}
        <div className="flex-1 relative">
          <span
            className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"}`}>
            Available Chains
          </span>
          {!networkList || networkList.length === 0 ? (
            <div className="mt-1">
              <div
                className={`${isDark ? "bg-zinc-700" : "bg-gray-100"
                  } h-10 rounded-md w-full animate-pulse`}></div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (!networkName.isbase) {
                    setChainOpen(!chainOpen);
                    setTokenOpen(false);
                  }
                }}
                className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-md text-sm ${isDark
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-white border border-gray-300 text-zinc-800"
                  }`}>
                <img src={networkName.image} className="w-5 h-5" />
                <div className="flex items-center gap-2">
                  {networkName.isbase === true
                    ? defaultCurrencyList.currencySymbol
                    : networkName.name}
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-150 ${chainOpen ? "rotate-180" : "rotate-0"
                    } ${isDark ? "text-gray-400" : "text-gray-600"}`}
                />
              </button>

              <div
                className={`absolute w-full mt-1 rounded-md shadow-lg z-10 transition-all duration-150 transform origin-top ${chainOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  } ${isDark
                    ? "bg-zinc-800 border border-zinc-700"
                    : "bg-white border border-gray-300"
                  }`}>
                {networkList.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      handleNetworkChange(item._id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${isDark
                      ? "text-white hover:bg-zinc-700"
                      : "text-zinc-800 hover:bg-gray-100"
                      }`}>
                    <img
                      src={item.networkImage}
                      alt={item.currencySymbol}
                      className="w-5 h-5"
                    />
                    {item.networkLabel}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Code */}
      <div className="w-full flex justify-center">
        <div
          className={`${isDark ? "bg-zinc-800" : "bg-white"
            } rounded-lg flex items-center justify-center p-3 w-[174px] h-[174px]`}>
          {loading || !depositData.address ? (
            <div className="flex items-center justify-center w-full h-full">
              <div
                className={`${isDark ? "bg-zinc-700" : "bg-gray-100"
                  } w-[150px] h-[150px] rounded-sm animate-pulse`}></div>
            </div>
          ) : (
            <div className="relative">
              <div ref={qrRef} className="flex items-center justify-center" />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? "#27272a" : "#ffffff",
                  padding: 6,
                  borderRadius: 6,
                }}>
                <img
                  src={unoCoin}
                  alt="soundbet"
                  style={{ width: 28, height: 28, borderRadius: 4 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Address */}
      <div className="w-full">
        <span
          className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"}`}>
          Your deposit address
        </span>
        {!depositData || !depositData.address ? (
          <div className="mt-1">
            <div
              className={`${isDark ? "bg-zinc-700" : "bg-gray-100"
                } h-10 rounded-md w-full animate-pulse`}></div>
          </div>
        ) : (
          <div
            className={`mt-1 flex items-center rounded-md ${isDark
              ? "bg-zinc-800 border border-zinc-700"
              : "bg-white border border-gray-300"
              }`}>
            <input
              type="text"
              value={depositData.address || ""}
              readOnly
              className={`flex-1 bg-transparent text-xs px-3 py-2 outline-none rounded-l-md ${isDark ? "text-white" : "text-zinc-800"
                }`}
            />
            <button
              onClick={handleCopyAddress}
              className={`px-3 py-2 rounded-none rounded-r-md text-sm hover:cursor-pointer ${copied
                ? "bg-green-600 text-white"
                : "bg-[#FF532A] text-white hover:bg-[#FF532A]"
                }`}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Warning Message */}
      <div
        className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${isDark
          ? "bg-zinc-800 border border-zinc-700"
          : "bg-white border border-gray-300"
          }`}>
        <span className="mr-2">
          <svg
            className={`w-6 h-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </span>
        <span className={`${isDark ? "text-zinc-400" : "text-zinc-800"}`}>
          Send only {defaultCurrencyList.currencySymbol} -{" "}
          {networkName.name === "Coin"
            ? defaultCurrencyList.currencySymbol
            : networkName.name}{" "}
          to this deposit address, otherwise you'll lose your funds
        </span>
      </div>

      {/* Missing Deposit Link */}
      <span
        className={`w-full flex text-sm gap-1 pl-[2px] ${isDark ? "text-white" : "text-zinc-800"
          }`}>
        Already Deposited Crypto haven't received yet?{" "}
        <a
          className="cursor-pointer text-[#FF532A] hover:text-[#FF532A]"
          onClick={callDeposit}>
          click here
        </a>
      </span>
      <div className="w-full flex justify-end mt-1">
        <span
          className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-800"}`}>
          Terms and Conditions Apply
        </span>
      </div>
    </div>
  );
};

export default DepositWalletDialog;
