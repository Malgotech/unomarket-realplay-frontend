import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelector } from 'react-redux';
import { postData } from '../../services/apiServices'; // Import postData from apiServices
import { userDataAPI } from '../../store/reducers/movieSlice';

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

const DisputeDialog = ({
  isOpen,
  onClose,
  eventData,
  marketId,
  resolution,
  onSubmit
}) => {
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDark = theme === 'dark'; // Check if dark mode is active
  const [disputeData, setDisputeData] = useState({
    proposed_result: "side_1", // Default to side_1
    evidence_url_1: "",
    evidence_url_2: "",
    evidence_description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Update dispute data when resolution or isOpen changes
  useEffect(() => {
    if (resolution && isOpen) {
      // Set the proposed result to be the opposite of the current resolution
      const oppositeResult = resolution.proposed_result === eventData.sub_markets[0].side_1 ? eventData.sub_markets[0].side_2 : eventData.sub_markets[0].side_1;
      setDisputeData(prev => ({
        ...prev,
        proposed_result: oppositeResult
      }));
    }
  }, [resolution, isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDisputeData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user makes changes
    setErrorMessage("");
  };

  // Validate form before submission
  const validateForm = () => {
    if (!marketId) {
      setErrorMessage("Market ID is required");
      return false;
    }

    if (!disputeData.proposed_result) {
      setErrorMessage("Proposed result is required");
      return false;
    }

    if (!disputeData.evidence_description.trim()) {
      setErrorMessage("Evidence description is required");
      return false;
    }

    // Basic URL validation
    if (disputeData.evidence_url_1 && !isValidUrl(disputeData.evidence_url_1)) {
      setErrorMessage("Please enter a valid URL for Evidence URL 1");
      return false;
    }

    if (disputeData.evidence_url_2 && !isValidUrl(disputeData.evidence_url_2)) {
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

  // Handle submit dispute
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
        alert("Please log in to dispute a resolution");
        onClose();
        return;
      }

      // Create the payload for the dispute API
      // Always send the original side_1/side_2 value from eventData.sub_markets[0]
      let proposedResultValue = disputeData.proposed_result;
      if (
        proposedResultValue === "side_1" ||
        proposedResultValue === (eventData?.sub_markets?.[0]?.side_1 || "side_1").toLowerCase()
      ) {
        proposedResultValue = eventData?.sub_markets?.[0]?.side_1 || "side_1";
      } else if (
        proposedResultValue === "side_2" ||
        proposedResultValue === (eventData?.sub_markets?.[0]?.side_2 || "side_2").toLowerCase()
      ) {
        proposedResultValue = eventData?.sub_markets?.[0]?.side_2 || "side_2";
      }
      const payload = {
        market_id: marketId,
        proposed_result: proposedResultValue,
        evidence_url_1: disputeData.evidence_url_1 || null,
        evidence_url_2: disputeData.evidence_url_2 || null,
        evidence_description: disputeData.evidence_description
      };

      console.log("Sending dispute payload:", payload);

      // Send to the dispute endpoint instead of propose
      const data = await postData('api/event/resolution/dispute', payload);

      if (data.success) {
        alert("Dispute submitted successfully");
        onClose();

        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        setErrorMessage(`Failed to submit dispute: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting dispute:", error);
      // Extract more detailed error message when available
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
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
      aria-labelledby="dispute-dialog-title"
      isDark={isDark}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 0,
          position: "relative"
        }}
      >
        <button
          className={`absolute right-4 top-4 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={onClose}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Top center title - 24px top space */}
        <div className="mt-[24px] flex justify-center">
          <div className={`w-[186px] h-[18px] justify-center text-2xl font-medium ${isDark ? 'text-gray-100' : 'text-[#2b2d2e]'}`}>Propose Dispute</div>
        </div>

        {/* Row with market question and image - 18px space */}
        <div className="mt-[18px] flex justify-between items-center w-full px-6">
          <div className={`justify-center text-xl font-semibold mr-4 ${isDark ? 'text-gray-100' : 'text-[#2b2d2e]'}`}>
            {eventData?.event_title || "Who will become president?"}
          </div>
          <div className={`w-9 h-9 ${isDark ? 'bg-gray-700' : 'bg-[#d9d9d9]'} rounded-[5px] overflow-hidden`}>
            {eventData?.event_image && (
              <img
                src={eventData.event_image}
                alt="Event"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Row with current proposed outcome - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div className={`justify-center text-base font-medium ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Current Outcome</div>
          <div className={`text-center justify-center text-base font-medium ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>
            {resolution?.proposed_result || "Yes"}
          </div>
        </div>

        {/* Row with outcome selection - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div className={`justify-center text-base font-medium ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Your Proposed Result</div>
          <div className="flex items-center">
            <select
              className={`bg-transparent border rounded-md px-2 py-1 ${isDark ? 'border-gray-600 text-gray-100 bg-gray-800' : 'border-gray-300'}`}
              name="proposed_result"
              value={disputeData.proposed_result}
              onChange={handleInputChange}
            >
              <option value={eventData?.sub_markets?.[0]?.side_1 || "side_1"}>
                {eventData?.sub_markets?.[0]?.side_1 || "Side 1"}
              </option>
              <option value={eventData?.sub_markets?.[0]?.side_2 || "side_2"}>
                {eventData?.sub_markets?.[0]?.side_2 || "Side 2"}
              </option>
            </select>
          </div>
        </div>

        {/* Evidence URL input */}
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div className={`justify-center text-base font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Evidence URL 1</div>
          <input
            type="text"
            name="evidence_url_1"
            value={disputeData.evidence_url_1}
            onChange={handleInputChange}
            placeholder="https://example.com/evidence"
            className={`w-full border rounded-md px-2 py-1 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300'}`}
          />
        </div>

        {/* Evidence URL input 2 */}
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div className={`justify-center text-base font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Evidence URL 2 (optional)</div>
          <input
            type="text"
            name="evidence_url_2"
            value={disputeData.evidence_url_2}
            onChange={handleInputChange}
            placeholder="https://example.com/evidence2"
            className={`w-full border rounded-md px-2 py-1 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300'}`}
          />
        </div>

        {/* Evidence description input */}
        <div className="mt-[16px] flex flex-col w-full px-6">
          <div className={`justify-center text-base font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Evidence Description</div>
          <textarea
            name="evidence_description"
            value={disputeData.evidence_description}
            onChange={handleInputChange}
            placeholder="Explain why you are disputing this result with evidence"
            className={`w-full border rounded-md px-2 py-1 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300'}`}
            rows={3}
          />
        </div>

        {/* Row with amount payable - 16px space */}
        <div className="mt-[16px] flex justify-between items-center w-full px-6">
          <div className={`w-[121px] h-3.5 justify-center text-base font-medium ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>Bond Amount</div>
          <div className={`w-[38px] h-3.5 text-center justify-center text-base font-medium ${isDark ? 'text-gray-200' : 'text-[#2b2d2e]'}`}>${eventData?.sub_markets?.[0]?.bond_amount || "0.0"}</div>
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
            className={`w-full h-12 px-4 py-2 rounded-[5px] inline-flex flex-col justify-center items-center gap-1 cursor-pointer transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#4169e1] hover:bg-[#3658c7]'}`}
            onClick={handleSubmit}
          >
            <div className="justify-center text-white text-xl font-semibold">
              {isSubmitting ? 'Submitting...' : 'Pay'}
            </div>
          </div>
        </div>
      </DialogContent>
    </StyledDialog>
  );
};

export default DisputeDialog;