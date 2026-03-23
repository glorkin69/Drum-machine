"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ThemeContext, useThemeProvider } from "@/hooks/use-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const themeCtx = useThemeProvider();

  return (
    <SessionProvider>
      <ThemeContext.Provider value={themeCtx}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
