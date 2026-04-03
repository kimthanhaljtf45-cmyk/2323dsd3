"use client";

import React from "react";
import { BottomNav } from "./BottomNav";
import { useStore } from "@/store/useStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md pb-24">
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
