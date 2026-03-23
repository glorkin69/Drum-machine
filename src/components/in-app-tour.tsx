"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle, BookOpen, Rocket, RotateCcw, ArrowRightLeft, ListOrdered, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TourStep {
  target: string;
  title: string;
  description: string;
  /** Which collapsible section must be open for this target */
  section?: string;
  /** Group label for step-list display in advanced mode */
  group?: string;
}

export type TutorialMode = "basic" | "advanced";

// ─── Section-to-tour-target mapping ─────────────────────────────────────────
// Maps data-tour targets to the SectionId that must be expanded
const TARGET_SECTION_MAP: Record<string, string> = {
  "song-mode": "songBuilder",
  "emotion-selector": "emotionControls",
  "style-dna": "styleDna",
  "complexity-slider": "soundShaping",
  "swing-humanize": "soundShaping",
  "virtual-band": "virtualBand",
  "session-recording": "sessionRecording",
  "variation-controls": "fillVariation",
  "xy-pad": "xyPad",
};

// ─── Step Definitions ────────────────────────────────────────────────────────

const BASIC_STEPS: TourStep[] = [
  {
    target: "drum-machine",
    title: "Welcome to BeatForge 808!",
    description:
      "This is your vintage drum machine. It plays 16-step patterns across 7 genres and 5 song parts. Let\u2019s get you started with the basics!",
    group: "Getting Started",
  },
  {
    target: "genre-selector",
    title: "Pick a Genre",
    description:
      "Choose from House, Electronic, Lo-Fi, Pop, Rock, Hip-Hop, or Trap. Each genre loads unique drum patterns tuned to that style.",
    group: "Getting Started",
  },
  {
    target: "song-part-selector",
    title: "Song Parts",
    description:
      "Select Intro, Verse, Chorus, Bridge, or Outro. Different parts use different rhythms so your track has real structure.",
    group: "Getting Started",
  },
  {
    target: "transport-controls",
    title: "Play & BPM",
    description:
      "Hit Play to hear the pattern. Adjust BPM between 60\u2013200 to set the tempo. The LED shows playback status.",
    group: "Playback",
  },
  {
    target: "pattern-grid",
    title: "The Pattern Grid",
    description:
      "Each row is a drum sound, each column is a step. Click pads to toggle hits on/off. The dot indicators show your playback position.",
    group: "Playback",
  },
  {
    target: "save-button",
    title: "Save Your Work",
    description:
      "Happy with your beat? Save it to your account. You can load it again anytime from the Load button next door.",
    group: "Saving",
  },
];

const ADVANCED_STEPS: TourStep[] = [
  // Basics
  {
    target: "drum-machine",
    title: "Welcome to the Full Tour!",
    description:
      "BeatForge 808 is packed with features. This advanced tour covers everything \u2014 from pattern editing to AI instruments and live effects.",
    group: "Basics",
  },
  {
    target: "genre-selector",
    title: "Genre Selection",
    description:
      "Seven genres with curated patterns. Each genre changes the entire drum kit palette and pattern library. Try switching mid-session!",
    group: "Basics",
  },
  {
    target: "song-part-selector",
    title: "Song Parts",
    description:
      "Intro, Verse, Chorus, Bridge, Outro \u2014 each loads rhythms designed for that section. Combine them in Song Mode for full arrangements.",
    group: "Basics",
  },
  {
    target: "transport-controls",
    title: "Transport Controls",
    description:
      "Play/Stop, BPM control (60\u2013200), and the fill trigger button. Hit the fill button for one-shot drum fills during playback.",
    group: "Basics",
  },
  {
    target: "pattern-grid",
    title: "The Pattern Grid",
    description:
      "Toggle pads to build your pattern. The grid supports variable lengths and shows real-time playback position with LED indicators.",
    group: "Pattern Editing",
  },
  {
    target: "editor-toolbar",
    title: "Pattern Editor Toolbar",
    description:
      "Switch between toggle, velocity, and probability editing modes. Use undo/redo, copy/paste rows, clear patterns, and change step length.",
    group: "Pattern Editing",
  },
  {
    target: "pattern-variation",
    title: "Pattern Variations",
    description:
      "Browse curated pattern presets for the current genre and song part. Great starting points you can customize further.",
    group: "Pattern Editing",
  },
  // Performance
  {
    target: "variation-controls",
    title: "A/B Variations & Fills",
    description:
      "Switch between A and B pattern variations, trigger fills, adjust intensity, and enable auto-switching for dynamic live performance.",
    section: "fillVariation",
    group: "Performance",
  },
  {
    target: "complexity-slider",
    title: "Complexity Control",
    description:
      "Slide from minimal (1) to complex (10). The algorithm intelligently adds or removes hits while keeping the groove musical.",
    section: "soundShaping",
    group: "Sound Shaping",
  },
  {
    target: "swing-humanize",
    title: "Swing & Humanization",
    description:
      "Add shuffle with the swing slider. Humanize introduces subtle timing and velocity variations so your beats feel less robotic.",
    section: "soundShaping",
    group: "Sound Shaping",
  },
  // Creative
  {
    target: "emotion-selector",
    title: "Mood & Emotion",
    description:
      "Select a mood like Energetic, Dark, Chill, or Aggressive. Patterns adapt to convey that emotional feel through rhythm choices.",
    section: "emotionControls",
    group: "Creative Tools",
  },
  {
    target: "style-dna",
    title: "Style DNA & Artist Presets",
    description:
      "Explore artist-inspired style profiles. Evolve patterns based on style DNA, view your rhythmic fingerprint, and generate fresh beats.",
    section: "styleDna",
    group: "Creative Tools",
  },
  {
    target: "song-mode",
    title: "Song Mode & Arrangement",
    description:
      "Build full songs by arranging pattern blocks on a timeline. Set per-block fills, loop sections, and export complete arrangements.",
    section: "songBuilder",
    group: "Song Building",
  },
  // Effects & AI
  {
    target: "xy-pad",
    title: "XY Effects Pad",
    description:
      "A Kaoss-style controller for real-time effects: reverb, delay, filter, distortion, and stutter. Drag to morph parameters live.",
    section: "xyPad",
    group: "Effects & AI",
  },
  {
    target: "virtual-band",
    title: "AI Virtual Band",
    description:
      "Enable up to 4 AI instruments \u2014 bass, melody, harmony, and percussion. Set key, scale, and intelligence level for each.",
    section: "virtualBand",
    group: "Effects & AI",
  },
  {
    target: "session-recording",
    title: "Session Recording",
    description:
      "Record your entire session \u2014 every knob twist, pad hit, and change. Play it back, save it, or load past recordings.",
    section: "sessionRecording",
    group: "Recording & Export",
  },
  {
    target: "save-button",
    title: "Save & Load",
    description:
      "Save patterns and full songs to your account. Load them later to keep building. Your creative history is always at hand.",
    group: "Recording & Export",
  },
];

const TOUR_STEPS: Record<string, Record<TutorialMode, TourStep[]>> = {
  dashboard: {
    basic: BASIC_STEPS,
    advanced: ADVANCED_STEPS,
  },
};

// ─── Local Storage Helpers ───────────────────────────────────────────────────

function getTourKey(screenId: string, mode: TutorialMode) {
  return `tour_completed_${screenId}_${mode}`;
}

function getProgressKey(screenId: string, mode: TutorialMode) {
  return `tour_progress_${screenId}_${mode}`;
}

function hasCompletedAnyTour(screenId: string): boolean {
  if (typeof window === "undefined") return false;
  return (
    !!localStorage.getItem(getTourKey(screenId, "basic")) ||
    !!localStorage.getItem(getTourKey(screenId, "advanced")) ||
    !!localStorage.getItem(`tour_completed_${screenId}`) // legacy key
  );
}

function getSavedProgress(screenId: string, mode: TutorialMode): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(getProgressKey(screenId, mode));
  return saved ? parseInt(saved, 10) : 0;
}

function saveProgress(screenId: string, mode: TutorialMode, step: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getProgressKey(screenId, mode), step.toString());
  }
}

function clearProgress(screenId: string, mode: TutorialMode) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(getProgressKey(screenId, mode));
  }
}

// ─── Dispatch section expand event ──────────────────────────────────────────

function requestSectionExpand(sectionId: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tour-expand-section", { detail: { sectionId } })
    );
  }
}

// ─── Selection Modal ─────────────────────────────────────────────────────────

interface TutorialSelectionModalProps {
  onSelect: (mode: TutorialMode) => void;
  onClose: () => void;
  basicProgress: number;
  advancedProgress: number;
}

function TutorialSelectionModal({ onSelect, onClose, basicProgress, advancedProgress }: TutorialSelectionModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[1010] bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-[1011] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#2C1E14] border-2 border-[#D4A574] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#D4A574]" />
              <h2 className="text-base font-mono tracking-wider text-[#D4A574] font-bold uppercase">
                Choose Your Tutorial
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#A08060] hover:text-[#D4A574] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="px-5 text-xs text-[#A08060] leading-relaxed mb-4">
            Pick a learning path that fits your experience level. You can switch anytime.
          </p>

          {/* Options */}
          <div className="px-5 pb-5 space-y-3">
            {/* Basic */}
            <button
              onClick={() => onSelect("basic")}
              className="w-full text-left rounded-xl border-2 border-[#4A3728] hover:border-[#E8732A] bg-[#1A1410] hover:bg-[#1A1410]/80 p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8732A]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8732A]/25 transition-colors">
                  <Rocket className="w-5 h-5 text-[#E8732A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-bold text-[#F5E6D3] tracking-wide">
                      QUICK START
                    </span>
                    <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#E8732A]/20 text-[#E8732A]">
                      {BASIC_STEPS.length} STEPS
                    </span>
                  </div>
                  <p className="text-xs text-[#A08060] leading-relaxed">
                    Learn the essentials: pick a genre, play patterns, and save your first beat. Perfect for getting started fast.
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[0.6rem] text-[#4A3728] font-mono">
                      ~ 2 min
                    </p>
                    {basicProgress > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-[#4A3728] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E8732A] rounded-full"
                            style={{ width: `${(basicProgress / BASIC_STEPS.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[0.55rem] font-mono text-[#E8732A]">
                          {basicProgress}/{BASIC_STEPS.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Advanced */}
            <button
              onClick={() => onSelect("advanced")}
              className="w-full text-left rounded-xl border-2 border-[#4A3728] hover:border-[#D4A574] bg-[#1A1410] hover:bg-[#1A1410]/80 p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4A574]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A574]/25 transition-colors">
                  <BookOpen className="w-5 h-5 text-[#D4A574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-bold text-[#F5E6D3] tracking-wide">
                      FULL TOUR
                    </span>
                    <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#D4A574]/20 text-[#D4A574]">
                      {ADVANCED_STEPS.length} STEPS
                    </span>
                  </div>
                  <p className="text-xs text-[#A08060] leading-relaxed">
                    Deep dive into everything: pattern editing, song mode, AI band, effects, style DNA, recording, and more.
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[0.6rem] text-[#4A3728] font-mono">
                      ~ 5 min
                    </p>
                    {advancedProgress > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-[#4A3728] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4A574] rounded-full"
                            style={{ width: `${(advancedProgress / ADVANCED_STEPS.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[0.55rem] font-mono text-[#D4A574]">
                          {advancedProgress}/{ADVANCED_STEPS.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Keyboard hint */}
          <div className="px-5 pb-4 flex items-center justify-center gap-3 text-[0.55rem] font-mono text-[#4A3728]">
            <span>ESC to close</span>
            <span>&bull;</span>
            <span>Arrow keys to navigate during tour</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Step List Panel ────────────────────────────────────────────────────────

interface StepListPanelProps {
  steps: TourStep[];
  currentStepIndex: number;
  onJumpToStep: (index: number) => void;
  onClose: () => void;
  mode: TutorialMode;
}

function StepListPanel({ steps, currentStepIndex, onJumpToStep, onClose, mode }: StepListPanelProps) {
  // Group steps
  const groups: { label: string; steps: { index: number; step: TourStep }[] }[] = [];
  let currentGroup: typeof groups[number] | null = null;

  steps.forEach((step, i) => {
    const groupLabel = step.group || "General";
    if (!currentGroup || currentGroup.label !== groupLabel) {
      currentGroup = { label: groupLabel, steps: [] };
      groups.push(currentGroup);
    }
    currentGroup.steps.push({ index: i, step });
  });

  return (
    <>
      <div className="fixed inset-0 z-[1010] bg-black/40" onClick={onClose} />
      <div className="fixed z-[1011] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm max-h-[70vh] bg-[#2C1E14] border-2 border-[#D4A574] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#D4A574]" />
            <h3 className="text-xs font-mono tracking-wider text-[#D4A574] font-bold uppercase">
              {mode === "basic" ? "Quick Start" : "Full Tour"} Steps
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#A08060] hover:text-[#D4A574] transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step list */}
        <div className="overflow-y-auto px-4 pb-4 flex-1">
          {groups.map((group, gi) => (
            <div key={gi} className="mb-2">
              <p className="text-[0.55rem] font-mono text-[#4A3728] uppercase tracking-widest mb-1 mt-1">
                {group.label}
              </p>
              {group.steps.map(({ index, step }) => (
                <button
                  key={index}
                  onClick={() => { onJumpToStep(index); onClose(); }}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors mb-0.5 ${
                    index === currentStepIndex
                      ? "bg-[#E8732A]/15 border border-[#E8732A]/30"
                      : index < currentStepIndex
                      ? "hover:bg-[#4A3728]/30"
                      : "hover:bg-[#4A3728]/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[0.55rem] font-mono font-bold ${
                      index === currentStepIndex
                        ? "bg-[#E8732A] text-white"
                        : index < currentStepIndex
                        ? "bg-[#D4A574]/30 text-[#D4A574]"
                        : "bg-[#4A3728] text-[#A08060]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-mono truncate ${
                      index === currentStepIndex
                        ? "text-[#E8732A] font-bold"
                        : index < currentStepIndex
                        ? "text-[#D4A574]"
                        : "text-[#A08060]"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface InAppTourProps {
  screenId: string;
}

export function InAppTour({ screenId }: InAppTourProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [showStepList, setShowStepList] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<TutorialMode>("basic");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({
    top: 0,
    left: 0,
    placement: "bottom" as "top" | "bottom" | "left" | "right",
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hasAutoStarted = useRef(false);

  const allSteps = TOUR_STEPS[screenId];
  const steps = allSteps ? allSteps[tutorialMode] : [];
  const currentStep = steps[currentStepIndex];

  // Auto-show selector on first visit
  useEffect(() => {
    if (hasAutoStarted.current) return;
    if (typeof window === "undefined") return;
    if (hasCompletedAnyTour(screenId)) return;

    hasAutoStarted.current = true;
    const timer = setTimeout(() => setShowSelector(true), 1000);
    return () => clearTimeout(timer);
  }, [screenId]);

  // Listen for external "open tutorial" events (from drum machine header button)
  useEffect(() => {
    const handler = () => {
      if (!isActive) {
        setShowSelector(true);
      }
    };
    window.addEventListener("tour-open-selector", handler);
    return () => window.removeEventListener("tour-open-selector", handler);
  }, [isActive]);

  // ─── Auto-expand sections for current step ─────────────────────────────────

  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Check if step has an explicit section, or use the target-to-section map
    const sectionId = currentStep.section || TARGET_SECTION_MAP[currentStep.target];
    if (sectionId) {
      // Dispatch event to expand the section, then wait for DOM update
      requestSectionExpand(sectionId);
      // Re-check position after section expands
      const timer = setTimeout(() => {
        updatePosition();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isActive, currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Save progress on step change ──────────────────────────────────────────

  useEffect(() => {
    if (isActive) {
      saveProgress(screenId, tutorialMode, currentStepIndex);
    }
  }, [currentStepIndex, isActive, screenId, tutorialMode]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive && !showSelector && !showStepList) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showStepList) {
          setShowStepList(false);
        } else if (showSelector) {
          setShowSelector(false);
        } else if (isActive) {
          endTour();
        }
        e.preventDefault();
      } else if (isActive && !showStepList && !showSelector) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          nextStep();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, showSelector, showStepList, currentStepIndex, steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Position calculation ──────────────────────────────────────────────────

  const updatePosition = useCallback(() => {
    if (!currentStep || !isActive) return;

    const target = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const tooltipW = 340;
    const tooltipH = 200;
    const gap = 16;

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportW - rect.right;
    const spaceLeft = rect.left;

    let placement: "top" | "bottom" | "left" | "right" = "bottom";
    let top = 0;
    let left = 0;

    if (spaceBelow >= tooltipH + gap) {
      placement = "bottom";
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
    } else if (spaceAbove >= tooltipH + gap) {
      placement = "top";
      top = rect.top - tooltipH - gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
    } else if (spaceRight >= tooltipW + gap) {
      placement = "right";
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + gap;
    } else if (spaceLeft >= tooltipW + gap) {
      placement = "left";
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap;
    } else {
      placement = "bottom";
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
    }

    left = Math.max(12, Math.min(left, viewportW - tooltipW - 12));
    top = Math.max(12, Math.min(top, viewportH - tooltipH - 12));

    setTooltipPos({ top, left, placement });

    if (rect.top < 0 || rect.bottom > viewportH) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, isActive]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  // ─── Tour Controls ─────────────────────────────────────────────────────────

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    if (typeof window !== "undefined") {
      localStorage.setItem(getTourKey(screenId, tutorialMode), "true");
      clearProgress(screenId, tutorialMode);
    }
  }, [screenId, tutorialMode]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const jumpToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  const handleSelectMode = (mode: TutorialMode) => {
    setTutorialMode(mode);
    // Resume from saved progress if any
    const savedStep = getSavedProgress(screenId, mode);
    const stepsForMode = allSteps ? allSteps[mode] : [];
    const resumeStep = savedStep > 0 && savedStep < stepsForMode.length ? savedStep : 0;
    setCurrentStepIndex(resumeStep);
    setShowSelector(false);
    setIsActive(true);
  };

  const handleSwitchMode = () => {
    setIsActive(false);
    setShowSelector(true);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    clearProgress(screenId, tutorialMode);
  };

  const openSelector = () => {
    setShowSelector(true);
  };

  if (!allSteps) return null;

  const basicProgress = getSavedProgress(screenId, "basic");
  const advancedProgress = getSavedProgress(screenId, "advanced");

  return (
    <>
      {/* Floating help button */}
      {!isActive && !showSelector && (
        <button
          onClick={openSelector}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#E8732A] text-white shadow-lg hover:bg-[#D4651F] transition-all hover:scale-105 flex items-center justify-center group"
          title="Start tutorial"
        >
          <HelpCircle className="w-6 h-6" />
          <span className="absolute right-full mr-2 px-2 py-1 rounded bg-[#2C1E14] border border-[#D4A574] text-xs font-mono text-[#D4A574] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Tutorial
          </span>
        </button>
      )}

      {/* Tutorial selection modal */}
      {showSelector && (
        <TutorialSelectionModal
          onSelect={handleSelectMode}
          onClose={() => setShowSelector(false)}
          basicProgress={basicProgress}
          advancedProgress={advancedProgress}
        />
      )}

      {/* Step list panel */}
      {showStepList && isActive && (
        <StepListPanel
          steps={steps}
          currentStepIndex={currentStepIndex}
          onJumpToStep={jumpToStep}
          onClose={() => setShowStepList(false)}
          mode={tutorialMode}
        />
      )}

      {/* Active tour overlay */}
      {isActive && currentStep && (
        <>
          {/* Dimming overlay */}
          <div
            className="fixed inset-0 z-[998] bg-black/25 transition-opacity duration-300"
            onClick={endTour}
          />

          {/* Spotlight */}
          <SpotlightOverlay target={currentStep.target} />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="fixed z-[1000] bg-[#2C1E14] border-2 border-[#D4A574] rounded-xl shadow-2xl p-4 transition-all duration-300"
            style={{ top: tooltipPos.top, left: tooltipPos.left, width: 340 }}
          >
            {/* Title row */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                {/* Group label */}
                {currentStep.group && (
                  <span className="text-[0.5rem] font-mono text-[#4A3728] uppercase tracking-widest">
                    {currentStep.group}
                  </span>
                )}
                <h3 className="text-sm font-mono tracking-wider text-[#D4A574] font-bold leading-tight">
                  {currentStep.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[0.6rem] text-[#A08060] font-mono">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                  <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded bg-[#4A3728] text-[#A08060] uppercase">
                    {tutorialMode === "basic" ? "Quick Start" : "Full Tour"}
                  </span>
                </div>
              </div>
              <button
                onClick={endTour}
                className="text-[#A08060] hover:text-[#D4A574] transition-colors p-1 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-[#C8A882] leading-relaxed mb-3 mt-2">
              {currentStep.description}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-[#4A3728] rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-[#E8732A] rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Clickable dot indicators - jump to step */}
              <div className="flex gap-1 flex-wrap max-w-[110px]">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => jumpToStep(i)}
                    className={`w-2 h-2 rounded-full transition-all hover:scale-150 ${
                      i === currentStepIndex
                        ? "bg-[#E8732A] scale-125"
                        : i < currentStepIndex
                        ? "bg-[#D4A574] hover:bg-[#E8732A]"
                        : "bg-[#4A3728] hover:bg-[#A08060]"
                    }`}
                    title={`Step ${i + 1}: ${steps[i].title}`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {/* Step list */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStepList(true)}
                  className="h-7 w-7 p-0 text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
                  title="View all steps"
                >
                  <ListOrdered className="w-3 h-3" />
                </Button>
                {/* Restart button */}
                {currentStepIndex > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRestart}
                    className="h-7 w-7 p-0 text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
                    title="Restart tutorial"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
                {/* Switch mode */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSwitchMode}
                  className="h-7 w-7 p-0 text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
                  title={tutorialMode === "basic" ? "Switch to Full Tour" : "Switch to Quick Start"}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </Button>
                {/* Back */}
                {currentStepIndex > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={prevStep}
                    className="h-7 px-2 text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F] text-xs font-mono"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Back
                  </Button>
                )}
                {/* Next / Finish */}
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-7 px-3 bg-[#E8732A] hover:bg-[#D4651F] text-white text-xs font-mono"
                >
                  {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
                  {currentStepIndex < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center justify-center gap-2 mt-2 text-[0.5rem] font-mono text-[#4A3728]">
              <span>ESC close</span>
              <span>&bull;</span>
              <span>&larr; &rarr; navigate</span>
              <span>&bull;</span>
              <span>ENTER next</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Spotlight Overlay ───────────────────────────────────────────────────────

function SpotlightOverlay({ target }: { target: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (el) setRect(el.getBoundingClientRect());

    const update = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    // Also update after a delay (for section expand animations)
    const timer = setTimeout(update, 400);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      clearTimeout(timer);
    };
  }, [target]);

  if (!rect) return null;

  const padding = 8;

  return (
    <div
      className="fixed z-[999] pointer-events-none tour-spotlight"
      style={{
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
    />
  );
}
