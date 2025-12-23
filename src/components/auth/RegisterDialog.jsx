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
import { postData } from "../../services/apiServices";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import logoDark from "../../images/logo-dark-mode.svg";
import logoLight from "../../images/logo-light-mode.svg";
import metamask from "../../images/metamask.svg";
import coinbaseWallet from "../../images/coinbase-wallet.svg";
import walletConnect from "../../images/wallet-connect.svg";
import phantom from "../../images/phantom-wallet.svg";
import google from "../../images/google.svg";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth2";
import {
  useConnect,
  useSignMessage,
  useAccount,
  ConnectorAlreadyConnectedError,
  useChainId,
} from "wagmi";
import { ethers } from "ethers";
import { IoMdClose } from "react-icons/io";
import loginbg from "../../../public/loginbg.png";
import { userLoginDispatch } from "../../store/reducers/movieSlice";

// Custom styled components
const StyledDialog = styled(Dialog)(
  ({ theme, showAuthenticator, darkmode }) => ({
    "& .MuiDialog-paper": {
      width: "100%",
      maxWidth: "400px", // increased from 720px
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

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

const RegisterDialog = ({ open, onClose }) => {
  const themeMode = useSelector((state) => state.theme.value);
  const isDarkMode = themeMode === "dark";
  const chainId = useChainId();
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [showAuthenticator, setShowAuthenticator] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [securityCode, setSecurityCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const otpInputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const darkmode = useSelector((state) => state.theme.darkmode);

  // Wagmi hooks
  const { connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected, connector } = useAccount();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    otpInputRefs.current = otpInputRefs.current.slice(0, 6);
  }, []);
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
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleOtpCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) {
      return;
    }
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .slice(0, 6)
      .replace(/[^\d]/g, "");
    if (pasteData) {
      const newOtpCode = [...otpCode];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newOtpCode[i] = pasteData[i];
        }
      }
      setOtpCode(newOtpCode);
      const nextEmptyIndex = newOtpCode.findIndex((code) => !code);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpInputRefs.current[nextEmptyIndex].focus();
      } else {
        otpInputRefs.current[5].focus();
      }
    }
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

  const handleCreateAccount = async () => {
    setErrorMessage("");
    if (!email) {
      setErrorMessage("All fields are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      const userData = { email };
      const result = await magic.user.getInfo();
      // console.log("result :>> ", result);
      // console.log("email :>> ", email);
      const didToken = await magic.auth.loginWithEmailOTP({ email });
      const response = await fetch(
        "http://localhost:3007/api/user/verifyotp",
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
      // console.log('data response :>> ', data);
      // console.log("data :>> ", data.data.token);
      // console.log('userdata:>> ', data.data.user.data);
      // console.log('userdata:>> ', data.data.user);

      if (data.status) {
        localStorage.setItem("UnomarketToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user.data));

        setRegisteredEmail(email);
        setShowOtpVerification(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    handleCloseSnackbar();
    setErrorMessage("");
    setEmail("");
  };

  const handleSkipAuthenticator = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    window.dispatchEvent(
      new CustomEvent("auth-state-changed", {
        detail: { isLoggedIn: true, user: userData },
      })
    );
    onClose();
    window.location.href = "/";
  };

  const handleSetupAuthenticator = () => {
    setShowAuthenticator(false);
    setShowSecurityCode(true);
  };
  const handleVerifyUsername = async (currentUsername) => {
    setIsLoading(true);
    try {
      const response = await postData("api/user/updateusername", {
        username: currentUsername, // use passed value, not state
      });
      const data = response;
      // console.log("data :>> ", data);

      if (data.status) {
        if (data.token) {
          const token = localStorage.getItem("UnomarketToken");
          setToken(token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(
            new CustomEvent("auth-state-changed", {
              detail: { isLoggedIn: true, user: data.user },
            })
          );
        }
        setShowOtpVerification(false);
        setShowAuthenticator(true);

        try {
          const twoFAResponse = await postData("api/user/Enable-2fa", {});
          // console.log("twoFAResponse :>> ", twoFAResponse);
          if (twoFAResponse.status === true) {
            setQrCode(twoFAResponse.data.qrCode);
            setSecret(twoFAResponse.data.secret);
          }
        } catch (error) {
          console.error("Error fetching 2FA setup:", error);
        }
      } else {
        setOtpError("Invalid OTP code. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setOtpError(error.response.data.message);
      } else {
        setOtpError("Failed to verify OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.trim().length > 2) {
      clearTimeout(window.usernameTimeout);
      window.usernameTimeout = setTimeout(() => {
        handleVerifyUsername(value); // pass value directly
      }, 900);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpVerification(false);
    setShowAuthenticator(false);
    setShowSecurityCode(false);
    setOtpCode(["", "", "", "", "", ""]);
  };

  const handleBackToAuthenticator = () => {
    setShowSecurityCode(false);
    setShowAuthenticator(true);
    setSecurityCode(["", "", "", "", "", ""]);
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
        onClose();
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.twoFA_enabled = true;
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", {
            detail: { isLoggedIn: true, user: userData },
          })
        );
        window.location.href = "/";
      } else {
        setVerificationError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setVerificationError(error.response.data.message);
      } else {
        setVerificationError("Failed to verify code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Magic with OAuth v2 extension
  const magic = new Magic("pk_live_CF7447615565DF26", {
    extensions: [new OAuthExtension()],
  });

  const handleGoogleLogin = async () => {
    try {
      await magic.oauth2.loginWithPopup({
        provider: "google",
        redirectURI: "http://localhost:3007",
        scope: ["profile", "email"],
      });
      const result = await magic.user.getInfo();
      const response = await postData("api/user/googlelogin", {
        email: result.email,
        wallet_address: result.publicAddress,
      });
      if (response.status) {
        onClose();
        localStorage.setItem("UnomarketToken", response?.data.token);
        localStorage.setItem("user", JSON.stringify(response?.data.user));
        window.location.href = "/";
      } else if (response.status === "2fa") {
        setShowSecurityCode(true);
      } else {
        setErrorMessage(response.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
  };
  const handleWalletLogin = async (connectorName) => {
    try {
      setIsLoading(true);

      const targetConnector = connectors.find((c) => c.name === connectorName);
      if (!targetConnector) {
        setErrorMessage(`${connectorName} connector not found.`);
        return;
      }

      let walletAddress;
      let connector;

      try {
        // Try to connect
        const result = await connectAsync({ connector: targetConnector });
        walletAddress = result.accounts[0];
        connector = result.connector;
      } catch (err) {
        if (err instanceof ConnectorAlreadyConnectedError) {
          // Already connected → just use the connector
          connector = targetConnector;
          const provider = new ethers.BrowserProvider(
            await connector.getProvider()
          );
          const signer = await provider.getSigner();
          walletAddress = await signer.getAddress();
        } else {
          throw err;
        }
      }

      if (!walletAddress) {
        setErrorMessage("Failed to connect wallet.");
        return;
      }

      // Wrap provider
      const provider = new ethers.BrowserProvider(
        await connector.getProvider()
      );
      const signer = await provider.getSigner();

      const message = "Login in Soundbet";
      const signature = await signer.signMessage(message);

      // API call
      const response = await postData("api/user/web3connect", {
        address: walletAddress,
        signature,
        message,
      });
      if (response.status) {
        onClose();
        localStorage.setItem("UnomarketToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else if (response.data.status === "2fa") {
        setShowSecurityCode(true);
      } else {
        setErrorMessage(response.message || "Login failed.");
      }
    } catch (error) {
      console.error(`${connectorName} login error:`, error);
      setErrorMessage(`${connectorName} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetamask = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (!window.ethereum) {
        setErrorMessage(
          "MetaMask is not installed. Please install the MetaMask extension."
        );
        return;
      }

      const metamaskConnector = connectors.find((c) => c.id === "metaMask");
      if (!metamaskConnector) {
        setErrorMessage("MetaMask connector not found.");
        return;
      }

      let walletAddress;
      let provider;
      let signer;

      try {
        // 🔹 Check if already connected
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          // ✅ Already connected → use existing account
          walletAddress = accounts[0];
        } else {
          // 🔹 Not connected → connect now
          const result = await connectAsync({ connector: metamaskConnector });
          walletAddress = result?.accounts?.[0];
        }

        // 🔹 Initialize provider and signer (always use window.ethereum)
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      } catch (err) {
        if (err.code === 4001) {
          setErrorMessage("User rejected MetaMask connection.");
          return;
        }
        console.error("[LoginDialog] MetaMask connection error:", err);
        setErrorMessage("Failed to connect to MetaMask. Please try again.");
        return;
      }

      // 🔹 Sign the message for authentication
      const message = `
🚀 Soundbet Login Authorization

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
          setErrorMessage(
            "Signature rejected by user. Please sign the message to proceed."
          );
          return;
        }
        console.error("[LoginDialog] MetaMask signature error:", signError);
        setErrorMessage("Failed to sign message. Please try again.");
        return;
      }

      // 🔹 API call to backend
      const response = await postData("api/user/web3connect", {
        address: walletAddress,
        signature,
        message,
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
          provider: "metamask",
          data: { address: walletAddress, signature, message },
        });
        setShowSecurityCode(true);
      } else {
        setErrorMessage(response.data?.message || "MetaMask login failed.");
      }
    } catch (error) {
      console.error("[LoginDialog] MetaMask login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCoinbase = () => handleWalletLogin("Coinbase Wallet");
  const handleWalletConnect = () => handleWalletLogin("WalletConnect");
  const handlePhantom = () => handleWalletLogin("Phantom");

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
          {errorMessage}
        </Alert>
      </Snackbar>

      <StyledDialog
        open={open}
        onClose={onClose}
        aria-labelledby="register-dialog-title"
        showAuthenticator={showAuthenticator || showOtpVerification}
        darkmode={isDarkMode}>
        <DialogContent
          sx={{
            display: "flex",
            // flexDirection: "column",
            // alignItems: "center",
            padding: 0,
          }}>
          {/* <div> */}
          {/* {!showSecurityCode && !showAuthenticator && (
            <img
              src={isDarkMode ? loginbg : loginbg}
              alt="Soundbet Logo"
              style={{
                width: showOtpVerification ? "50%" : "100%",
                height: showOtpVerification ? "50%" : "100%",
              }}
              className="hidden md:block"
            />
          )} */}
          {/* </div> */}
          <div className="relative d-flex justify-center items-center  er flex-column w-full  h-full  ">
            <IoMdClose
              onClick={onClose}
              className={`absolute top-0 right-0 z-10  ${
                isDarkMode ? "text-white" : "text-black"
              }`}
              style={{ width: "20px", height: "20px" }}
            />
            <Fade
              in={
                !showOtpVerification && !showAuthenticator && !showSecurityCode
              }
              timeout={300}>
              <div
                style={{
                  display:
                    !showOtpVerification &&
                    !showAuthenticator &&
                    !showSecurityCode
                      ? "flex"
                      : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  width: "100%",
                  height: "100%",
                }}>
                <div className="w-auto h-[25px] justify-start text-[color:var(--font-color)] text-2xl font-semibold mb-[18px]">
                  Enter a World of Predictions
                </div>

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
                  />
                </div>

                {errorMessage && (
                  <span className="text-[16px] text-red-500">
                    {errorMessage}
                  </span>
                )}

                <div
                  className="w-full py-3 bg-[#FF4215] rounded-full inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                  onClick={handleCreateAccount}
                  style={{ opacity: isLoading ? 0.7 : 1 }}>
                  <div className="justify-center text-[#fcfcfc] text-sm font-medium flex items-center">
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Send Code"
                    )}
                  </div>
                </div>

                <div className="w-full max-h-full flex justify-between items-center gap-2 mt-2">
                  <button
                    className="w-full h-10  border border-none hover:border-[#FF4215] bg-[#E9E9E9] hover:bg-[#FF4215] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleGoogleLogin}>
                    <img src={google} alt="google" width={30} height={30} />
                  </button>
                  <button
                    className="w-full h-10  border border-none hover:border-[#FF4215] bg-[#E9E9E9] hover:bg-[#FF4215] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleMetamask}>
                    <img src={metamask} alt="metamask" width={30} height={30} />
                  </button>
                  {/* <button
                  className="w-full h-10 bg-[#2C3F4F] hover:bg-[#4169e1] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out"
                  onClick={handleCoinbase}>
                  <img
                    src={coinbaseWallet}
                    alt="coinbaseWallet"
                    width={30}
                    height={30}
                  />
                </button>
                <button
                  className="w-full h-10 bg-[#2C3F4F] hover:bg-[#4169e1] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out"
                  onClick={handleWalletConnect}>
                  <img
                    src={walletConnect}
                    alt="walletConnect"
                    width={30}
                    height={30}
                  />
                </button>
                <button
                  className="w-full h-10 bg-[#2C3F4F] hover:bg-[#4169e1] rounded-[6px] flex justify-center items-center transition-colors duration-300 ease-in-out"
                  onClick={handlePhantom}>
                  <img src={phantom} alt="phantom" width={30} height={30} />
                </button> */}
                </div>
              </div>
            </Fade>

            <Fade in={showOtpVerification} timeout={300}>
              <div
                style={{
                  display: showOtpVerification ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}>
                <div className="w-full flex items-center mb-[18px] relative">
                  <div
                    className="absolute left-0 p-2 cursor-pointer"
                    onClick={handleBackToRegister}>
                    <FiArrowLeft
                      size={24}
                      color={isDarkMode ? "#fff" : "#000"}
                    />
                  </div>
                </div>
                <div className="w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-xl font-semibold mt-[20px]">
                  Enter the username
                </div>
                <div
                  className="w-full h-[50px] mt-3 border-x border border-[color:var(--border-color)] rounded-[9px] flex items-center px-4"
                  style={{ background: isDarkMode ? "#2C2C2C" : "#fff" }}>
                  <input
                    type="text"
                    value={username}
                    onChange={handleChange}
                    placeholder="Enter the Username"
                    className="w-full h-full outline-none text-[color:var(--font-color)] bg-transparent"
                  />
                </div>

                {showOtpVerification && otpError && (
                  <div className="text-red-500 text-sm mb-2">{otpError}</div>
                )}

                {isLoading && (
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <CircularProgress
                      size={16}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Checking availability...
                  </div>
                )}
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
                <div className="w-full flex items-center mb-[18px] relative">
                  <div
                    className="absolute left-0 p-2 cursor-pointer"
                    onClick={handleBackToRegister}>
                    <FiArrowLeft
                      size={24}
                      color={isDarkMode ? "#fff" : "#000"}
                    />
                  </div>
                  <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                    Setup Authenticator
                  </div>
                </div>
                <div className="text-center mb-4 text-[color:var(--font-color)]">
                  For enhanced security, we recommend setting up two-factor
                  authentication
                </div>

                <div className="flex justify-center mb-4">
                  <div
                    className="border border-[color:var(--border-color)] p-2 rounded"
                    style={{ background: isDarkMode ? "#2C2C2C" : "#fff" }}>
                    {qrCode ? (
                      <img
                        src={qrCode}
                        alt="2FA Setup QR Code"
                        className="w-[200px] h-[200px]"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
                        <CircularProgress size={40} />
                      </div>
                    )}
                  </div>
                </div>

                {secret && (
                  <div className="text-center mb-4 text-[color:var(--font-color)] text-sm">
                    <p>
                      Or enter this code manually: <strong>{secret}</strong>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <div
                    className="px-8 py-3 border rounded inline-flex justify-center items-center gap-[9px] cursor-pointer"
                    onClick={handleSkipAuthenticator}
                    style={{
                      background: isDarkMode ? "#2C2C2C" : "#fff",
                      border: "1px solid #4169e1",
                      color: "#4169e1",
                    }}>
                    <div className="justify-center text-sm font-medium">
                      Skip for Now
                    </div>
                  </div>

                  <div
                    className="px-8 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] cursor-pointer"
                    onClick={handleSetupAuthenticator}>
                    <div className="justify-center text-[#fcfcfc] text-sm font-medium">
                      Continue
                    </div>
                  </div>
                </div>
              </div>
            </Fade>

            <Fade in={showSecurityCode} timeout={300}>
              <div
                style={{
                  display: showSecurityCode ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}>
                <div className="w-full flex items-center mb-[18px] relative">
                  <div
                    className="absolute left-0 p-2 cursor-pointer"
                    onClick={handleBackToAuthenticator}>
                    <FiArrowLeft
                      size={24}
                      color={isDarkMode ? "#fff" : "#000"}
                    />
                  </div>
                  <div className="w-full text-center text-[color:var(--font-color)] text-2xl font-semibold">
                    Verification Code
                  </div>
                </div>
                <div className="w-[353px] h-[46px] text-center justify-start mb-[16px] text-[color:var(--font-color)] text-xl font-semibold">
                  Enter code from Authenticator App
                </div>

                <div className="inline-flex justify-start items-center gap-4 mb-[24px]">
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
                      className="w-[54px] h-[54px] border border-[color:var(--border-color)] rounded-[9px] text-center text-2xl bg-transparent text-[color:var(--font-color)] outline-none focus:border-[#4169e1] focus:border-2"
                    />
                  ))}
                </div>

                {showSecurityCode && verificationError && (
                  <div className="text-red-500 text-sm mb-2">
                    {verificationError}
                  </div>
                )}

                <div
                  className="px-12 py-3 bg-[#4169e1] rounded inline-flex justify-center items-center gap-[9px] cursor-pointer"
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
                      "Verify & Complete"
                    )}
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

export default RegisterDialog;
