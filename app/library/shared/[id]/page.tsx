"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SharedLibraryView from "../../../components/SharedLibraryView";

export default function SharedLibraryPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    router.push("/library");
  };

  if (!mounted) {
    return null;
  }

  return (
    <SharedLibraryView sharedLibraryId={params.id} onClose={handleGoBack} />
  );
} 