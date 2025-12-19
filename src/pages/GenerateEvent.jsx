import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CircularProgress, Alert, Card, CardContent } from "@mui/material";
import { useSelector } from "react-redux";
// import { fetchData, postData }

import { fetchData, postData } from "../services/apiServices";
import { useNavigate } from "react-router-dom";

const GenerateEvent = ({
  open,
  onClose,
  setActiveButton,
  setGrokPreviewIdx,
  grokPreviewIdx,
  setGrokResults,
  grokResults,
}) => {
  const theme = useSelector((state) => state.theme.value);
  const isDark = theme === "dark";
  const navigate = useNavigate("");
  const [showGrok, setShowGrok] = useState(false);
  const [grokCategory, setGrokCategory] = useState("");
  const [grokIdea, setGrokIdea] = useState("");
  const [grokLoading, setGrokLoading] = useState(false);
  const [grokError, setGrokError] = useState("");

  const [categories, setCategories] = useState([]);

  // Fetch categories for dropdown
  React.useEffect(() => {
    fetchData("api/admin/categories").then((data) =>
      setCategories(data.data.categories || [])
    );
  }, []);

  const handleGrokOpen = () => {
    setShowGrok(true);
    setGrokCategory("");
    setGrokIdea("");
    setGrokResults([]);
    setGrokPreviewIdx(null);
    setGrokError("");
  };

  const handleGrokClose = () => {
    setGrokCategory("");
    setGrokIdea("");
    setGrokResults([]);
    onClose();
  };

  const handleGrokGenerate = async (e) => {
    e.preventDefault();
    setGrokLoading(true);
    setGrokError("");
    setGrokResults([]);
    setGrokPreviewIdx(null);
    try {
      // Find category name by _id
      const catObj = categories.find((cat) => cat._id === grokCategory);
      const genre = catObj ? catObj.name : grokCategory;
      const data = await postData("api/admin/grok/generatidea", {
        genre,
        eventIdea: grokIdea,
      });
      if (data.success && data.data && Array.isArray(data.data.events)) {
        setGrokResults(data.data.events);
      } else {
        setGrokError("No events generated. Try a different idea.");
      }
    } catch (err) {
      setGrokError("Failed to generate events. Please try again.");
    } finally {
      setGrokLoading(false);
    }
  };

  // Autofill NewEvent with selected grok event
  const handleGrokSelect = (idx) => {
    setGrokPreviewIdx(idx);
    setActiveButton(true);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleGrokClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: "16px",
          padding: "12px",
          backgroundColor: isDark ? "#1A1B1E" : "#F5F5F5",
          width: "700px",
        },
      }}
      data-lenis-prevent>
      {/* Header */}
      <div data-lenis-prevent className="flex justify-between items-center p-2">
        <h2
          className="text-lg font-semibold"
          style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
          Generate Market Ideas
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold">
          ×
        </button>
      </div>

      <div
        className={`w-full h-px mt-3 ${
          isDark ? "bg-zinc-700" : "bg-gray-300"
        }`}></div>

      {/* Body */}
      <form onSubmit={handleGrokGenerate} className="mt-4 space-y-4 p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="flex flex-col">
            <label
              className="text-sm font-medium mb-1"
              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
              Category
            </label>
            <select
              className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={grokCategory}
              onChange={(e) => setGrokCategory(e.target.value)}
              required
              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
              <option
                value=""
                style={{ color: isDark ? "#FFFFFF" : "#FFFFFF" }}>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="text-black">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Idea */}
          <div className="flex flex-col">
            <label
              className="text-sm font-medium mb-1"
              style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
              Event Idea
            </label>
            <input
              type="text"
              value={grokIdea}
              onChange={(e) => setGrokIdea(e.target.value)}
              placeholder="Describe your event idea..."
              className={`border border-gray-300 rounded-md px-3 py-2 text-sm ${
                isDark
                  ? "bg-transparent text-white placeholder-gray-400"
                  : "bg-white text-black"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-3">
          <button
            type="button"
            onClick={handleGrokClose}
            className="px-5 py-2 rounded-md bg-gray-400 text-white text-sm hover:bg-gray-500 transition">
            Close
          </button>
          <button
            type="submit"
            disabled={grokLoading}
            className="px-4 py-2 rounded inline-flex justify-center items-center gap-2 bg-[#FF532A] hover:bg-[#FF532A] transition text-white text-sm">
            {grokLoading ? (
              <>
                <CircularProgress size={16} color="inherit" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {grokError && (
        <Alert severity="error" className="mt-3">
          {grokError}
        </Alert>
      )}

      {/* Results */}
      {grokResults?.length > 0 && (
        <div className="mt-4 p-2">
          <h5
            className="text-md font-semibold mb-2"
            style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
            Generated Events Preview
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grokResults.map((ev, idx) => (
              <Card
                key={idx}
                variant="outlined"
                style={{
                  borderColor:
                    grokPreviewIdx === idx
                      ? "#FF532A"
                      : isDark
                      ? "#FF532A"
                      : "#000",
                  backgroundColor: isDark ? "#222" : "#fff",
                }}>
                <CardContent>
                  <h6
                    className="font-semibold"
                    style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}>
                    {ev.event.event_title}
                  </h6>
                  <p
                    className={`text-sm mb-2 ${isDark
                      ? "#FF532A"
                      : "#000"}`}
                   >
                    {ev.event.market_summary}
                  </p>
                  <div className="text-xs">
                    <b className={`${isDark
                      ? "#FF532A"
                      : "#000"}`}>Markets:</b>
                    <ul className="ml-4 list-disc">
                      {ev.markets.map((m, i) => (
                        <li key={i} className={`${isDark
                      ? "#FF532A"
                      : "#000"}`}>
                          {m.name}{" "}
                          <span className={`${isDark
                      ? "#FF532A"
                      : "#000"}`}>
                            ({m.start_date.split("T")[0]} →{" "}
                            {m.end_date.split("T")[0]})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right mt-3">
                    <button
                      onClick={() => handleGrokSelect(idx)}
                      className="text-sm px-3 py-1 rounded border border-[#FF532A] text-[#FF532A] hover:bg-[#FF532A] hover:text-white transition">
                      Use This
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default GenerateEvent;
