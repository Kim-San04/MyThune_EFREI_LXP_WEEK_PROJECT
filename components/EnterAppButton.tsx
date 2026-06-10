"use client";

import { useSession } from "next-auth/react";

interface EnterAppButtonProps {
  className?: string;
  id?: string;
  children: React.ReactNode;
}

export const ENTER_APP_EVENT = "mythune:enter-app";

export default function EnterAppButton({ className, id, children }: EnterAppButtonProps) {
  const { status } = useSession();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent(ENTER_APP_EVENT, { detail: { authenticated: status === "authenticated" } })
    );
  }

  return (
    <a href="/app" id={id} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
