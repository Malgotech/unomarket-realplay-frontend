import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Navbar removed - now handled globally in App.jsx
import { fetchData, postData, putData } from "../services/apiServices";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Wrapper to override autofill background colors for inputs/textareas
const AutofillWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "darkmode",
})(({ darkmode }) => ({
  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus":
    {
      WebkitBoxShadow: `0 0 0px 1000px ${darkmode ? "#2C2C2C" : "#fff"} inset`,
      WebkitTextFillColor: darkmode ? "#fff" : "#000",
    },
  "& textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus":
    {
      WebkitBoxShadow: `0 0 0px 1000px ${darkmode ? "#2C2C2C" : "#fff"} inset`,
      WebkitTextFillColor: darkmode ? "#fff" : "#000",
    },
}));

// API function to fetch user profile
const fetchUserProfile = async () => {
  try {
    return await fetchData("api/event/user");
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return { success: false, message: error.message };
  }
};

const EditProfile = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    bio: "",
    profile_image: "",
    joinDate: "",
  });

  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState({
    unit: "px",
    width: 300,
    height: 300,
    x: 50,
    y: 50,
    aspect: 1, // Locked square aspect ratio
  });
  const [completedCrop, setCompletedCrop] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchUserProfile();
        if (response.success) {
          const { user } = response;
          setUserData({
            username: user.username || "",
            name: user.name || "",
            bio: user.bio || "",
            profile_image: user.profileImage || "",
            joinDate: user.joinDate || "Unknown",
          });
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
  }, []);

  const getCroppedImg = useCallback((image, crop) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    // Force square dimensions - use the smaller dimension to ensure perfect square
    const squareSize = Math.min(crop.width * scaleX, crop.height * scaleY);

    canvas.width = squareSize * pixelRatio;
    canvas.height = squareSize * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    // Draw the image as a perfect square
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      squareSize,
      squareSize,
      0,
      0,
      squareSize,
      squareSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  }, []);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    // Validate that the crop is actually square
    const cropWidth = Math.round(completedCrop.width);
    const cropHeight = Math.round(completedCrop.height);

    if (Math.abs(cropWidth - cropHeight) > 1) {
      alert("Please ensure the crop area is perfectly square.");
      return;
    }

    setUploadLoading(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );

      // Additional validation: check if the blob represents a square image
      const img = new Image();
      const objectUrl = URL.createObjectURL(croppedImageBlob);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width !== img.height) {
          alert("Error: The cropped image is not square. Please try again.");
          setUploadLoading(false);
          return;
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append("file", croppedImageBlob, "profile-image.jpg");
        formData.append("path", "soundbet/images");

        try {
          // Use postData to call the API with FormData
          const response = await postData("api/admin/upload", formData, true);
          if (response.status && response.data) {
            setUserData((prev) => ({
              ...prev,
              profile_image: response.data,
            }));
            setShowCropModal(false);
            setImgSrc("");
          } else {
            alert("Failed to upload image. Please try again.");
          }
        } catch (error) {
          console.error("Error uploading cropped image:", error);
          alert("Failed to upload image. Please try again.");
        } finally {
          setUploadLoading(false);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        alert("Error processing the cropped image. Please try again.");
        setUploadLoading(false);
      };

      img.src = objectUrl;
    } catch (error) {
      console.error("Error creating cropped image:", error);
      alert("Failed to process image. Please try again.");
      setUploadLoading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImgSrc("");
    setCrop({
      unit: "px",
      width: 300,
      height: 300,
      x: 50,
      y: 50,
      aspect: 1,
    });
    setCompletedCrop(null);
  };

  const handleSaveChanges = async () => {
    try {
      // Only send the needed fields to the API
      const updateData = {
        name: userData.name,
        bio: userData.bio,
        profile_image: userData.profile_image,
      };

      const response = await putData("api/user/updateUser", updateData);
      if (response.success) {
        // Update local storage with new user data
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...updateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        navigate("/dashboard");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile.");
    }
  };

  if (isLoading) {
    return (
      <div
        className={`toughts-page w-full min-h-screen ${
          isDarkMode ? "bg-[#121212]" : "bg-gray-50"
        }`}
      >
        <main className="container w-full mx-0 px-4 pt-34 pb-16 sm:pt-40 md:pt-36 max-w-[1350px]">
          <div className="flex flex-col gap-8 mx-4">
            <div className="w-full max-w-[902px] animate-pulse">
              {/* Profile Header Skeleton */}
              <div className="flex items-center mb-8">
                <div
                  className={`w-[108px] h-[108px] rounded-full ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                  }`}
                ></div>
                <div className="ml-[16px] flex flex-col gap-[18px]">
                  <div
                    className={`h-[37px] w-48 rounded-md ${
                      isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-[19px] w-32 rounded-md ${
                      isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Upload button skeleton */}
              <div
                className={`h-[38px] w-48 rounded mb-8 ${
                  isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                }`}
              ></div>

              {/* Name field skeleton */}
              <div className="mb-6">
                <div
                  className={`h-4 w-16 rounded-md mb-2 ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-full h-16 rounded-xl ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                  }`}
                ></div>
              </div>

              {/* Bio field skeleton */}
              <div>
                <div
                  className={`h-4 w-12 rounded-md mb-2 ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-full h-52 rounded-xl ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                  }`}
                ></div>
              </div>

              {/* Save button skeleton */}
              <div
                className={`mt-8 h-[38px] w-32 rounded ${
                  isDarkMode ? "bg-zinc-700" : "bg-gray-300"
                }`}
              ></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AutofillWrapper darkmode={isDarkMode}>
      <div
        className={`toughts-page w-full min-h-screen ${
          isDarkMode ? "bg-[#121212]" : "bg-gray-50"
        }`}
      >
        <main className="container w-full mx-0 px-4 pt-34 pb-16 sm:pt-40 md:pt-36 max-w-[1350px]">
          <div className="flex flex-col gap-8 mx-4">
            <div className="w-full max-w-[902px]">
              {/* Profile Header with Username and Join Date */}
              <div className="flex items-center mb-8">
                <div
                  className={`rounded-full overflow-hidden ${
                    isDarkMode ? "bg-zinc-800" : "bg-[#d9d9d9]"
                  }`}
                >
                  {userData.profile_image ? (
                    <img
                      src={userData.profile_image}
                      alt="Profile"
                      className=" w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-700">
                      {userData.name
                        ? userData.name.charAt(0).toUpperCase()
                        : ""}
                    </div>
                  )}
                </div>
                <div className="ml-[16px] flex flex-col justify-center gap-[18px]">
                  <div
                    className={`h-[37px] justify-center md:text-4xl sm:text:xl text-sm font-semibold ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-[#2b2d2e]"
                    }`}
                  >
                    @{userData.username}
                  </div>
                  <div
                    className={`h-[19px] justify-start text-lg font-semibold ${
                      isDarkMode ? "text-[#C5C5C5]/50" : "text-[#2b2d2e]/50"
                    }`}
                  >
                    Joined {userData.joinDate}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              {/* Upload button */}
              <div
                onClick={handleUploadClick}
                className="h-[38px] px-[18px] py-[7px] rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#4169e1] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer mb-8"
              >
                <div className="justify-center text-[#4169e1] text-sm font-medium  ">
                  {uploadLoading ? "Uploading..." : "Upload Profile Picture"}
                </div>
              </div>

              <div className="mb-6">
                <div
                  className={`text-base font-semibold mb-2 ${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
                >
                  Name
                </div>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your Name"
                  className={`w-full h-16 px-4 rounded-xl border focus:outline-none bg-transparent ${
                    isDarkMode
                      ? "border-zinc-700/50 text-[#C5C5C5] placeholder:text-zinc-400"
                      : "border-zinc-800/50 text-zinc-800 placeholder:text-zinc-400"
                  }`}
                />
              </div>

              <div>
                <div
                  className={`text-base font-semibold mb-2 ${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
                >
                  Bio
                </div>
                <div
                  className={`mt-3 w-full h-52 rounded-xl border focus:outline-none ${
                    isDarkMode ? "border-zinc-700/50" : "border-zinc-800/50"
                  }`}
                >
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    placeholder="Write your bio here..."
                    className={`w-full h-full rounded-xl p-4 resize-none focus:outline-none bg-transparent placeholder:text-zinc-400 ${
                      isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                    }`}
                  />
                </div>
              </div>

              <div
                onClick={handleSaveChanges}
                className="mt-8 h-[38px] px-[18px] py-[7px] rounded outline-[1.20px] outline-offset-[-1.20px] outline-[#4169e1] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
              >
                <div className="justify-center text-[#4169e1] text-sm font-medium  ">
                  Save Changes
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Image Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0  bg-opacity-60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div
              className={`${
                isDarkMode
                  ? "bg-[#1e1e1e]/95 border border-zinc-700/50"
                  : "bg-white/95 border border-zinc-200/50"
              } backdrop-blur-md rounded-xl shadow-2xl max-w-lg w-full`}
            >
              {/* Header */}
              <div className="p-4 pb-2">
                <h3
                  className={`text-lg font-semibold text-center ${
                    isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                  }`}
                >
                  Crop Your Profile Picture
                </h3>
              </div>

              {/* Crop Area - Centered and Compact */}
              <div className="px-4 pb-2 flex justify-center">
                {imgSrc && (
                  <div className="relative inline-block">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      minWidth={100}
                      minHeight={100}
                      circularCrop={false}
                      className="max-w-full"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{
                          maxHeight: "350px",
                          maxWidth: "100%",
                          display: "block",
                          margin: "0 auto",
                        }}
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  </div>
                )}
              </div>

              {/* Buttons - Below the image, centered */}
              <div className="p-4 pt-2 flex justify-center gap-3">
                <button
                  onClick={handleCropCancel}
                  className={`px-5 py-2.5 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "border-zinc-600 text-[#C5C5C5] hover:bg-zinc-800/50"
                      : "border-zinc-300 text-zinc-700 hover:bg-gray-50"
                  }`}
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  disabled={!completedCrop || uploadLoading}
                  className="px-5 py-2.5 bg-[#4169e1] text-white rounded-lg hover:bg-[#3557c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadLoading ? "Uploading..." : "Upload Cropped Image"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AutofillWrapper>
  );
};

export default EditProfile;
