"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "beatforge-section-states";

export type SectionId =
  | "songBuilder"
  | "emotionControls"
  | "styleDna"
  | "soundShaping"
  | "virtualBand"
  | "sessionRecording"
  | "fillVariation"
  | "xyPad"
  | "effectsRack";

const DEFAULT_STATES: Record<SectionId, boolean> = {
  songBuilder: true,
  emotionControls: false,
  styleDna: false,
  soundShaping: false,
  virtualBand: false,
  sessionRecording: false,
  fillVariation: true,
  xyPad: false,
  effectsRack: false,
};

const ALL_SECTION_IDS = Object.keys(DEFAULT_STATES) as SectionId[];

export function useCollapsibleSections() {
  const [sections, setSections] = useState<Record<SectionId, boolean>>(DEFAULT_STATES);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Record<SectionId, boolean>>;
        setSections((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch {
      // Ignore storage errors
    }
  }, [sections, hydrated]);

  // Listen for tour expand events
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ sectionId: string }>;
      const sectionId = customEvent.detail?.sectionId as SectionId;
      if (sectionId && ALL_SECTION_IDS.includes(sectionId)) {
        setSections((prev) => {
          if (prev[sectionId]) return prev; // already open
          return { ...prev, [sectionId]: true };
        });
      }
    };

    window.addEventListener("tour-expand-section", handler);
    return () => window.removeEventListener("tour-expand-section", handler);
  }, []);

  const toggle = useCallback((id: SectionId) => {
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isOpen = useCallback(
    (id: SectionId) => sections[id] ?? DEFAULT_STATES[id],
    [sections]
  );

  const expandSection = useCallback((id: SectionId) => {
    setSections((prev) => ({ ...prev, [id]: true }));
  }, []);

  const collapseAll = useCallback(() => {
    const allClosed = Object.fromEntries(
      Object.keys(DEFAULT_STATES).map((k) => [k, false])
    ) as Record<SectionId, boolean>;
    setSections(allClosed);
  }, []);

  const expandAll = useCallback(() => {
    const allOpen = Object.fromEntries(
      Object.keys(DEFAULT_STATES).map((k) => [k, true])
    ) as Record<SectionId, boolean>;
    setSections(allOpen);
  }, []);

  return { isOpen, toggle, expandSection, collapseAll, expandAll, hydrated };
}
