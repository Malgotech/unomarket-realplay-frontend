import axios from "axios";
const UnomarketToken = localStorage.getItem("UnomarketToken");
const api = axios.create({
  // baseURL: "http://52.23.223.231",
  // baseURL: "https://api.uno.market",
  baseURL: "https://api.uno.market",
  headers: {
    "Content-Type": "application/json",
    // Add any default headers here (e.g., for authentication)
    Authorization: `Bearer ${UnomarketToken}`,
  },
});

export default api;
