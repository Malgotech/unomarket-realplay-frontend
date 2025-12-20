import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Fade,
  Alert,
  Snackbar,
  Slide,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";

import loginbg from "../../../public/loginbg.png";
import metamask from "../../images/metamask.svg";
import walletConnect from "../../images/wallet-connect.svg";
import phantom from "../../images/phantom-wallet.svg";
import google from "../../images/google.svg";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import {
  useConnect,
  useSignMessage,
  useAccount,
  useChainId,
  ConnectorAlreadyConnectedError,
} from "wagmi";
import { ethers } from "ethers";
import { postData } from "../../services/apiServices";
import { IoMdClose } from "react-icons/io";
import { userLoginDispatch } from "../../store/reducers/movieSlice";
import Toast from "../Toast";

import logoDark from "../../images/unologo.svg";
import logoLight from "../../images/unologo-dark.svg";

// import { IoClose } from "react-icons/io5";

// Custom styled components
const StyledDialog = styled(Dialog)(
  ({ theme, showAuthenticator, darkmode }) => ({
    "& .MuiDialog-paper": {
      width: "100%",
      maxWidth: "340px", // increased from 720px
      height: showAuthenticator ? "auto" : "auto",
      maxHeight: "auto",
      borderRadius: "18px",
      background: darkmode ? "#1E1E1E" : "#FDFDFD",
      color: darkmode ? "#FFFFFF" : "#2b2d2e",
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        width: "800px", // increased from 520px
        height: showAuthenticator ? "auto" : "400px",
        maxHeight: "90vh",
        margin: 0,
        padding: "12px",
      },
      transition: theme.transitions.create(["height"], {
        duration: theme.transitions.duration.standard,
      }),
      "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus":
        {
          WebkitBoxShadow: `0 0 0px 1000px ${
            darkmode ? "#2C2C2C" : "#fff"
          } inset`,
          WebkitTextFillColor: darkmode ? "#fff" : "#000",
        },
    },
  })
);

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "&.Mui-focused fieldset": {
      borderColor: "#6366F1",
    },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "10px 16px",
  textTransform: "none",
  fontSize: "16px",
  fontWeight: 600,
  backgroundColor: "#6366F1",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#4F46E5",
  },
  width: "100%",
}));

// Slide transition for the Snackbar
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const LoginDialog = ({ open, onClose, onLoginSuccess }) => {
  const themeMode = useSelector((state) => state.theme.value);
  const dispatch = useDispatch();
  const isDarkMode = themeMode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [securityCode, setSecurityCode] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const inputRefs = useRef([]);
  const [showAuthenticator, setShowAuthenticator] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Wagmi hooks
  const {
    connectAsync,
    connect,
    connectors,
    error: connectError,
  } = useConnect();
  const { signMessageAsync, error: signError } = useSignMessage();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  useEffect(() => {
    if (connectError) {
      console.error("[LoginDialog] Connect error:", connectError);
      setErrorMessage(connectError.message || "Failed to connect wallet");
      setSnackbarOpen(true);
    }
    if (signError) {
      console.error("[LoginDialog] Sign error:", signError);
      setErrorMessage(signError.message || "Failed to sign message");
      setSnackbarOpen(true);
    }
  }, [connectors, address, isConnected, chainId, connectError, signError]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    if (errorMessage || verificationError) {
      setSnackbarOpen(true);
    }
  }, [errorMessage, verificationError]);

  // Handle closing the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSecurityCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) {
      return;
    }
    const newSecurityCode = [...securityCode];
    newSecurityCode[index] = value;
    setSecurityCode(newSecurityCode);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !securityCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .slice(0, 6)
      .replace(/[^\d]/g, "");
    if (pasteData) {
      const newSecurityCode = [...securityCode];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newSecurityCode[i] = pasteData[i];
        }
      }
      setSecurityCode(newSecurityCode);
      const nextEmptyIndex = newSecurityCode.findIndex((code) => !code);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  // Initialize Magic with OAuth v2 extension
  const magic = new Magic("pk_live_CF7447615565DF26", {
    extensions: [new OAuthExtension()],
  });
  const magicWallet = new Magic("pk_live_CF7447615565DF26", {
    network: "mainnet",
  });

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email) {
      setErrorMessage("Email is required");
      return;
    }
    setIsLoading(true);
    try {
      const didToken = await magic.auth.loginWithEmailOTP({ email });
      const response = await fetch(
        "https://api.uno.market/api/user/verifyotp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + didToken,
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (data.status) {
        localStorage.setItem("UnomarketToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        dispatch(userLoginDispatch());
        setEmail("");
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", {
            detail: { isLoggedIn: true, user: data.data.user },
          })
        );
        if (data.data.user && data.data.user.twoFA_enabled) {
          setToken(data.data.token);
          setShowSecurityCode(true);
        } else {
          try {
            const twoFAResponse = await postData("api/user/Enable-2fa", {});
            if (twoFAResponse.status) {
              setQrCode(twoFAResponse.data.qrCode);
              setSecret(twoFAResponse.data.secret);
              setShowAuthenticator(true);
            }
          } catch (error) {
            console.error("[LoginDialog] Error fetching 2FA setup:", error);
            if (onLoginSuccess) onLoginSuccess();
            onClose();
          }
        }
      } else {
        setErrorMessage(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("[LoginDialog] Login error:", error);
      setErrorMessage(
        error.response?.data?.message || "An error occurred during login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    handleCloseSnackbar();
    setErrorMessage("");
    setEmail("");
  };

  const handleBackToLogin = () => {
    setShowSecurityCode(false);
    setShowAuthenticator(false);
    setSecurityCode(["", "", "", "", "", ""]);
    setErrorMessage("");
    setVerificationError("");
  };

  const handleVerifyCode = async () => {
    setVerificationError("");
    const code = securityCode.join("");
    if (code.length !== 6) {
      setVerificationError("Please enter all 6 digits");
      return;
    }
    setIsLoading(true);
    try {
      const response = await postData("api/user/verify-2fa", { token: code });
      if (response.status) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.twoFA_enabled = true;
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", {
            detail: { isLoggedIn: true, user: userData },
          })
        );
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        setVerificationError(
          response.data.message || "Invalid verification code."
        );
      }
    } catch (error) {
      console.error("[LoginDialog] 2FA verification error:", error);
      setVerificationError(
        error.response?.data?.message || "Failed to verify code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAuthenticator = () => {
    setShowSecurityCode(true);
    setShowAuthenticator(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await magic.oauth2.loginWithPopup({
        provider: "google",
        redirectURI: window.location.origin,
        scope: ["profile", "email"],
      });
      const result = await magic.user.getInfo();

      // 🔹 Call backend
      const response = await postData("api/user/googlelogin", {
        email: result.email,
        wallet_address: result.publicAddress,
      });

      if (response.status) {
        // ✅ Login success
        localStorage.setItem("UnomarketToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        dispatch(userLoginDispatch());
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", {
            detail: { isLoggedIn: true, user: response.data.user },
          })
        );

        // 🔹 If user has 2FA enabled → show code input
        if (response.data.user?.twoFA_enabled) {
          setToken(response.data.token);
          setShowSecurityCode(true);
        } else {
          try {
            const twoFAResponse = await postData("api/user/Enable-2fa", {});
            if (twoFAResponse.status) {
              setQrCode(twoFAResponse.data.qrCode);
              setSecret(twoFAResponse.data.secret);
              setShowAuthenticator(true);
            }
          } catch (error) {
            console.error("[LoginDialog] Error fetching 2FA setup:", error);
            if (onLoginSuccess) onLoginSuccess();
            onClose();
          }
        }
      } else if (
        response.message === "2FA token required" ||
        response.data?.message === "2FA token required"
      ) {
        // 🟡 Ask for 2FA code
        setToken({ provider: "google", data: result });
        setShowSecurityCode(true);
      } else {
        setErrorMessage(response.data?.message || "Google login failed.");
      }
    } catch (error) {
      console.error("[LoginDialog] Google login error:", error);
      setErrorMessage("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleMetamask = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      let walletAddress;
      let provider;
      let signer;

      // Use WalletConnect for all cases (like Polymarket)
      if (isMobile || !window.ethereum) {
        // Mobile or no MetaMask - use WalletConnect
        await handleWalletConnectLogin();
        return; // Return early as handleWalletConnectLogin handles everything
      } else {
        // Desktop with MetaMask - use direct connection but with better error handling
        await handleInjectedWalletLogin();
      }
    } catch (error) {
      console.error("[LoginDialog] Wallet login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // WalletConnect-based login (works on both mobile and desktop)
  const handleWalletConnectLogin = async () => {
    try {
      // Close the modal first to avoid overlay issues with WalletConnect modal
      onClose();

      // Small delay to ensure modal is closed
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Initialize WalletConnect
      const walletConnectProvider = await EthereumProvider.init({
        projectId: "1358def94e5cb22680b65fde5bf76b87", // Get from https://cloud.walletconnect.com/
        chains: [1], // Mainnet
        optionalChains: [137, 56, 42161], // Polygon, BSC, Arbitrum
        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
        events: ["chainChanged", "accountsChanged"],
        showQrModal: true,
        qrModalOptions: {
          themeMode: "light",
          themeVariables: {
            "--wcm-z-index": "99999", // Ensure it appears above everything
          },
        },
      });

      // Enable session (triggers QR modal on desktop, deep link on mobile)
      await walletConnectProvider.enable();

      // Get the connected accounts
      const accounts = await walletConnectProvider.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const walletAddress = accounts[0];

      // Create ethers provider and signer from WalletConnect
      const provider = new ethers.BrowserProvider(walletConnectProvider);
      const signer = await provider.getSigner();

      // Store the provider for future transactions
      localStorage.setItem(
        "activeWallet",
        JSON.stringify({
          type: "walletConnect",
          address: walletAddress,
          timestamp: Date.now(),
        })
      );

      // Proceed with signature and login
      await proceedWithSignatureAndLogin(
        walletAddress,
        signer,
        "walletConnect"
      );
    } catch (error) {
      setErrorMessage(err);
      if (error?.message?.includes("User rejected") || error?.code === 4001) {
        setErrorMessage("Connection was cancelled.");
      } else {
        console.error("[LoginDialog] WalletConnect error:", error);
        setErrorMessage("Failed to connect wallet. Please try again.");
      }
      // Re-open the modal if there was an error
      // You might want to add logic here to re-open your modal
    }
  };

  // Direct injected wallet login (MetaMask on desktop)
  const handleInjectedWalletLogin = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed.");
      return;
    }
    const metamaskConnector = connectors.find((c) => c.id === "io.metamask");
    if (!metamaskConnector) {
      setErrorMessage("MetaMask connector not found.");
      return;
    }

    let walletAddress;
    let provider;
    let signer;

    try {
      // Check if already connected
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts && accounts.length > 0) {
        walletAddress = accounts[0];
      } else {
        // Request connection
        const result = await connectAsync({ connector: metamaskConnector });
        walletAddress = result?.accounts?.[0];
      }

      // Initialize provider and signer
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();

      // Store for future transactions
      localStorage.setItem(
        "activeWallet",
        JSON.stringify({
          type: "injected",
          address: walletAddress,
          timestamp: Date.now(),
        })
      );

      // Proceed with signature and login
      await proceedWithSignatureAndLogin(walletAddress, signer, "injected");
    } catch (err) {
      if (err.code === 4001) {
        setErrorMessage("User rejected connection.");
      } else if (err.message?.includes("already connected")) {
        // Handle already connected case
        await handleAlreadyConnected();
      } else {
        console.error("[LoginDialog] MetaMask connection error:", err);
        setErrorMessage("Failed to connect to MetaMask. Please try again.");
      }
    }
  };

  // Common function for signature and login (used by both methods)
  const proceedWithSignatureAndLogin = async (
    walletAddress,
    signer,
    walletType
  ) => {
    // Sign the message for authentication
    const message = `
🚀 UnoMarket Login Authorization

You're about to enter the world of predictions.

By signing, you confirm:
✅ You own this wallet
✅ You agree to Soundbet's Terms of Use
✅ You understand this is a secure, gas-free login

Signature Request ID: ${Math.floor(Math.random() * 1_000_000)}
Timestamp: ${new Date().toISOString()}
`;

    let signature;
    try {
      signature = await signer.signMessage(message);
    } catch (signError) {
      if (signError.code === 4001) {
        setErrorMessage("Signature rejected. Please sign to login.");
        return;
      }
      console.error("[LoginDialog] Signature error:", signError);
      setErrorMessage("Failed to sign message. Please try again.");
      return;
    }

    // API call to backend
    const response = await postData("api/user/web3connect", {
      address: walletAddress,
      signature,
      message,
      walletType, // Send wallet type to backend if needed
    });

    if (response.status) {
      localStorage.setItem("UnomarketToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      dispatch(userLoginDispatch());
      window.dispatchEvent(
        new CustomEvent("auth-state-changed", {
          detail: { isLoggedIn: true, user: response.data.user },
        })
      );

      if (response.data.user?.twoFA_enabled) {
        setToken(response.data.token);
        setShowSecurityCode(true);
      } else {
        try {
          const twoFAResponse = await postData("api/user/Enable-2fa", {});
          if (twoFAResponse.status) {
            setQrCode(twoFAResponse.data.qrCode);
            setSecret(twoFAResponse.data.secret);
            setShowAuthenticator(true);
          }
        } catch (error) {
          console.error("[LoginDialog] Error fetching 2FA setup:", error);
          if (onLoginSuccess) onLoginSuccess();
          onClose();
        }
      }
    } else if (
      response.message === "2FA token required" ||
      response.data?.message === "2FA token required"
    ) {
      setToken({
        provider: walletType,
        data: { address: walletAddress, signature, message },
      });
      setShowSecurityCode(true);
    } else {
      setErrorMessage(response.data?.message || "Wallet login failed.");
    }
  };

  // Handle already connected wallets
  const handleAlreadyConnected = async () => {
    try {
      // Try to get accounts directly
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts && accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        await proceedWithSignatureAndLogin(accounts[0], signer, "injected");
      } else {
        setErrorMessage("Connection issue detected. Please try reconnecting.");
      }
    } catch (error) {
      console.error("Error handling already connected wallet:", error);
      setErrorMessage("Please refresh the page and try again.");
    }
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseModal}
        TransitionComponent={SlideTransition}
        sx={{ mt: 2 }}>
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
          }}>
          {errorMessage || verificationError}
        </Alert>
      </Snackbar>

      <StyledDialog
        open={open}
        onClose={onClose}
        aria-labelledby="login-dialog-title"
        showAuthenticator={showAuthenticator}
        darkmode={isDarkMode}>
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}>
          {/* <div> */}
          {/* {!showSecurityCode && !showAuthenticator && (
            <img
              src={isDarkMode ? logoDark : logoLight}
              alt="Soundbet Logo"
              style={{ width: "100%", height: "100%" }}
              className="hidden md:block"
            />
          )} */}
          {/* </div> */}
          <div className="d-flex relative justify-evenly align-center flex-column w-full    h-auto">
            <img
              src={isDarkMode ? logoLight : logoDark}
              alt="Soundbet Logo"
              style={{ width: "120px" }}
            />
            <IoMdClose
              onClick={onClose}
              className={`absolute top-0 right-0 z-10  ${
                isDarkMode ? "text-white" : "text-black"
              }`}
              style={{ width: "20px", height: "20px" }}
            />

            <Fade in={!showSecurityCode && !showAuthenticator} timeout={300}>
              <div
                style={{
                  display:
                    !showSecurityCode && !showAuthenticator ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  gap: "20px",
                  marginTop: "20px",
                }}>
                <div className="h-[25px] justify-start text-[color:var(--font-color)] text-2xl font-semibold mb-[18px]">
                  Glad you're back!
                </div>

                <div className="w-full h-auto flex flex-col items-center justify-center gap-2">
                  <div
                    className="w-full h-[54px] border-x border border-[#AEAEAE] rounded-[12px] flex items-center px-4"
                    style={{ background: isDarkMode ? "#2C2C2C" : "#fff" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Email Address"
                      className="w-full h-full outline-none text-[color:var(--font-color)] bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          handleLogin();
                        }
                      }}
                    />
                  </div>

                  {errorMessage && (
                    <span className="text-[16px] text-red-500">
                      {errorMessage}
                    </span>
                  )}
                </div>

                <div
                  className="w-full py-3 bg-[#FF4215] rounded-full inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                  onClick={handleLogin}
                  style={{ opacity: isLoading ? 0.7 : 1 }}>
                  <div className="justify-center text-[#fcfcfc] text-sm font-medium flex items-center">
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Login"
                    )}
                  </div>
                </div>

                <div className="w-full max-h-full flex justify-between items-center gap-2  ">
                  <button
                    className="w-full h-10  border border-none hover:border-[#FF4215] bg-[#E9E9E9] hover:bg-[#FF4215] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}>
                    <img src={google} alt="google" width={30} height={30} />
                  </button>
                  <button
                    className="w-full h-10   border border-none hover:border-[#FF4215] bg-[#E9E9E9] hover:bg-[#FF4215]  rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleMetamask}
                    disabled={isLoading}>
                    <img src={metamask} alt="metamask" width={30} height={30} />
                  </button>

                  {/* <button
                  className="w-full h-10 bg-[#2C3F4F] hover:bg-[#4169e1] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                  onClick={handleWalletConnect}
                  disabled={isLoading}>
                  <img
                    src={walletConnect}
                    alt="walletConnect"
                    width={30}
                    height={30}
                  />
                </button>
                <button
                  className="w-full h-10 bg-[#2C3F4F] hover:bg-[#4169e1] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                  onClick={handlePhantom}
                  disabled={isLoading}>
                  <img src={phantom} alt="phantom" width={30} height={30} />
                </button> */}
                </div>
              </div>
            </Fade>

            <Fade in={showSecurityCode && !showAuthenticator} timeout={300}>
              <div
                style={{
                  display:
                    showSecurityCode && !showAuthenticator ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}>
                <div className="w-full flex items-center mb-[18px] relative">
                  <div
                    className="absolute left-0 p-2 cursor-pointer"
                    onClick={handleBackToLogin}>
                    <FiArrowLeft
                      size={24}
                      color={isDarkMode ? "#fff" : "#000"}
                    />
                  </div>
                  <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                    Verification Code
                  </div>
                </div>

                <div className="w-full max-w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-xl font-semibold px-4">
                  Enter code from your Authenticator App
                </div>

                <div className="w-full flex justify-center items-center mb-[24px] px-4 overflow-hidden">
                  <div className="flex justify-center items-center gap-1 sm:gap-3 max-w-full">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={securityCode[index]}
                        onChange={(e) =>
                          handleSecurityCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        maxLength={1}
                        className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] border border-[color:var(--border-color)] rounded-[9px] text-center text-base sm:text-xl outline-none focus:border-[#4169e1] focus:border-2 bg-transparent text-[color:var(--font-color)] flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>

                {verificationError && (
                  <div className="text-red-500 text-sm mb-2">
                    {verificationError}
                  </div>
                )}

                <div
                  className="px-12 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                  onClick={handleVerifyCode}
                  style={{ opacity: isLoading ? 0.7 : 1 }}>
                  <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                    {isLoading ? (
                      <span className="flex items-center">
                        <CircularProgress
                          size={16}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                        Verifying...
                      </span>
                    ) : (
                      "Verify"
                    )}
                  </div>
                </div>
              </div>
            </Fade>

            <Fade in={showAuthenticator} timeout={300}>
              <div
                style={{
                  display: showAuthenticator ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}>
                <div className="w-full flex items-center mb-[10px] relative mt-4">
                  <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                    Setup Authenticator
                  </div>
                </div>

                <div className="text-center text-[14px] mb-4 text-[color:var(--font-color)] px-4">
                  For enhanced security, we recommend setting up two-factor
                  authentication
                </div>

                <div className="flex justify-center mb-4 px-4">
                  <div
                    className="border border-[color:var(--border-color)] p-2 rounded"
                    style={{ background: isDarkMode ? "#2C2C2C" : "#fff" }}>
                    {qrCode ? (
                      <img
                        src={qrCode}
                        alt="2FA Setup QR Code"
                        className="w-[120px] h-[120px] sm:w-[120px] sm:h-[120px]"
                      />
                    ) : (
                      <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] bg-gray-100 flex items-center justify-center">
                        <CircularProgress size={40} />
                      </div>
                    )}
                  </div>
                </div>

                {secret && (
                  <div className="text-center mb-4 text-[color:var(--font-color)] text-sm px-4 max-w-full">
                    <p className="mb-1">Or enter this code manually:</p>
                    <div
                      className="p-2 rounded text-xs font-mono break-all select-all cursor-pointer max-w-full overflow-hidden"
                      style={{
                        background: isDarkMode ? "#374151" : "#f3f4f6",
                        color: isDarkMode ? "#e5e7eb" : "#374151",
                      }}>
                      {secret}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 px-4 w-full sm:w-auto">
                  <div
                    className="px-8 py-3 bg-[#FF4215] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                    onClick={handleSetupAuthenticator}>
                    <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                      Continue
                    </div>
                  </div>

                  <div
                    className="px-8 py-3 bg-[#FF4215] rounded inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (onLoginSuccess) onLoginSuccess();
                      onClose();
                    }}>
                    <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                      Skip for Now
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default LoginDialog;
