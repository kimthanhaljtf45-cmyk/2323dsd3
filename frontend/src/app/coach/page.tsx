"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store/useStore";
import { formatDate, getRelativeDay, isToday } from "@/lib/utils";
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MapPin
} from "lucide-react";

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'WARNED' | null;

interface ChildAttendance {
  childId: string;
  name: string;
  status: AttendanceStatus;
}

export default function CoachDashboard() {
  const { user, schedule, fetchSchedule } = useStore();
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Filter today's trainings for coach
  const todayTrainings = schedule.filter(s => 
    s.status === 'ACTIVE' && 
    isToday(new Date(s.date)) &&
    s.coach?.telegramId === user?.telegramId
  );

  // Mock children list for demo
  const mockChildren = [
    { id: '1', name: 'Артем Коваленко' },
    { id: '2', name: 'Софія Коваленко' },
    { id: '3', name: 'Максим Петренко' },
    { id: '4', name: 'Анна Сидоренко' },
    { id: '5', name: 'Данило Мельник' },
  ];

  const handleMarkAttendance = (childId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [childId]: prev[childId] === status ? null : status
    }));
  };

  const getStatusCount = (status: AttendanceStatus) => {
    return Object.values(attendanceMap).filter(s => s === status).length;
  };

  return (
    <div className="min-h-screen bg-white" data-testid="coach-dashboard">
      <Header title="Тренер" />
      
      <div className="pt-16 pb-28 px-4 space-y-6">
        {/* Today's Summary */}
        <div className="bg-[#0F0F10] rounded-2xl p-5 mt-4">
          <p className="text-gray-400 text-sm mb-1">Сьогодні</p>
          <h2 className="font-heading text-2xl font-bold text-white">
            {formatDate(new Date(), 'long')}
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-green-400">
                {getStatusCount('PRESENT')}
              </p>
              <p className="text-xs text-gray-400">Присутні</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-red-400">
                {getStatusCount('ABSENT')}
              </p>
              <p className="text-xs text-gray-400">Відсутні</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-yellow-400">
                {getStatusCount('WARNED')}
              </p>
              <p className="text-xs text-gray-400">Попередили</p>
            </div>
          </div>
        </div>

        {/* Today's Trainings */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-4">
            Сьогоднішні тренування
          </h2>
          
          {todayTrainings.length === 0 ? (
            <div className="ataka-card p-6 text-center" data-testid="no-today-trainings">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Сьогодні немає тренувань</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTrainings.map((training) => (
                <div 
                  key={training.scheduleId}
                  className={`ataka-card p-4 cursor-pointer transition-all ${
                    selectedTraining?.scheduleId === training.scheduleId 
                      ? 'border-[#E30613] border-2' 
                      : ''
                  }`}
                  onClick={() => setSelectedTraining(training)}
                  data-testid={`training-card-${training.scheduleId}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-bold text-[#0F0F10]">
                        {training.group?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{training.startTime} - {training.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{training.location?.name}</span>
                      </div>
                    </div>
                    <Badge className="bg-[#E30613]/10 text-[#E30613] border-none">
                      <Users className="h-4 w-4 mr-1" />
                      {mockChildren.length}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Attendance Marking Section - Always visible for demo */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold">
              Відмітка присутності
            </h2>
            {selectedTraining && (
              <Badge variant="secondary" className="bg-gray-100">
                {selectedTraining.group?.name}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {mockChildren.map((child) => {
              const status = attendanceMap[child.id];
              return (
                <div 
                  key={child.id}
                  className="ataka-card p-4"
                  data-testid={`attendance-child-${child.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#E30613]/10 text-[#E30613] font-bold">
                          {child.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{child.name}</span>
                    </div>
                    {status && (
                      <Badge 
                        className={`border-none ${
                          status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {status === 'PRESENT' && 'Був'}
                        {status === 'ABSENT' && 'Не був'}
                        {status === 'WARNED' && 'Попередив'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleMarkAttendance(child.id, 'PRESENT')}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        status === 'PRESENT'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      data-testid={`mark-present-${child.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(child.id, 'ABSENT')}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        status === 'ABSENT'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      data-testid={`mark-absent-${child.id}`}
                    >
                      <XCircle className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(child.id, 'WARNED')}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        status === 'WARNED'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                      data-testid={`mark-warned-${child.id}`}
                    >
                      <AlertTriangle className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button 
            className="w-full mt-4 bg-[#E30613] text-white py-4 rounded-xl font-semibold disabled:opacity-50"
            disabled={Object.keys(attendanceMap).length === 0}
            data-testid="save-attendance-btn"
          >
            Зберегти відмітки
          </button>
        </section>
      </div>
    </div>
  );
}
