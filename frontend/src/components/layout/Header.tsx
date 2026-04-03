"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const BellIcon = ({ hasNotification }: { hasNotification?: boolean }) => (
  <div className="relative">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {hasNotification && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E30613] rounded-full border-2 border-white" />
    )}
  </div>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export function Header({ title, showBack, rightAction }: HeaderProps) {
  const router = useRouter();
  const { user } = useStore();
  
  const handleBack = () => {
    router.back();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-md h-14 px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button 
              onClick={handleBack}
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <BackIcon />
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image 
                  src="/images/logo-ataka.png" 
                  alt="АТАКА" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </Link>
          )}
          
          {title && (
            <h1 className="font-heading font-bold text-[#0F0F10] truncate">
              {title}
            </h1>
          )}
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2">
          {rightAction || (
            <Link 
              href="/notifications" 
              className="p-2 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <BellIcon hasNotification />
            </Link>
          )}
          
          {/* Role badge */}
          {user?.role && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
              user.role === 'COACH' ? 'bg-blue-100 text-blue-700' :
              user.role === 'STUDENT' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {user.role === 'PARENT' ? 'Батько' :
               user.role === 'STUDENT' ? 'Учень' :
               user.role === 'COACH' ? 'Тренер' :
               user.role === 'ADMIN' ? 'Адмін' : user.role}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
