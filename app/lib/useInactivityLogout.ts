"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

// After this much time with no user activity, sign the user out automatically.
// Protects private journal/chat data on devices left unattended.
export const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

/** Signs the user out and redirects to /login after a period of inactivity. */
export function useInactivityLogout(timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.replace("/login?reason=timeout");
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, timeoutMs);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMs]);
}
