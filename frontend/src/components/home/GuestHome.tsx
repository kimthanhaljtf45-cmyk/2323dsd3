"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { Input } from "@/components/ui/input";
import { 
  ShieldIcon, 
  UsersIcon, 
  TrophyIcon, 
  TargetIcon, 
  MapPinIcon,
  ChevronRightIcon,
  FlameIcon
} from "@/components/icons";

export function GuestHome() {
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
      const accounts: Record<string, { id: string; name: string }> = {
        parent: { id: "100000004", name: "Ірина" },
        student: { id: "100000010", name: "Артем" },
        coach: { id: "100000002", name: "Олександр" },
        admin: { id: "100000001", name: "Адміністратор" },
      };
      const acc = accounts[role];
      if (acc) await login(acc.id, acc.name);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="guest-home">
      {/* HERO */}
      <section className="relative bg-[#0F0F10] overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#E30613] rounded-full opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center pt-12 pb-8 px-6 text-center">
          <div className="relative w-28 h-28 mb-6">
            <Image 
              src="/images/logo-ataka.png" 
              alt="АТАКА Team Kostenko" 
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="font-heading text-3xl font-bold text-white mb-4 leading-tight">
            Виховуємо силу.<br/>
            Дисципліну.<br/>
            Характер.
          </h1>
          
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
            Тренування для дітей 6–16 років.<br/>
            Шлях воїна починається тут.
          </p>

          {!showLogin ? (
            <div className="w-full max-w-xs space-y-3">
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full bg-[#E30613] text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2"
                data-testid="trial-btn"
              >
                <FlameIcon size={20} />
                Записатись на пробне
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full border-2 border-white/30 text-white font-medium py-3 px-6 rounded-xl"
                data-testid="login-btn"
              >
                Увійти в кабінет
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xs bg-white rounded-2xl p-5 text-left">
              <h3 className="font-heading text-lg font-bold text-[#0F0F10] mb-4 text-center">
                Демо вхід
              </h3>
              
              <div className="space-y-3 mb-4">
                <Input
                  placeholder="Telegram ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="h-11"
                  data-testid="telegram-id-input"
                />
                <Input
                  placeholder="Ім'я"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                  data-testid="first-name-input"
                />
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn || !telegramId || !firstName}
                  className="w-full bg-[#E30613] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  data-testid="submit-login-btn"
                >
                  {isLoggingIn ? "Вхід..." : "Увійти"}
                </button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-3 text-center">Або увійти як:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'student', label: '🧒 Учень' },
                    { key: 'parent', label: '👨‍👩‍👧 Батько' },
                    { key: 'coach', label: '🥋 Тренер' },
                    { key: 'admin', label: '⚙️ Адмін' }
                  ].map((item) => (
                    <button 
                      key={item.key}
                      onClick={() => handleDemoLogin(item.key)}
                      disabled={isLoggingIn}
                      className="text-xs py-2.5 px-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                      data-testid={`demo-${item.key}-btn`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                className="mt-4 text-xs text-gray-400 underline w-full text-center"
                onClick={() => setShowLogin(false)}
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-10">
        <h2 className="font-heading text-xl font-bold text-center mb-6">
          Чому обирають <span className="text-[#E30613]">АТАКУ</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ShieldIcon, title: "Дисципліна", desc: "Виховуємо характер" },
            { icon: UsersIcon, title: "Групи за віком", desc: "6-8, 9-12, 13-16 років" },
            { icon: TrophyIcon, title: "Змагання", desc: "Турніри та атестації" },
            { icon: TargetIcon, title: "Досвід", desc: "15+ років" },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4" data-testid={`feature-${i}`}>
              <div className="w-10 h-10 bg-[#E30613]/10 rounded-lg flex items-center justify-center mb-3">
                <f.icon size={20} className="text-[#E30613]" />
              </div>
              <p className="font-semibold text-[#0F0F10] text-sm">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="px-5 py-8 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <MapPinIcon size={24} className="text-[#E30613]" />
          <div>
            <h3 className="font-heading font-bold">4 зали у Києві</h3>
            <p className="text-xs text-gray-500">Оберіть зручну локацію</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { name: "Позняки", address: "Анни Ахматової, 13В", schedule: "Пн Ср Пт" },
            { name: "Відрадний", address: "Новопольова, 106", schedule: "Пн-Пт" },
            { name: "Шалімова", address: "Академіка Шалімова, 43", schedule: "Вт Чт Сб" },
            { name: "Соломʼянка", address: "Авіаконструктора Антонова, 4", schedule: "Вт Чт" },
          ].map((loc, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#0F0F10]">{loc.name}</p>
                  <p className="text-xs text-gray-500">{loc.address}</p>
                </div>
                <span className="text-xs bg-[#E30613]/10 text-[#E30613] px-2 py-1 rounded-full font-medium">
                  {loc.schedule}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 bg-[#0F0F10] text-center">
        <div className="relative w-10 h-10 mx-auto mb-2">
          <Image src="/images/logo-ataka.png" alt="АТАКА" fill className="object-contain" />
        </div>
        <p className="text-gray-500 text-xs">© 2026 АТАКА Team Kostenko</p>
      </footer>
    </div>
  );
}
