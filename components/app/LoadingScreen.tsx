"use client";

import ThunieCoinLoader from "@/components/app/ThunieCoinLoader";

export default function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <ThunieCoinLoader />
    </main>
  );
}
