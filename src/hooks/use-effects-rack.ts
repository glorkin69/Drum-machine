"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  RackEffectType,
  EffectSlot,
  EffectSlotParams,
  EffectTargetMode,
} from "@/lib/effects-rack-types";
import { createDefaultSlot, getEffectDefinition } from "@/lib/effects-rack-types";
import { multiEffectsEngine } from "@/lib/multi-effects-engine";
import { drumAudio } from "@/lib/audio-engine";

const STORAGE_KEY = "beatforge-effects-rack";

interface StoredState {
  slots: EffectSlot[];
}

export function useEffectsRack() {
  const [slots, setSlots] = useState<EffectSlot[]>([
    createDefaultSlot(0),
    createDefaultSlot(1),
    createDefaultSlot(2),
  ]);
  const [masterEnabled, setMasterEnabled] = useState(false);
  const initializedRef = useRef(false);

  // Load persisted state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredState;
        if (parsed.slots && parsed.slots.length === 3) {
          setSlots(parsed.slots);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots }));
    } catch {
      // ignore
    }
  }, [slots]);

  // Initialize audio engine when master is enabled
  useEffect(() => {
    if (masterEnabled && !initializedRef.current) {
      drumAudio.init();
      const ctx = drumAudio.getAudioContext();
      if (ctx) {
        multiEffectsEngine.init(ctx);
        initializedRef.current = true;
      }
    }
  }, [masterEnabled]);

  // Sync slots to audio engine whenever they change
  useEffect(() => {
    if (!masterEnabled || !initializedRef.current) return;

    for (const slot of slots) {
      if (slot.effectType) {
        multiEffectsEngine.setSlotEffect(slot.id, slot.effectType, slot.params);
        multiEffectsEngine.setSlotEnabled(slot.id, slot.enabled);
      } else {
        multiEffectsEngine.setSlotEffect(slot.id, null, slot.params);
      }
    }
  }, [slots, masterEnabled]);

  const setSlotEffect = useCallback((slotIndex: number, effectType: RackEffectType | null) => {
    setSlots((prev) => {
      const next = [...prev];
      if (!effectType) {
        next[slotIndex] = { ...next[slotIndex], effectType: null, enabled: false };
      } else {
        const def = getEffectDefinition(effectType);
        next[slotIndex] = {
          ...next[slotIndex],
          effectType,
          enabled: true,
          params: {
            mix: def.mixDefault,
            param1: def.param1Default,
            param2: def.param2Default,
          },
        };
      }
      return next;
    });
  }, []);

  const toggleSlotEnabled = useCallback((slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], enabled: !next[slotIndex].enabled };
      return next;
    });
  }, []);

  const updateSlotParams = useCallback((slotIndex: number, params: Partial<EffectSlotParams>) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        ...next[slotIndex],
        params: { ...next[slotIndex].params, ...params },
      };
      return next;
    });

    // Immediate audio engine update for responsiveness
    if (initializedRef.current) {
      const slot = slots[slotIndex];
      if (slot?.effectType) {
        const merged = { ...slot.params, ...params };
        multiEffectsEngine.updateSlotParams(slotIndex, merged);
      }
    }
  }, [slots]);

  const clearSlot = useCallback((slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = createDefaultSlot(slotIndex);
      return next;
    });
  }, []);

  const setSlotTargetMode = useCallback((slotIndex: number, mode: EffectTargetMode) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        ...next[slotIndex],
        targetMode: mode,
        targetInstrument: mode === "global" ? "master" : next[slotIndex].targetInstrument,
      };
      return next;
    });
  }, []);

  const setSlotTargetInstrument = useCallback((slotIndex: number, instrumentId: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], targetInstrument: instrumentId };
      return next;
    });
  }, []);

  const toggleMaster = useCallback(() => {
    setMasterEnabled((prev) => !prev);
  }, []);

  return {
    slots,
    masterEnabled,
    toggleMaster,
    setSlotEffect,
    toggleSlotEnabled,
    updateSlotParams,
    clearSlot,
    setSlotTargetMode,
    setSlotTargetInstrument,
  };
}
