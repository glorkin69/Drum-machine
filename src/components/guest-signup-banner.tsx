"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, X, UserPlus } from "lucide-react";

const SIGNUP_PROMPT_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const AUTO_DISMISS_MS = 30 * 1000; // 30 seconds

interface GuestSignupBannerProps {
  guestSessionStart: number | null;
}

export function GuestSignupBanner({ guestSessionStart }: GuestSignupBannerProps) {
  const [visible, setVisible] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setAnimatingOut(true);
    // Wait for slide-out animation before hiding
    setTimeout(() => {
      setVisible(false);
      setAnimatingOut(false);
      setDismissed(true);
    }, 400);
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }
  }, []);

  // Show banner after 5 minutes of guest session
  useEffect(() => {
    if (!guestSessionStart || dismissed) return;

    const elapsed = Date.now() - guestSessionStart;
    const remaining = SIGNUP_PROMPT_DELAY_MS - elapsed;

    // If already past the delay, show immediately
    if (remaining <= 0) {
      setVisible(true);
      // Small delay for mount, then animate in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimatingIn(true));
      });
      return;
    }

    const showTimer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimatingIn(true));
      });
    }, remaining);

    return () => clearTimeout(showTimer);
  }, [guestSessionStart, dismissed]);

  // Auto-dismiss after 30 seconds of being visible
  useEffect(() => {
    if (!visible || animatingOut || dismissed) return;

    autoDismissRef.current = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
        autoDismissRef.current = null;
      }
    };
  }, [visible, animatingOut, dismissed, dismiss]);

  if (!visible || dismissed) return null;

  return (
    <div
      className={`max-w-6xl mx-auto mb-4 overflow-hidden transition-all duration-500 ease-out ${
        animatingIn && !animatingOut
          ? "max-h-40 opacity-100 translate-y-0"
          : animatingOut
            ? "max-h-0 opacity-0 -translate-y-4"
            : "max-h-0 opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-gradient-to-r from-[#2C1E14] via-[#3D2B1F] to-[#2C1E14] border border-[#D4A574]/40 rounded-lg p-4 shadow-lg shadow-[#E8732A]/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#E8732A]/20 to-[#D4A574]/10 border border-[#E8732A]/30 flex items-center justify-center">
              <Music className="w-5 h-5 text-[#E8732A]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-mono text-[#F5E6D3] tracking-wide">
                Found a pattern you actually like? Create an account before you accidentally close the tab. 🎵
              </p>
              <p className="text-[0.65rem] font-mono text-[#A08060] mt-0.5 tracking-wider">
                THAT TOOK YOU LIKE 10 MINUTES TO TWEAK
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#E8732A] to-[#D4651F] hover:from-[#D4651F] hover:to-[#C05A1A] text-white font-mono text-xs tracking-wider shadow-md shadow-[#E8732A]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#E8732A]/30"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                SAVE ME
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismiss}
              className="text-[#6B5B47] hover:text-[#A08060] hover:bg-[#3D2B1F] p-1.5 h-auto"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
