"use client";

import React, { useEffect } from "react";
import { 
  Calendar, 
  CreditCard, 
  Clock,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Target,
  Flame,
  MapPin
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, getRelativeDay } from "@/lib/utils";
import Link from "next/link";

export function ParentDashboard() {
  const { user, children, schedule, payments, feed, fetchChildren, fetchSchedule, fetchPayments, fetchFeed } = useStore();

  useEffect(() => {
    fetchChildren();
    fetchSchedule();
    fetchPayments();
    fetchFeed();
  }, [fetchChildren, fetchSchedule, fetchPayments, fetchFeed]);

  // Get next training
  const nextTraining = schedule.find(s => 
    s.status === 'ACTIVE' && new Date(s.date) >= new Date()
  );

  // Get pending payments
  const pendingPayments = payments.filter(p => 
    p.status === 'PENDING' || p.status === 'UNDER_REVIEW'
  );

  // Get latest news
  const latestNews = feed.slice(0, 2);

  // Mock attendance data for demo
  const attendancePercent = 83;

  return (
    <div className="min-h-screen bg-white" data-testid="parent-dashboard">
      <Header />
      
      <div className="pt-16 pb-28">
        {/* Hero Welcome Section */}
        <div className="bg-[#0F0F10] px-6 py-8 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E30613] rounded-full opacity-20" />
          
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-1">Вітаємо в школі</p>
            <h1 className="font-heading text-2xl font-bold text-white mb-4">
              АТАКА
            </h1>
            
            {/* Next Training Card */}
            {nextTraining && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#E30613] font-semibold uppercase tracking-wide">
                    Наступне заняття
                  </span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="font-heading text-xl font-bold text-white mb-1">
                  {getRelativeDay(nextTraining.date)}, {nextTraining.startTime}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {nextTraining.group?.name} • {nextTraining.location?.name}
                </p>
                <button 
                  className="flex items-center gap-2 text-[#E30613] font-semibold text-sm"
                  data-testid="report-absence-btn"
                >
                  <AlertCircle className="h-4 w-4" />
                  Не зможемо прийти
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-6">
          {/* Children Section */}
          <section>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="font-heading text-lg font-bold">Мої діти</h2>
              <Link href="/profile" className="text-sm text-[#E30613] font-medium">
                Усі
              </Link>
            </div>
            
            <div className="space-y-3">
              {children.length === 0 ? (
                <div className="ataka-card p-6 text-center" data-testid="no-children-card">
                  <p className="text-gray-500 mb-4">У вас ще немає доданих дітей</p>
                  <button className="ataka-btn-primary">Додати дитину</button>
                </div>
              ) : (
                children.map((child) => (
                  <Link href={`/profile/child/${child.id}`} key={child.id}>
                    <div 
                      className="ataka-card p-4 flex items-center justify-between"
                      data-testid={`child-card-${child.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-[#E30613]/20">
                          <AvatarFallback className="bg-[#E30613]/10 text-[#E30613] font-bold text-lg">
                            {child.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-heading font-bold text-[#0F0F10]">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {child.group?.name || "Без групи"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Дисципліна</p>
                          <p className={`font-bold ${attendancePercent >= 80 ? 'text-green-600' : attendancePercent >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {attendancePercent}%
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Progress Section */}
          {children.length > 0 && (
            <section className="ataka-card-highlight p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#E30613] rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-heading font-bold">Ціль місяця</p>
                  <p className="text-sm text-gray-500">Відвідати 12 тренувань</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#E30613] h-3 rounded-full transition-all"
                    style={{ width: '67%' }}
                  />
                </div>
                <span className="font-bold text-[#0F0F10]">8/12</span>
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section>
            <h2 className="font-heading text-lg font-bold mb-4">Швидкі дії</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/schedule">
                <div 
                  className="ataka-card p-5 text-center hover:border-[#E30613]/30 transition-colors"
                  data-testid="quick-schedule-btn"
                >
                  <div className="w-12 h-12 bg-[#0F0F10] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-heading font-semibold">Розклад</p>
                </div>
              </Link>
              <Link href="/profile/payments">
                <div 
                  className="ataka-card p-5 text-center hover:border-[#E30613]/30 transition-colors relative"
                  data-testid="quick-payments-btn"
                >
                  <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-heading font-semibold">Оплати</p>
                  {pendingPayments.length > 0 && (
                    <span className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#E30613] text-white text-xs flex items-center justify-center font-bold pulse-red">
                      {pendingPayments.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </section>

          {/* Payments Alert */}
          {pendingPayments.length > 0 && (
            <section 
              className="bg-[#FFF8E1] border border-[#F59E0B]/30 rounded-2xl p-5"
              data-testid="payments-alert"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="font-heading font-bold mb-1">Очікують оплати</p>
                  <p className="text-sm text-gray-600 mb-3">
                    {pendingPayments.length} рахунків на суму{" "}
                    <span className="font-bold text-[#0F0F10]">
                      {formatCurrency(pendingPayments.reduce((acc, p) => acc + p.amount, 0))}
                    </span>
                  </p>
                  <Link href="/profile/payments">
                    <button className="text-sm font-semibold text-[#F59E0B] hover:underline">
                      Переглянути →
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* School Life / Feed Preview */}
          {latestNews.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#E30613]" />
                  <h2 className="font-heading text-lg font-bold">Жива школа</h2>
                </div>
                <Link href="/feed" className="text-sm text-[#E30613] font-medium">
                  Усі
                </Link>
              </div>
              
              <div className="space-y-3">
                {latestNews.map((post) => (
                  <div 
                    key={post.id} 
                    className="ataka-card p-4"
                    data-testid={`news-card-${post.id}`}
                  >
                    <div className="flex items-start gap-3">
                      {post.isPinned && (
                        <Badge className="bg-[#E30613] text-white border-none">
                          Важливо
                        </Badge>
                      )}
                      <div className="flex-1">
                        <p className="font-heading font-semibold mb-1">{post.title}</p>
                        {post.body && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {post.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(post.publishedAt, 'long')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
