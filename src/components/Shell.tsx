"use client";

import { StoreProvider } from "@/lib/store";
import { Nav } from "./Nav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="mx-auto min-h-[100dvh] max-w-lg bg-ink pb-24">
        {children}
        <Nav />
      </div>
    </StoreProvider>
  );
}
