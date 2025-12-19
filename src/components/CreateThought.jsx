import React, { useState } from "react";
import TextPost from "./posts/TextPost";
import MediaPost from "./posts/MediaPost";
import LinkPost from "./posts/LinkPost";

const CreateThought = () => {
  const [activeTab, setActiveTab] = useState("text");

  const renderContent = () => {
    switch (activeTab) {
      case "text":
        return <TextPost />;
      case "media":
        return <MediaPost />;
      case "link":
        return <LinkPost />;
      default:
        return <TextPost />;
    }
  };

  return (
    <div className="w-[902px] bg-white rounded-xl p-6">
      <div className="flex gap-6">
        <button
          className={`hover:cursor-pointer text-sm font-semibold ${
            activeTab === "text" ? "text-zinc-800" : "text-zinc-800/50"
          }`}
          onClick={() => setActiveTab("text")}
        >
          Text
        </button>
        <button
          className={`hover:cursor-pointer text-sm font-semibold ${
            activeTab === "media" ? "text-zinc-800" : "text-zinc-800/50"
          }`}
          onClick={() => setActiveTab("media")}
        >
          Images & Videos
        </button>
        <button
          className={`hover:cursor-pointer text-sm font-semibold ${
            activeTab === "link" ? "text-zinc-800" : "text-zinc-800/50"
          }`}
          onClick={() => setActiveTab("link")}
        >
          Link
        </button>
      </div>

      {renderContent()}

      <div className="flex justify-end mt-4">
        <button className="hover:cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Post
        </button>
      </div>
    </div>
  );
};

export default CreateThought;
