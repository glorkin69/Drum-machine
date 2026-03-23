// Web Audio API drum machine engine — only import from client components

import { audioEffects } from "./audio-effects";
import { multiEffectsEngine } from "./multi-effects-engine";
import { audioContextManager } from "./audio-context-manager";
import type { SynthParams } from "./drum-sound-variations";

// Store active variation params per instrument
let variationParams: Record<string, SynthParams> = {};

/** Set synthesis parameter overrides for a specific instrument */
export function setInstrumentVariation(instrumentId: string, params: SynthParams): void {
  variationParams[instrumentId] = params;
}

/** Clear all variation overrides */
export function clearAllVariations(): void {
  variationParams = {};
}

/** Get current variation params for an instrument */
export function getInstrumentVariation(instrumentId: string): SynthParams {
  return variationParams[instrumentId] ?? {};
}

class DrumMachineAudio {
  private audioContext: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private masterOutput: GainNode | null = null;

  init(): void {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
    this.createNoiseBuffer();

    // Initialize effects engines and route master output through them
    // Chain: instruments -> XY pad effects -> multi-effects rack -> destination
    const { input } = audioEffects.init(this.audioContext);
    multiEffectsEngine.init(this.audioContext);
    this.masterOutput = input;

    // Register with audio context manager for iOS handling
    audioContextManager.registerContext(this.audioContext);

    // Auto-resume if suspended (iOS requires user gesture first)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {
        // Will be handled by user interaction via audioContextManager.unlock()
      });
    }
  }

  /** Attempt to resume/unlock the audio context - call from user gesture */
  async resumeContext(): Promise<boolean> {
    if (!this.audioContext) return false;
    return audioContextManager.unlock();
  }

  /** Get the current AudioContext state */
  getContextState(): AudioContextState | null {
    return this.audioContext?.state as AudioContextState | null;
  }

  /** Get the master output node — instruments connect here instead of ctx.destination */
  private getOutput(): AudioNode {
    if (this.masterOutput) return this.masterOutput;
    return this.ensureContext().destination;
  }

  /** Expose AudioContext for effects engine */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  private createNoiseBuffer(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds of noise
    this.noiseBuffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.init();
    }
    // Try to resume if suspended (will only succeed during user gesture)
    if (this.audioContext!.state === "suspended") {
      this.audioContext!.resume().catch(() => {
        // Silent catch - will be handled by audioContextManager
      });
    }
    return this.audioContext!;
  }

  playSound(instrumentId: string, velocity: number = 100): void {
    const ctx = this.ensureContext();
    this.scheduleSoundAtTime(instrumentId, ctx.currentTime, velocity);
  }

  getCurrentTime(): number {
    return this.ensureContext().currentTime;
  }

  scheduleSound(instrumentId: string, time: number, velocity: number = 100): void {
    this.ensureContext();
    this.scheduleSoundAtTime(instrumentId, time, velocity);
  }

  /** Play a sound with specific variation params (for preview) */
  playSoundWithVariation(instrumentId: string, params: SynthParams, velocity: number = 100): void {
    const ctx = this.ensureContext();
    const oldParams = variationParams[instrumentId];
    variationParams[instrumentId] = params;
    this.scheduleSoundAtTime(instrumentId, ctx.currentTime, velocity);
    // Restore previous params
    if (oldParams) {
      variationParams[instrumentId] = oldParams;
    } else {
      delete variationParams[instrumentId];
    }
  }

  private scheduleSoundAtTime(instrumentId: string, time: number, velocity: number = 100): void {
    // Velocity scaling: 0-127 mapped to 0.0-1.0 gain multiplier
    const velGain = Math.max(0, Math.min(1, velocity / 127));
    const p = variationParams[instrumentId] ?? {};

    switch (instrumentId) {
      case "kick":
        this.playKick(time, velGain, p);
        break;
      case "snare":
        this.playSnare(time, velGain, p);
        break;
      case "hihat-closed":
        this.playHihatClosed(time, velGain, p);
        break;
      case "hihat-open":
        this.playHihatOpen(time, velGain, p);
        break;
      case "clap":
        this.playClap(time, velGain, p);
        break;
      case "tom-high":
        this.playTomHigh(time, velGain, p);
        break;
      case "tom-low":
        this.playTomLow(time, velGain, p);
        break;
      case "ride":
        this.playRide(time, velGain, p);
        break;
      default:
        console.warn(`Unknown instrument: ${instrumentId}`);
    }
  }

  /** Apply saturation (soft clipping) via waveshaper if saturation param is set */
  private applySaturation(ctx: AudioContext, node: AudioNode, saturation: number, output: AudioNode): AudioNode {
    if (saturation <= 0) {
      node.connect(output);
      return node;
    }
    const waveshaper = ctx.createWaveShaper();
    const amount = saturation * 50;
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    waveshaper.curve = curve;
    waveshaper.oversample = "2x";
    node.connect(waveshaper);
    waveshaper.connect(output);
    return waveshaper;
  }

  // --- Kick: sine wave with pitch envelope, punchy attack ---
  private playKick(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    // Master velocity gain node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain * (p.gainStart ?? 1.0), time);

    // Apply saturation if needed
    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = p.oscType ?? "sine";
    osc.frequency.setValueAtTime(p.freqStart ?? 150, time);
    osc.frequency.exponentialRampToValueAtTime(p.freqEnd ?? 40, time + (p.freqDecay ?? 0.07));

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.4));

    // Sub-bass layer for extra weight
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(p.subFreqStart ?? 80, time);
    osc2.frequency.exponentialRampToValueAtTime(p.subFreqEnd ?? 30, time + 0.1);
    gain2.gain.setValueAtTime(p.subGain ?? 0.7, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + (p.subDecay ?? 0.3));

    // Click transient for attack
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(p.clickFreq ?? 1000, time);
    clickGain.gain.setValueAtTime(p.clickGain ?? 0.3, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + (p.clickDecay ?? 0.01));

    osc.connect(gain).connect(masterGain);
    osc2.connect(gain2).connect(masterGain);
    clickOsc.connect(clickGain).connect(masterGain);

    osc.start(time);
    osc.stop(time + (p.decay ?? 0.4) + 0.1);
    osc2.start(time);
    osc2.stop(time + (p.subDecay ?? 0.3) + 0.1);
    clickOsc.start(time);
    clickOsc.stop(time + 0.05);

    const cleanupNodes: AudioNode[] = [gain, gain2, clickGain, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([osc, osc2, clickOsc], cleanupNodes, time + 0.7);
  }

  // --- Snare: white noise burst + mid-frequency tone, bandpass filtered ---
  private playSnare(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    // Noise component
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const noiseGain = ctx.createGain();
    const noiseBandpass = ctx.createBiquadFilter();
    noiseBandpass.type = "bandpass";
    noiseBandpass.frequency.setValueAtTime(p.noiseBandpass ?? 5000, time);
    noiseBandpass.Q.setValueAtTime(p.noiseBandpassQ ?? 0.8, time);
    const noiseHighpass = ctx.createBiquadFilter();
    noiseHighpass.type = "highpass";
    noiseHighpass.frequency.setValueAtTime(p.noiseHighpass ?? 1500, time);

    noiseGain.gain.setValueAtTime(p.noiseGain ?? 0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (p.noiseDecay ?? 0.2));

    noiseSource.connect(noiseHighpass).connect(noiseBandpass).connect(noiseGain).connect(masterGain);

    // Tone component (body of the snare)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(p.toneFreqStart ?? 250, time);
    osc.frequency.exponentialRampToValueAtTime(p.toneFreqEnd ?? 120, time + (p.toneDecay ?? 0.04));
    oscGain.gain.setValueAtTime(p.toneGain ?? 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + (p.toneDecay ?? 0.1));

    osc.connect(oscGain).connect(masterGain);

    noiseSource.start(time);
    noiseSource.stop(time + (p.noiseDecay ?? 0.2) + 0.05);
    osc.start(time);
    osc.stop(time + (p.toneDecay ?? 0.1) + 0.05);

    const cleanupNodes: AudioNode[] = [noiseGain, oscGain, noiseBandpass, noiseHighpass, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([noiseSource, osc], cleanupNodes, time + 0.35);
  }

  // --- Hi-hat Closed: high-frequency noise, very short decay, highpass filtered ---
  private playHihatClosed(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const gain = ctx.createGain();
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(p.noiseHighpass ?? 7000, time);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(p.noiseBandpass ?? 10000, time);
    bandpass.Q.setValueAtTime(p.noiseBandpassQ ?? 1.2, time);

    gain.gain.setValueAtTime(p.noiseGain ?? 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (p.noiseDecay ?? 0.05));

    noiseSource.connect(highpass).connect(bandpass).connect(gain).connect(masterGain);

    noiseSource.start(time);
    noiseSource.stop(time + (p.noiseDecay ?? 0.05) + 0.03);

    const cleanupNodes: AudioNode[] = [gain, highpass, bandpass, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([noiseSource], cleanupNodes, time + 0.1);
  }

  // --- Hi-hat Open: same filtering, longer decay ---
  private playHihatOpen(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const gain = ctx.createGain();
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(p.noiseHighpass ?? 7000, time);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(p.noiseBandpass ?? 10000, time);
    bandpass.Q.setValueAtTime(p.noiseBandpassQ ?? 1.2, time);

    gain.gain.setValueAtTime(p.noiseGain ?? 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (p.noiseDecay ?? 0.35));

    noiseSource.connect(highpass).connect(bandpass).connect(gain).connect(masterGain);

    noiseSource.start(time);
    noiseSource.stop(time + (p.noiseDecay ?? 0.35) + 0.05);

    const cleanupNodes: AudioNode[] = [gain, highpass, bandpass, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([noiseSource], cleanupNodes, time + 0.5);
  }

  // --- Clap: multiple short noise bursts with slight delays ---
  private playClap(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const burstCount = p.burstCount ?? 4;
    const burstSpacing = p.burstSpacing ?? 0.01;
    const burstOffsets: number[] = [];
    for (let i = 0; i < burstCount; i++) {
      burstOffsets.push(i * burstSpacing);
    }

    const sources: AudioScheduledSourceNode[] = [];
    const nodes: AudioNode[] = [masterGain];
    if (p.saturation) nodes.push(satNode);

    for (const offset of burstOffsets) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      const gain = ctx.createGain();
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(p.noiseBandpass ?? 2500, time + offset);
      bandpass.Q.setValueAtTime(p.noiseBandpassQ ?? 0.6, time + offset);

      const t = time + offset;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.7, t + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      noiseSource.connect(bandpass).connect(gain).connect(masterGain);

      noiseSource.start(t);
      noiseSource.stop(t + 0.03);

      sources.push(noiseSource);
      nodes.push(gain, bandpass);
    }

    // Tail: longer noise decay after the initial bursts
    const lastOffset = burstOffsets[burstOffsets.length - 1] ?? 0.035;
    const tailSource = ctx.createBufferSource();
    tailSource.buffer = this.noiseBuffer;
    const tailGain = ctx.createGain();
    const tailBandpass = ctx.createBiquadFilter();
    tailBandpass.type = "bandpass";
    tailBandpass.frequency.setValueAtTime(p.noiseBandpass ?? 2500, time + lastOffset);
    tailBandpass.Q.setValueAtTime((p.noiseBandpassQ ?? 0.6) * 0.8, time + lastOffset);

    const tailDecay = p.tailDecay ?? 0.3;
    tailGain.gain.setValueAtTime(0.5, time + lastOffset);
    tailGain.gain.exponentialRampToValueAtTime(0.001, time + lastOffset + tailDecay);

    tailSource.connect(tailBandpass).connect(tailGain).connect(masterGain);
    tailSource.start(time + lastOffset);
    tailSource.stop(time + lastOffset + tailDecay + 0.05);

    sources.push(tailSource);
    nodes.push(tailGain, tailBandpass);

    this.scheduleCleanup(sources, nodes, time + lastOffset + tailDecay + 0.1);
  }

  // --- Tom High: sine with pitch envelope ---
  private playTomHigh(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = p.oscType ?? "sine";
    osc.frequency.setValueAtTime(p.freqStart ?? 200, time);
    osc.frequency.exponentialRampToValueAtTime(p.freqEnd ?? 100, time + (p.freqDecay ?? 0.08));

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.25));

    // Click transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(p.clickFreq ?? 600, time);
    clickGain.gain.setValueAtTime(p.clickGain ?? 0.2, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + (p.clickDecay ?? 0.008));

    osc.connect(gain).connect(masterGain);
    clickOsc.connect(clickGain).connect(masterGain);

    osc.start(time);
    osc.stop(time + (p.decay ?? 0.25) + 0.05);
    clickOsc.start(time);
    clickOsc.stop(time + 0.05);

    const cleanupNodes: AudioNode[] = [gain, clickGain, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([osc, clickOsc], cleanupNodes, time + 0.4);
  }

  // --- Tom Low: sine with pitch envelope ---
  private playTomLow(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(velGain, time);

    const satNode = p.saturation
      ? this.applySaturation(ctx, masterGain, p.saturation, this.getOutput())
      : (masterGain.connect(this.getOutput()), masterGain);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = p.oscType ?? "sine";
    osc.frequency.setValueAtTime(p.freqStart ?? 150, time);
    osc.frequency.exponentialRampToValueAtTime(p.freqEnd ?? 60, time + (p.freqDecay ?? 0.1));

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 0.35));

    // Click transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(p.clickFreq ?? 500, time);
    clickGain.gain.setValueAtTime(p.clickGain ?? 0.2, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + (p.clickDecay ?? 0.008));

    osc.connect(gain).connect(masterGain);
    clickOsc.connect(clickGain).connect(masterGain);

    osc.start(time);
    osc.stop(time + (p.decay ?? 0.35) + 0.05);
    clickOsc.start(time);
    clickOsc.stop(time + 0.05);

    const cleanupNodes: AudioNode[] = [gain, clickGain, masterGain];
    if (p.saturation) cleanupNodes.push(satNode);
    this.scheduleCleanup([osc, clickOsc], cleanupNodes, time + 0.5);
  }

  // --- Ride: metallic sound from detuned oscillators, long decay ---
  private playRide(time: number, velGain: number = 1, p: SynthParams = {}): void {
    const ctx = this.audioContext!;

    // Multiple detuned square/triangle oscillators for metallic character
    const frequencies = p.metallicFreqs ?? [320, 508, 630, 748, 835];
    const sources: AudioScheduledSourceNode[] = [];
    const nodes: AudioNode[] = [];

    const velNode = ctx.createGain();
    velNode.gain.setValueAtTime(velGain, time);
    velNode.connect(this.getOutput());
    nodes.push(velNode);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, time);
    masterGain.gain.exponentialRampToValueAtTime(0.001, time + (p.decay ?? 1.5));
    masterGain.connect(velNode);
    nodes.push(masterGain);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(p.filterFreq ?? 5000, time);
    bandpass.Q.setValueAtTime(p.filterQ ?? 0.5, time);
    bandpass.connect(masterGain);
    nodes.push(bandpass);

    for (const freq of frequencies) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, time);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.15, time);

      osc.connect(oscGain).connect(bandpass);

      osc.start(time);
      osc.stop(time + (p.decay ?? 1.5) + 0.1);

      sources.push(osc);
      nodes.push(oscGain);
    }

    // Noise shimmer layer
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    const noiseGain = ctx.createGain();
    const noiseHighpass = ctx.createBiquadFilter();
    noiseHighpass.type = "highpass";
    noiseHighpass.frequency.setValueAtTime(9000, time);

    noiseGain.gain.setValueAtTime(p.shimmerGain ?? 0.12, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (p.shimmerDecay ?? 0.8));

    noiseSource.connect(noiseHighpass).connect(noiseGain).connect(masterGain);

    noiseSource.start(time);
    noiseSource.stop(time + (p.shimmerDecay ?? 0.8) + 0.2);

    sources.push(noiseSource);
    nodes.push(noiseGain, noiseHighpass);

    this.scheduleCleanup(sources, nodes, time + (p.decay ?? 1.5) + 0.2);
  }

  // --- Cleanup utility: disconnect nodes after they finish ---
  private scheduleCleanup(
    sources: AudioScheduledSourceNode[],
    nodes: AudioNode[],
    afterTime: number
  ): void {
    const delayMs = Math.max(0, (afterTime - this.audioContext!.currentTime) * 1000 + 50);
    setTimeout(() => {
      for (const source of sources) {
        try {
          source.disconnect();
        } catch {
          // already disconnected
        }
      }
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          // already disconnected
        }
      }
    }, delayMs);
  }

  dispose(): void {
    if (this.audioContext) {
      audioEffects.dispose();
      multiEffectsEngine.dispose();
      audioContextManager.dispose();
      this.masterOutput = null;
      this.audioContext.close();
      this.audioContext = null;
      this.noiseBuffer = null;
    }
  }
}

export const drumAudio = new DrumMachineAudio();
