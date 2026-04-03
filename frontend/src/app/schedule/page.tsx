"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { formatDate, getRelativeDay, isToday, isTomorrow } from "@/lib/utils";
import { 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  CalendarIcon
} from "@/components/icons";
import { Header } from "@/components/layout/Header";

export default function SchedulePage() {
  const { schedule, fetchSchedule, children } = useStore();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchSchedule(filter === "all" ? undefined : filter);
  }, [fetchSchedule, filter]);

  // Get unique groups from children
  const childGroups = children
    .filter(c => c.group)
    .map(c => ({ id: c.groupId!, name: c.group!.name }));

  // Group schedule by date
  const scheduleByDate = schedule.reduce((acc, item) => {
    const dateKey = new Date(item.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, typeof schedule>);

  const sortedDates = Object.keys(scheduleByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="min-h-screen bg-white pb-20" data-testid="schedule-page">
      <Header title="Розклад" />
      
      <div className="pt-14 px-4 space-y-4">
        {/* Filter Tabs */}
        <div className="pt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all" 
                ? "bg-[#E30613] text-white" 
                : "bg-gray-100 text-gray-600"
            }`}
            data-testid="filter-all"
          >
            Усі
          </button>
          {childGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === g.id 
                  ? "bg-[#E30613] text-white" 
                  : "bg-gray-100 text-gray-600"
              }`}
              data-testid={`filter-${g.id}`}
            >
              {g.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        {schedule.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center" data-testid="no-schedule">
            <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">Немає занять на найближчі дні</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map((dateKey) => {
              const items = scheduleByDate[dateKey];
              const date = new Date(dateKey);
              const dateIsToday = isToday(date);
              const dateIsTomorrow = isTomorrow(date);

              return (
                <div key={dateKey}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-heading font-bold ${
                      dateIsToday ? 'text-[#E30613]' : 'text-[#0F0F10]'
                    }`}>
                      {getRelativeDay(date)}
                    </h3>
                    {dateIsToday && (
                      <span className="text-[10px] bg-[#E30613] text-white px-2 py-0.5 rounded font-medium">
                        Сьогодні
                      </span>
                    )}
                    {dateIsTomorrow && (
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium">
                        Завтра
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div 
                        key={`${item.scheduleId}-${idx}`}
                        className={`bg-white border rounded-xl p-3.5 ${
                          item.status === 'CANCELLED' 
                            ? 'opacity-60 border-red-200' 
                            : dateIsToday 
                              ? 'border-l-4 border-l-[#E30613] border-gray-100'
                              : 'border-gray-100'
                        }`}
                        data-testid={`schedule-item-${item.scheduleId}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-[#0F0F10] text-sm">{item.group?.name}</p>
                            <p className="text-xs text-gray-500">{item.group?.level}</p>
                          </div>
                          {item.status === 'CANCELLED' && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
                              Скасовано
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <ClockIcon size={12} className="text-[#E30613]" />
                            <span className="font-medium">{item.startTime} - {item.endTime}</span>
                          </div>

                          {item.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPinIcon size={12} />
                              <span>{item.location.name}</span>
                            </div>
                          )}

                          {item.coach && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <UserIcon size={12} />
                              <span>{item.coach.firstName} {item.coach.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
