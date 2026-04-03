"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

// SVG Icons
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ScheduleIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FeedIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const ProfileIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CoachIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AdminIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

type NavItem = {
  href: string;
  icon: React.FC<{ active?: boolean }>;
  label: string;
};

const getNavItems = (role?: string): NavItem[] => {
  if (role === 'COACH') {
    return [
      { href: "/", icon: CoachIcon, label: "Групи" },
      { href: "/schedule", icon: ScheduleIcon, label: "Розклад" },
      { href: "/feed", icon: FeedIcon, label: "Стрічка" },
      { href: "/profile", icon: ProfileIcon, label: "Профіль" },
    ];
  }
  
  if (role === 'ADMIN') {
    return [
      { href: "/", icon: AdminIcon, label: "Панель" },
      { href: "/schedule", icon: ScheduleIcon, label: "Розклад" },
      { href: "/feed", icon: FeedIcon, label: "Стрічка" },
      { href: "/profile", icon: ProfileIcon, label: "Профіль" },
    ];
  }
  
  if (role === 'STUDENT') {
    return [
      { href: "/", icon: HomeIcon, label: "Мій прогрес" },
      { href: "/schedule", icon: ScheduleIcon, label: "Розклад" },
      { href: "/feed", icon: FeedIcon, label: "Стрічка" },
      { href: "/profile", icon: ProfileIcon, label: "Профіль" },
    ];
  }
  
  // PARENT or authenticated
  return [
    { href: "/", icon: HomeIcon, label: "Головна" },
    { href: "/schedule", icon: ScheduleIcon, label: "Розклад" },
    { href: "/feed", icon: FeedIcon, label: "Стрічка" },
    { href: "/profile", icon: ProfileIcon, label: "Профіль" },
  ];
};

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useStore();
  
  // Don't show nav for guests
  if (!isAuthenticated) return null;
  
  const navItems = getNavItems(user?.role);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      data-testid="bottom-nav"
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all",
                  "active:scale-95 min-w-[64px]",
                  isActive 
                    ? "text-[#E30613]" 
                    : "text-gray-400"
                )}
              >
                <div className={cn(
                  "mb-1 transition-all",
                  isActive && "scale-110"
                )}>
                  <IconComponent active={isActive} />
                </div>
                <span className={cn(
                  "text-[10px] transition-all",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
