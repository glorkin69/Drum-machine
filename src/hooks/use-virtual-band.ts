/**
 * useVirtualBand - Virtual band member management hook
 *
 * Manages AI-powered virtual musicians that generate complementary
 * musical parts based on the current drum pattern.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  VirtualBandMember,
  VirtualInstrument,
  MusicalKey,
  MusicalScale,
  AIIntelligenceLevel,
} from "@/lib/collab-types";
import { VIRTUAL_BAND_PRESETS } from "@/lib/collab-types";
import { generateVirtualBandPattern, virtualBandAudio } from "@/lib/virtual-band-engine";
import type { DrumPattern, PatternLength } from "@/lib/drum-patterns";

function createDefaultMember(instrument: VirtualInstrument): VirtualBandMember {
  const preset = VIRTUAL_BAND_PRESETS[instrument];
  return {
    ...preset,
    id: `vb_${instrument}_${Date.now()}`,
    generatedPattern: [],
    generatedVelocity: [],
  };
}

export function useVirtualBand() {
  const [members, setMembers] = useState<VirtualBandMember[]>([
    createDefaultMember("bass"),
    createDefaultMember("melody"),
    createDefaultMember("harmony"),
    createDefaultMember("percussion"),
  ]);

  const [isInitialized, setIsInitialized] = useState(false);
  const membersRef = useRef(members);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  /** Initialize the virtual band audio engine */
  const initAudio = useCallback((audioContext: AudioContext, destination: AudioNode) => {
    virtualBandAudio.init(audioContext, destination);
    setIsInitialized(true);
  }, []);

  /** Toggle a member on/off */
  const toggleMember = useCallback((instrument: VirtualInstrument) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.instrument === instrument ? { ...m, enabled: !m.enabled } : m
      )
    );
  }, []);

  /** Update a member's settings */
  const updateMember = useCallback(
    (instrument: VirtualInstrument, updates: Partial<VirtualBandMember>) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.instrument === instrument ? { ...m, ...updates } : m
        )
      );
    },
    []
  );

  /** Set member volume */
  const setMemberVolume = useCallback(
    (instrument: VirtualInstrument, volume: number) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.instrument === instrument) {
            virtualBandAudio.setVolume(m.id, volume);
            return { ...m, volume };
          }
          return m;
        })
      );
    },
    []
  );

  /** Set member key */
  const setMemberKey = useCallback((instrument: VirtualInstrument, key: MusicalKey) => {
    setMembers((prev) =>
      prev.map((m) => (m.instrument === instrument ? { ...m, key } : m))
    );
  }, []);

  /** Set member scale */
  const setMemberScale = useCallback((instrument: VirtualInstrument, scale: MusicalScale) => {
    setMembers((prev) =>
      prev.map((m) => (m.instrument === instrument ? { ...m, scale } : m))
    );
  }, []);

  /** Set member intelligence level */
  const setMemberIntelligence = useCallback(
    (instrument: VirtualInstrument, intelligence: AIIntelligenceLevel) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.instrument === instrument ? { ...m, intelligence } : m
        )
      );
    },
    []
  );

  /** Set member octave */
  const setMemberOctave = useCallback((instrument: VirtualInstrument, octave: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.instrument === instrument ? { ...m, octave } : m))
    );
  }, []);

  /** Set follow intensity */
  const setFollowIntensity = useCallback(
    (instrument: VirtualInstrument, followIntensity: number) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.instrument === instrument ? { ...m, followIntensity } : m
        )
      );
    },
    []
  );

  /** Generate patterns for all enabled members */
  const generatePatterns = useCallback(
    (drumPattern: DrumPattern, patternLength: PatternLength) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (!m.enabled) return m;

          const { notes, velocities } = generateVirtualBandPattern(
            drumPattern,
            patternLength,
            m
          );

          return {
            ...m,
            generatedPattern: notes,
            generatedVelocity: velocities,
          };
        })
      );
    },
    []
  );

  /** Schedule a step's notes for all enabled members */
  const scheduleStep = useCallback(
    (step: number, time: number) => {
      if (!isInitialized) return;

      for (const member of membersRef.current) {
        if (!member.enabled) continue;
        if (step >= member.generatedPattern.length) continue;

        const note = member.generatedPattern[step];
        if (note === null || note === undefined) continue;

        const velocity = member.generatedVelocity[step] || 80;
        virtualBandAudio.scheduleNote(
          member.instrument,
          member.id,
          note,
          velocity,
          time,
          member.volume
        );
      }
    },
    [isInitialized]
  );

  /** Get enabled member count */
  const enabledCount = members.filter((m) => m.enabled).length;

  /** Dispose audio resources */
  const dispose = useCallback(() => {
    virtualBandAudio.dispose();
    setIsInitialized(false);
  }, []);

  return {
    members,
    enabledCount,
    isInitialized,
    initAudio,
    toggleMember,
    updateMember,
    setMemberVolume,
    setMemberKey,
    setMemberScale,
    setMemberIntelligence,
    setMemberOctave,
    setFollowIntensity,
    generatePatterns,
    scheduleStep,
    dispose,
  };
}
