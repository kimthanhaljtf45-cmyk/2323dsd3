"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, getRelativeDay } from "@/lib/utils";
import { 
  ArrowLeft,
  Calendar,
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { children, schedule, payments, fetchChildren, fetchSchedule, fetchPayments } = useStore();
  const [child, setChild] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
    fetchSchedule();
    fetchPayments();
  }, [fetchChildren, fetchSchedule, fetchPayments]);

  useEffect(() => {
    if (children.length > 0 && params.id) {
      const found = children.find(c => c.id === params.id);
      setChild(found);
    }
  }, [children, params.id]);

  if (!child) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E30613] border-t-transparent" />
      </div>
    );
  }

  // Get next training for this child's group
  const nextTraining = schedule.find(s => 
    s.status === 'ACTIVE' && 
    new Date(s.date) >= new Date() &&
    s.group?.id === child.groupId
  );

  // Get child's payments
  const childPayments = payments.filter(p => p.childId === child.id);
  const pendingPayment = childPayments.find(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');

  // Mock attendance data
  const attendanceData = {
    total: 12,
    present: 10,
    percent: 83,
    monthlyGoal: 12,
    currentProgress: 8
  };

  // Mock achievements
  const achievements = [
    { title: "10 тренувань без пропусків", date: "2026-03-15" },
    { title: "Перший місяць", date: "2026-02-01" },
  ];

  // Mock recent attendance
  const recentAttendance = [
    { day: "Пн", status: "present" },
    { day: "Ср", status: "warned" },
    { day: "Пт", status: "present" },
    { day: "Пн", status: "present" },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="child-detail-page">
      {/* Custom Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F10]">
        <div className="mx-auto max-w-md">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h1 className="ml-2 font-heading text-lg font-bold text-white">
              Картка учня
            </h1>
          </div>
        </div>
      </header>
      
      <div className="pt-16 pb-28">
        {/* Child Header */}
        <div className="bg-[#0F0F10] px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-[#E30613]/30">
              <AvatarFallback className="bg-[#E30613] text-white font-bold text-2xl">
                {child.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                {child.firstName}
              </h2>
              <p className="text-gray-400">
                {child.group?.name || "Без групи"}
              </p>
              {child.coach && (
                <p className="text-gray-500 text-sm mt-1">
                  Тренер: {child.coach.firstName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-5">
          {/* Next Training */}
          {nextTraining && (
            <div className="ataka-card-highlight p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#E30613] font-semibold uppercase tracking-wide">
                  Наступне заняття
                </span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="font-heading text-xl font-bold text-[#0F0F10] mb-1">
                {getRelativeDay(nextTraining.date)}, {nextTraining.startTime}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {nextTraining.location?.name}
              </p>
              <button 
                className="flex items-center gap-2 text-[#E30613] font-semibold text-sm"
                data-testid="report-absence-child-btn"
              >
                <AlertCircle className="h-4 w-4" />
                Не прийдемо
              </button>
            </div>
          )}

          {/* Discipline */}
          <div className="ataka-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold">Дисципліна</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${
                attendanceData.percent >= 80 ? 'text-green-600' : 
                attendanceData.percent >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {attendanceData.percent}%
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {attendanceData.present} з {attendanceData.total} тренувань відвідано
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        attendanceData.percent >= 80 ? 'bg-green-500' : 
                        attendanceData.percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${attendanceData.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="ataka-card p-5 rounded-2xl border-l-4 border-l-[#E30613]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E30613] rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-heading font-bold">Ціль місяця</p>
                <p className="text-sm text-gray-500">Відвідати {attendanceData.monthlyGoal} тренувань</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#E30613] h-3 rounded-full transition-all"
                  style={{ width: `${(attendanceData.currentProgress / attendanceData.monthlyGoal) * 100}%` }}
                />
              </div>
              <span className="font-bold text-[#0F0F10]">
                {attendanceData.currentProgress}/{attendanceData.monthlyGoal}
              </span>
            </div>
          </div>

          {/* Coach Comment - Mock */}
          <div className="bg-[#0F0F10] p-5 rounded-2xl">
            <p className="text-xs text-gray-400 mb-2">Коментар тренера</p>
            <p className="text-white">
              {child.firstName} став більш уважним, добре працює на тренуваннях. Рекомендую продовжувати в такому темпі!
            </p>
          </div>

          {/* Achievements */}
          <div className="ataka-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-[#E30613]" />
              <h3 className="font-heading font-bold">Досягнення</h3>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {achievements.map((ach, i) => (
                <div key={i} className="shrink-0 bg-[#E30613]/10 px-4 py-2 rounded-xl">
                  <p className="text-sm font-medium text-[#0F0F10]">{ach.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="ataka-card p-5 rounded-2xl">
            <h3 className="font-heading font-bold mb-4">Останні тренування</h3>
            
            <div className="space-y-2">
              {recentAttendance.map((att, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-[#0F0F10]">{att.day}</span>
                  <div className="flex items-center gap-2">
                    {att.status === 'present' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-sm">Був</span>
                      </>
                    )}
                    {att.status === 'absent' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 text-sm">Не був</span>
                      </>
                    )}
                    {att.status === 'warned' && (
                      <>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-600 text-sm">Попередив</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          {pendingPayment && (
            <div className="ataka-card p-5 rounded-2xl border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-yellow-600" />
                <span className="font-heading font-bold">Оплата</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mb-3">
                {formatCurrency(pendingPayment.amount)}
              </p>
              <button className="bg-[#E30613] text-white w-full py-3 rounded-xl font-semibold">
                Оплатити
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
