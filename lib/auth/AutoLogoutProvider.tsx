"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface AutoLogoutProviderProps {
  children: React.ReactNode;
  inactivityTimeout?: number; // in milliseconds, default 30 minutes
  warningTime?: number; // show warning X ms before logout, default 2 minutes
}

export default function AutoLogoutProvider({
  children,
  inactivityTimeout = 30 * 60 * 1000, // 30 minutes
  warningTime = 2 * 60 * 1000, // 2 minutes
}: AutoLogoutProviderProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const logout = useCallback(async () => {
    toast.error("You have been logged out due to inactivity");
    await supabase.auth.signOut();
    router.push("/login");
  }, [router, supabase.auth]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer (optional)
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        toast(
          `You will be logged out in ${warningTime / 60000} minutes due to inactivity`,
          {
            icon: "⚠️",
            duration: 5000,
          }
        );
      }, inactivityTimeout - warningTime);
    }

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout();
    }, inactivityTimeout);
  }, [inactivityTimeout, warningTime, logout]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        resetTimer();
      }
    };

    checkAuth();

    // Events that reset the timer (user activity)
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, supabase.auth]);

  return <>{children}</>;
}
