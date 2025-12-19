import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { fetchData } from "../../services/apiServices";

const StyledDialog = styled(Dialog)(({ theme, darkmode }) => ({
  "& .MuiDialog-paper": {
    width: "480px",
    height: "auto",
    maxHeight: "90vh",
    borderRadius: "18px",
    background: darkmode ? "#1E1E1E" : "#FDFDFD",
    color: darkmode ? "#FFFFFF" : "#2b2d2e",
    maxWidth: "480px",
    margin: 0,
    padding: theme.spacing(3),
    // Mobile responsive styles
    [theme.breakpoints.down("sm")]: {
      width: "95vw",
      maxWidth: "95vw",
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      height: "auto",
      maxHeight: "95vh",
    },
  },
}));

const FreeCreditsMarketingDialog = ({ open, onClose, onRegisterClick }) => {
  const themeMode = useSelector((state) => state.theme.value);
  const isDarkMode = themeMode === "dark";

  const [freeFundsAmount, setFreeFundsAmount] = useState(25); // Default amount
  const [isLoading, setIsLoading] = useState(true);

  // Fetch free funds config when dialog opens
  useEffect(() => {
    if (open) {
      fetchFreeFundsConfig();
    }
  }, [open]);

  const fetchFreeFundsConfig = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetchData("marketing/free-funds/config");
      
      if (response.success && response.data) {
        setFreeFundsAmount(response.data.free_funds_amount || 25);
      }
    } catch (error) {
      console.error("Error fetching free funds config:", error);
      // Use default amount if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    onClose();
    onRegisterClick();
  };

  const handleMaybeLater = () => {
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleMaybeLater}
      aria-labelledby="free-credits-marketing-dialog"
      darkmode={isDarkMode}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 0,
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box sx={{ marginY: 2, width: "120px" }}>
          <img
            src={isDarkMode ? "/soundbet-new-logo-dark.png" : "/soundbet-new-logo-light.png"}
            alt="soundbet Logo"
            style={{ width: "100%" }}
          />
        </Box>

        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: isDarkMode ? "#fff" : "#2b2d2e" }}>
              Loading offer...
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* Main emoji and hook */}
            <div className="text-7xl mb-4">🚀</div>
            
            <Typography
              variant="h4"
              sx={{
                color: isDarkMode ? "#fff" : "#2b2d2e",
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Welcome to SOUNDBET!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? "#C5C5C5" : "#666",
                mb: 3,
                maxWidth: "400px",
                fontSize: "16px",
                lineHeight: "1.5",
              }}
            >
              Join thousands of traders making predictions and earning real money. 
              Start your journey with{" "}
              <span style={{ color: "#4169e1", fontWeight: "bold" }}>
                ${freeFundsAmount} FREE
              </span>{" "}
              USDC credits!
            </Typography>

            {/* Highlight the free amount */}
            {/* <div className="mb-4 p-4 rounded-lg" style={{ 
              background: isDarkMode 
                ? "linear-gradient(135deg, #4169e1 0%, #7c3aed 100%)" 
                : "linear-gradient(135deg, #4169e1 0%, #7c3aed 100%)",
              color: "#fff"
            }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                }}
              >
                ${freeFundsAmount}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  opacity: 0.9,
                }}
              >
                Free Credits • No Deposit Required
              </Typography>
            </div> */}

            {/* Feature highlights */}
            <div className="mb-6 space-y-2 text-left w-full max-w-[350px]">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#4169e1] rounded-full"></div>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#C5C5C5" : "#666" }}>
                  Predict sports, politics & market events
                </Typography>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#4169e1] rounded-full"></div>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#C5C5C5" : "#666" }}>
                  Win cryptos with accurate predictions
                </Typography>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#4169e1] rounded-full"></div>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#C5C5C5" : "#666" }}>
                  Instant withdrawals to your wallet
                </Typography>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full max-w-[350px]">
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-4 bg-[#4169e1] rounded-lg cursor-pointer hover:bg-[#3558d9] transition-colors"
              >
                <div className="text-[#fcfcfc] text-lg font-semibold">
                  Claim ${freeFundsAmount} Free Credits
                </div>
                <div className="text-[#fcfcfc] text-sm opacity-90">
                  Sign up now • Takes few seconds
                </div>
              </button>

              <button
                onClick={handleMaybeLater}
                className="w-full px-6 py-3 border rounded-lg cursor-pointer transition-colors"
                style={{
                  background: isDarkMode ? "#2C2C2C" : "#fff",
                  border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
                  color: isDarkMode ? "#C5C5C5" : "#666",
                }}
              >
                <div className="text-sm font-medium">Maybe Later</div>
              </button>
            </div>

            {/* Small disclaimer */}
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#666" : "#999",
                fontSize: "11px",
                mt: 3,
                maxWidth: "320px",
                lineHeight: "1.4",
              }}
            >
              Free credits are automatically added to your account upon registration. 
              Terms and conditions apply.
            </Typography>
          </div>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default FreeCreditsMarketingDialog;