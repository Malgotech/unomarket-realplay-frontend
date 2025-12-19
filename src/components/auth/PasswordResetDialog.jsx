import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Fade,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { postData } from "../../services/apiServices";
import { useSelector } from "react-redux";

// Slide transition for Snackbar
const SlideTransition = (props) => {
  return <Slide {...props} direction="down" />;
};

// Custom styled components
const StyledDialog = styled(Dialog)(({ theme, darkmode }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: "520px",
    height: "auto",
    maxHeight: "90vh",
    borderRadius: "18px",
    background: darkmode ? "#1E1E1E" : "#FDFDFD",
    color: darkmode ? "#FFFFFF" : "#2b2d2e",
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      width: "520px",
      height: "auto",
      maxHeight: "90vh",
      margin: 0,
      padding: theme.spacing(3),
    },
    transition: theme.transitions.create(["height"], {
      duration: theme.transitions.duration.standard,
    }),
    // override browser autofill background
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
      WebkitBoxShadow: `0 0 0px 1000px ${darkmode ? '#2C2C2C' : '#fff'} inset`,
      WebkitTextFillColor: darkmode ? '#fff' : '#000',
    },
  },
}));

const PasswordResetDialog = ({ open, onClose }) => {
  const themeMode = useSelector((state) => state.theme.value);
  const isDarkMode = themeMode === 'dark';
  
  // Reset flow states
  const [resetStep, setResetStep] = useState("email"); // "email", "otp", "password"
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Refs for OTP inputs
  const resetOtpRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    resetOtpRefs.current = resetOtpRefs.current.slice(0, 6);
  }, []);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setResetStep("email");
      setResetEmail("");
      setResetOtp(["", "", "", "", "", ""]);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [open]);

  // Error handling
  useEffect(() => {
    if (errorMessage) {
      setSnackbarOpen(true);
    }
  }, [errorMessage]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handler functions
  const handleRequestPasswordReset = async () => {
    if (!resetEmail) {
      setErrorMessage("Email is required");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await postData("forgot-password", {
        email: resetEmail,
      });

      if (response.success) {
        setResetStep("otp");
      } else {
        setErrorMessage(response.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newResetOtp = [...resetOtp];
    newResetOtp[index] = value;
    setResetOtp(newResetOtp);

    // Auto-focus next input when a digit is entered
    if (value && index < 5) {
      resetOtpRefs.current[index + 1].focus();
    }
  };

  const handleResetOtpKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !resetOtp[index] && index > 0) {
      resetOtpRefs.current[index - 1].focus();
    }
  };

  const handleResetOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .slice(0, 6)
      .replace(/[^\d]/g, "");

    if (pasteData) {
      const newResetOtp = [...resetOtp];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newResetOtp[i] = pasteData[i];
        }
      }
      setResetOtp(newResetOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newResetOtp.findIndex((code) => !code);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        resetOtpRefs.current[nextEmptyIndex].focus();
      } else {
        resetOtpRefs.current[5].focus();
      }
    }
  };

  const handleVerifyResetOtp = async () => {
    const code = resetOtp.join("");

    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await postData("verify-password-reset-otp", {
        email: resetEmail,
        otp: code,
      });

      if (response.success && response.resetToken) {
        setResetToken(response.resetToken);
        setResetStep("password");
      } else {
        setErrorMessage(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await postData("reset-password", {
        email: resetEmail,
        newPassword: newPassword,
        resetToken: resetToken,
      });

      if (response.success) {
        // Reset successful, close dialog
        onClose();
        // You might want to show a success message in the parent component
      } else {
        setErrorMessage(response.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Snackbar for showing error messages in top center */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        sx={{ mt: 2 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            animation: "pulse 1s",
            "@keyframes pulse": {
              "0%": {
                transform: "scale(0.95)",
                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0.7)",
              },
              "70%": {
                transform: "scale(1)",
                boxShadow: "0 0 0 10px rgba(255, 82, 82, 0)",
              },
              "100%": {
                transform: "scale(0.95)",
                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0)",
              },
            },
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <StyledDialog
        open={open}
        onClose={onClose}
        aria-labelledby="password-reset-dialog-title"
        darkmode={isDarkMode}
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 0,
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

          {/* Password Reset - Email Input Screen */}
          <Fade in={resetStep === "email"} timeout={300}>
            <div
              style={{
                display: resetStep === "email" ? "flex" : "none",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div className="w-full flex items-center mb-[18px] relative">
                <div className="absolute left-0 p-2 cursor-pointer" onClick={onClose}>
                  <FiArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                </div>
                <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                  Reset Password
                </div>
              </div>

              <div className="w-full max-w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-base px-4">
                Enter your email address and we'll send you a 6-digit verification code
              </div>

              <div className="w-full max-w-[450px] h-[60px] border border-[color:var(--border-color)] mb-[24px] rounded-[9px] flex items-center px-4" style={{ background: isDarkMode ? '#2C2C2C' : '#fff' }}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-full outline-none text-[color:var(--font-color)] bg-transparent"
                />
              </div>

              <div
                className="px-12 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                onClick={handleRequestPasswordReset}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </div>
              </div>
            </div>
          </Fade>

          {/* Password Reset - OTP Verification Screen */}
          <Fade in={resetStep === "otp"} timeout={300}>
            <div
              style={{
                display: resetStep === "otp" ? "flex" : "none",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div className="w-full flex items-center mb-[18px] relative">
                <div className="absolute left-0 p-2 cursor-pointer" onClick={() => setResetStep("email")}>
                  <FiArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                </div>
                <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                  Verification Code
                </div>
              </div>

              <div className="w-full max-w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-base px-4">
                Enter the 6-digit code sent to {resetEmail}
              </div>

              <div className="w-full flex justify-center items-center mb-[24px] px-4 overflow-hidden">
                <div className="flex justify-center items-center gap-1 sm:gap-3 max-w-full">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (resetOtpRefs.current[index] = el)}
                      type="text"
                      value={resetOtp[index]}
                      onChange={(e) => handleResetOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleResetOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleResetOtpPaste : undefined}
                      maxLength={1}
                      className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] border border-[color:var(--border-color)] rounded-[9px] text-center text-base sm:text-xl outline-none focus:border-[#4169e1] focus:border-2 bg-transparent text-[color:var(--font-color)] flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              <div
                className="px-12 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                onClick={handleVerifyResetOtp}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                  {isLoading ? "Verifying..." : "Verify Code"}
                </div>
              </div>
            </div>
          </Fade>

          {/* Password Reset - New Password Screen */}
          <Fade in={resetStep === "password"} timeout={300}>
            <div
              style={{
                display: resetStep === "password" ? "flex" : "none",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div className="w-full flex items-center mb-[18px] relative">
                <div className="absolute left-0 p-2 cursor-pointer" onClick={() => setResetStep("otp")}>
                  <FiArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                </div>
                <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                  Set New Password
                </div>
              </div>

              <div className="w-full max-w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-base px-4">
                Create a new password for your account
              </div>

              <div className="w-full max-w-[450px] h-[60px] border border-[color:var(--border-color)] mb-[16px] rounded-[9px] flex items-center px-4" style={{ background: isDarkMode ? '#2C2C2C' : '#fff' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full h-full outline-none text-[color:var(--font-color)] bg-transparent"
                />
                <div onClick={() => setShowNewPassword(!showNewPassword)} className="cursor-pointer">
                  {showNewPassword ? <FiEyeOff size={20} color={isDarkMode ? '#fff' : '#000'} /> : <FiEye size={20} color={isDarkMode ? '#fff' : '#000'} />}
                </div>
              </div>

              <div className="w-full max-w-[450px] h-[60px] border border-[color:var(--border-color)] mb-[24px] rounded-[9px] flex items-center px-4" style={{ background: isDarkMode ? '#2C2C2C' : '#fff' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full h-full outline-none text-[color:var(--font-color)] bg-transparent"
                />
                <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer">
                  {showConfirmPassword ? <FiEyeOff size={20} color={isDarkMode ? '#fff' : '#000'} /> : <FiEye size={20} color={isDarkMode ? '#fff' : '#000'} />}
                </div>
              </div>

              <div
                className="px-12 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                onClick={handleResetPassword}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </div>
              </div>
            </div>
          </Fade>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default PasswordResetDialog;
