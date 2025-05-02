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
    <div className="bg-[#121212] min-h-screen">
      <Navbar />
      <div className="pt-[76px]"> {/* Padding to account for fixed navbar */}
        <LibraryContent />
      </div>
    </div>
  );
};

export default LibraryPage; 