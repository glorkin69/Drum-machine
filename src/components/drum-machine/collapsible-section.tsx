"use client";

import { type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ThemeColors } from "@/lib/theme-colors";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  tc: ThemeColors;
  badge?: ReactNode;
  /** Compact mode uses less padding */
  compact?: boolean;
  /** Additional class on the content wrapper */
  contentClassName?: string;
  children: ReactNode;
  /** data-tour attribute */
  dataTour?: string;
}

export function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  tc,
  badge,
  compact = false,
  contentClassName,
  children,
  dataTour,
}: CollapsibleSectionProps) {
  return (
    <div data-tour={dataTour}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-md transition-colors group"
        style={{
          padding: compact ? "4px 8px" : "6px 10px",
          backgroundColor: isOpen ? `${tc.accentOrange}08` : "transparent",
          borderLeft: `2px solid ${isOpen ? tc.accentOrange : tc.panelBorder}`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
              style={{ color: isOpen ? tc.accentOrange : tc.textMuted }}
            >
              {icon}
            </span>
          )}
          <span
            className="text-[0.65rem] font-mono font-bold tracking-wider uppercase truncate"
            style={{ color: isOpen ? tc.accentOrange : tc.textMuted }}
          >
            {title}
          </span>
          {badge}
        </div>
        <div
          className="flex-shrink-0 ml-2 transition-transform duration-150"
          style={{ color: isOpen ? tc.accentOrange : tc.mutedBorder }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`mt-1.5 ${contentClassName ?? ""}`}>
          {children}
        </div>
      )}
    </div>
  );
}
