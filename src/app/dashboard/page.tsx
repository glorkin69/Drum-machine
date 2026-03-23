"use client";

import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { Loader2 } from "lucide-react";

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8732A] mx-auto mb-4" />
        <p className="text-[#A08060] font-mono text-sm tracking-wider">LOADING MACHINE...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
