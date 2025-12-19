import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  Row,
  Col,
  Form,
  Input,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  CircularProgress,
} from "@mui/material";

import { Alert, AlertTitle, List, ListItem } from "@mui/material";

import Switch from "react-switch"; // Import the React Switch component
import * as Yup from "yup";
import { useFormik } from "formik";
import { fetchData, uploadFile, createEvent } from "../services/apiServices";
import { useDropzone } from "react-dropzone"; // For drag and drop functionality
import Cropper from "react-easy-crop"; // Replacing react-image-crop with react-easy-crop
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isDarkColor } from "../utils/colorExtractor";

const getCurrentUTCDateTimeLocal = () => {
  const now = new Date();
  // Use UTC methods to get the current UTC time without timezone conversion
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = now.getUTCFullYear();
  const mm = pad(now.getUTCMonth() + 1);
  const dd = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const min = pad(now.getUTCMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
};

// Helper to normalize a datetime-local string to force seconds to 00
const normalizeDateTimeLocal = (dt) => {
  if (!dt) return dt;
  // If already has seconds, replace them with 00
  if (dt.length === 19) return dt.slice(0, 17) + "00";
  // If only yyyy-MM-ddTHH:mm, add :00
  if (dt.length === 16) return dt + ":00";
  return dt;
};

// Format date in UTC format for API calls
const formatDateForUTC = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString(); // Return ISO string in UTC
};

// Helper function to safely convert any value to a trimmed string
const safeStringTrim = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value.toString().trim();
};

// Image Cropper Modal Component
const ImageCropperModal = ({ isOpen, toggle, image, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hasSubMarket, setHasSubMarket] = useState(false);
  const [loading, setLoading] = useState(false);

  // When modal opens, reset the crop state
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  // Handle crop complete
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onCropCompleteCallback = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    generatePreview(croppedAreaPixels);
  }, []);

  // Generate a preview from the crop selection
  const generatePreview = useCallback(
    async (croppedAreaPixels) => {
      if (!croppedAreaPixels || !image) return;

      try {
        const imageObj = new Image();
        imageObj.src = image;

        await new Promise((resolve) => {
          imageObj.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to the cropped size
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          imageObj,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Convert to data URL for preview
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreviewUrl(dataUrl);
      } catch (error) {
        console.error("Error generating preview:", error);
      }
    },
    [image]
  );

  // Create a crop preview and convert to blob for saving
  const createCropPreview = async () => {
    setLoading(true);

    try {
      if (!croppedAreaPixels || !image) {
        throw new Error("No valid crop selection");
      }

      const imageObj = new Image();
      imageObj.src = image;

      await new Promise((resolve) => {
        imageObj.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to exactly 256x256px for events
      canvas.width = 256;
      canvas.height = 256;

      ctx.drawImage(
        imageObj,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        256,
        256
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Canvas is empty");
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          1
        );
      });
    } catch (error) {
      console.error("Error creating crop preview:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) {
      alert("Please make a crop selection first");
      return;
    }

    try {
      setLoading(true);
      const croppedImageBlob = await createCropPreview();
      onCropComplete(croppedImageBlob);
      toggle();
    } catch (error) {
      alert("Error processing the image. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={toggle}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: "16px",
          padding: "12px",
          backgroundColor: isDarkColor ? "#1A1B1E" : "#F5F5F5",
          width: "700px",
        },
      }}>
      <DialogTitle className="text-white">
        Crop Image (Final size: 256x256px)
      </DialogTitle>
      <DialogContent>
        <div className="relative h-[400px]">
          {image ? (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteCallback}
              cropShape="rect"
              showGrid={true}
            />
          ) : (
            <div className="text-center p-4 border rounded">
              <p>No image loaded. Please select an image first.</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-gray-500 mb-2">Zoom</p>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, value) => setZoom(value)}
          />
        </div>

        <div className="mt-4">
          <h6 className="text-[#fff]">Preview:</h6>
          {previewUrl ? (
            <div className="w-[150px] h-[150px] border rounded overflow-hidden mt-2">
              <img
                src={previewUrl}
                alt="Crop preview"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-[150px] h-[150px] border border-dashed flex items-center justify-center text-gray-400 mt-2">
              No preview
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <button
          className="px-5 py-2 rounded-md bg-gray-400 text-white text-sm hover:bg-gray-500 transition"
          onClick={toggle}
          color="secondary"
          disabled={loading}>
          Cancel
        </button>
        <button
          className="px-5 py-2 rounded  inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer bg-[#FF532A]  transition-colors duration-300 ease-in-out text-white "
          onClick={handleSaveCrop}
          variant="contained"
          disabled={loading || !croppedAreaPixels}>
          {loading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            "Apply Crop"
          )}
        </button>
      </DialogActions>
    </Dialog>
  );
};

// Region multi-select with chips component
const RegionMultiSelect = ({ regions, selectedRegions, onChange , isDark }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const handleRegionSelect = (regionId) => {
    const isSelected = selectedRegions.includes(regionId);
    let newSelectedRegions;

    if (isSelected) {
      // Remove the region if already selected
      newSelectedRegions = selectedRegions.filter((id) => id !== regionId);
    } else {
      // Add the region if not selected
      newSelectedRegions = [...selectedRegions, regionId];
    }

    onChange(newSelectedRegions);
  };

  const handleRemoveRegion = (regionId, e) => {
    e.stopPropagation(); // Prevent dropdown toggle
    const newSelectedRegions = selectedRegions.filter((id) => id !== regionId);
    onChange(newSelectedRegions);
  };

  return (
    <div className=" relative w-full">
      <div
        className={`w-full h-[55px] text-[#000]  border border-gray-300 rounded-md px-3 py-2 text-sm   appearance-none focus:outline-none focus:ring-0 focus:shadow-none `}
        onClick={toggleDropdown}
        style={{
          cursor: "pointer",
          minHeight: "45px",
          height: "auto",
          position: "relative",
        }}>
        {selectedRegions.length > 0 ? (
          <div className="d-flex flex-wrap" style={{ maxWidth: "95%" }}>
            {selectedRegions.map((regionId) => {
              const region = regions.find((r) => r._id === regionId);
              return region ? (
                <div
                  key={region._id}
                  className={`bg-primary px-2 py-1 rounded d-flex align-items-center me-1 mb-1 ${isDark ? "text-[#fff]" : "text-[#000]"} `}   >
                  <span>{region.name}</span>
                  <span
                    className="ms-1"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => handleRemoveRegion(region._id, e)}>
                    ×
                  </span>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className={` ${isDark ? "text-[#fff]" : "text-[#000]"} `}>Select regions...</div>
        )}
        <div className="dropdown-toggle ms-auto">
          <i className="mdi mdi-chevron-down"></i>
        </div>
      </div>

      {dropdownOpen && (
        <div
        data-lenis-prevent
          className={` absolute z-10 p-2 mt-1 w-full  border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto ${isDark ? "bg-[#1e1e1e]" : "bg-[#fff]"}  `}>
          {regions.map((region) => (
            <div
              key={region._id}
              className="flex flex-col items-start gap-1 "
              onClick={() => handleRegionSelect(region._id)}
              style={{ cursor: "pointer" }}>
              <div className="form-check flex gap-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedRegions.includes(region._id)}
                  onChange={() => {}} // Handled by the parent div click
                  id={`region-${region._id}`}
                />
                <label
                  className="form-check-label"
                  htmlFor={`region-${region._id}`}>
                  {region.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DraggableImageUpload = ({
  onFileSelect,
  currentImage,
  isUploading,
  uploadError,
  fieldId,
  error, // Add error prop
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Instead of uploading right away, show the cropper
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(imageUrl);
      setShowCropper(true);
    }
  };

  const handleDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      // Create a preview and show the cropper
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(imageUrl);
      setShowCropper(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });

  const handleCropComplete = (croppedBlob) => {
    // Create a file from the blob
    const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
      type: "image/jpeg",
    });

    // Create a preview URL for the cropped image
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(previewUrl);

    // Upload the cropped file
    onFileSelect(croppedFile);
  };

  const toggleCropper = () => {
    setShowCropper(!showCropper);
    if (!showCropper) {
      // Clean up the object URL when we close without saving
      URL.revokeObjectURL(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <>
      <div
        {...getRootProps()}
        className={`dropzone-container p-3 border rounded w-full ${
          isDragActive ? "border-primary" : ""
        } ${error ? "border-red-500" : ""}`} // Add error border
        style={{
          borderStyle: "dashed",
          cursor: "pointer",
          padding: "20px",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <input {...getInputProps()} id={fieldId} disabled={isUploading} />

        {previewUrl ? (
          <div className="text-center">
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxHeight: "100px",
                maxWidth: "100%",
                marginBottom: "10px",
              }}
              className="img-thumbnail"
            />
            <p className="mb-0">Drag & drop a new image or click to replace</p>
          </div>
        ) : (
          <div className="text-center">
            {isDragActive ? (
              <p className="mb-0">Drop the image here...</p>
            ) : (
              <>
                <i
                  className="ri-upload-cloud-line"
                  style={{ fontSize: "2rem" }}></i>
                <p className="mb-0">
                  Drag & drop an image here, or click to select
                </p>
                <p className="small text-muted">
                  (Image will be cropped to 1:1 ratio)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message for image upload */}
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

      {isUploading && (
        <div className="mt-2">
          <Spinner size="sm" /> Uploading...
        </div>
      )}

      {uploadError && (
        <Alert color="danger" className="mt-2">
          {uploadError}
        </Alert>
      )}

      {previewUrl && (
        <div className="mt-2 small text-muted">
          Click on the image area again to upload a different image
        </div>
      )}

      <div className="mt-2">
        <Label className="btn btn-outline-secondary btn-sm">
          Browse Files
          <Input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </Label>
      </div>

      <ImageCropperModal
        isOpen={showCropper}
        toggle={toggleCropper}
        image={selectedFile}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

const NewEvent = ({ grokEvent, onBack, onClick }) => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.value);

  const isDark = theme === "dark";
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  // Add autofill state
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const prevGrokEventRef = useRef();

  // Submarket state (do NOT set from grokEvent directly)
  const [subMarkets, setSubMarkets] = useState([]);
  const [hasSubMarket, setHasSubMarket] = useState(false);

  // Add missing state hooks for uploads and submit status
  const [uploadingFiles, setUploadingFiles] = useState({
    event_image: false,
    full_rules_doc: false,
  });
  const [uploadErrors, setUploadErrors] = useState({
    event_image: null,
    full_rules_doc: null,
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    event_image: null,
    full_rules_doc: null,
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  // Fetch categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchData("api/admin/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    getCategories();
  }, []);

  // Fetch regions
  useEffect(() => {
    const getRegions = async () => {
      try {
        const response = await fetchData("api/admin/regions");
        if (response && response.data.regions) {
          setRegions(response.data.regions || []);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    getRegions();
  }, []);

  // Autofill from grokEvent if provided
  useEffect(() => {
    // If new grokEvent, reset autofill flag
    if (grokEvent !== prevGrokEventRef.current) {
      setHasAutofilled(false);
      prevGrokEventRef.current = grokEvent;
    }
    if (grokEvent && !hasAutofilled) {
      // Autofill form fields from grokEvent
      const event = grokEvent.event || {};

      // Create the values object with proper trimming and fallbacks
      const newValues = {
        event_title: safeStringTrim(event.event_title),
        event_image: event.event_image || null,
        market_summary: safeStringTrim(event.market_summary),
        category: event.category_id || "",
        sub_category: event.sub_category_id || "",
        list_date: event.list_date
          ? normalizeDateTimeLocal(event.list_date)
          : getCurrentUTCDateTimeLocal(),
        regions: event.regions || [],
        rules_summary: safeStringTrim(event.rules_summary),
        rules_variables: safeStringTrim(event.rules_variables),
        settlement_sources: safeStringTrim(event.settlement_sources),
        full_rules_doc: event.full_rules_doc || null,
        has_sub_markets:
          Array.isArray(grokEvent.markets) && grokEvent.markets.length > 0,
        start_date: event.start_date
          ? normalizeDateTimeLocal(event.start_date)
          : getCurrentUTCDateTimeLocal(),
        end_date: event.end_date ? normalizeDateTimeLocal(event.end_date) : "",
        can_close_early: event.can_close_early || false,
        settlement_time: event.settlement_time || 24,
        side_1: safeStringTrim(event.side_1) || "Yes",
        side_2: safeStringTrim(event.side_2) || "No",
        bond_amount: event.bond_amount || 50,
        resolution_window: event.resolution_window || 24,
      };

      console.log("New values to set:", newValues);

      // Set values and mark fields as touched to trigger validation
      validation.setValues(newValues);

      // Mark required fields as touched so validation works properly
      const fieldsToTouch = {
        event_title: true,
        market_summary: true,
        category: true,
        list_date: true,
        rules_summary: true,
        settlement_sources: true,
      };

      // If we have an event image from grok, mark it as touched
      if (newValues.event_image) {
        fieldsToTouch.event_image = true;
      }

      // If we have a rules document from grok, mark it as touched
      if (newValues.full_rules_doc) {
        fieldsToTouch.full_rules_doc = true;
      }

      // Mark single market fields as touched if not using sub markets
      if (!newValues.has_sub_markets) {
        fieldsToTouch.start_date = true;
        fieldsToTouch.end_date = true;
      }

      validation.setTouched(fieldsToTouch);

      // Set uploaded files if they exist in grok data
      if (event.event_image || event.full_rules_doc) {
        setUploadedFiles((prev) => ({
          ...prev,
          event_image: event.event_image || prev.event_image,
          full_rules_doc: event.full_rules_doc || prev.full_rules_doc,
        }));
      }

      // Trigger validation after a short delay to ensure state is updated
      setTimeout(() => {
        validation.validateForm().then((errors) => {
          console.log("Validation after autofill - errors:", errors);
          console.log("Form is valid:", validation.isValid);
          console.log("Form values:", validation.values);
        });
      }, 100);

      // Autofill submarkets if present
      if (Array.isArray(grokEvent.markets) && grokEvent.markets.length > 0) {
        setHasSubMarket(true);
        setSubMarkets(
          grokEvent.markets.map((m) => ({
            name: safeStringTrim(m.name),
            event_image: m.event_image || null,
            list_date: m.list_date
              ? normalizeDateTimeLocal(m.list_date)
              : getCurrentUTCDateTimeLocal(),
            start_date: m.start_date
              ? normalizeDateTimeLocal(m.start_date)
              : getCurrentUTCDateTimeLocal(),
            end_date: m.end_date ? normalizeDateTimeLocal(m.end_date) : "",
            can_close_early: m.can_close_early || false,
            settlement_time: m.settlement_time || 24,
            side_1: safeStringTrim(m.side_1) || "Yes",
            side_2: safeStringTrim(m.side_2) || "No",
            bond_amount: m.bond_amount || 50,
            settlement_time: m.settlement_time || 24,
            resolution_window: m.resolution_window || 24,
          }))
        );
      } else {
        setHasSubMarket(false);
        setSubMarkets([]);
      }
      setHasAutofilled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grokEvent, hasAutofilled]);

  // When grokEvent changes, reset autofill flag
  useEffect(() => {
    setHasAutofilled(false);
  }, [grokEvent]);

  // Update subcategories when category changes
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    validation.handleChange(e);

    if (!categoryId) {
      setSubCategories([]);
      return;
    }

    // Find the selected category and its subcategories
    const selectedCategory = categories.find((cat) => cat._id === categoryId);
    if (selectedCategory && selectedCategory.subcategories) {
      setSubCategories(selectedCategory.subcategories);
    } else {
      setSubCategories([]);
    }
  };

  const handleFileUpload = async (file, field, submarketIndex = null) => {
    if (!file) return;

    const uploadField =
      submarketIndex !== null ? `submarket_${submarketIndex}` : field;

    try {
      setUploadingFiles((prev) => ({ ...prev, [uploadField]: true }));
      setUploadErrors((prev) => ({ ...prev, [uploadField]: null }));

      const fileType = field === "full_rules_doc" ? "document" : "image";
      const fileUrl = await uploadFile(file, fileType);

      if (submarketIndex !== null) {
        const newSubMarkets = [...subMarkets];
        newSubMarkets[submarketIndex] = {
          ...newSubMarkets[submarketIndex],
          event_image: fileUrl, // Use event_image instead of image
        };
        setSubMarkets(newSubMarkets);
      } else {
        setUploadedFiles((prev) => ({ ...prev, [field]: fileUrl }));
        validation.setFieldValue(field, fileUrl);
      }
    } catch (error) {
      const errorMessage = error.message || "Error uploading file";
      setUploadErrors((prev) => ({ ...prev, [uploadField]: errorMessage }));
      if (submarketIndex === null) {
        validation.setFieldError(field, errorMessage);
      }
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [uploadField]: false }));
    }
  };

  const formatEventData = (values) => {
    // Validate submarket fields if has_sub_markets is true
    if (hasSubMarket) {
      const invalidSubMarkets = subMarkets.filter(
        (market) =>
          !market.name ||
          !safeStringTrim(market.name) ||
          !market.start_date ||
          !market.end_date
      );

      if (invalidSubMarkets.length > 0) {
        throw new Error(
          "All submarkets must have name, start date and end date"
        );
      }
    }

    // Validate required fields with proper trimming
    const requiredFields = [
      { field: "event_title", name: "Event title" },
      { field: "market_summary", name: "Market summary" },
      { field: "rules_summary", name: "Rules summary" },
      { field: "settlement_sources", name: "Settlement sources" },
    ];

    for (const { field, name } of requiredFields) {
      if (!values[field] || !safeStringTrim(values[field])) {
        throw new Error(`${name} is required`);
      }
    }

    const eventData = {
      event_title: safeStringTrim(values.event_title),
      event_image: values.event_image,
      market_summary: safeStringTrim(values.market_summary),
      category: values.category || "660e3a12b4c5f2a1bcd24678",
      sub_category: values.sub_category || "660e3a12b4c5f2a1bcd24678",
      has_sub_markets: hasSubMarket,
      list_date: formatDateForUTC(values.list_date),
      regions: values.regions || [],
      rules_summary: safeStringTrim(values.rules_summary),
      rules_variables:
        safeStringTrim(values.rules_variables)
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v) || [],
      settlement_sources:
        safeStringTrim(values.settlement_sources)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s) || [],
      full_rules_doc_url: values.full_rules_doc,
      total_pool_in_usd: 0,
    };

    if (hasSubMarket) {
      eventData.markets = subMarkets.map((market) => {
        // Ensure we have an image for the submarket
        if (!market.event_image && market.image) {
          market.event_image = market.image;
        }

        return {
          name: safeStringTrim(market.name),
          market_image: market.event_image,
          list_date: formatDateForUTC(market.list_date || values.list_date),
          start_date: formatDateForUTC(market.start_date),
          end_date: formatDateForUTC(market.end_date),
          yes_bids: 0,
          yes_asks: 0,
          volume: 0,
          dollar_volume: 0,
          status: "open",
          result: null,
          can_close_early: market.can_close_early,
          settlement_time: Number(market.settlement_time),
          side_1: safeStringTrim(market.side_1),
          side_2: safeStringTrim(market.side_2),
          bond_amount: Number(market.bond_amount),
          settlement_time: Number(market.settlement_time),
          resolution_window: Number(market.resolution_window),
        };
      });
    } else {
      eventData.markets = [
        {
          name: safeStringTrim(values.event_title),
          market_image: values.event_image,
          list_date: formatDateForUTC(values.list_date),
          start_date: formatDateForUTC(values.start_date),
          end_date: formatDateForUTC(values.end_date),
          yes_bids: 0,
          yes_asks: 0,
          volume: 0,
          dollar_volume: 0,
          status: "open",
          result: null,
          can_close_early: values.can_close_early,
          settlement_time: Number(values.settlement_time),
          side_1: safeStringTrim(values.side_1),
          side_2: safeStringTrim(values.side_2),
          bond_amount: Number(values.bond_amount),
          resolution_window: Number(values.resolution_window),
        },
      ];
    }

    return eventData;
  };

  // Formik setup (do NOT set initialValues from grokEvent)
  const validation = useFormik({
    enableReinitialize: false, // Set to false to prevent form reset on validation errors
    initialValues: {
      event_title: "",
      event_image: null,
      market_summary: "",
      category: "",
      sub_category: "",
      list_date: getCurrentUTCDateTimeLocal(),
      regions: [],
      rules_summary: "",
      rules_variables: "",
      settlement_sources: "",
      full_rules_doc: null,
      has_sub_markets: false,
      start_date: getCurrentUTCDateTimeLocal(),
      end_date: "",
      can_close_early: false,
      settlement_time: 24,
      side_1: "Yes",
      side_2: "No",
      bond_amount: 50,
      resolution_window: 24,
    },
    validationSchema: Yup.object({
      event_title: Yup.string()
        .transform((value) => safeStringTrim(value))
        .required("Event title is required"),
      event_image: Yup.string().required("Event image is required"),
      market_summary: Yup.string()
        .transform((value) => safeStringTrim(value))
        .required("Event summary is required"),
      category: Yup.string().required("Category is required"),
      list_date: Yup.string().required("Listing date is required"),
      rules_summary: Yup.string()
        .transform((value) => safeStringTrim(value))
        .required("Rules summary is required"),
      settlement_sources: Yup.string()
        .transform((value) => safeStringTrim(value))
        .required("Settlement sources are required"),
      full_rules_doc: Yup.string().required("Rules document is required"),
      start_date: Yup.string().when(["has_sub_markets"], {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string().required("Start date is required"),
      }),
      end_date: Yup.string().when(["has_sub_markets"], {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string().required("End date is required"),
      }),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        console.log("Form submission started with values:", values);
        console.log("hasSubMarket:", hasSubMarket);
        console.log("subMarkets:", subMarkets);

        setSubmitStatus({ loading: true, error: null, success: false });
        const eventData = formatEventData(values);
        console.log("Submitting event data:", eventData);
        const response = await createEvent(eventData);
        console.log("Event created successfully:", response);
        setSubmitStatus({ loading: false, error: null, success: true });

        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate("/events"); // Redirect to events list
        }, 2000);

        // Reset form after successful submission
        validation.resetForm();
        setHasSubMarket(false);
        setSubMarkets([
          {
            name: "",
            image: null,
            list_date: getCurrentUTCDateTimeLocal(),
            start_date: getCurrentUTCDateTimeLocal(),
            end_date: "",
            can_close_early: false,
            settlement_time: 24,
          },
        ]);
        setUploadedFiles({
          event_image: null,
          full_rules_doc: null,
        });
      } catch (error) {
        console.error("Error creating event:", error);
        setSubmitStatus({
          loading: false,
          error: error.message || "Failed to create event",
          success: false,
        });
        // Set form-level error if needed
        setErrors({ submit: error.message || "Failed to create event" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Helper function to check if form is ready for submission
  const isFormReadyForSubmission = () => {
    const values = validation.values;

    // Check required fields
    const requiredFields = [
      "event_title",
      "event_image",
      "market_summary",
      "category",
      "list_date",
      "rules_summary",
      "settlement_sources",
      "full_rules_doc",
    ];

    for (const field of requiredFields) {
      if (!values[field] || !safeStringTrim(values[field])) {
        console.log(`Field ${field} is missing or empty:`, values[field]);
        return false;
      }
    }

    // Check single market fields if not using sub markets
    if (!hasSubMarket) {
      if (!values.start_date || !values.end_date) {
        return false;
      }
    }

    // Check sub markets if using them
    if (hasSubMarket) {
      for (let i = 0; i < subMarkets.length; i++) {
        const market = subMarkets[i];
        if (
          !market.name ||
          !safeStringTrim(market.name) ||
          !market.start_date ||
          !market.end_date
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSubMarketChange = (index, field, value) => {
    const newSubMarkets = [...subMarkets];
    newSubMarkets[index] = { ...newSubMarkets[index], [field]: value };
    setSubMarkets(newSubMarkets);
  };

  const addSubMarket = () => {
    let start_date = getCurrentUTCDateTimeLocal();
    let end_date = "";
    if (subMarkets.length > 0) {
      start_date = subMarkets[0].start_date || getCurrentUTCDateTimeLocal();
      end_date = subMarkets[0].end_date || "";
    }
    setSubMarkets([
      ...subMarkets,
      {
        name: "",
        image: null,
        list_date: getCurrentUTCDateTimeLocal(),
        start_date,
        end_date,
        can_close_early: false,
        settlement_time: 24,
        side_1: "Yes",
        side_2: "No",
        bond_amount: 50,
        settlement_time: 24,
        resolution_window: 24,
      },
    ]);
  };

  const removeSubMarket = (index) => {
    const newSubMarkets = subMarkets.filter((_, i) => i !== index);
    setSubMarkets(newSubMarkets);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit(e);
      }}
      className={`profile-page min-h-screen relative z-10   px-4 pt-20 lg:pt-40 pb-16 sm:pt-32 md:pt-36 ${
        isDark ? "bg-[#121212]" : ""
      }`}>
      <div className="container   mx-auto   rounded-lg shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1
            className={` text-xl font-semibold   ${
              isDark ? "text-[#fff]" : "text-[#000]"
            }`}>
            Events
          </h1>

          <div
            onClick={onClick}
            className="rounded  inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer bg-[#FF532A]  transition-colors duration-300 ease-in-out hover:text-white">
            <div className="px-[18px] py-[8px] justify-center text-white text-sm font-medium group-hover:text-white transition-colors duration-300 ease-in-out hover:text-white">
              Generate Market
            </div>
          </div>
        </div>
      </div>
      <Card className="container mx-auto mt-5">
        <CardBody>
          {submitStatus.success && (
            <Alert color="success" className="mb-4">
              Event created successfully!
            </Alert>
          )}
          {submitStatus.error && (
            <Alert color="danger" className="mb-4">
              {submitStatus.error}
            </Alert>
          )}

          <div className="container  mx-auto mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Name */}
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Event Name
              </label>

              <input
                type="text"
                id="event_title"
                name="event_title"
                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent  focus:outline-none focus:ring-0 ${
                  validation.touched.event_title &&
                  validation.errors.event_title
                    ? "border-red-500"
                    : "border-gray-300"
                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.event_title}
              />
              {validation.touched.event_title &&
                validation.errors.event_title && (
                  <div className="text-red-500 text-sm mt-1">
                    {validation.errors.event_title}
                  </div>
                )}
            </div>

            {/* Event Image */}
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Event Image
              </label>

              <DraggableImageUpload
                className="w-full border border-gray-300 rounded-md text-center cursor-pointer transition-colors hover:border-gray-400"
                onFileSelect={(file) => handleFileUpload(file, "event_image")}
                currentImage={uploadedFiles.event_image}
                isUploading={uploadingFiles.event_image}
                uploadError={uploadErrors.event_image}
                fieldId="event_image_upload"
                error={
                  validation.touched.event_image &&
                  validation.errors.event_image
                }
              />
            </div>

            {/* Event Summary */}
            <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Event Summary
              </label>

              <input
                type="textarea"
                id="market_summary"
                name="market_summary"
                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent  focus:outline-none focus:ring-0 ${
                  validation.touched.market_summary &&
                  validation.errors.market_summary
                    ? "border-red-500"
                    : "border-gray-300"
                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.market_summary}
              />
              {validation.touched.market_summary &&
                validation.errors.market_summary && (
                  <div className="text-red-500 text-sm mt-1">
                    {validation.errors.market_summary}
                  </div>
                )}
            </div>

            {/* Category */}
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Category
              </label>

              <select
                id="category"
                name="category"
                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent  appearance-none focus:outline-none focus:ring-0 ${
                  validation.touched.category && validation.errors.category
                    ? "border-red-500"
                    : "border-gray-300"
                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                onChange={handleCategoryChange}
                onBlur={validation.handleBlur}
                value={validation.values.category}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                    style={{ color: isDark ? "#1A1A1A" : "#1A1A1A" }}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validation.touched.category && validation.errors.category && (
                <div className="text-red-500 text-sm mt-1">
                  {validation.errors.category}
                </div>
              )}
            </div>

            {/* Sub Category */}
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Sub Category
              </label>

              <select
                id="sub_category"
                name="sub_category"
                className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent appearance-none focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                } `}
                onChange={validation.handleChange}
                value={validation.values.sub_category}>
                <option value="">Select Sub Category</option>
                {subCategories.map((subCategory) => (
                  <option
                    key={subCategory._id}
                    value={subCategory._id}
                    style={{ color: isDark ? "#1A1A1A" : "#1A1A1A" }}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Date */}
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Listing Date (UTC Timezone)
              </label>

              <small className="form-text text-muted">
                From this Date the event will be visible to users. (Select time
                in UTC timezone)
              </small>

              <div className="relative w-full">
                <input
                  type="datetime-local"
                  id="list_date"
                  name="list_date"
                  className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent   appearance-none focus:outline-none focus:ring-0 ${
                    validation.touched.list_date && validation.errors.list_date
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${
                    isDark
                      ? "text-[#fff] placeholder-white   "
                      : "text-[#000] placeholder-[#000]"
                  }`}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.list_date}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {validation.touched.list_date && validation.errors.list_date && (
                <div className="text-red-500 text-sm mt-1">
                  {validation.errors.list_date}
                </div>
              )}
            </div>

            {/* Regions */}
            <div className="w-full mt-8 flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Regions
              </label>

              <RegionMultiSelect
                regions={regions}
                selectedRegions={validation.values.regions}
                onChange={(selectedRegions) =>
                  validation.setFieldValue("regions", selectedRegions)
                }
                isDark={isDark}
              />
            </div>

            {/* Settlement Sources */}
            <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Settlement Sources
              </label>

              <input
                type="textarea"
                id="settlement_sources"
                name="settlement_sources"
                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent  focus:outline-none focus:ring-0 ${
                  validation.touched.settlement_sources &&
                  validation.errors.settlement_sources
                    ? "border-red-500"
                    : "border-gray-300"
                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.settlement_sources}
                placeholder="Enter settlement sources (comma separated)"
              />
              {validation.touched.settlement_sources &&
                validation.errors.settlement_sources && (
                  <div className="text-red-500 text-sm mt-1">
                    {validation.errors.settlement_sources}
                  </div>
                )}
            </div>

            {/* Rules */}
            <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium mb-1"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Rules
              </label>

              <input
                type="textarea"
                id="rules_summary"
                name="rules_summary"
                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 ${
                  validation.touched.rules_summary &&
                  validation.errors.rules_summary
                    ? "border-red-500"
                    : "border-gray-300"
                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.rules_summary}
              />
              {validation.touched.rules_summary &&
                validation.errors.rules_summary && (
                  <div className="text-red-500 text-sm mt-1">
                    {validation.errors.rules_summary}
                  </div>
                )}
            </div>

            {/* Full Rules PDF */}
            <div className="w-full mt-8 flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Full Rules PDF
              </label>

              <div className="relative w-full">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, "full_rules_doc");
                      validation.setFieldValue("full_rules_doc", "uploaded");
                      validation.setFieldTouched("full_rules_doc", true);
                    }
                  }}
                  accept=".pdf"
                  disabled={uploadingFiles.full_rules_doc}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-start gap-10 w-full h-[50px] border rounded-md text-sm bg-transparent   cursor-pointer ${
                    validation.touched.full_rules_doc &&
                    validation.errors.full_rules_doc
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${
                    isDark
                      ? "text-[#fff] placeholder-white   "
                      : "text-[#000] placeholder-[#000]"
                  }`}>
                  <span className="w-fit h-full flex justify-center items-center px-5 text-gray-400 hover:bg-gray-50 hover:bg-opacity-5 transition-colors">
                    Choose file
                  </span>
                  <span className="text-gray-500">
                    {uploadedFiles.full_rules_doc
                      ? "File selected"
                      : "No file chosen"}
                  </span>
                </label>
              </div>

              {uploadingFiles.full_rules_doc && (
                <div className="mt-2">
                  <Spinner size="sm" /> Uploading...
                </div>
              )}
              {uploadErrors.full_rules_doc && (
                <Alert color="danger" className="mt-2">
                  {uploadErrors.full_rules_doc}
                </Alert>
              )}
              {uploadedFiles.full_rules_doc && (
                <div className="mt-2">
                  <Alert color="success">
                    PDF uploaded successfully!{" "}
                    <a
                      href={uploadedFiles.full_rules_doc}
                      target="_blank"
                      rel="noopener noreferrer">
                      View PDF
                    </a>
                  </Alert>
                </div>
              )}
              {validation.touched.full_rules_doc &&
                validation.errors.full_rules_doc &&
                !uploadedFiles.full_rules_doc && (
                  <div className="text-red-500 text-sm mt-1">
                    {validation.errors.full_rules_doc}
                  </div>
                )}
            </div>

            {/* Has Multiple Markets */}
            <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                Has Multiple Markets
              </label>

              <div style={{ display: "flex", alignItems: "center" }}>
                <Switch
                  checked={hasSubMarket}
                  onChange={(checked) => {
                    setHasSubMarket(checked);
                    validation.setFieldValue("has_sub_markets", checked);
                    if (checked) {
                      // When switching ON, preserve start_date and end_date from form if filled
                      setSubMarkets((prev) => {
                        const mainStart = validation.values.start_date;
                        const mainEnd = validation.values.end_date;
                        return [
                          {
                            name: "",
                            image: null,
                            list_date: getCurrentUTCDateTimeLocal(),
                            start_date:
                              mainStart || getCurrentUTCDateTimeLocal(),
                            end_date: mainEnd || "",
                            can_close_early: false,
                            settlement_time: 24,
                          },
                        ];
                      });
                    }
                  }}
                  onColor="#86d3ff"
                  onHandleColor="#2693e6"
                  offColor="#cccccc"
                  offHandleColor="#888888"
                  handleDiameter={24}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={48}
                  id="has_sub_markets"
                  className="me-2"
                />
                <span>{hasSubMarket ? "Yes" : "No"}</span>
              </div>
            </div>

            {hasSubMarket ? (
              <>
                <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
                  {subMarkets.map((subMarket, index) => (
                    <div key={index} className="mb-3 w-full">
                      <CardBody>
                        <Row>
                          <label
                            className="text-xl font-medium mb-1"
                            style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                            Sub Market
                          </label>

                          <Col lg="1">
                            {index > 0 && (
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => removeSubMarket(index)}>
                                ✕
                              </Button>
                            )}
                          </Col>
                        </Row>

                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                          {/* Submarket Name */}
                          <div className="w-full mt-2 flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium mb-1"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Submarket Name
                            </label>

                            <input
                              type="text"
                              value={subMarket.name}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent  focus:outline-none focus:ring-0 focus:shadow-none ${
                                isDark
                                  ? "text-[#fff] placeholder-white   "
                                  : "text-[#000] placeholder-[#000]"
                              }`}
                            />
                            {!subMarket.name && (
                              <div className="text-red-500 text-sm mt-1">
                                Submarket name is required
                              </div>
                            )}
                          </div>

                          {/* Submarket Image */}
                          <div className="w-full mt-2 flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium mb-1"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Submarket Image
                            </label>

                            <DraggableImageUpload
                              onFileSelect={(file) =>
                                handleFileUpload(file, "image", index)
                              }
                              currentImage={subMarket.event_image}
                              isUploading={uploadingFiles[`submarket_${index}`]}
                              uploadError={uploadErrors[`submarket_${index}`]}
                              fieldId={`submarket_image_${index}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                          {/* Start Date */}
                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Start Date (UTC Timezone)
                            </label>

                            <small className="form-text text-muted">
                              From this Date the users can place orders. (Select
                              time in UTC timezone)
                            </small>

                            <div className="relative w-full">
                              <input
                                type="datetime-local"
                                value={
                                  subMarket.start_date
                                    ? normalizeDateTimeLocal(
                                        subMarket.start_date
                                      )
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleSubMarketChange(
                                    index,
                                    "start_date",
                                    val ? normalizeDateTimeLocal(val) : ""
                                  );
                                }}
                                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 ${
                                  !subMarket.start_date
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                              />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            {!subMarket.start_date && (
                              <div className="text-red-500 text-sm mt-1">
                                Start date is required
                              </div>
                            )}
                          </div>

                          {/* End Date */}
                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              End Date (UTC Timezone)
                            </label>

                            <small className="form-text text-muted">
                              From this Date the users can not place orders.
                              (Select time in UTC timezone)
                            </small>

                            <div className="relative w-full">
                              <input
                                type="datetime-local"
                                value={
                                  subMarket.end_date
                                    ? normalizeDateTimeLocal(subMarket.end_date)
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleSubMarketChange(
                                    index,
                                    "end_date",
                                    val ? normalizeDateTimeLocal(val) : ""
                                  );
                                }}
                                className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 ${
                                  !subMarket.end_date
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                              />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            {!subMarket.end_date && (
                              <div className="text-red-500 text-sm mt-1">
                                End date is required
                              </div>
                            )}
                          </div>

                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Can close early?
                            </label>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}>
                              <Switch
                                checked={subMarket.can_close_early}
                                onChange={(checked) => {
                                  handleSubMarketChange(
                                    index,
                                    "can_close_early",
                                    checked
                                  );
                                }}
                                onColor="#86d3ff"
                                onHandleColor="#2693e6"
                                offColor="#cccccc"
                                offHandleColor="#888888"
                                handleDiameter={24}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={48}
                                className="me-2"
                              />
                              <span>
                                {subMarket.can_close_early ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Side 1
                            </label>

                            <input
                              type="text"
                              value={subMarket.side_1}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "side_1",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Side 1 description"
                              className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                            />
                          </div>

                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Side 2
                            </label>

                            <input
                              type="text"
                              value={subMarket.side_2}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "side_2",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Side 2 description"
                              className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Bond Amount ($)
                            </label>

                            <input
                              type="number"
                              value={subMarket.bond_amount}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "bond_amount",
                                  Number(e.target.value)
                                )
                              }
                              min="0"
                              placeholder="Bond amount in USD"
                              className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent placeholder-white text-white focus:outline-none focus:ring-0 focus:shadow-none"
                            />
                          </div>

                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Settlement Time (hours)
                            </label>

                            <input
                              type="number"
                              value={subMarket.settlement_time}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "settlement_time",
                                  Number(e.target.value)
                                )
                              }
                              min="1"
                              placeholder="Settlement time in hours"
                              className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent    focus:outline-none focus:ring-0 focus:shadow-none ${isDark ? "text-[#fff]" : "text-[#000]"}`}
                            />
                          </div>

                          <div className="w-full flex flex-col justify-start items-start gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                              Resolution Window (hours)
                            </label>

                            <input
                              type="number"
                              value={subMarket.resolution_window}
                              onChange={(e) =>
                                handleSubMarketChange(
                                  index,
                                  "resolution_window",
                                  Number(e.target.value)
                                )
                              }
                              min="1"
                              placeholder="Resolution window in hours"
                              className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                            />
                          </div>
                        </div>
                      </CardBody>

                      <button
                        color="primary"
                        onClick={addSubMarket}
                        className="w-fit h-[50px] mt-2 p-5 rounded  inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer bg-[#FF532A]  transition-colors duration-300 ease-in-out  text-white">
                        Add Submarket
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-1 sm:col-span-2 rounded-md flex flex-col justify-start items-start gap-2">
                <div className="mb-3 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                    {/* Start Date */}
                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Start Date (UTC Timezone)
                      </label>

                      <small className="form-text text-muted">
                        From this Date the users can place orders. (Select time
                        in UTC timezone)
                      </small>

                      <div className="relative w-full">
                        <input
                          type="datetime-local"
                          id="start_date"
                          name="start_date"
                          onChange={(e) => {
                            const val = e.target.value;
                            validation.setFieldValue(
                              "start_date",
                              val ? normalizeDateTimeLocal(val) : ""
                            );
                          }}
                          onBlur={validation.handleBlur}
                          value={
                            validation.values.start_date
                              ? normalizeDateTimeLocal(
                                  validation.values.start_date
                                )
                              : ""
                          }
                          className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent  focus:outline-none focus:ring-0 ${
                            validation.touched.start_date &&
                            validation.errors.start_date &&
                            !validation.values.has_sub_markets
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {validation.touched.start_date &&
                        validation.errors.start_date &&
                        !validation.values.has_sub_markets && (
                          <div className="text-red-500 text-sm mt-1">
                            {validation.errors.start_date}
                          </div>
                        )}
                    </div>

                    {/* End Date */}
                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        End Date (UTC Timezone)
                      </label>

                      <small className="form-text text-muted">
                        From this Date the users can not place orders. (Select
                        time in UTC timezone)
                      </small>

                      <div className="relative w-full">
                        <input
                          type="datetime-local"
                          id="end_date"
                          name="end_date"
                          onChange={(e) => {
                            const val = e.target.value;
                            validation.setFieldValue(
                              "end_date",
                              val ? normalizeDateTimeLocal(val) : ""
                            );
                          }}
                          onBlur={validation.handleBlur}
                          value={
                            validation.values.end_date
                              ? normalizeDateTimeLocal(
                                  validation.values.end_date
                                )
                              : ""
                          }
                          className={`w-full h-[50px] border rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 ${
                            validation.touched.end_date &&
                            validation.errors.end_date &&
                            !validation.values.has_sub_markets
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {validation.touched.end_date &&
                        validation.errors.end_date &&
                        !validation.values.has_sub_markets && (
                          <div className="text-red-500 text-sm mt-1">
                            {validation.errors.end_date}
                          </div>
                        )}
                    </div>

                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Can close early?
                      </label>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Switch
                          checked={validation.values.can_close_early}
                          onChange={(checked) => {
                            validation.setFieldValue(
                              "can_close_early",
                              checked
                            );
                          }}
                          onColor="#86d3ff"
                          onHandleColor="#2693e6"
                          offColor="#cccccc"
                          offHandleColor="#888888"
                          handleDiameter={24}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          height={20}
                          width={48}
                          id="can_close_early_switch"
                          className="me-2"
                        />
                        <span>
                          {validation.values.can_close_early ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Side 1
                      </label>

                      <input
                        type="text"
                        id="side_1"
                        name="side_1"
                            readOnly
                        onChange={validation.handleChange}
                        value={validation.values.side_1}
                        placeholder="Enter Side 1 description"
                        className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                      />
                    </div>

                    <div className="w-full flex  flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Side 2
                      </label>

                      <input
                        type="text"
                        id="side_2"
                        name="side_2"
                        readOnly
                        onChange={validation.handleChange}
                        value={validation.values.side_2}
                        placeholder="Enter Side 2 description"
                        className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent placeholder-white  focus:outline-none focus:ring-0 focus:shadow-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Bond Amount ($)
                      </label>

                      <input
                        type="number"
                        id="bond_amount"
                        name="bond_amount"
                        onChange={validation.handleChange}
                        value={validation.values.bond_amount}
                        min="0"
                        placeholder="Bond amount in USD"
                        className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                      />
                    </div>

                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Settlement Time (hours)
                      </label>

                      <input
                        type="number"
                        id="settlement_time_new"
                        name="settlement_time"
                        onChange={validation.handleChange}
                        value={validation.values.settlement_time}
                        min="1"
                        placeholder="Settlement time in hours"
                        className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:shadow-none ${isDark ? "placeholder-white text-white " : "placeholder-[#000] text-[#000] "}`}
                      />
                    </div>

                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                        Resolution Window (hours)
                      </label>

                      <input
                        type="number"
                        id="resolution_window"
                        name="resolution_window"
                        onChange={validation.handleChange}
                        value={validation.values.resolution_window}
                        min="1"
                        placeholder="Resolution window in hours"
                        className={`w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-sm bg-transparent   focus:outline-none focus:ring-0 focus:shadow-none ${
                  isDark
                    ? "text-[#fff] placeholder-white   "
                    : "text-[#000] placeholder-[#000]"
                }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            color="primary"
            className={`w-fit h-[50px] mt-2 p-5 rounded text-[#fff]  inline-flex justify-center items-center gap-[9px] overflow-hidden cursor-pointer bg-[#FF532A]  transition-colors duration-300 ease-in-out hover:text-white ${!isFormReadyForSubmission() ? "opacity-30 cursor-not-allowed" : ""}`}
            disabled={
              submitStatus.loading ||
              Object.values(uploadingFiles).some(Boolean) ||
              !isFormReadyForSubmission()
            }>
            {submitStatus.loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Creating Event...
              </>
            ) : Object.values(uploadingFiles).some(Boolean) ? (
              <>
                <Spinner size="sm" className="me-2" />
                Uploading...
              </>
            ) : !isFormReadyForSubmission() ? (
              "Please fill all required fields"
            ) : (
              "Submit"
            )}
          </button>
        </CardBody>
      </Card>
    </Form>
  );
};

// Assign to variable before export for ESLint
const NewEventComponent = NewEvent;
export default NewEventComponent;
