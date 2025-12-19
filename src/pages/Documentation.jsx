import React, { useState } from 'react';
import { useSelector } from 'react-redux';
// Navbar removed - now handled globally in App.jsx
import DocsSidebar from '../components/docs/DocsSidebar';
import DocsContent from '../components/docs/DocsContent';

const Documentation = () => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <>
      <div
        className={`w-full min-h-screen pt-28 ${
          isDarkMode
            ? "bg-[#121212] text-[#C5C5C5]"
            : "bg-neutral-100 text-zinc-800"
        }`}
      >
        <div className="max-w-[1350px] mx-auto px-4">
          <div className="flex gap-8 h-[calc(100vh-7rem)]">
            {/* Fixed Sidebar */}
            <div
              className="w-80 flex-shrink-0 overflow-y-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE and Edge
              }}
            >
              <div className="pt-8">
                <DocsSidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  isDarkMode={isDarkMode}
                />
              </div>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>

            {/* Main Content with independent scroll */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE and Edge
              }}
            >
              <div className="pt-8 pb-16">
                <DocsContent
                  activeSection={activeSection}
                  isDarkMode={isDarkMode}
                />
              </div>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;