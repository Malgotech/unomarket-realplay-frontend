import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { postData } from "../../services/apiServices"; // Import postData from apiServices
import { useToast } from "../../context/ToastContext";
import { userDataAPI } from "../../store/reducers/movieSlice";

// Custom styled dialog
const StyledDialog = styled(Dialog)(({ theme, isDark }) => ({
  "& .MuiDialog-paper": {
    width: "532px",
    borderRadius: "18px",
    background: isDark ? "#18181b" : "#FDFDFD",
    maxWidth: "532px",
    margin: 0,
    padding: theme.spacing(2),
  },
}));

const ResolutionDialog = ({
  isOpen,
  onClose,
  eventData,
  marketId,
  onSubmit,
}) => {
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDark = theme === "dark"; // Check if dark mode is active
  const { showSuccessToast, showErrorToast } = useToast();
  // Find the current market data based on marketId
  const currentMarket =
    eventData?.sub_markets?.find((market) => market._id === marketId) ||
    eventData?.sub_markets?.[0];

  const [resolutionData, setResolutionData] = useState({
    proposed_result: "side_1", // Default to side_1, will be updated in useEffect
    evidence_url_1: "",
    evidence_url_2: "",
    evidence_description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Update the default proposed_result when currentMarket changes
  useEffect(() => {
    if (currentMarket?.side_1) {
      setResolutionData((prev) => ({
        ...prev,
        proposed_result: currentMarket.side_1,
      }));
    }
  }, [currentMarket, marketId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResolutionData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user makes changes
    setErrorMessage("");
  };

  // Validate form before submission
  const validateForm = () => {
    if (!resolutionData.evidence_description.trim()) {
      setErrorMessage("Evidence description is required");
      return false;
    }

    // Check if both URLs are provided
    if (
      !resolutionData.evidence_url_1.trim() ||
      !resolutionData.evidence_url_2.trim()
    ) {
      setErrorMessage("Both evidence URLs are required");
      return false;
    }

    // Basic URL validation for both URLs
    if (!isValidUrl(resolutionData.evidence_url_1)) {
      setErrorMessage("Please enter a valid URL for Evidence URL 1");
      return false;
    }

    if (!isValidUrl(resolutionData.evidence_url_2)) {
      setErrorMessage("Please enter a valid URL for Evidence URL 2");
      return false;
    }

    return true;
  };

  // Simple URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle submit resolution
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Reset error state
    setErrorMessage("");

    // Validate form
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("UnomarketToken");
      if (!token) {
        alert("Please log in to propose a resolution");
        onClose();
        return;
      }

      // Create the payload, ensuring proper data types and formats
      // Always send the original side_1/side_2 value from currentMarket
      let proposedResultValue = resolutionData.proposed_result;
      if (
        proposedResultValue === "side_1" ||
        proposedResultValue ===
          (currentMarket?.side_1 || "side_1").toLowerCase()
      ) {
        proposedResultValue = currentMarket?.side_1 || "side_1";
      } else if (
        proposedResultValue === "side_2" ||
        proposedResultValue ===
          (currentMarket?.side_2 || "side_2").toLowerCase()
      ) {
        proposedResultValue = currentMarket?.side_2 || "side_2";
      }
      const payload = {
        market_id: marketId,
        proposed_result: proposedResultValue,
        evidence_url_1: resolutionData.evidence_url_1,
        evidence_url_2: resolutionData.evidence_url_2,
        evidence_description: resolutionData.evidence_description,
      };

      console.log("Sending resolution payload:", payload);
      console.log("Current market being resolved:", currentMarket);

      // Use postData from apiServices instead of direct fetch
      const data = await postData("api/event/resolution/propose", payload);

      if (data.success) {
        showSuccessToast("Resolution proposal submitted successfully");
        onClose();

        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        setErrorMessage(
          `Failed to submit resolution: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error submitting resolution:", error);
      // Extract more detailed error message when available
      const errorMsg =
        error.response?.data?.message || error.message || "Unknown error";
      setErrorMessage(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
    dispatch(userDataAPI());
  };

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="resolution-dialog-title"
      isDark={isDark}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 0,
          position: "relative",
        }}>
        <button
          className={`absolute right-4 top-4 ${
            isDark
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={onClose}>
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Top center title - 24px top space */}
        <div className="mt-[24px] flex justify-center">
          <div
            className={`h-[18px] justify-center text-2xl font-medium ${
              isDark ? "text-gray-100" : "text-[#2b2d2e]"
            }`}>
            Propose Solution
          </div>
        </div>

        {/* Row with market question and image - 18px space */}
        <div className="mt-[18px] flex justify-between items-center w-full px-6">
          <div
            className={`justify-center text-xl font-semibold mr-4 ${
              isDark ? "text-gray-100" : "text-[#2b2d2e]"
            }`}>
            {eventData?.event_title || "Who become president?"}
          </div>
          <div
            className={`w-9 h-9 ${
              isDark ? "bg-gray-700" : "bg-[#d9d9d9]"
            } rounded-[5px] overflow-hidden`}>
            {eventData?.event_image && (
              <img
                src={eventData.event_image}
                alt="Event"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Row with result - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div
            className={`w-[46px] h-3.5 justify-center text-base font-medium ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Market
          </div>
          <div
            className={`text-center justify-center text-base font-medium ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            {currentMarket?.name || "Yes"}
          </div>
        </div>

        {/* Row with outcome selection - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div
            className={`justify-center text-base font-medium ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Proposed Result
          </div>
          <div className="flex items-center">
            <select
              className={`bg-transparent border rounded-md px-2 py-1 ${
                isDark
                  ? "border-gray-600 text-gray-100 bg-gray-800"
                  : "border-gray-300 text-[#2b2d2e]"
              }`}
              name="proposed_result"
              value={resolutionData.proposed_result}
              onChange={handleInputChange}>
              <option value={currentMarket?.side_1 || "side_1"}>
                {currentMarket?.side_1 || "Side 1"}
              </option>
              <option value={currentMarket?.side_2 || "side_2"}>
                {currentMarket?.side_2 || "Side 2"}
              </option>
            </select>
          </div>
        </div>

        {/* Evidence URL inputs */}
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div
            className={`justify-center text-base font-medium mb-2 ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Evidence URL 1
          </div>
          <input
            type="text"
            name="evidence_url_1"
            value={resolutionData.evidence_url_1}
            onChange={handleInputChange}
            placeholder="https://example.com/evidence1"
            className={`w-full border rounded-md px-2 py-1 ${
              isDark
                ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
                : "border-gray-300"
            }`}
          />
        </div>
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div
            className={`justify-center text-base font-medium mb-2 ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Evidence URL 2
          </div>
          <input
            type="text"
            name="evidence_url_2"
            value={resolutionData.evidence_url_2}
            onChange={handleInputChange}
            placeholder="https://example.com/evidence2"
            className={`w-full border rounded-md px-2 py-1 ${
              isDark
                ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
                : "border-gray-300"
            }`}
          />
        </div>

        {/* Evidence description input - NEW */}
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div
            className={`justify-center text-base font-medium mb-2 ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Evidence Description
          </div>
          <textarea
            name="evidence_description"
            value={resolutionData.evidence_description}
            onChange={handleInputChange}
            placeholder="Describe the evidence for your proposed result"
            className={`w-full border rounded-md px-2 py-1 ${
              isDark
                ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
                : "border-gray-300"
            }`}
            rows={3}
          />
        </div>

        {/* Row with amount payable - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div
            className={`w-[121px] h-3.5 justify-center text-base font-medium ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            Bond Amount
          </div>
          <div
            className={`w-[38px] h-3.5 text-center justify-center text-base font-medium ${
              isDark ? "text-gray-200" : "text-[#2b2d2e]"
            }`}>
            ${currentMarket?.bond_amount || "0.00"}
          </div>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div className="mt-2 text-red-500 text-center w-full px-6">
            {errorMessage}
          </div>
        )}

        {/* Pay button at bottom - with proper spacing */}
        <div className="mt-[36px] flex justify-center w-full px-6 mb-6">
          <div
            className={`w-full h-12 px-4 py-2 rounded-[5px] inline-flex flex-col justify-center items-center gap-1 cursor-pointer transition-colors ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-[#4169e1] hover:bg-[#3658c7]"
            }`}
            onClick={handleSubmit}>
            <div className="justify-center text-white text-xl font-semibold">
              {isSubmitting ? "Submitting..." : "Pay"}
            </div>
          </div>
        </div>
      </DialogContent>
    </StyledDialog>
  );
};

export default ResolutionDialog;
