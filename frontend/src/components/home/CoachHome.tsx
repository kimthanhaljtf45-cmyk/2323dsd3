"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { formatDate, isToday } from "@/lib/utils";
import { 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  BellIcon,
  MessageIcon
} from "@/components/icons";

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'WARNED' | null;

export function CoachHome() {
  const { user, schedule, groups } = useStore();
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  // Filter today's trainings for this coach
  const todayTrainings = schedule.filter(s => 
    s.status === 'ACTIVE' && isToday(new Date(s.date))
  );

  // Mock children for attendance
  const mockChildren = [
    { id: '1', name: 'Артем Коваленко' },
    { id: '2', name: 'Софія Коваленко' },
    { id: '3', name: 'Максим Петренко' },
    { id: '4', name: 'Анна Сидоренко' },
    { id: '5', name: 'Данило Мельник' },
  ];

  const markAttendance = (childId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [childId]: prev[childId] === status ? null : status
    }));
  };

  const countByStatus = (status: AttendanceStatus) => 
    Object.values(attendanceMap).filter(s => s === status).length;

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="coach-home">
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
              <span className="font-heading font-bold text-white text-sm">Тренер</span>
              <p className="text-xs text-gray-400">{user?.firstName}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 relative">
            <BellIcon size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Today Stats */}
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Сьогодні</p>
          <p className="font-heading text-lg font-bold text-white mb-3">
            {formatDate(new Date(), 'long')}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-heading text-2xl font-bold text-green-400">{countByStatus('PRESENT')}</p>
              <p className="text-[10px] text-gray-400">Присутні</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-red-400">{countByStatus('ABSENT')}</p>
              <p className="text-[10px] text-gray-400">Відсутні</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-yellow-400">{countByStatus('WARNED')}</p>
              <p className="text-[10px] text-gray-400">Попередили</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-5">
        {/* Today's Trainings */}
        <section>
          <h2 className="font-heading font-bold text-[#0F0F10] mb-3">Сьогоднішні тренування</h2>
          
          {todayTrainings.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-gray-500 text-sm">Сьогодні немає тренувань</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTrainings.map((training) => (
                <div 
                  key={training.scheduleId}
                  className="bg-white border border-gray-100 rounded-xl p-3.5"
                  data-testid={`training-${training.scheduleId}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#0F0F10] text-sm">{training.group?.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <ClockIcon size={12} />
                        <span>{training.startTime} - {training.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <MapPinIcon size={12} />
                        <span>{training.location?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#E30613]/10 px-2 py-1 rounded-lg">
                      <UsersIcon size={12} className="text-[#E30613]" />
                      <span className="text-xs font-medium text-[#E30613]">{mockChildren.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Attendance Marking */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-[#0F0F10]">Відмітка присутності</h2>
          </div>

          <div className="space-y-2">
            {mockChildren.map((child) => {
              const status = attendanceMap[child.id];
              return (
                <div 
                  key={child.id}
                  className="bg-white border border-gray-100 rounded-xl p-3.5"
                  data-testid={`attendance-${child.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#E30613]/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-sm text-[#E30613]">{child.name[0]}</span>
                      </div>
                      <span className="font-medium text-sm">{child.name}</span>
                    </div>
                    {status && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {status === 'PRESENT' && 'Був'}
                        {status === 'ABSENT' && 'Не був'}
                        {status === 'WARNED' && 'Попередив'}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => markAttendance(child.id, 'PRESENT')}
                      className={`py-2 rounded-lg transition-all ${
                        status === 'PRESENT'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}
                      data-testid={`mark-present-${child.id}`}
                    >
                      <CheckCircleIcon size={18} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => markAttendance(child.id, 'ABSENT')}
                      className={`py-2 rounded-lg transition-all ${
                        status === 'ABSENT'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}
                      data-testid={`mark-absent-${child.id}`}
                    >
                      <XCircleIcon size={18} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => markAttendance(child.id, 'WARNED')}
                      className={`py-2 rounded-lg transition-all ${
                        status === 'WARNED'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                      data-testid={`mark-warned-${child.id}`}
                    >
                      <AlertTriangleIcon size={18} className="mx-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            className="w-full mt-4 bg-[#E30613] text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
            disabled={Object.keys(attendanceMap).length === 0}
            data-testid="save-attendance-btn"
          >
            Зберегти відмітки
          </button>
        </section>

        {/* Quick Actions */}
        <section className="pb-4">
          <h2 className="font-heading font-bold text-[#0F0F10] mb-3">Швидкі дії</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/feed/new">
              <div className="bg-[#0F0F10] rounded-xl p-4 text-center">
                <MessageIcon size={20} className="text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Написати групі</p>
              </div>
            </Link>
            <Link href="/schedule">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <ClockIcon size={20} className="text-[#0F0F10] mx-auto mb-2" />
                <p className="text-[#0F0F10] text-sm font-medium">Розклад</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
