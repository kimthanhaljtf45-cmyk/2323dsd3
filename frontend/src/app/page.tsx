"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { GuestHome } from "@/components/home/GuestHome";
import { ParentHome } from "@/components/home/ParentHome";
import { CoachHome } from "@/components/home/CoachHome";
import { AdminHome } from "@/components/home/AdminHome";
import { StudentHome } from "@/components/home/StudentHome";

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);
  const fetchChildren = useStore((state) => state.fetchChildren);
  const fetchSchedule = useStore((state) => state.fetchSchedule);
  const fetchFeed = useStore((state) => state.fetchFeed);
  const fetchPayments = useStore((state) => state.fetchPayments);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
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

  // Show loading until hydrated
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

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
