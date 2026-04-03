"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { usersApi } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";

// Icons
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function ProfilePage() {
  const { user, children, payments, logout, fetchChildren, fetchPayments } = useStore();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
    fetchPayments();
    
    const loadDashboard = async () => {
      try {
        const { data } = await usersApi.getDashboard();
        setDashboard(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadDashboard();
  }, [fetchChildren, fetchPayments]);

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0);
  
  // Calculate family stats
  const totalAttendance = dashboard?.children?.reduce((sum: number, c: any) => 
    sum + (c.attendance?.present || 0), 0) || 0;
  const avgDiscipline = dashboard?.children?.length > 0
    ? Math.round(dashboard.children.reduce((sum: number, c: any) => 
        sum + (c.attendance?.percent || 0), 0) / dashboard.children.length)
    : 0;

  return (
    <AppShell title="Профіль">
      <div className="px-4 py-4 space-y-4">
        {/* Profile Hero Card */}
        <div className="bg-gradient-to-br from-[#0F0F10] to-[#1a1a1b] rounded-2xl p-5 text-white">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E30613] to-[#FF6B6B] rounded-xl flex items-center justify-center text-2xl font-bold">
                {user?.firstName?.charAt(0)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg">
                <EditIcon />
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {user?.role === 'PARENT' ? 'Батько / Мати' :
                   user?.role === 'COACH' ? 'Тренер' :
                   user?.role === 'ADMIN' ? 'Адміністратор' :
                   user?.role === 'STUDENT' ? 'Учень' : user?.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                @{user?.username || user?.telegramId}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-[10px] text-gray-400">Дітей</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{avgDiscipline}%</p>
              <p className="text-[10px] text-gray-400">Дисципліна</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{totalAttendance}</p>
              <p className="text-[10px] text-gray-400">Тренувань</p>
            </div>
          </div>
        </div>

        {/* My Family Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E30613]/10 rounded-xl flex items-center justify-center">
                <UsersIcon />
              </div>
              <div>
                <h3 className="font-bold text-[#0F0F10]">Моя родина в клубі</h3>
                <p className="text-xs text-gray-500">{children.length} {children.length === 1 ? 'дитина' : 'дітей'}</p>
              </div>
            </div>
            <Link href="/profile/add-child" className="text-[#E30613] text-sm font-medium">
              + Додати
            </Link>
          </div>
          
          <div className="divide-y divide-gray-50">
            {children.map((child: any) => (
              <Link
                key={child.id}
                href={`/profile/child/${child.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#E30613]/80 to-[#E30613] rounded-xl flex items-center justify-center text-white font-bold">
                  {child.firstName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0F0F10]">
                      {child.firstName} {child.lastName}
                    </p>
                    {child.attendance?.streak >= 3 && (
                      <span className="text-amber-500 flex items-center gap-0.5 text-xs">
                        <StarIcon /> {child.attendance.streak}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{child.group?.name || 'Без групи'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      (child.attendance?.percent || 0) >= 80 ? 'bg-green-500' :
                      (child.attendance?.percent || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-[10px] text-gray-400">
                      {child.attendance?.percent || 0}% дисципліна
                    </span>
                  </div>
                </div>
                <ChevronRightIcon />
              </Link>
            ))}
            
            {children.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500 text-sm mb-3">Додайте свою дитину</p>
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

        {/* Activity Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <ActivityIcon />
            </div>
            <div>
              <h3 className="font-bold text-[#0F0F10]">Моя активність</h3>
              <p className="text-xs text-gray-500">Цього місяця</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-[#0F0F10]">{totalAttendance}</p>
              <p className="text-xs text-gray-500">Тренувань відвідано</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-600">
                {dashboard?.children?.reduce((s: number, c: any) => s + (c.attendance?.warned || 0), 0) || 0}
              </p>
              <p className="text-xs text-gray-500">Попереджень</p>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className={`bg-white rounded-xl border ${pendingPayments.length > 0 ? 'border-amber-200' : 'border-gray-100'} overflow-hidden`}>
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                pendingPayments.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              }`}>
                <CreditCardIcon />
              </div>
              <div>
                <h3 className="font-bold text-[#0F0F10]">Оплати</h3>
                {pendingPayments.length > 0 ? (
                  <p className="text-xs text-amber-600 font-medium">{pendingPayments.length} до оплати</p>
                ) : (
                  <p className="text-xs text-green-600">Все оплачено</p>
                )}
              </div>
            </div>
          </div>
          
          {pendingPayments.length > 0 && (
            <div className="p-4 bg-amber-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Сума до оплати</span>
                <span className="text-xl font-bold text-amber-600">{totalPending} грн</span>
              </div>
              <Link 
                href="/profile/payments"
                className="block w-full bg-[#0F0F10] text-white text-center py-3 rounded-xl font-semibold"
              >
                Переглянути рахунки
              </Link>
            </div>
          )}
          
          <Link 
            href="/profile/payments"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-600">Історія оплат</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs">{paidPayments.length} оплат</span>
              <ChevronRightIcon />
            </div>
          </Link>
        </div>

        {/* Communication Section */}
        <Link 
          href="/messages"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <MessageIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0F0F10]">Повідомлення</h3>
            <p className="text-xs text-gray-500">Зв'язок з тренером</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            <ChevronRightIcon />
          </div>
        </Link>

        {/* Rating Section */}
        <Link 
          href="/rating"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <TrophyIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0F0F10]">Рейтинг і успішність</h3>
            <p className="text-xs text-gray-500">Прогрес дітей у клубі</p>
          </div>
          <ChevronRightIcon />
        </Link>

        {/* Settings Menu */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0F0F10]">Налаштування</h3>
          </div>
          
          <div className="divide-y divide-gray-50">
            <Link href="/settings/profile" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <UserIcon />
              <span className="flex-1 text-sm">Особисті дані</span>
              <ChevronRightIcon />
            </Link>
            
            <Link href="/settings/notifications" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <BellIcon />
              <span className="flex-1 text-sm">Сповіщення</span>
              <ChevronRightIcon />
            </Link>
            
            <Link href="/settings" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <SettingsIcon />
              <span className="flex-1 text-sm">Налаштування додатку</span>
              <ChevronRightIcon />
            </Link>
            
            <Link href="/help" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <HelpIcon />
              <span className="flex-1 text-sm">Допомога</span>
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOutIcon />
          Вийти з акаунту
        </button>

        {/* Version Info */}
        <p className="text-center text-xs text-gray-400 pb-4">
          АТАКА Mini App v1.0.0
        </p>
      </div>
    </AppShell>
  );
}
