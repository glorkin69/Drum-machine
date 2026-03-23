"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DrumMachine } from "@/components/drum-machine/drum-machine";
import { InAppTour } from "@/components/in-app-tour";
import { Loader2 } from "lucide-react";

export function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestSessionStart, setGuestSessionStart] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const guest = searchParams.get("guest") === "true";
    setIsGuest(guest);
    if (guest) {
      // Persist guest session start in sessionStorage so it survives re-renders
      const storedStart = sessionStorage.getItem("guestSessionStart");
      if (storedStart) {
        setGuestSessionStart(parseInt(storedStart, 10));
      } else {
        const now = Date.now();
        sessionStorage.setItem("guestSessionStart", now.toString());
        setGuestSessionStart(now);
      }
    } else {
      // Clean up if not guest
      sessionStorage.removeItem("guestSessionStart");
    }
  }, [searchParams]);

  useEffect(() => {
    // Read guest param directly to avoid race condition with isGuest state
    const guest = searchParams.get("guest") === "true";
    if (!guest && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, searchParams]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--theme-body-bg)" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--theme-led-active)" }} />
          <p className="font-mono text-sm tracking-wider" style={{ color: "var(--theme-label-color)" }}>POWERING UP...</p>
        </div>
      </div>
    );
  }

  if (!isGuest && !session) return null;

  return (
    <>
      <DrumMachine isGuest={isGuest} guestSessionStart={guestSessionStart} />
      <InAppTour screenId="dashboard" />
    </>
  );
}
