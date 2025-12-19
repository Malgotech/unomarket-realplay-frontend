import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Fade,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";

// Custom styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "80%",
    maxWidth: "900px",
    borderRadius: "18px",
    background: "#FDFDFD",
    margin: 0,
    padding: theme.spacing(3),
  },
}));

const ProfileDialog = ({ open, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Get user data from localStorage
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserData(user);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [open]);

  // Format date from ISO string to "Month YYYY" format
  const formatJoinDate = (createdAt) => {
    if (!createdAt) return "Recent member";
    try {
      const date = new Date(createdAt);
      return `Joined ${format(date, "MMM yyyy")}`;
    } catch (error) {
      return "Recent member";
    }
  };

  const handleEditProfile = () => {
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="profile-dialog-title"
    >
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", padding: 2 }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Profile Image */}
                <div className="w-[108px] h-[108px] bg-[#d9d9d9] rounded-full">
                  {userData?.profileImage && (
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>

                {/* Username and Join Date - 16px space between image and text */}
                <Box
                  sx={{
                    ml: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  <div className="w-[206px] h-[37px] justify-start text-[#2b2d2e] text-4xl font-semibold  ">
                    @{userData?.username || 'username'}
                  </div>
                  <div className="w-[139px] h-[19px] justify-start text-[#2b2d2e]/50 text-lg font-semibold  ">
                    {formatJoinDate(userData?.createdAt)}
                  </div>
                </Box>
              </Box>

              {/* Edit Profile Button */}
              <div
                className="w-[93px] h-[38px] px-[18px] py-[7px] rounded-lg outline outline-[1.20px] outline-offset-[-1.20px] outline-[#4169e1] inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer"
                onClick={handleEditProfile}
              >
                <div className="justify-center text-[#4169e1] text-sm font-medium  ">
                  Edit Profile
                </div>
              </div>
            </Box>

            {/* Additional profile content can be added here */}
            <Box sx={{ borderTop: "1px solid #eee", pt: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <div className="text-[#2b2d2e] text-xl font-semibold  ">
                  Account Details
                </div>
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <div>
                  <div className="text-[#2b2d2e]/50 text-sm font-medium  ">
                    Email
                  </div>
                  <div className="text-[#2b2d2e] text-base font-medium  ">
                    {userData?.email || "No email provided"}
                  </div>
                </div>

                <div>
                  <div className="text-[#2b2d2e]/50 text-sm font-medium  ">
                    Wallet Balance
                  </div>
                  <div className="text-[#2b2d2e] text-base font-medium  ">
                    ${userData?.wallet?.$numberDecimal || "0.00"}
                  </div>
                </div>

                <div>
                  <div className="text-[#2b2d2e]/50 text-sm font-medium  ">
                    2FA Status
                  </div>
                  <div className="text-[#2b2d2e] text-base font-medium  ">
                    {userData?.twoFA_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                <div>
                  <div className="text-[#2b2d2e]/50 text-sm font-medium  ">
                    Email Verification
                  </div>
                  <div className="text-[#2b2d2e] text-base font-medium  ">
                    {userData?.email_verified ? "Verified" : "Not Verified"}
                  </div>
                </div>
              </Box>

              {userData?.bio && (
                <Box sx={{ mt: 3 }}>
                  <div className="text-[#2b2d2e]/50 text-sm font-medium  ">
                    Bio
                  </div>
                  <div className="text-[#2b2d2e] text-base font-medium   mt-1">
                    {userData.bio}
                  </div>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default ProfileDialog;
