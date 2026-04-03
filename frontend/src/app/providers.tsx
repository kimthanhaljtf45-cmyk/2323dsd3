"use client";

import React, { useEffect, useState, useCallback } from "react";
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
            language_code?: string;
            is_premium?: boolean;
          };
          start_param?: string;
          auth_date?: number;
          hash?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        platform: string;
        version: string;
      };
    };
  }
}

// Custom hook for Telegram WebApp
export function useTelegramWebApp() {
  const [tg, setTg] = useState<Window['Telegram'] | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setTg(window.Telegram);
      setIsReady(true);
    }
  }, []);
  
  return { tg: tg?.WebApp, isReady, isTMA: isReady && !!tg?.WebApp?.initData };
}

// Registration form component for new users
function RegistrationForm({ 
  telegramUser, 
  onRegister 
}: { 
  telegramUser: { id: number; first_name: string; last_name?: string; username?: string };
  onRegister: (role: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    await onRegister(selectedRole);
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#E30613] to-[#FF6B6B] rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🥋</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Ласкаво просимо!</h1>
          <p className="text-gray-400 mt-2">{telegramUser.first_name}, оберіть вашу роль</p>
        </div>
        
        {/* Role Selection */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => setSelectedRole('PARENT')}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'PARENT'
                ? 'border-[#E30613] bg-[#E30613]/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedRole === 'PARENT' ? 'bg-[#E30613]' : 'bg-gray-700'
              }`}>
                👨‍👩‍👧
              </div>
              <div>
                <p className={`font-bold ${selectedRole === 'PARENT' ? 'text-white' : 'text-gray-200'}`}>
                  Я — Батько / Мати
                </p>
                <p className="text-sm text-gray-400">
                  Відстежуйте успіхи своєї дитини
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedRole('STUDENT')}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'STUDENT'
                ? 'border-[#E30613] bg-[#E30613]/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedRole === 'STUDENT' ? 'bg-[#E30613]' : 'bg-gray-700'
              }`}>
                🥋
              </div>
              <div>
                <p className={`font-bold ${selectedRole === 'STUDENT' ? 'text-white' : 'text-gray-200'}`}>
                  Я — Учень
                </p>
                <p className="text-sm text-gray-400">
                  Слідкуйте за своїм прогресом
                </p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={!selectedRole || isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedRole
              ? 'bg-[#E30613] text-white hover:bg-[#C70510]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Реєстрація...
            </span>
          ) : (
            'Продовжити'
          )}
        </button>
        
        <p className="text-center text-gray-500 text-xs mt-4">
          Роль тренера призначає адміністратор
        </p>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  const handleRegister = useCallback(async (role: string) => {
    if (!telegramUser) return;
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: String(telegramUser.id),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          role
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        useStore.setState({
          token: data.accessToken,
          user: data.user,
          isAuthenticated: true
        });
        setNeedsRegistration(false);
        
        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }, [telegramUser]);

  useEffect(() => {
    const initApp = async () => {
      if (typeof window === 'undefined') {
        setIsInitialized(true);
        return;
      }

      try {
        const tg = window.Telegram?.WebApp;
        const hasTelegramUser = tg?.initDataUnsafe?.user?.id;
        
        // Initialize Telegram WebApp
        if (tg) {
          try {
            tg.ready();
            tg.expand();
            
            // Set theme colors
            tg.setHeaderColor('#ffffff');
            tg.setBackgroundColor('#f9fafb');
            
            // Enable closing confirmation if user has unsaved changes
            // tg.enableClosingConfirmation();
          } catch (e) {
            console.error('TG init error:', e);
          }
        }
        
        // Authenticate based on context
        if (hasTelegramUser && tg?.initData) {
          // Running inside Telegram Mini App with real user
          setTelegramUser(tg.initDataUnsafe.user);
          
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: tg.initData })
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Check if user needs registration (no role)
              if (data.user.role === null || data.user.status === 'PENDING_REGISTRATION') {
                setNeedsRegistration(true);
                setIsInitialized(true);
                return;
              }
              
              localStorage.setItem('token', data.accessToken);
              useStore.setState({
                token: data.accessToken,
                user: data.user,
                isAuthenticated: true
              });
            } else {
              // Auth failed - might be new user
              setNeedsRegistration(true);
            }
          } catch (error) {
            console.error('Telegram auth error:', error);
          }
        } else {
          // Not in Telegram - use regular token-based auth
          const token = localStorage.getItem('token');
          if (token) {
            useStore.setState({ token });
            try {
              const response = await fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (response.ok) {
                const user = await response.json();
                useStore.setState({ user, isAuthenticated: true });
              } else {
                localStorage.removeItem('token');
                useStore.setState({ token: null, user: null, isAuthenticated: false });
              }
            } catch (error) {
              console.error('User fetch error:', error);
              localStorage.removeItem('token');
              useStore.setState({ token: null, user: null, isAuthenticated: false });
            }
          }
        }
      } catch (error) {
        console.error('Init error:', error);
      }
      
      setIsInitialized(true);
    };
    
    initApp();
  }, []);

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-[#E30613] border-t-transparent" />
          <p className="mt-4 text-gray-500 text-sm">Завантаження...</p>
        </div>
      </div>
    );
  }

  // Show registration form for new Telegram users
  if (needsRegistration && telegramUser) {
    return <RegistrationForm telegramUser={telegramUser} onRegister={handleRegister} />;
  }

  return <>{children}</>;
}
