import { useEffect, useState, useRef } from "react";
import api from "../services/api.jsx"; // Import the API configuration
import { transformSSEOrderBookData } from "../utils/orderBookUtils.js"; // Import transformation utility

/**
 * Custom hook for connecting to order book updates via Server-Sent Events (SSE)
 * @param {string} marketId - The ID of the market to subscribe to
 * @param {string} side1 - First side name (e.g., "Yes", "Lakers")
 * @param {string} side2 - Second side name (e.g., "No", "Warriors")
 * @returns {Object} The order book data and connection state
 */
export const useOrderBookSSE = (marketId, side1 = "Yes", side2 = "No") => {
  const [orderBook, setOrderBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounce rapid updates to prevent flickering
  const [updateBuffer, setUpdateBuffer] = useState(null);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    let eventSource;
    let reconnectTimer;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY_MS = 3000;

    const connectSSE = () => {
      setIsLoading(true);
      setConnectionStatus("connecting");

      console.log(
        `Connecting SSE for market ${marketId} with sides: ${side1}, ${side2}`
      );

      // Close any existing connection
      if (eventSource) {
        eventSource.close();
      }

      // Get the base URL from the API configuration
      const baseUrl = api.defaults.baseURL;

      // Get auth token if available
      const token = localStorage.getItem("UnomarketToken");

      // Append token to the URL if available
      let sseUrl = `${baseUrl}/api/event/orderbook/stream?market_id=${marketId}`;
      if (token) {
        sseUrl += `&token=${token}`;
      }

      // Add a unique timestamp to prevent caching
      sseUrl += `&t=${Date.now()}`;


      // Create a new EventSource connection to the SSE endpoint
      eventSource = new EventSource(sseUrl);

      // Connection opened successfully
      eventSource.onopen = () => {
        setConnectionStatus("connected");
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdateTime(new Date());

          // Handle different event types
          if (data.type === "connection_established") {
            setConnectionStatus("established");
          } else if (data.type === "orderbook_update") {

            // Handle the new data structure: {"orderbook":{"MIL":[[67,5]],"MIA":[]}}
            if (data.data && data.data.orderbook) {
              const orderbook = data.data.orderbook;

              // Check if we have data for our market sides (dynamic keys)
              const hasValidData =
                (orderbook[side1] && Array.isArray(orderbook[side1])) ||
                (orderbook[side2] && Array.isArray(orderbook[side2]));


              if (hasValidData) {
                // Check if the data is different from what we already have
                const dataChanged =
                  !orderBook ||
                  JSON.stringify(orderBook) !== JSON.stringify(data.data);

                if (dataChanged) {

                  // Store the update in buffer
                  setUpdateBuffer(data.data);

                  // Clear any existing timeout
                  if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                  }

                  // Set updating state immediately for smooth transition
                  setIsUpdating(true);

                  // Debounce the actual update to prevent rapid flickering
                  updateTimeoutRef.current = setTimeout(() => {
                    // Transform the data to the expected format
                    const transformedData = transformSSEOrderBookData(
                      updateBuffer || data.data,
                      side1,
                      side2
                    );
                    setOrderBook(transformedData);
                    setIsLoading(false);
                    setIsUpdating(false);
                    setUpdateBuffer(null);
                  }, 100); // 100ms debounce
                } else {
                }
              } else {
                // Still set the data even if our specific sides are empty
                const transformedData = transformSSEOrderBookData(
                  data.data,
                  side1,
                  side2
                );
                setOrderBook(transformedData);
                setIsLoading(false);
              }
            } else {
              console.error("Invalid order book data structure:", data.data);
              setError("Invalid order book data received");
            }
          } 
        } catch (err) {
          console.error("Error parsing SSE data:", err);
          setError("Failed to parse server data");
          setConnectionStatus("error");
        }
      };

      // Handle heartbeat events (they come with event type)
      eventSource.addEventListener("heartbeat", (event) => {
        try {
          const timestamp = parseInt(event.data);
          setLastUpdateTime(new Date());

          // Ensure connection is marked as established if we're receiving heartbeats
          if (connectionStatus !== "established") {
            setConnectionStatus("established");
          }
        } catch (err) {
          console.warn("Invalid heartbeat data:", event.data);
        }
      });

      // Handle errors
      eventSource.onerror = (err) => {
        setError("Connection to order book failed");
        setIsLoading(false);
        setConnectionStatus("error");

        // Clear any existing reconnect timer
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts - 1);

          reconnectTimer = setTimeout(() => {
            connectSSE();
          }, delay);
        } else {
          setError(
            `Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please refresh the page.`
          );
        }
      };
    };

    // Start the SSE connection when the component mounts
    if (marketId) {
      connectSSE();
    } else {
      setIsLoading(false);
      setError("No market ID provided");
      setConnectionStatus("idle");
    }

    // Clean up the connection when the component unmounts
    return () => {
      if (eventSource) {
        eventSource.close();
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [marketId, side1, side2]); // Reconnect if marketId or sides change

  return {
    orderBook,
    isLoading,
    error,
    connectionStatus,
    lastUpdateTime,
    isUpdating,
  };
};
