"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

// SVG Icons
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {!active && <polyline points="9 22 9 12 15 12 15 22" />}
  </svg>
);

const ScheduleIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const FeedIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
  </svg>
);

const ProfileIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

type NavItem = {
  href: string;
  icon: React.FC<{ active?: boolean }>;
  label: string;
  badge?: number;
};

const getNavItems = (role?: string): NavItem[] => {
  const items: NavItem[] = [
    { href: "/", icon: HomeIcon, label: "Головна" },
    { href: "/schedule", icon: ScheduleIcon, label: "Розклад" },
    { href: "/feed", icon: FeedIcon, label: "Стрічка" },
    { href: "/profile", icon: ProfileIcon, label: "Профіль" },
  ];
  
  if (role === 'COACH') {
    items[0].label = "Групи";
  } else if (role === 'ADMIN') {
    items[0].label = "Панель";
  } else if (role === 'STUDENT') {
    items[0].label = "Прогрес";
  }
  
  return items;
};

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useStore();
  
  if (!isAuthenticated) return null;
  
  const navItems = getNavItems(user?.role);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="bottom-nav"
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-1">
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
                  "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all relative",
                  "active:scale-95 min-w-[64px]",
                  isActive 
                    ? "text-[#E30613]" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn(
                  "mb-0.5 transition-transform",
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
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-3 min-w-[16px] h-4 bg-[#E30613] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
