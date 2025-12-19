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
import { fetchData, postData } from "../../services/apiServices";
import confetti from "canvas-confetti";

const StyledDialog = styled(Dialog)(({ theme, darkmode }) => ({
  "& .MuiDialog-paper": {
    width: "450px",
    height: "auto",
    maxHeight: "80vh",
    borderRadius: "18px",
    background: darkmode ? "#1E1E1E" : "#FDFDFD",
    color: darkmode ? "#FFFFFF" : "#2b2d2e",
    maxWidth: "450px",
    margin: 0,
    padding: theme.spacing(3),
    // Mobile responsive styles
    [theme.breakpoints.down("sm")]: {
      width: "95vw",
      maxWidth: "95vw",
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      height: "auto",
      maxHeight: "90vh",
    },
  },
}));

const OnboardingRewardsDialog = ({ open, onClose }) => {
  const themeMode = useSelector((state) => state.theme.value);
  const isDarkMode = themeMode === "dark";

  const [freeFundsAmount, setFreeFundsAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  // Fetch free funds config when dialog opens
  useEffect(() => {
    if (open) {
      fetchFreeFundsConfig();
    }
  }, [open]);

  const fetchFreeFundsConfig = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await fetchData("marketing/free-funds/config");
      
      if (response.success && response.data) {
        setFreeFundsAmount(response.data.free_funds_amount || 0);
      } else {
        setErrorMessage("Failed to load rewards information");
      }
    } catch (error) {
      console.error("Error fetching free funds config:", error);
      setErrorMessage("Failed to load rewards information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsClaiming(true);
    setErrorMessage("");

    try {
      const response = await postData("marketing/free-funds/claim", {});
      
      if (response.success && response.data) {
        setIsClaimed(true);
        setClaimedAmount(response.data.claimed_amount);
        setNewBalance(response.data.new_wallet_balance);
        
        // Trigger confetti animation
        triggerConfettiAnimation();
        
        // Auto-close dialog after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
        
      } else {
        setErrorMessage(response.message || "Failed to claim rewards");
      }
    } catch (error) {
      console.error("Error claiming free funds:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to claim rewards. Please try again.");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const triggerConfettiAnimation = () => {
    // Create multiple confetti bursts
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Create confetti from both sides
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  };

  const handleClose = () => {
    onClose();
  };

  // Don't show dialog if no free funds available
  if (!isLoading && freeFundsAmount <= 0) {
    return null;
  }

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      aria-labelledby="onboarding-rewards-dialog"
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
              Loading rewards...
            </Typography>
          </div>
        ) : isClaimed ? (
          // Success state
          <div className="flex flex-col items-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <Typography
              variant="h4"
              sx={{
                color: "#4169e1",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Congratulations!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: isDarkMode ? "#fff" : "#2b2d2e",
                mb: 1,
              }}
            >
              You've claimed ${claimedAmount}!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#C5C5C5" : "#666",
                mb: 3,
              }}
            >
              New wallet balance: ${newBalance.toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#C5C5C5" : "#666",
                fontSize: "12px",
              }}
            >
              This dialog will close automatically...
            </Typography>
          </div>
        ) : (
          // Default state - show rewards to claim
          <div className="flex flex-col items-center w-full">
            <div className="text-6xl mb-4">💰</div>
            
            <Typography
              variant="h5"
              sx={{
                color: isDarkMode ? "#fff" : "#2b2d2e",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Welcome Bonus!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? "#C5C5C5" : "#666",
                mb: 3,
                maxWidth: "350px",
              }}
            >
              Congratulations on joining SOUNDBET! As a welcome gift, you have
            </Typography>

            <div className="mb-4">
              <Typography
                variant="h3"
                sx={{
                  color: "#4169e1",
                  fontWeight: "bold",
                }}
              >
                ${freeFundsAmount}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? "#C5C5C5" : "#666",
                }}
              >
                in onboarding rewards waiting for you!
              </Typography>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mb-4 text-center max-w-[350px]">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClose}
                className="px-8 py-3 border rounded cursor-pointer"
                style={{
                  background: isDarkMode ? "#2C2C2C" : "#fff",
                  border: "1px solid #ccc",
                  color: isDarkMode ? "#fff" : "#666",
                }}
              >
                <div className="text-sm font-medium">Maybe Later</div>
              </button>

              <button
                onClick={handleClaimRewards}
                disabled={isClaiming}
                className="px-8 py-3 bg-[#4169e1] rounded cursor-pointer"
                style={{
                  opacity: isClaiming ? 0.7 : 1,
                  cursor: isClaiming ? "not-allowed" : "pointer",
                }}
              >
                <div className="text-[#fcfcfc] text-sm font-medium">
                  {isClaiming ? (
                    <span className="flex items-center">
                      <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                      Claiming...
                    </span>
                  ) : (
                    "Claim Now"
                  )}
                </div>
              </button>
            </div>

            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#C5C5C5" : "#999",
                fontSize: "11px",
                mt: 3,
                maxWidth: "300px",
              }}
            >
              These funds can be used for trading on SOUNDBET. Start predicting and win!
            </Typography>
          </div>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default OnboardingRewardsDialog;