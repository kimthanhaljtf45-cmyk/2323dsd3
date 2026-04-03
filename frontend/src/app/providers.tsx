"use client";

import React, { useEffect } from "react";
import { useStore } from "@/store/useStore";

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
      };
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initApp = async () => {
      if (typeof window === 'undefined') return;

      try {
        const tg = window.Telegram?.WebApp;
        const hasTelegramUser = tg?.initDataUnsafe?.user?.id;
        
        if (tg) {
          try { tg.ready(); } catch (e) { /* ignore */ }
          try { tg.expand(); } catch (e) { /* ignore */ }
        }
        
        if (hasTelegramUser && tg?.initData) {
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
            }
          } catch (e) {
            console.error('Telegram auth error:', e);
          }
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            useStore.setState({ token });
            try {
              const response = await fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              if (response.ok) {
                const user = await response.json();
                useStore.setState({ user, isAuthenticated: true });
              } else {
                localStorage.removeItem('token');
                useStore.setState({ token: null, user: null, isAuthenticated: false });
              }
            } catch (e) {
              console.error('User fetch error:', e);
              localStorage.removeItem('token');
              useStore.setState({ token: null, user: null, isAuthenticated: false });
            }
          }
        }
      } catch (error) {
        console.error('Init error:', error);
      }
    };
    
    initApp();
  }, []);

  return <>{children}</>;
}
