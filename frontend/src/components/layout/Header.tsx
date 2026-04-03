"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import Image from "next/image";

// SVG Icons
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  transparent?: boolean;
}

export function Header({ title, showBack, onBack, transparent }: HeaderProps) {
  const { user, isAuthenticated } = useStore();

  // Guest header - minimal
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'bg-[#0F0F10]'}`}>
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button 
                onClick={onBack}
                className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors"
                data-testid="back-btn"
              >
                <BackIcon />
              </button>
            ) : (
              <Image 
                src="/images/logo-ataka.png" 
                alt="АТАКА" 
                width={32} 
                height={32}
                className="rounded-full"
              />
            )}
            
            {title ? (
              <h1 className="font-heading text-base font-bold text-white">
                {title}
              </h1>
            ) : (
              <span className="font-heading font-bold text-white text-base">
                АТАКА
              </span>
            )}
          </div>

          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
            data-testid="notifications-btn"
          >
            <BellIcon />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E30613] rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}

// Minimal header for child pages
export function PageHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F10]">
      <div className="mx-auto max-w-md">
        <div className="flex items-center px-4 py-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1 -ml-1 mr-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              data-testid="back-btn"
            >
              <BackIcon />
            </button>
          )}
          <h1 className="font-heading text-base font-bold text-white">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
