"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { AppShell } from "@/components/layout/AppShell";
import { usersApi } from "@/lib/api";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { uk } from "date-fns/locale";

// Icons
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const formatDateLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Сьогодні";
  if (isTomorrow(date)) return "Завтра";
  return format(date, "EEEE, d MMMM", { locale: uk });
};

export function ParentHome() {
  const { user, children, payments, feed } = useStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await usersApi.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  const nextTraining = dashboard?.nextTraining;
  const dashboardChildren = dashboard?.children || children;

  return (
    <AppShell title="Головна">
      <div className="px-4 py-4 space-y-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F0F10]">
              Привіт, {user?.firstName}! 👋
            </h2>
            <p className="text-sm text-gray-500">
              {format(new Date(), "EEEE, d MMMM", { locale: uk })}
            </p>
          </div>
          <div className="relative w-12 h-12">
            <Image 
              src="/images/logo-ataka.png" 
              alt="АТАКА" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>

        {/* Next Training Card */}
        {nextTraining && (
          <div className="bg-gradient-to-br from-[#E30613] to-[#C70510] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-xs text-white/80">Найближче тренування</p>
                <p className="font-bold">{formatDateLabel(nextTraining.date)}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon />
                <span>{nextTraining.startTime} - {nextTraining.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon />
                <span>{nextTraining.location?.name || nextTraining.group?.location?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserIcon />
                <span>{nextTraining.group?.name}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link 
                href="/absence"
                className="flex-1 bg-white/20 backdrop-blur text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
              >
                Не прийдемо
              </Link>
              <Link 
                href="/schedule"
                className="flex-1 bg-white text-[#E30613] text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Розклад
              </Link>
            </div>
          </div>
        )}

        {/* Important Alerts */}
        {pendingPayments.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-800 text-sm">
                  {pendingPayments.length} неоплачених рахунків
                </p>
                <p className="text-xs text-amber-600">
                  Загалом: {pendingPayments.reduce((s, p) => s + p.amount, 0)} грн
                </p>
              </div>
              <Link 
                href="/profile/payments"
                className="text-amber-700 hover:text-amber-900"
              >
                <ChevronRightIcon />
              </Link>
            </div>
          </div>
        )}

        {/* My Children Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#0F0F10]">Мої діти</h3>
            <Link href="/profile" className="text-sm text-[#E30613] font-medium">
              Усі
            </Link>
          </div>
          
          <div className="space-y-3">
            {dashboardChildren.map((child: any) => (
              <Link
                key={child.id}
                href={`/profile/child/${child.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E30613] to-[#C70510] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {child.firstName?.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#0F0F10]">
                        {child.firstName} {child.lastName}
                      </h4>
                      {child.attendance?.streak && child.attendance.streak >= 3 && (
                        <span className="text-amber-500 flex items-center gap-0.5 text-xs">
                          <StarIcon /> {child.attendance.streak}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {child.group?.name || 'Група не призначена'}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mt-2">
                      {child.attendance && (
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            child.attendance.percent >= 80 ? 'bg-green-500' :
                            child.attendance.percent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-600">
                            {child.attendance.percent}% відвідувань
                          </span>
                        </div>
                      )}
                      {child.goal && (
                        <span className="text-xs text-gray-400">
                          {child.goal.current}/{child.goal.target} цей місяць
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRightIcon />
                </div>
              </Link>
            ))}
            
            {dashboardChildren.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-3">
                  У вас ще немає доданих дітей
                </p>
                <Link 
                  href="/profile/add-child"
                  className="inline-block bg-[#E30613] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  + Додати дитину
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold text-[#0F0F10] mb-3">Швидкі дії</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: CalendarIcon, label: "Розклад", href: "/schedule", color: "bg-blue-50 text-blue-600" },
              { icon: CreditCardIcon, label: "Оплати", href: "/profile/payments", color: "bg-green-50 text-green-600" },
              { icon: XCircleIcon, label: "Пропуск", href: "/absence", color: "bg-amber-50 text-amber-600" },
              { icon: MessageIcon, label: "Написати", href: "/messages", color: "bg-purple-50 text-purple-600" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon />
                </div>
                <span className="text-[11px] font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        {dashboardChildren.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E30613]/10 rounded-lg flex items-center justify-center">
                <TrophyIcon />
              </div>
              <h3 className="font-bold text-[#0F0F10]">Прогрес цього місяця</h3>
            </div>
            
            <div className="space-y-3">
              {dashboardChildren.slice(0, 2).map((child: any) => (
                <div key={child.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20 truncate">{child.firstName}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E30613] to-[#FF6B6B] rounded-full transition-all"
                      style={{ width: `${child.goal ? (child.goal.current / child.goal.target) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {child.goal?.current || 0}/{child.goal?.target || 12}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Club Life Preview */}
        {feed.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#0F0F10]">Життя клубу</h3>
              <Link href="/feed" className="text-sm text-[#E30613] font-medium">
                Усі
              </Link>
            </div>
            
            <div className="space-y-3">
              {feed.slice(0, 2).map((post) => (
                <div 
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      post.type === 'EVENT' ? 'bg-purple-100 text-purple-600' :
                      post.type === 'ANNOUNCEMENT' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {post.type === 'EVENT' ? '🏆' : post.type === 'ANNOUNCEMENT' ? '📢' : '📰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0F0F10] line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {post.body}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {format(parseISO(post.publishedAt), "d MMM, HH:mm", { locale: uk })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
