"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { formatCurrency, getRelativeDay } from "@/lib/utils";
import { 
  ClockIcon, 
  AlertCircleIcon, 
  ChevronRightIcon,
  CalendarIcon,
  CreditCardIcon,
  TargetIcon,
  FlameIcon,
  BellIcon
} from "@/components/icons";

export function ParentHome() {
  const { user, children, schedule, payments, feed } = useStore();

  // Get next training
  const nextTraining = schedule.find(s => 
    s.status === 'ACTIVE' && new Date(s.date) >= new Date()
  );

  // Pending payments
  const pendingPayments = payments.filter(p => 
    p.status === 'PENDING' || p.status === 'UNDER_REVIEW'
  );
  const totalPending = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  // Latest feed
  const latestNews = feed.slice(0, 2);

  // Mock attendance - in real app comes from API
  const attendancePercent = 83;
  const monthlyGoal = { current: 8, target: 12 };

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="parent-home">
      {/* Header with hero */}
      <div className="bg-[#0F0F10] px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo-ataka.png" 
              alt="АТАКА" 
              width={32} 
              height={32}
              className="rounded-full"
            />
            <span className="font-heading font-bold text-white">АТАКА</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 relative" data-testid="notifications-btn">
            <BellIcon size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E30613] rounded-full" />
          </button>
        </div>

        {/* Next Training Card */}
        {nextTraining && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#E30613] font-bold uppercase tracking-wide">
                Наступне заняття
              </span>
              <ClockIcon size={14} className="text-gray-400" />
            </div>
            <p className="font-heading text-lg font-bold text-white">
              {getRelativeDay(nextTraining.date)}, {nextTraining.startTime}
            </p>
            <p className="text-gray-400 text-sm mb-3">
              {nextTraining.group?.name} • {nextTraining.location?.name}
            </p>
            <Link href="/absence">
              <button className="flex items-center gap-1.5 text-[#E30613] font-medium text-sm">
                <AlertCircleIcon size={14} />
                Не зможемо прийти
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="px-4 space-y-5 -mt-2">
        {/* Children Section */}
        <section className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-[#0F0F10]">Мої діти</h2>
            <Link href="/profile" className="text-xs text-[#E30613] font-medium">Усі</Link>
          </div>
          
          {children.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-5 text-center" data-testid="no-children">
              <p className="text-gray-500 text-sm mb-3">Немає доданих дітей</p>
              <button className="bg-[#E30613] text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                Додати дитину
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <Link href={`/child/${child.id}`} key={child.id}>
                  <div 
                    className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center justify-between"
                    data-testid={`child-card-${child.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#E30613]/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-[#E30613]">{child.firstName[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F0F10] text-sm">{child.firstName}</p>
                        <p className="text-xs text-gray-500">{child.group?.name || "Без групи"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Дисципліна</p>
                        <p className={`font-bold text-sm ${
                          attendancePercent >= 80 ? 'text-green-600' : 
                          attendancePercent >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attendancePercent}%
                        </p>
                      </div>
                      <ChevronRightIcon size={16} className="text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Monthly Goal */}
        {children.length > 0 && (
          <section className="bg-[#FFFBFB] border border-[#E30613]/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#E30613] rounded-lg flex items-center justify-center">
                <TargetIcon size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#0F0F10] text-sm">Ціль місяця</p>
                <p className="text-xs text-gray-500">Відвідати {monthlyGoal.target} тренувань</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#E30613] h-2 rounded-full"
                  style={{ width: `${(monthlyGoal.current / monthlyGoal.target) * 100}%` }}
                />
              </div>
              <span className="font-bold text-sm text-[#0F0F10]">
                {monthlyGoal.current}/{monthlyGoal.target}
              </span>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-bold text-[#0F0F10] mb-3">Швидкі дії</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/schedule">
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center" data-testid="action-schedule">
                <div className="w-11 h-11 bg-[#0F0F10] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CalendarIcon size={20} className="text-white" />
                </div>
                <p className="font-medium text-sm">Розклад</p>
              </div>
            </Link>
            <Link href="/profile/payments">
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center relative" data-testid="action-payments">
                <div className="w-11 h-11 bg-[#E30613] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CreditCardIcon size={20} className="text-white" />
                </div>
                <p className="font-medium text-sm">Оплати</p>
                {pendingPayments.length > 0 && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-[#E30613] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingPayments.length}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </section>

        {/* Payment Alert */}
        {pendingPayments.length > 0 && (
          <section className="bg-[#FFF8E6] border border-[#F59E0B]/20 rounded-xl p-4" data-testid="payment-alert">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircleIcon size={18} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">Очікують оплати</p>
                <p className="text-xs text-gray-600 mb-2">
                  {pendingPayments.length} рахунків на суму{" "}
                  <span className="font-bold">{formatCurrency(totalPending)}</span>
                </p>
                <Link href="/profile/payments">
                  <span className="text-xs font-medium text-[#F59E0B]">Переглянути →</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Feed Preview */}
        {latestNews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FlameIcon size={18} className="text-[#E30613]" />
                <h2 className="font-heading font-bold text-[#0F0F10]">Жива школа</h2>
              </div>
              <Link href="/feed" className="text-xs text-[#E30613] font-medium">Усі</Link>
            </div>
            
            <div className="space-y-2">
              {latestNews.map((post) => (
                <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-3.5" data-testid={`feed-${post.id}`}>
                  <p className="font-semibold text-sm text-[#0F0F10] mb-1">{post.title}</p>
                  {post.body && (
                    <p className="text-xs text-gray-500 line-clamp-2">{post.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
