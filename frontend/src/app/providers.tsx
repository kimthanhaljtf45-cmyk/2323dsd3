"use client";

import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useStore } from "@/store/useStore";

const AppShellComponent = dynamic(
  () => import("@/components/layout/AppShell").then(mod => mod.AppShell),
  { ssr: false }
);

// Telegram WebApp type declaration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [telegramReady, setTelegramReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if running inside Telegram WebApp
    const initTelegram = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Signal that app is ready
        tg.ready();
        
        // Expand to full height
        tg.expand();
        
        // If we have initData, try to authenticate with it
        if (tg.initData && tg.initData.length > 0) {
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initData: tg.initData }),
            });
            
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('token', data.accessToken);
              useStore.setState({ 
                token: data.accessToken, 
                user: data.user, 
                isAuthenticated: true 
              });
              console.log('Telegram auth successful:', data.user.firstName);
            }
          } catch (error) {
            console.error('Telegram auth error:', error);
          }
        }
        
        setTelegramReady(true);
      } else {
        // Not in Telegram - use regular auth
        const token = localStorage.getItem('token');
        if (token) {
          useStore.setState({ token });
          useStore.getState().fetchUser().catch(() => {
            localStorage.removeItem('token');
            useStore.setState({ token: null, user: null, isAuthenticated: false });
          });
        }
      }
    };
    
    initTelegram();
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return <AppShellComponent>{children}</AppShellComponent>;
}
