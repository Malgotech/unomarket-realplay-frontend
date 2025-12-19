import api from "./api";

// Generalized function to fetch data from any endpoint
let baseURL = "https://unoapi.unitythink.com";


export const fetchData = async (endpoint, data = null) => {
  try {
    const token = localStorage.getItem("UnomarketToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    let response;
    if (data) {
      response = await api.post(`/${endpoint}`, data, { headers }); // Example using POST
    } else {
      response = await api.get(`/${endpoint}`, { headers });
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);

    if (error.response) {
      // The request was made, but the server responded with a non-2xx status code
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error setting up the request:", error.message);
    }

    throw error; // Re-throw the error for the caller to handle
  }
};

// Generalized function to post data to any endpoint
export const postData = async (endpoint, data, isFormData = false) => {
  try {
    const token = localStorage.getItem("UnomarketToken");

    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // For FormData, don't set Content-Type - let browser set it with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      headers,
      // Ensure axios doesn't transform FormData
      ...(isFormData && {
        transformRequest: [(data) => data],
        timeout: 30000, // 30 second timeout for file uploads
      }),
    };


    const response = await api.post(`${baseURL}/${endpoint}`, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generalized function to put data to any endpoint
export const putData = async (endpoint, data) => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem("UnomarketToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.put(`/${endpoint}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error putting data to ${endpoint}:`, error);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    throw error;
  }
};

// Specific function to create a category (uses the generalized postData function)
// export const createCategory = async (endpoint, categoryData) => {
//   return postData(endpoint, categoryData);
// };

// Generalized function to delete data from any endpoint
export const deleteData = async (endpoint) => {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem("UnomarketToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.delete(`/${endpoint}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    throw error;
  }
};

// Withdraw funds
export const withdrawFunds = async (address, amount) => {
  return postData("withdraws", { address, amount });
};



export const createEvent = async (eventData) => {
  try {
    // Ensure we're using 'markets' instead of 'sub_markets' for consistency with API
    if (eventData.markets) {
      // Make sure all required fields are present for each market
      eventData.markets = eventData.markets.map((market) => ({
        ...market,
        // Ensure market_image is set (fallback to event_image if missing)
        market_image:
          market.market_image || market.event_image || eventData.event_image,
        // Ensure these values are numbers
        settlement_time: Number(market.settlement_time || 24),
        yes_bids: Number(market.yes_bids || 0),
        yes_asks: Number(market.yes_asks || 0),
        volume: Number(market.volume || 0),
        dollar_volume: Number(market.dollar_volume || 0),
      }));
    }

    const response = await api.post("/api/admin/createevents", eventData);
    return response.data;
  } catch (error) {
    console.error("Create Event Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};


export const uploadFile = async (file, fileType = "image") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "path",
      fileType === "image" ? "uploads/images" : "uploads/documents"
    );

    const response = await api.post("/api/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (!response.data || !response.data.data) {
      throw new Error("No file URL received from server");
    }

    return response.data.data;
  } catch (error) {
    console.error("Upload Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.message || error.message || "Upload failed"
    );
  }
};