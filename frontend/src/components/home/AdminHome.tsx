"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { 
  UsersIcon,
  CreditCardIcon,
  CalendarIcon,
  TargetIcon,
  TrendingUpIcon,
  FlameIcon,
  BellIcon,
  ChevronRightIcon
} from "@/components/icons";

export function AdminHome() {
  const { user } = useStore();

  // Mock dashboard data - in real app comes from /admin/dashboard API
  const stats = {
    totalStudents: 127,
    activeGroups: 8,
    pendingPayments: 15,
    totalPending: 45000,
    todayAttendance: 85,
    newTrials: 4
  };

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="admin-home">
      {/* Header */}
      <div className="bg-[#0F0F10] px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo-ataka.png" 
              alt="АТАКА" 
              width={32} 
              height={32}
              className="rounded-full"
            />
            <div>
              <span className="font-heading font-bold text-white text-sm">Адмін панель</span>
              <p className="text-xs text-gray-400">АТАКА</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 relative">
            <BellIcon size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E30613] rounded-full" />
          </button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-white">{stats.totalStudents}</p>
            <p className="text-[10px] text-gray-400">Учнів</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-white">{stats.activeGroups}</p>
            <p className="text-[10px] text-gray-400">Груп</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="font-heading text-2xl font-bold text-green-400">{stats.todayAttendance}%</p>
            <p className="text-[10px] text-gray-400">Сьогодні</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-5">
        {/* Pending Payments Alert */}
        <section className="bg-[#FFF8E6] border border-[#F59E0B]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                <CreditCardIcon size={18} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Очікують оплати</p>
                <p className="text-xs text-gray-600">
                  {stats.pendingPayments} рахунків • {stats.totalPending.toLocaleString()} грн
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-gray-400" />
          </div>
        </section>

        {/* New Trials Alert */}
        {stats.newTrials > 0 && (
          <section className="bg-[#ECFDF5] border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <FlameIcon size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Нові заявки на пробне</p>
                  <p className="text-xs text-gray-600">{stats.newTrials} заявки</p>
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-gray-400" />
            </div>
          </section>
        )}

        {/* Quick Actions Grid */}
        <section>
          <h2 className="font-heading font-bold text-[#0F0F10] mb-3">Керування</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/students">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-students">
                <UsersIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Учні</p>
                <p className="text-xs text-gray-500">{stats.totalStudents} активних</p>
              </div>
            </Link>
            <Link href="/admin/groups">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-groups">
                <TargetIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Групи</p>
                <p className="text-xs text-gray-500">{stats.activeGroups} груп</p>
              </div>
            </Link>
            <Link href="/admin/payments">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-payments">
                <CreditCardIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Оплати</p>
                <p className="text-xs text-gray-500">{stats.pendingPayments} pending</p>
              </div>
            </Link>
            <Link href="/admin/schedule">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-schedule">
                <CalendarIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Розклад</p>
                <p className="text-xs text-gray-500">Керувати</p>
              </div>
            </Link>
            <Link href="/admin/feed">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-feed">
                <FlameIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Контент</p>
                <p className="text-xs text-gray-500">Стрічка</p>
              </div>
            </Link>
            <Link href="/admin/analytics">
              <div className="bg-white border border-gray-100 rounded-xl p-4" data-testid="admin-analytics">
                <TrendingUpIcon size={22} className="text-[#E30613] mb-2" />
                <p className="font-medium text-sm">Аналітика</p>
                <p className="text-xs text-gray-500">Статистика</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
