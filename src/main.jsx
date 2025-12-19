import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, mainnet, polygon, sepolia } from "viem/chains"; // Add chains as needed
import { injected, walletConnect } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

// Create a QueryClient for React Query
const queryClient = new QueryClient();

// Configure Wagmi
const projectId = "1358def94e5cb22680b65fde5bf76b87";
const chains = [mainnet, polygon, bsc];

const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains,
  metadata: {
    name: "UnoMarket",
    description: "UnoMarket Prediction Platform",
    url: "https://unomarket.com",
    icons: ["https://unomarket.com/favicon.ico"],
  },
});
createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: "light", // or 'dark'
  enableAnalytics: false,
});
createRoot(document.getElementById("root")).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </WagmiProvider>
);
