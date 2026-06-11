"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackgroundAmbience from "@/components/BackgroundAmbience";
import LoadingScreen from "@/components/app/LoadingScreen";
import AuthModal from "@/components/AuthModal";
import AppTransitionOverlay from "@/components/AppTransitionOverlay";

const SPLASH_MS = 1400;
const TRANSITION_MS = 500;

function EntrerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSplash, setShowSplash] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  function handleSuccess() {
    setTransitioning(true);
    setTimeout(() => router.push("/app"), TRANSITION_MS);
  }

  if (showSplash) return <LoadingScreen />;

  return (
    <>
      <BackgroundAmbience />
      <AuthModal
        open={!transitioning}
        onClose={() => router.push("/")}
        onSuccess={handleSuccess}
        initialMode={initialMode}
      />
      <AppTransitionOverlay active={transitioning} />
    </>
  );
}

export default function EntrerPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EntrerContent />
    </Suspense>
  );
}
