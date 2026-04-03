"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/lib/utils";
import { 
  ChevronRight, 
  CreditCard, 
  LogOut, 
  Bell,
  HelpCircle,
  Target,
  Award
} from "lucide-react";

export default function ProfilePage() {
  const { user, children, payments, logout, fetchChildren, fetchPayments } = useStore();

  useEffect(() => {
    fetchChildren();
    fetchPayments();
  }, [fetchChildren, fetchPayments]);

  const pendingPayments = payments.filter(
    p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW'
  );

  // Mock data
  const totalAttendance = 83;
  const userLevel = "Активний батько";

  return (
    <div className="min-h-screen bg-white" data-testid="profile-page">
      <Header title="Профіль" />
      
      <div className="pt-16 pb-28 px-4 space-y-6">
        {/* User Card */}
        <div className="ataka-card p-5 mt-4" data-testid="user-info-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-[#E30613]/20">
              <AvatarFallback className="text-xl bg-[#E30613] text-white font-bold">
                {user?.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-bold text-[#0F0F10]">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-[#E30613]/10 text-[#E30613] border-none text-xs">
                  {user?.role === 'PARENT' && 'Батько/Мати'}
                  {user?.role === 'COACH' && 'Тренер'}
                  {user?.role === 'ADMIN' && 'Адміністратор'}
                </Badge>
              </div>
            </div>
            <Award className="h-8 w-8 text-[#E30613]" />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-[#0F0F10]">{children.length}</p>
              <p className="text-xs text-gray-500">Дітей</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-green-600">{totalAttendance}%</p>
              <p className="text-xs text-gray-500">Дисципліна</p>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-4">Мої діти</h2>
          
          <div className="space-y-3">
            {children.map((child) => (
              <Link href={`/profile/child/${child.id}`} key={child.id}>
                <div 
                  className="ataka-card p-4 flex items-center justify-between"
                  data-testid={`child-link-${child.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-[#E30613]/20">
                      <AvatarFallback className="bg-[#E30613]/10 text-[#E30613] font-bold">
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
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
            
            {children.length === 0 && (
              <div className="ataka-card p-6 text-center">
                <p className="text-gray-500 mb-4">Немає доданих дітей</p>
                <button className="bg-[#E30613] text-white px-6 py-3 rounded-xl font-semibold">
                  Додати дитину
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payments Summary */}
        <div 
          className={`ataka-card p-5 ${pendingPayments.length > 0 ? 'border-l-4 border-l-yellow-500' : ''}`}
          data-testid="payments-summary"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E30613]/10 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#E30613]" />
              </div>
              <span className="font-heading font-bold">Оплати</span>
            </div>
            {pendingPayments.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 border-none">
                {pendingPayments.length} до оплати
              </Badge>
            )}
          </div>
          
          {pendingPayments.length > 0 ? (
            <div>
              <p className="text-2xl font-bold text-yellow-600 mb-1">
                {formatCurrency(pendingPayments.reduce((acc, p) => acc + p.amount, 0))}
              </p>
              <p className="text-sm text-gray-500 mb-4">Сума до оплати</p>
              <Link href="/profile/payments">
                <button className="bg-[#0F0F10] text-white px-6 py-3 rounded-xl font-semibold w-full">
                  Переглянути рахунки
                </button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">Всі рахунки оплачено</p>
          )}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <Link href="/profile/payments">
            <div className="ataka-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Історія оплат</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
          
          <Link href="/profile/notifications">
            <div className="ataka-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Сповіщення</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
          
          <div className="ataka-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Допомога</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="w-full p-4 rounded-xl border-2 border-red-200 text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          data-testid="logout-btn"
        >
          <LogOut className="h-5 w-5" />
          Вийти
        </button>
      </div>
    </div>
  );
}
