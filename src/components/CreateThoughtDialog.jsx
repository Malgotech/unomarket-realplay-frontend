import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { RiCloseLine } from "react-icons/ri";
import { postData } from "../services/apiServices";
import LoginDialog from "./auth/LoginDialog";
import Toast from "./Toast";

const CreateThoughtDialog = ({ open, onClose }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

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

  const handleCreatePost = async () => {
    const token = localStorage.getItem("UnomarketToken");
    if (!token) {
      setShowLoginDialog(true);
      setError("Please login to bookmark this market");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const thoughtData = {
        content: content,
        userId: userData.id, // Add user ID
        userName: userData.name || "Anonymous",
        userImage: userData.profileImage || null,
      };

      const response = await postData("thoughts", thoughtData);

      if (response) {
        // Changed from response.success since API might return different structure
        setContent("");
        setImage(null);
        setShowToast(true);
        onClose();
      }
    } catch (error) {
      console.error("Error creating thought:", error);

      if (error.response) {
        if (error.response.status === 403) {
          // Token expired or invalid
          localStorage.removeItem("UnomarketToken");
          localStorage.removeItem("user");
          setShowLoginDialog(true);
          setError("Please login again to continue");
          setTimeout(() => setError(""), 3000);
        } else {
          setError(error.response.data?.message || "Failed to create thought");
        }
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    setError("");    
    handleCreatePost();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "16px",
            padding: "20px",
          },
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <DialogContent className="p-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt={userData.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200" />
            )}
            <span className="font-medium">{userData.name || "User"}</span>
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[150px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-between items-center mt-4">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <img
                src="/uploadImageIcon.svg"
                alt="Upload"
                className="w-5 h-5"
              />
            </button>

            <button
              onClick={handleCreatePost}
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-lg text-white font-medium ${content.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
                }`}
            >
              Create Post
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Toast
        message="Thought created successfully!"
        show={showToast}
        type="success"
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default CreateThoughtDialog;
