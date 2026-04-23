"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import type { AppStore } from "@/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // useRef ensures we create the store only once per component mount
  // Required for RSC compatibility — avoids creating a new store on every render
  const storeRef = useRef<AppStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
