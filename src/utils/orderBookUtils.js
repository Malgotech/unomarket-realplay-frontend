/**
 * Utility functions for handling orderbook data transformations
 * Handles the new format: dynamic keys, array format [price, shares], integer prices, only bids
 */

/**
 * Transforms the new orderbook format to the expected component format
 * @param {Object} rawOrderBook - The raw orderbook data from API
 * @param {string} side1 - First side name (e.g., "Yes", "Lakers")
 * @param {string} side2 - Second side name (e.g., "No", "Warriors")
 * @returns {Object} Transformed orderbook data
 */
export const transformOrderBookData = (rawOrderBook, side1, side2) => {
  if (!rawOrderBook || !rawOrderBook.orderbook) {
    return {
      [side1]: { bids: [], asks: [] },
      [side2]: { bids: [], asks: [] }
    };
  }

  const orderbook = rawOrderBook.orderbook;
  
  // Get bids for each side (only bids are provided)
  const side1Bids = Array.isArray(orderbook[side1]) ? orderbook[side1] : [];
  const side2Bids = Array.isArray(orderbook[side2]) ? orderbook[side2] : [];

  // Transform array format [price, shares] to object format {price, shares}
  // Keep prices as integers (cents) - do NOT divide by 100
  const transformBids = (bids) => {
    return bids.map(([price, shares]) => ({
      price: price, // Keep as integer cents (44 not 0.44)
      shares: shares
    }));
  };

  // Calculate asks using reciprocal relationship
  // YES BID at price X = NO ASK at price (100 - X)
  // NO BID at price Y = YES ASK at price (100 - Y)
  const calculateAsks = (oppositeBids) => {
    return oppositeBids.map(([price, shares]) => ({
      price: 100 - price, // Reciprocal price, keep as integer cents
      shares: shares
    }));
  };

  const transformedSide1Bids = transformBids(side1Bids);
  const transformedSide2Bids = transformBids(side2Bids);

  // Calculate asks from opposite side's bids
  const transformedSide1Asks = calculateAsks(side2Bids);
  const transformedSide2Asks = calculateAsks(side1Bids);

  return {
    [side1]: {
      bids: transformedSide1Bids,
      asks: transformedSide1Asks
    },
    [side2]: {
      bids: transformedSide2Bids,
      asks: transformedSide2Asks
    }
  };
};

/**
 * Transforms orderbook data for SSE updates
 * @param {Object} sseData - SSE data containing orderbook
 * @param {string} side1 - First side name
 * @param {string} side2 - Second side name
 * @returns {Object} Transformed SSE data
 */
export const transformSSEOrderBookData = (sseData, side1, side2) => {
  if (!sseData || !sseData.orderbook) {
    return {
      orderBook: {
        [side1]: { bids: [], asks: [] },
        [side2]: { bids: [], asks: [] }
      },
      spreads: { [side1]: null, [side2]: null },
      marketPrices: {
        [side1]: { bestBid: null, bestAsk: null },
        [side2]: { bestBid: null, bestAsk: null }
      }
    };
  }

  const transformedOrderBook = transformOrderBookData({ orderbook: sseData.orderbook }, side1, side2);
  const calculatedSpreads = calculateSpreads(transformedOrderBook, side1, side2);
  const marketPrices = calculateMarketPrices(transformedOrderBook, side1, side2);
  
  return {
    orderBook: transformedOrderBook,
    spreads: calculatedSpreads,
    marketPrices: marketPrices
  };
};

/**
 * Get the best bid and ask prices for market prices calculation
 * @param {Array} bids - Array of bid objects {price, shares}
 * @param {Array} asks - Array of ask objects {price, shares}
 * @returns {Object} {bestBid, bestAsk}
 */
export const getBestPrices = (bids, asks) => {
  const bestBid = bids && bids.length > 0 ? Math.max(...bids.map(b => b.price)) : null;
  const bestAsk = asks && asks.length > 0 ? Math.min(...asks.map(a => a.price)) : null;
  
  return { bestBid, bestAsk };
};

/**
 * Calculate spread from orderbook data (ask - bid gap)
 * @param {Object} transformedOrderBook - Transformed orderbook data
 * @param {string} side1 - First side name
 * @param {string} side2 - Second side name
 * @returns {Object} Spread object for each side
 */
export const calculateSpreads = (transformedOrderBook, side1, side2) => {
  const calculateSideSpread = (sideData) => {
    const bids = sideData.bids || [];
    const asks = sideData.asks || [];
    
    if (bids.length === 0 || asks.length === 0) {
      return null;
    }
    
    // Get best bid (highest price) and best ask (lowest price)
    const bestBid = Math.max(...bids.map(b => b.price));
    const bestAsk = Math.min(...asks.map(a => a.price));
    
    // Spread is the gap between best ask and best bid
    return bestAsk - bestBid;
  };

  const side1Data = transformedOrderBook[side1] || { bids: [], asks: [] };
  const side2Data = transformedOrderBook[side2] || { bids: [], asks: [] };

  return {
    [side1]: calculateSideSpread(side1Data),
    [side2]: calculateSideSpread(side2Data)
  };
};

/**
 * Calculate market prices from transformed orderbook data
 * @param {Object} transformedOrderBook - Transformed orderbook data
 * @param {string} side1 - First side name
 * @param {string} side2 - Second side name
 * @returns {Object} Market prices object
 */
export const calculateMarketPrices = (transformedOrderBook, side1, side2) => {
  const side1Data = transformedOrderBook[side1] || { bids: [], asks: [] };
  const side2Data = transformedOrderBook[side2] || { bids: [], asks: [] };

  const side1Prices = getBestPrices(side1Data.bids, side1Data.asks);
  const side2Prices = getBestPrices(side2Data.bids, side2Data.asks);

  return {
    [side1]: side1Prices,
    [side2]: side2Prices
  };
};
