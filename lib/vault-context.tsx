"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface VaultContextValue {
  dek: CryptoKey | null;
  setDek: (dek: CryptoKey | null) => void;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [dek, setDekState] = useState<CryptoKey | null>(null);
  const setDek = useCallback((d: CryptoKey | null) => setDekState(d), []);
  return <VaultContext.Provider value={{ dek, setDek }}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
