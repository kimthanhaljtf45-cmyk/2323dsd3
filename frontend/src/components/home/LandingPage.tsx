"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Shield, 
  Users, 
  Calendar, 
  MapPin, 
  Trophy,
  ChevronRight,
  Target,
  Flame,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { Input } from "@/components/ui/input";

const features = [
  { icon: Shield, title: "Дисципліна", desc: "Виховуємо характер та силу волі" },
  { icon: Users, title: "Групи за віком", desc: "6-8, 9-12, 13-16 років" },
  { icon: Trophy, title: "Змагання", desc: "Регулярні турніри та атестації" },
  { icon: Target, title: "Професіонали", desc: "Тренери з міжнародним досвідом" },
];

const stats = [
  { value: "15+", label: "років досвіду" },
  { value: "500+", label: "учнів" },
  { value: "200+", label: "медалей" },
];

export function LandingPage() {
  const { login } = useStore();
  const [showLogin, setShowLogin] = useState(false);
  const [telegramId, setTelegramId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!telegramId || !firstName) return;
    
    setIsLoggingIn(true);
    try {
      await login(telegramId, firstName);
    } catch (error) {
      console.error(error);
      alert("Помилка входу");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoggingIn(true);
    try {
      const demoAccounts: Record<string, { id: string; name: string }> = {
        parent: { id: "100000004", name: "Ірина" },
        coach: { id: "100000002", name: "Олександр" },
        admin: { id: "100000001", name: "Адміністратор" },
      };
      const account = demoAccounts[role];
      if (account) {
        await login(account.id, account.name);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* HERO SECTION - Black with red accents */}
      <section className="relative min-h-[85vh] bg-[#0F0F10] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 ataka-pattern" />
        
        {/* Red circle accent */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E30613] rounded-full opacity-10" />
        <div className="absolute bottom-20 -left-10 w-40 h-40 bg-[#E30613] rounded-full opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="relative w-32 h-32 mb-4">
              <Image 
                src="/images/logo-ataka.png" 
                alt="АТАКА Team Kostenko" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="font-heading text-5xl font-bold text-white tracking-tight">
              АТАКА
            </h1>
          </div>

          {/* Main Message */}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 max-w-sm leading-tight">
            Виховуємо силу.<br/>
            Дисципліну.<br/>
            Характер.
          </h2>
          
          <p className="text-gray-400 text-lg mb-10 max-w-xs">
            Тренування для дітей 6–16 років.<br/>
            Шлях воїна починається тут.
          </p>

          {!showLogin ? (
            <div className="w-full max-w-xs space-y-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full flex items-center justify-center gap-2 text-lg bg-[#E30613] text-white font-semibold py-4 px-6 rounded-xl hover:bg-[#C30510] transition-colors"
                data-testid="get-started-btn"
              >
                <Flame className="h-5 w-5" />
                Записатись на пробне
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full py-4 px-6 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors"
                data-testid="login-btn"
              >
                Увійти в кабінет
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xs bg-white rounded-2xl p-6 text-left">
              <h3 className="font-heading text-xl font-bold text-[#0F0F10] mb-4 text-center">
                Демо вхід
              </h3>
              
              <div className="space-y-3 mb-4">
                <Input
                  placeholder="Telegram ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="border-gray-200"
                  data-testid="telegram-id-input"
                />
                <Input
                  placeholder="Ім'я"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-gray-200"
                  data-testid="first-name-input"
                />
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn || !telegramId || !firstName}
                  className="ataka-btn-primary w-full disabled:opacity-50"
                  data-testid="submit-login-btn"
                >
                  {isLoggingIn ? "Вхід..." : "Увійти"}
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-3 text-center">Або увійти як:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleDemoLogin("parent")}
                    disabled={isLoggingIn}
                    className="text-sm py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    data-testid="demo-parent-btn"
                  >
                    Батько
                  </button>
                  <button 
                    onClick={() => handleDemoLogin("coach")}
                    disabled={isLoggingIn}
                    className="text-sm py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    data-testid="demo-coach-btn"
                  >
                    Тренер
                  </button>
                  <button 
                    onClick={() => handleDemoLogin("admin")}
                    disabled={isLoggingIn}
                    className="text-sm py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    data-testid="demo-admin-btn"
                  >
                    Адмін
                  </button>
                </div>
              </div>
              
              <button 
                className="mt-4 text-sm text-gray-500 underline w-full text-center"
                onClick={() => setShowLogin(false)}
              >
                Назад
              </button>
            </div>
          )}
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-6 w-6 text-white/50 rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <h2 className="font-heading text-2xl font-bold text-center mb-2">
          Чому обирають
        </h2>
        <p className="text-center text-[#E30613] font-heading font-bold text-xl mb-10">
          АТАКУ
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="ataka-card p-5 text-center"
              data-testid={`feature-card-${i}`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E30613]/10 rounded-xl mb-3">
                <feature.icon className="h-6 w-6 text-[#E30613]" />
              </div>
              <h3 className="font-heading font-bold text-[#0F0F10] mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - Dark */}
      <section className="px-6 py-14 bg-[#0F0F10]">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
          {stats.map((stat, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <p className="font-heading text-4xl font-bold text-[#E30613]">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Path of Warrior Section */}
      <section className="px-6 py-16 bg-white">
        <h2 className="font-heading text-2xl font-bold text-center mb-10">
          Шлях учня
        </h2>
        
        <div className="max-w-md mx-auto space-y-4">
          {[
            { level: "Новачок", desc: "Перші кроки та основи", color: "bg-gray-200" },
            { level: "Учень", desc: "Розвиток техніки", color: "bg-yellow-100" },
            { level: "Боєць", desc: "Перші змагання", color: "bg-orange-100" },
            { level: "Лідер", desc: "Майстерність та наставництво", color: "bg-[#E30613]/10" },
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${step.color}`}>
              <div className="w-10 h-10 rounded-full bg-[#0F0F10] flex items-center justify-center text-white font-bold">
                {i + 1}
              </div>
              <div>
                <p className="font-heading font-bold text-[#0F0F10]">{step.level}</p>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations Section */}
      <section className="px-6 py-14 bg-[#F5F5F5]">
        <div className="max-w-md mx-auto text-center">
          <MapPin className="h-10 w-10 mx-auto mb-4 text-[#E30613]" />
          <h3 className="font-heading text-xl font-bold mb-2">
            2 зали у Києві
          </h3>
          <p className="text-gray-600 mb-6">
            Оболонь та Позняки.<br/>
            Оберіть зручну локацію.
          </p>
          <button 
            className="ataka-btn-secondary"
            data-testid="view-locations-btn"
          >
            Переглянути адреси
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 bg-[#E30613] text-white text-center">
        <Award className="h-12 w-12 mx-auto mb-4 opacity-80" />
        <h2 className="font-heading text-2xl font-bold mb-3">
          Готові почати?
        </h2>
        <p className="text-white/80 mb-8 max-w-xs mx-auto">
          Запишіть дитину на безкоштовне пробне заняття
        </p>
        <button 
          onClick={() => setShowLogin(true)}
          className="bg-white text-[#E30613] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all"
        >
          Записатись зараз
        </button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#0F0F10] text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <Image 
            src="/images/logo-ataka.png" 
            alt="АТАКА" 
            fill
            className="object-contain"
          />
        </div>
        <p className="text-gray-400 text-sm">
          © 2026 АТАКА Team Kostenko
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Telegram Mini App
        </p>
      </footer>
    </div>
  );
}
