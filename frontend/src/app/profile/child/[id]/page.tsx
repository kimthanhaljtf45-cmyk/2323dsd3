"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { childrenApi, attendanceApi } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { uk } from "date-fns/locale";

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
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

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const formatDateLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Сьогодні";
  if (isTomorrow(date)) return "Завтра";
  return format(date, "EEEE, d MMMM", { locale: uk });
};

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { schedule, payments, fetchSchedule, fetchPayments } = useStore();
  const [child, setChild] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        const [childRes, attendanceRes] = await Promise.all([
          childrenApi.getOne(params.id as string),
          attendanceApi.getChildAttendance(params.id as string)
        ]);
        setChild(childRes.data);
        setAttendance(attendanceRes.data || []);
        fetchSchedule(childRes.data.groupId);
        fetchPayments();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params.id, fetchSchedule, fetchPayments]);

  if (isLoading || !child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E30613] border-t-transparent" />
      </div>
    );
  }

  // Get next training for this child's group
  const nextTraining = schedule.find(s => 
    s.status === 'ACTIVE' && 
    new Date(s.date) >= new Date()
  );

  // Get child's payments
  const childPayments = payments.filter(p => p.childId === child.id);
  const pendingPayment = childPayments.find(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');

  // Attendance stats
  const attendanceStats = child.attendance || {
    monthTotal: attendance.length,
    present: attendance.filter((a: any) => a.status === 'PRESENT').length,
    warned: attendance.filter((a: any) => a.status === 'WARNED').length,
    absent: attendance.filter((a: any) => a.status === 'ABSENT').length,
    percent: 0
  };
  attendanceStats.percent = attendanceStats.monthTotal > 0 
    ? Math.round((attendanceStats.present / attendanceStats.monthTotal) * 100) 
    : 0;

  const goal = child.goal || { target: 12, current: attendanceStats.present };
  const coachComment = child.coachComment || child.note || "Дитина добре працює на тренуваннях. Продовжуйте в такому темпі!";
  const achievements = child.achievements || [];

  // Recent attendance (last 6)
  const recentAttendance = attendance.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F10]">
        <div className="mx-auto max-w-md">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors text-white"
            >
              <BackIcon />
            </button>
            <h1 className="ml-2 font-bold text-lg text-white">
              Картка учня
            </h1>
          </div>
        </div>
      </header>
      
      <div className="pt-14 pb-24">
        {/* Child Hero */}
        <div className="bg-[#0F0F10] px-5 pt-4 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#E30613] to-[#FF6B6B] rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {child.firstName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-2xl text-white">
                {child.firstName} {child.lastName}
              </h2>
              <p className="text-gray-400 text-sm">
                {child.group?.name || "Без групи"}
              </p>
              {child.coach && (
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <UserIcon />
                  Тренер: {child.coach.firstName} {child.coach.lastName}
                </p>
              )}
              {child.location && (
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                  <MapPinIcon />
                  {child.location.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${
                attendanceStats.percent >= 80 ? 'text-green-400' :
                attendanceStats.percent >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {attendanceStats.percent}%
              </p>
              <p className="text-[10px] text-gray-400">Дисципліна</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{goal.current}</p>
              <p className="text-[10px] text-gray-400">Тренувань</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{achievements.length}</p>
              <p className="text-[10px] text-gray-400">Досягнень</p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4">
          {/* Next Training Card */}
          {nextTraining && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E30613]/10 rounded-lg flex items-center justify-center text-[#E30613]">
                    <CalendarIcon />
                  </div>
                  <span className="text-xs text-[#E30613] font-semibold uppercase tracking-wide">
                    Наступне тренування
                  </span>
                </div>
              </div>
              
              <p className="font-bold text-xl text-[#0F0F10] mb-2">
                {formatDateLabel(nextTraining.date)}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <ClockIcon />
                  {nextTraining.startTime} - {nextTraining.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon />
                  {nextTraining.location?.name || child.location?.name}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/absence?childId=${child.id}`}
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Не прийдемо
                </Link>
                <Link 
                  href="/schedule"
                  className="flex-1 bg-[#E30613] text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C70510] transition-colors"
                >
                  Розклад
                </Link>
              </div>
            </div>
          )}

          {/* Discipline Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F0F10]">Дисципліна</h3>
              <TrendingUpIcon />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-4xl font-bold ${
                attendanceStats.percent >= 80 ? 'text-green-600' : 
                attendanceStats.percent >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {attendanceStats.percent}%
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {attendanceStats.present} з {attendanceStats.monthTotal} тренувань
                </p>
                <div className="mt-2 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      attendanceStats.percent >= 80 ? 'bg-green-500' : 
                      attendanceStats.percent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${attendanceStats.percent}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{attendanceStats.present}</p>
                <p className="text-[10px] text-gray-500">Був</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600">{attendanceStats.warned}</p>
                <p className="text-[10px] text-gray-500">Попередив</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">{attendanceStats.absent}</p>
                <p className="text-[10px] text-gray-500">Пропустив</p>
              </div>
            </div>
          </div>

          {/* Monthly Goal Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#E30613] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#E30613] rounded-xl flex items-center justify-center text-white">
                <TargetIcon />
              </div>
              <div>
                <p className="font-bold text-[#0F0F10]">Ціль місяця</p>
                <p className="text-xs text-gray-500">Відвідати {goal.target} тренувань</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#E30613] to-[#FF6B6B] h-full rounded-full transition-all"
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                />
              </div>
              <span className="font-bold text-[#0F0F10] text-lg">
                {goal.current}/{goal.target}
              </span>
            </div>
            
            {goal.current >= goal.target && (
              <div className="mt-3 bg-green-50 text-green-700 text-sm p-2 rounded-lg text-center font-medium">
                🎉 Ціль досягнута!
              </div>
            )}
          </div>

          {/* Coach Comment Card */}
          <div className="bg-[#0F0F10] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                <MessageIcon />
              </div>
              <span className="text-xs text-gray-400">Коментар тренера</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {coachComment}
            </p>
            {child.coach && (
              <p className="text-gray-500 text-xs mt-3">
                — {child.coach.firstName} {child.coach.lastName}
              </p>
            )}
          </div>

          {/* Achievements Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AwardIcon />
                <h3 className="font-bold text-[#0F0F10]">Досягнення</h3>
              </div>
              <span className="text-xs text-gray-400">{achievements.length} шт</span>
            </div>
            
            {achievements.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {achievements.map((ach: any, i: number) => (
                  <div key={i} className="shrink-0 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-4 py-3 rounded-xl">
                    <p className="text-sm font-medium text-amber-800">{ach.title}</p>
                    <p className="text-[10px] text-amber-600 mt-1">
                      {format(parseISO(ach.awardedAt), "d MMM yyyy", { locale: uk })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Продовжуйте тренуватись — досягнення скоро з'являться!
              </p>
            )}
          </div>

          {/* Rating Card */}
          <Link 
            href={`/rating?childId=${child.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <TrophyIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0F0F10]">Рейтинг</h3>
              <p className="text-xs text-gray-500">Позиція у групі та клубі</p>
            </div>
            <ChevronRightIcon />
          </Link>

          {/* Recent Attendance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F0F10]">Останні тренування</h3>
              <Link href={`/attendance/${child.id}`} className="text-xs text-[#E30613] font-medium">
                Усі
              </Link>
            </div>
            
            {recentAttendance.length > 0 ? (
              <div className="space-y-2">
                {recentAttendance.map((att: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-700">
                      {format(parseISO(att.date), "EEE, d MMM", { locale: uk })}
                    </span>
                    <div className="flex items-center gap-2">
                      {att.status === 'PRESENT' && (
                        <>
                          <CheckCircleIcon />
                          <span className="text-green-600 text-sm font-medium">Був</span>
                        </>
                      )}
                      {att.status === 'ABSENT' && (
                        <>
                          <XCircleIcon />
                          <span className="text-red-600 text-sm font-medium">Не був</span>
                        </>
                      )}
                      {att.status === 'WARNED' && (
                        <>
                          <AlertTriangleIcon />
                          <span className="text-amber-600 text-sm font-medium">Попередив</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Історія відвідувань поки що пуста
              </p>
            )}
          </div>

          {/* Payment Card */}
          {pendingPayment && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 border-l-4 border-l-amber-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <CreditCardIcon />
                </div>
                <div>
                  <span className="font-bold text-[#0F0F10]">Оплата</span>
                  <p className="text-xs text-gray-500">{pendingPayment.description}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-600 mb-3">
                {pendingPayment.amount} грн
              </p>
              <Link 
                href={`/payment/${pendingPayment.id}`}
                className="block bg-[#E30613] text-white w-full py-3 rounded-xl font-semibold text-center"
              >
                Оплатити
              </Link>
            </div>
          )}

          {/* All Payments Link */}
          <Link 
            href={`/profile/payments?childId=${child.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <CreditCardIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0F0F10]">Історія оплат</h3>
              <p className="text-xs text-gray-500">{childPayments.length} оплат</p>
            </div>
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
