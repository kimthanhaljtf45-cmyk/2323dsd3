"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { formatDate, formatCurrency, getRelativeDay } from "@/lib/utils";
import { 
  ChevronLeftIcon,
  ClockIcon, 
  MapPinIcon, 
  AlertCircleIcon,
  TargetIcon,
  AwardIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  MessageIcon
} from "@/components/icons";

export default function ChildPage() {
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
        <div className="w-8 h-8 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get next training for this child's group
  const nextTraining = schedule.find(s => 
    s.status === 'ACTIVE' && 
    new Date(s.date) >= new Date() &&
    s.group?.id === child.groupId
  );

  // Child's payments
  const childPayments = payments.filter(p => p.childId === child.id);
  const pendingPayment = childPayments.find(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');

  // Mock data (in real app from API)
  const attendance = {
    total: 12,
    present: 10,
    percent: 83,
    goal: { target: 12, current: 8 }
  };

  const achievements = [
    { title: "10 тренувань без пропусків", date: "2026-03-15" },
    { title: "Перший місяць", date: "2026-02-01" },
  ];

  const recentAttendance = [
    { day: "Пн", date: "31.03", status: "PRESENT" },
    { day: "Ср", date: "02.04", status: "WARNED" },
    { day: "Пт", date: "04.04", status: "PRESENT" },
    { day: "Пн", date: "07.04", status: "PRESENT" },
  ];

  const coachComment = "Став більш уважним, добре працює на тренуваннях. Рекомендую продовжувати в такому темпі!";

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="child-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F10]">
        <div className="mx-auto max-w-md">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => router.back()}
              className="p-1 -ml-1 mr-2 text-white"
              data-testid="back-btn"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <h1 className="font-heading text-base font-bold text-white">
              Картка учня
            </h1>
          </div>
        </div>
      </header>

      {/* Child Header */}
      <div className="bg-[#0F0F10] pt-14 px-4 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#E30613] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{child.firstName[0]}</span>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">{child.firstName}</h2>
            <p className="text-gray-400 text-sm">{child.group?.name || "Без групи"}</p>
            {child.coach && (
              <p className="text-gray-500 text-xs mt-0.5">Тренер: {child.coach.firstName}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2 pt-4">
        {/* Next Training */}
        {nextTraining && (
          <section className="bg-[#FFFBFB] border border-[#E30613]/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#E30613] font-bold uppercase tracking-wide">
                Наступне заняття
              </span>
              <ClockIcon size={14} className="text-gray-400" />
            </div>
            <p className="font-heading text-lg font-bold text-[#0F0F10]">
              {getRelativeDay(nextTraining.date)}, {nextTraining.startTime}
            </p>
            <p className="text-gray-500 text-sm mb-3">{nextTraining.location?.name}</p>
            <Link href="/absence">
              <button className="flex items-center gap-1.5 text-[#E30613] font-medium text-sm">
                <AlertCircleIcon size={14} />
                Не прийдемо
              </button>
            </Link>
          </section>
        )}

        {/* Discipline */}
        <section className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#0F0F10]">Дисципліна</h3>
            <TrendingUpIcon size={18} className="text-green-600" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${
              attendance.percent >= 80 ? 'text-green-600' : 
              attendance.percent >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {attendance.percent}%
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">
                {attendance.present} з {attendance.total} тренувань
              </p>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    attendance.percent >= 80 ? 'bg-green-500' : 
                    attendance.percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${attendance.percent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Goal */}
        <section className="bg-white border border-gray-100 rounded-xl p-4 border-l-4 border-l-[#E30613]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#E30613] rounded-lg flex items-center justify-center">
              <TargetIcon size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Ціль місяця</p>
              <p className="text-xs text-gray-500">Відвідати {attendance.goal.target} тренувань</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[#E30613] h-2.5 rounded-full"
                style={{ width: `${(attendance.goal.current / attendance.goal.target) * 100}%` }}
              />
            </div>
            <span className="font-bold text-sm">{attendance.goal.current}/{attendance.goal.target}</span>
          </div>
        </section>

        {/* Coach Comment */}
        <section className="bg-[#0F0F10] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageIcon size={14} className="text-gray-400" />
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Коментар тренера</span>
          </div>
          <p className="text-white text-sm leading-relaxed">{coachComment}</p>
        </section>

        {/* Achievements */}
        <section className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AwardIcon size={18} className="text-[#E30613]" />
            <h3 className="font-semibold text-[#0F0F10]">Досягнення</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {achievements.map((ach, i) => (
              <div key={i} className="shrink-0 bg-[#E30613]/10 px-3 py-2 rounded-lg">
                <p className="text-xs font-medium text-[#0F0F10]">{ach.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Attendance */}
        <section className="bg-white border border-gray-100 rounded-xl p-4">
          <h3 className="font-semibold text-[#0F0F10] mb-3">Останні тренування</h3>
          <div className="space-y-2">
            {recentAttendance.map((att, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-sm text-[#0F0F10]">{att.day}</span>
                  <span className="text-xs text-gray-400 ml-2">{att.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {att.status === 'PRESENT' && (
                    <>
                      <CheckCircleIcon size={14} className="text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Був</span>
                    </>
                  )}
                  {att.status === 'ABSENT' && (
                    <>
                      <XCircleIcon size={14} className="text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Не був</span>
                    </>
                  )}
                  {att.status === 'WARNED' && (
                    <>
                      <AlertTriangleIcon size={14} className="text-yellow-600" />
                      <span className="text-xs text-yellow-600 font-medium">Попередив</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment */}
        {pendingPayment && (
          <section className="bg-white border border-gray-100 rounded-xl p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-2 mb-2">
              <CreditCardIcon size={18} className="text-yellow-600" />
              <span className="font-semibold text-sm">Оплата</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mb-3">
              {formatCurrency(pendingPayment.amount)}
            </p>
            <button className="w-full bg-[#E30613] text-white py-3 rounded-xl font-semibold">
              Оплатити
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
