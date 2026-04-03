"use client";

import React from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { useStore } from "@/store/useStore";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  hideNav?: boolean;
}

export function AppShell({ 
  children, 
  title, 
  showBack, 
  rightAction,
  hideNav = false 
}: AppShellProps) {
  const { isAuthenticated } = useStore();
  const showNavigation = isAuthenticated && !hideNav;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      {isAuthenticated && title && (
        <Header 
          title={title} 
          showBack={showBack} 
          rightAction={rightAction}
        />
      )}
      
      {/* Scrollable Content Area */}
      <main 
        className={`flex-1 overflow-y-auto mx-auto w-full max-w-md ${
          showNavigation ? 'pb-20' : ''
        } ${isAuthenticated && title ? 'pt-14' : ''}`}
      >
        {children}
      </main>
      
      {/* Fixed Bottom Navigation */}
      {showNavigation && <BottomNav />}
    </div>
  );
}
