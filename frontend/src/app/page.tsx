"use client";

import React, { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { GuestHome } from "@/components/home/GuestHome";
import { ParentHome } from "@/components/home/ParentHome";
import { CoachHome } from "@/components/home/CoachHome";
import { AdminHome } from "@/components/home/AdminHome";
import { StudentHome } from "@/components/home/StudentHome";

export default function HomePage() {
  const { isAuthenticated, user, fetchChildren, fetchSchedule, fetchFeed, fetchPayments } = useStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch data based on role
      if (user.role === 'PARENT') {
        fetchChildren();
        fetchSchedule();
        fetchFeed();
        fetchPayments();
      } else if (user.role === 'COACH') {
        fetchSchedule();
        fetchFeed();
      } else if (user.role === 'ADMIN') {
        fetchSchedule();
        fetchFeed();
      } else if (user.role === 'STUDENT') {
        fetchSchedule();
        fetchFeed();
      }
    }
  }, [isAuthenticated, user, fetchChildren, fetchSchedule, fetchFeed, fetchPayments]);

  // State-based routing
  if (!isAuthenticated) {
    return <GuestHome />;
  }

  if (user?.role === 'STUDENT') {
    return <StudentHome />;
  }

  if (user?.role === 'COACH') {
    return <CoachHome />;
  }

  if (user?.role === 'ADMIN') {
    return <AdminHome />;
  }

  // Default: PARENT
  return <ParentHome />;
}
