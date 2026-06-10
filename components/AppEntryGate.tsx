"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import AppTransitionOverlay from "@/components/AppTransitionOverlay";
import { ENTER_APP_EVENT } from "@/components/EnterAppButton";

const TRANSITION_MS = 500;

export default function AppEntryGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "1") setModalOpen(true);
  }, [searchParams]);

  useEffect(() => {
    function onEnterApp(e: Event) {
      const { authenticated } = (e as CustomEvent<{ authenticated: boolean }>).detail;
      if (authenticated) {
        enterApp();
      } else {
        setModalOpen(true);
      }
    }
    window.addEventListener(ENTER_APP_EVENT, onEnterApp);
    return () => window.removeEventListener(ENTER_APP_EVENT, onEnterApp);
  }, []);

  function enterApp() {
    setModalOpen(false);
    setTransitioning(true);
    setTimeout(() => router.push("/app"), TRANSITION_MS);
  }

  return (
    <>
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={enterApp} />
      <AppTransitionOverlay active={transitioning} />
    </>
  );
}
