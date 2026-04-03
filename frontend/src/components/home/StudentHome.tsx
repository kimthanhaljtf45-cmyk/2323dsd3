"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { formatCurrency, getRelativeDay } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  ClockIcon, 
  ChevronRightIcon,
  CalendarIcon,
  TrophyIcon,
  TargetIcon,
  FlameIcon,
  StarIcon,
  ZapIcon,
  AwardIcon,
  TrendingUpIcon
} from "@/components/icons";

interface StudentDashboardData {
  profile: {
    id: string;
    firstName: string;
    lastName?: string;
    group?: { name: string; level: string };
    coach?: { firstName: string; lastName?: string };
    location?: { name: string };
    attendance: {
      monthTotal: number;
      present: number;
      warned: number;
      absent: number;
      percent: number;
    };
    goal: {
      target: number;
      current: number;
    };
    coachComment?: string;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      awardedAt: string;
    }>;
  } | null;
  nextTraining?: {
    date: string;
    startTime: string;
    endTime: string;
    group?: { name: string };
    location?: { name: string };
  };
  feedPreview: Array<{
    id: string;
    title: string;
    body?: string;
    type: string;
  }>;
}

export function StudentHome() {
  const { user, schedule, feed, fetchSchedule, fetchFeed } = useStore();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/me/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    fetchSchedule();
    fetchFeed();
  }, [fetchSchedule, fetchFeed]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const nextTraining = dashboardData?.nextTraining;

  if (!profile) {
    return (
      <div className="min-h-screen bg-white pb-20" data-testid="student-home-no-profile">
        <div className="bg-[#0F0F10] px-4 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Image 
              src="/images/logo-ataka.png" 
              alt="АТАКА" 
              width={32} 
              height={32}
              className="rounded-full"
            />
            <span className="font-heading font-bold text-white">АТАКА</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-white">
            Привіт, {user?.firstName}!
          </h1>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500 mb-4">Профіль учня не знайдено</p>
          <p className="text-sm text-gray-400">Зверніться до адміністратора для прив'язки вашого профілю.</p>
        </div>
      </div>
    );
  }

  const attendancePercent = profile.attendance?.percent || 0;
  const goalProgress = profile.goal ? (profile.goal.current / profile.goal.target) * 100 : 0;

  // Calculate level based on attendance
  const getLevel = (percent: number) => {
    if (percent >= 90) return { name: "Майстер", color: "text-yellow-500", icon: "🏆" };
    if (percent >= 75) return { name: "Боєць", color: "text-red-500", icon: "🥋" };
    if (percent >= 50) return { name: "Учень", color: "text-blue-500", icon: "📚" };
    return { name: "Новачок", color: "text-gray-500", icon: "🌱" };
  };

  const level = getLevel(attendancePercent);

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="student-home">
      {/* Header */}
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
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
            <span className="text-lg">{level.icon}</span>
            <span className={`text-sm font-medium ${level.color}`}>{level.name}</span>
          </div>
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[#E30613] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {profile.firstName[0]}{profile.lastName?.[0] || ''}
            </span>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-white">
              {profile.firstName} {profile.lastName || ''}
            </h1>
            <p className="text-gray-400 text-sm">
              {profile.group?.name || 'Без групи'}
            </p>
            {profile.coach && (
              <p className="text-gray-500 text-xs">
                Тренер: {profile.coach.firstName} {profile.coach.lastName || ''}
              </p>
            )}
          </div>
        </div>

        {/* Next Training Card */}
        {nextTraining && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#E30613] font-bold uppercase tracking-wide">
                Наступне тренування
              </span>
              <ClockIcon size={14} className="text-gray-400" />
            </div>
            <p className="font-heading text-lg font-bold text-white">
              {getRelativeDay(nextTraining.date)}, {nextTraining.startTime}
            </p>
            <p className="text-gray-400 text-sm">
              {nextTraining.group?.name} • {nextTraining.location?.name}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 space-y-5 -mt-2">
        {/* Discipline Score */}
        <section className="pt-5">
          <div className="bg-gradient-to-br from-[#0F0F10] to-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center">
                  <ZapIcon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Твоя дисципліна</p>
                  <p className="font-heading text-3xl font-bold text-white">
                    {attendancePercent}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Тренувань</p>
                <p className="text-white font-bold">{profile.attendance?.present || 0} з {profile.attendance?.monthTotal || 0}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Прогрес до {level.name === "Майстер" ? "ідеалу" : "наступного рівня"}</span>
                <span className="text-[#E30613]">{attendancePercent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#E30613] to-[#ff4444] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(attendancePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Goal */}
        <section className="bg-[#FFFBFB] border border-[#E30613]/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#E30613] rounded-lg flex items-center justify-center">
              <TargetIcon size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#0F0F10] text-sm">Ціль місяця</p>
              <p className="text-xs text-gray-500">Відвідати {profile.goal?.target || 12} тренувань</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#E30613] h-3 rounded-full transition-all"
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <span className="font-bold text-sm text-[#0F0F10]">
              {profile.goal?.current || 0}/{profile.goal?.target || 12}
            </span>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="font-heading font-bold text-[#0F0F10] mb-3">Твоя статистика</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-green-600">
                {profile.attendance?.present || 0}
              </p>
              <p className="text-xs text-green-700">Був</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-yellow-600">
                {profile.attendance?.warned || 0}
              </p>
              <p className="text-xs text-yellow-700">Попередив</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-red-600">
                {profile.attendance?.absent || 0}
              </p>
              <p className="text-xs text-red-700">Пропустив</p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrophyIcon size={18} className="text-[#E30613]" />
              <h2 className="font-heading font-bold text-[#0F0F10]">Досягнення</h2>
            </div>
            <Link href="/profile" className="text-xs text-[#E30613] font-medium">Усі</Link>
          </div>
          
          {profile.achievements && profile.achievements.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {profile.achievements.slice(0, 5).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex-shrink-0 w-24 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 text-center"
                >
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <StarIcon size={20} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-[#0F0F10] line-clamp-2">
                    {achievement.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <AwardIcon size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Тренуйся, щоб отримати перше досягнення!</p>
            </div>
          )}
        </section>

        {/* Coach Comment */}
        {profile.coachComment && (
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-lg">💬</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-blue-900 mb-1">Коментар тренера</p>
                <p className="text-sm text-blue-700">{profile.coachComment}</p>
              </div>
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
            <Link href="/feed">
              <div className="bg-white border border-gray-100 rounded-xl p-4 text-center" data-testid="action-feed">
                <div className="w-11 h-11 bg-[#E30613] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FlameIcon size={20} className="text-white" />
                </div>
                <p className="font-medium text-sm">Новини</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Feed Preview */}
        {dashboardData?.feedPreview && dashboardData.feedPreview.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FlameIcon size={18} className="text-[#E30613]" />
                <h2 className="font-heading font-bold text-[#0F0F10]">Новини групи</h2>
              </div>
              <Link href="/feed" className="text-xs text-[#E30613] font-medium">Усі</Link>
            </div>
            
            <div className="space-y-2">
              {dashboardData.feedPreview.slice(0, 2).map((post) => (
                <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-3.5">
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
