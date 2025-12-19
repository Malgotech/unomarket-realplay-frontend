import { useState, useEffect } from "react";
import { fetchData } from "../services/apiServices";

// Global cache for categories
let categoriesCache = null;
let cacheTimestamp = null;
let cachePromise = null;

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

const useCategories = () => {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => {
      const currentTime = Date.now();

      // Check if we have valid cached data
      if (
        categoriesCache &&
        cacheTimestamp &&
        currentTime - cacheTimestamp < CACHE_DURATION
      ) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }

      // Check localStorage cache
      try {
        const cachedData = localStorage.getItem("SoundbetCategories");
        const cachedTimestampStr = localStorage.getItem(
          "SoundbetCategoriesTimestamp"
        );

        if (cachedData && cachedTimestampStr) {
          const cachedTime = parseInt(cachedTimestampStr);
          if (currentTime - cachedTime < CACHE_DURATION) {
            const parsedData = JSON.parse(cachedData);
            categoriesCache = parsedData;
            cacheTimestamp = cachedTime;
            setCategories(parsedData);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error parsing cached categories:", e);
      }

      // If there's already a fetch in progress, wait for it
      if (cachePromise) {
        try {
          const result = await cachePromise;
          setCategories(result);
          setLoading(false);
          return;
        } catch (err) {
          setError(err);
          setLoading(false);
          return;
        }
      }

      // Make fresh API call
      cachePromise = fetchData("api/admin/categories")
        .then((response) => {
          if (response.status && response.data.categories) {
            categoriesCache = response;
            cacheTimestamp = currentTime;

            // Update localStorage
            localStorage.setItem(
              "SoundbetCategories",
              JSON.stringify(response)
            );
            localStorage.setItem(
              "SoundbetCategoriesTimestamp",
              currentTime.toString()
            );

            return response;
          } else {
            throw new Error("Failed to fetch categories");
          }
        })
        .catch((err) => {
          console.error("Error fetching categories:", err);
          throw err;
        })
        .finally(() => {
          cachePromise = null;
        });

      try {
        const result = await cachePromise;
        setCategories(result);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  // Helper function to get sports subcategories
  const getSportsSubcategories = () => {
    if (!categories?.categories) return [];

    const sportsCategory = categories.categories.find(
      (category) => category.name === "Sports"
    );

    return sportsCategory?.subcategories || [];
  };

  // Helper function to find subcategory by ID
  const getSubcategoryById = (subcategoryId) => {
    const subcategories = getSportsSubcategories();
    return subcategories.find((subcat) => subcat._id === subcategoryId);
  };

  return {
    categories,
    loading,
    error,
    getSportsSubcategories,
    getSubcategoryById,
  };
};

export default useCategories;
