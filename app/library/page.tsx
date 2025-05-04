"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import LibraryContent from "../components/LibraryContent";

const LibraryPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-[#121212] to-[#0e0e10] min-h-screen">
      <Navbar />
      <div className="pt-[76px] px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="py-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 inline-block mb-2">
            Your Epic Library
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-8">
            Manage your games, create collections, and share with friends
          </p>
          <LibraryContent />
        </div>
      </div>
    </div>
  );
};

export default LibraryPage; 