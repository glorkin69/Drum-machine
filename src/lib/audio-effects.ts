// Web Audio API effects engine for XY Kaoss Pad controller
// Only import from client components

export type EffectType = "reverb" | "delay" | "filter" | "distortion" | "stutter";

export type EffectTarget = "master" | string; // "master" or an instrumentId

export interface EffectParams {
  x: number; // 0-1
  y: number; // 0-1
}

export interface EffectState {
  type: EffectType;
  enabled: boolean;
  params: EffectParams;
  locked: boolean;
}

const SMOOTHING_TIME = 0.03; // 30ms for smooth parameter changes

class AudioEffectsEngine {
  private audioContext: AudioContext | null = null;
  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;

  // Effect nodes
  private reverbConvolver: ConvolverNode | null = null;
  private reverbPreDelay: DelayNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private distortionToneFilter: BiquadFilterNode | null = null;
  private distortionGain: GainNode | null = null;

  // Stutter effect nodes
  private stutterGainNode: GainNode | null = null;
  private stutterSchedulerId: ReturnType<typeof setInterval> | null = null;
  private stutterLastScheduledTime: number = 0;
  private stutterRate: number = 0.25; // note division multiplier
  private stutterIntensity: number = 0.5;

  // BPM for beat-synced effects
  private bpm: number = 120;

  // Effect target (which instrument or "master")
  private effectTarget: EffectTarget = "master";

  private currentEffect: EffectType = "filter";
  private enabled: boolean = false;
  private engaged: boolean = false; // Whether user is actively pressing the pad
  private initialized: boolean = false;

  /**
   * Initialize the effects engine and insert it into the audio chain.
   * Call this after the AudioContext is created.
   */
  init(audioContext: AudioContext): { input: GainNode; output: GainNode } {
    if (this.initialized && this.audioContext === audioContext) {
      return { input: this.inputNode!, output: this.outputNode! };
    }

    this.audioContext = audioContext;

    // Create main routing nodes
    this.inputNode = audioContext.createGain();
    this.outputNode = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();

    this.inputNode.gain.setValueAtTime(1, audioContext.currentTime);
    this.outputNode.gain.setValueAtTime(1, audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(1, audioContext.currentTime);
    this.wetGain.gain.setValueAtTime(0, audioContext.currentTime);

    // Dry path: input -> dryGain -> output
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
    this.outputNode.connect(audioContext.destination);

    // Create all effect nodes
    this.createReverbNodes(audioContext);
    this.createDelayNodes(audioContext);
    this.createFilterNodes(audioContext);
    this.createDistortionNodes(audioContext);
    this.createStutterNodes(audioContext);

    this.initialized = true;
    return { input: this.inputNode, output: this.outputNode };
  }

  private createReverbNodes(ctx: AudioContext): void {
    // Create impulse response for convolution reverb
    this.reverbConvolver = ctx.createConvolver();
    this.reverbPreDelay = ctx.createDelay(0.1);
    this.reverbPreDelay.delayTime.setValueAtTime(0.02, ctx.currentTime);

    // Generate synthetic impulse response
    this.updateReverbImpulse(2.0);
  }

  private updateReverbImpulse(duration: number): void {
    if (!this.audioContext || !this.reverbConvolver) return;
    const ctx = this.audioContext;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(0.1, duration));
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with some early reflections
        const t = i / sampleRate;
        const decay = Math.exp(-3 * t / duration);
        data[i] = (Math.random() * 2 - 1) * decay;

        // Add subtle early reflections
        if (t < 0.08) {
          const reflectionGain = (1 - t / 0.08) * 0.3;
          data[i] += (Math.random() * 2 - 1) * reflectionGain;
        }
      }
    }

    this.reverbConvolver.buffer = impulse;
  }

  private createDelayNodes(ctx: AudioContext): void {
    this.delayNode = ctx.createDelay(1.5);
    this.delayNode.delayTime.setValueAtTime(0.3, ctx.currentTime);

    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.3, ctx.currentTime);

    this.delayWet = ctx.createGain();
    this.delayWet.gain.setValueAtTime(0.5, ctx.currentTime);

    // Delay feedback loop
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Delay output
    this.delayNode.connect(this.delayWet);
  }

  private createFilterNodes(ctx: AudioContext): void {
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.setValueAtTime(2000, ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1, ctx.currentTime);
  }

  private createDistortionNodes(ctx: AudioContext): void {
    this.distortionNode = ctx.createWaveShaper();
    this.distortionNode.oversample = "4x";
    this.distortionGain = ctx.createGain();
    this.distortionGain.gain.setValueAtTime(1, ctx.currentTime);

    this.distortionToneFilter = ctx.createBiquadFilter();
    this.distortionToneFilter.type = "lowpass";
    this.distortionToneFilter.frequency.setValueAtTime(8000, ctx.currentTime);
    this.distortionToneFilter.Q.setValueAtTime(0.5, ctx.currentTime);

    // Set default distortion curve
    this.updateDistortionCurve(0.5);

    this.distortionNode.connect(this.distortionToneFilter);
    this.distortionToneFilter.connect(this.distortionGain);
  }

  private createStutterNodes(ctx: AudioContext): void {
    this.stutterGainNode = ctx.createGain();
    this.stutterGainNode.gain.setValueAtTime(1, ctx.currentTime);
  }

  private updateDistortionCurve(amount: number): void {
    if (!this.distortionNode) return;
    const samples = 256;
    const curve = new Float32Array(samples);
    const drive = Math.max(0.01, amount * 50);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (Math.PI + drive) * x / (Math.PI + drive * Math.abs(x));
    }
    this.distortionNode.curve = curve;
  }

  /**
   * Connect the effect chain for the given effect type
   */
  private connectEffect(type: EffectType): void {
    if (!this.audioContext || !this.inputNode || !this.wetGain || !this.outputNode) return;

    // Disconnect any existing wet path
    this.disconnectWetPath();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    switch (type) {
      case "reverb":
        if (this.reverbPreDelay && this.reverbConvolver) {
          this.inputNode.connect(this.reverbPreDelay);
          this.reverbPreDelay.connect(this.reverbConvolver);
          this.reverbConvolver.connect(this.wetGain);
          this.wetGain.connect(this.outputNode);
        }
        break;

      case "delay":
        if (this.delayNode && this.delayWet) {
          this.inputNode.connect(this.delayNode);
          this.delayWet.connect(this.wetGain);
          this.wetGain.connect(this.outputNode);
        }
        break;

      case "filter":
        if (this.filterNode) {
          // For filter, we replace the dry path entirely
          this.dryGain!.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
          this.inputNode.connect(this.filterNode);
          this.filterNode.connect(this.wetGain);
          this.wetGain.connect(this.outputNode);
          this.wetGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
        }
        break;

      case "distortion":
        if (this.distortionNode && this.distortionGain) {
          this.dryGain!.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
          this.inputNode.connect(this.distortionNode);
          this.distortionGain.connect(this.wetGain);
          this.wetGain.connect(this.outputNode);
          this.wetGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
        }
        break;

      case "stutter":
        if (this.stutterGainNode) {
          // Stutter replaces dry path with gated signal
          this.dryGain!.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
          this.inputNode.connect(this.stutterGainNode);
          this.stutterGainNode.connect(this.wetGain);
          this.wetGain.connect(this.outputNode);
          this.wetGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
          // Start the stutter scheduling loop
          this.startStutterScheduler();
        }
        break;
    }

    this.currentEffect = type;
  }

  /**
   * Start the stutter gate scheduler. Uses setInterval to continuously
   * schedule gain automation events in a lookahead window.
   */
  private startStutterScheduler(): void {
    this.stopStutterScheduler();
    if (!this.audioContext || !this.stutterGainNode) return;

    this.stutterLastScheduledTime = this.audioContext.currentTime;

    this.stutterSchedulerId = setInterval(() => {
      this.scheduleStutterEvents();
    }, 25); // Schedule every 25ms
  }

  private stopStutterScheduler(): void {
    if (this.stutterSchedulerId !== null) {
      clearInterval(this.stutterSchedulerId);
      this.stutterSchedulerId = null;
    }
    // Reset stutter gain to 1
    if (this.stutterGainNode && this.audioContext) {
      this.stutterGainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.stutterGainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    }
  }

  /**
   * Schedule stutter gate on/off events in a lookahead window
   */
  private scheduleStutterEvents(): void {
    if (!this.audioContext || !this.stutterGainNode) return;

    const now = this.audioContext.currentTime;
    const lookahead = 0.1; // 100ms lookahead
    const scheduleUntil = now + lookahead;

    // Calculate stutter cycle duration based on BPM and rate
    // stutterRate: note division multiplier (1 = quarter, 0.5 = eighth, 0.25 = sixteenth, 0.125 = thirty-second)
    const beatDuration = 60 / this.bpm; // duration of one quarter note in seconds
    const cycleDuration = beatDuration * this.stutterRate;
    const minCycle = 0.02; // 20ms minimum to prevent audio glitches
    const safeCycle = Math.max(minCycle, cycleDuration);

    // Gate floor based on intensity (0 = no gate, 1 = full silence)
    const gateFloor = Math.max(0.001, 1 - this.stutterIntensity);

    // On duration is 60% of cycle, off (gated) is 40%
    const onDuration = safeCycle * 0.6;
    const offDuration = safeCycle * 0.4;

    let t = this.stutterLastScheduledTime;
    if (t < now) t = now;

    const gain = this.stutterGainNode.gain;

    while (t < scheduleUntil) {
      // Gate ON (full volume)
      gain.setValueAtTime(1, t);
      // Smooth transition to gate floor
      const offTime = t + onDuration;
      if (offTime < scheduleUntil + safeCycle) {
        gain.setTargetAtTime(gateFloor, offTime, 0.005);
      }
      t += safeCycle;
    }

    this.stutterLastScheduledTime = t;
  }

  private disconnectWetPath(): void {
    if (!this.audioContext || !this.inputNode) return;
    const now = this.audioContext.currentTime;

    // Stop stutter scheduler if running
    this.stopStutterScheduler();

    try {
      // Disconnect input from all effect nodes
      if (this.reverbPreDelay) {
        try { this.inputNode.disconnect(this.reverbPreDelay); } catch { /* not connected */ }
      }
      if (this.delayNode) {
        try { this.inputNode.disconnect(this.delayNode); } catch { /* not connected */ }
      }
      if (this.filterNode) {
        try { this.inputNode.disconnect(this.filterNode); } catch { /* not connected */ }
        try { this.filterNode.disconnect(this.wetGain!); } catch { /* not connected */ }
      }
      if (this.distortionNode) {
        try { this.inputNode.disconnect(this.distortionNode); } catch { /* not connected */ }
      }
      if (this.stutterGainNode) {
        try { this.inputNode.disconnect(this.stutterGainNode); } catch { /* not connected */ }
        try { this.stutterGainNode.disconnect(this.wetGain!); } catch { /* not connected */ }
      }
      // Disconnect wet from output
      if (this.wetGain && this.outputNode) {
        try { this.wetGain.disconnect(this.outputNode); } catch { /* not connected */ }
      }
      // Disconnect reverb chain
      if (this.reverbConvolver && this.wetGain) {
        try { this.reverbConvolver.disconnect(this.wetGain); } catch { /* not connected */ }
      }
      if (this.delayWet && this.wetGain) {
        try { this.delayWet.disconnect(this.wetGain); } catch { /* not connected */ }
      }
      if (this.distortionGain && this.wetGain) {
        try { this.distortionGain.disconnect(this.wetGain); } catch { /* not connected */ }
      }
    } catch {
      // Ignore disconnection errors
    }

    // Restore dry path
    if (this.dryGain) {
      this.dryGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
    }
    if (this.wetGain) {
      this.wetGain.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
    }
  }

  /**
   * Enable effects processing (master on/off)
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.initialized) return;

    this.updateEffectState();
  }

  /**
   * Set whether user is actively engaging the pad (press-and-hold)
   */
  setEngaged(engaged: boolean): void {
    this.engaged = engaged;
    if (!this.initialized) return;

    this.updateEffectState();
  }

  /**
   * Update effect routing based on enabled and engaged states
   */
  private updateEffectState(): void {
    const shouldBeActive = this.enabled && this.engaged;

    if (shouldBeActive) {
      this.connectEffect(this.currentEffect);
    } else {
      this.disconnectWetPath();
    }
  }

  /**
   * Switch which effect the XY pad controls
   */
  setEffectType(type: EffectType): void {
    const wasEnabled = this.enabled;
    if (wasEnabled) {
      this.disconnectWetPath();
    }
    this.currentEffect = type;
    if (wasEnabled) {
      this.connectEffect(type);
    }
  }

  /**
   * Set BPM for beat-synced effects (stutter)
   */
  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  /**
   * Set the effect target (which instrument or "master" for whole mix)
   */
  setEffectTarget(target: EffectTarget): void {
    this.effectTarget = target;
  }

  /**
   * Get the current effect target
   */
  getEffectTarget(): EffectTarget {
    return this.effectTarget;
  }

  /**
   * Get the current stutter rate info for display
   */
  getStutterRateLabel(x: number): string {
    if (x < 0.25) return "1/4";
    if (x < 0.5) return "1/8";
    if (x < 0.75) return "1/16";
    return "1/32";
  }

  /**
   * Update effect parameters from XY pad position (0-1 for both axes)
   */
  updateParams(x: number, y: number): void {
    if (!this.initialized || !this.enabled || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    switch (this.currentEffect) {
      case "reverb":
        this.updateReverbParams(x, y, now);
        break;
      case "delay":
        this.updateDelayParams(x, y, now);
        break;
      case "filter":
        this.updateFilterParams(x, y, now);
        break;
      case "distortion":
        this.updateDistortionParams(x, y, now);
        break;
      case "stutter":
        this.updateStutterParams(x, y);
        break;
    }
  }

  private updateReverbParams(x: number, y: number, now: number): void {
    // X = room size (reverb tail duration 0.3 - 5 seconds)
    const roomSize = 0.3 + x * 4.7;
    this.updateReverbImpulse(roomSize);

    // Y = wet/dry mix
    if (this.wetGain && this.dryGain) {
      const wetAmount = y * 0.8; // Cap at 80% wet
      this.wetGain.gain.setTargetAtTime(wetAmount, now, SMOOTHING_TIME);
      this.dryGain.gain.setTargetAtTime(1 - wetAmount * 0.5, now, SMOOTHING_TIME);
    }
  }

  private updateDelayParams(x: number, y: number, now: number): void {
    // X = delay time (50ms - 1200ms)
    if (this.delayNode) {
      const delayTime = 0.05 + x * 1.15;
      this.delayNode.delayTime.setTargetAtTime(delayTime, now, SMOOTHING_TIME);
    }

    // Y = feedback amount (0% - 85%)
    if (this.delayFeedback && this.wetGain) {
      const feedback = y * 0.85;
      this.delayFeedback.gain.setTargetAtTime(feedback, now, SMOOTHING_TIME);
      this.wetGain.gain.setTargetAtTime(0.3 + y * 0.5, now, SMOOTHING_TIME);
    }
  }

  private updateFilterParams(x: number, y: number, now: number): void {
    if (!this.filterNode) return;

    // X = cutoff frequency (60Hz - 18kHz, logarithmic)
    const minFreq = 60;
    const maxFreq = 18000;
    const frequency = minFreq * Math.pow(maxFreq / minFreq, x);
    this.filterNode.frequency.setTargetAtTime(frequency, now, SMOOTHING_TIME);

    // Y = resonance (Q value: 0.5 - 20)
    const q = 0.5 + y * 19.5;
    this.filterNode.Q.setTargetAtTime(q, now, SMOOTHING_TIME);
  }

  private updateDistortionParams(x: number, y: number, now: number): void {
    // X = drive amount
    this.updateDistortionCurve(x);

    // Y = tone (filter cutoff 200Hz - 12kHz)
    if (this.distortionToneFilter) {
      const tone = 200 + y * 11800;
      this.distortionToneFilter.frequency.setTargetAtTime(tone, now, SMOOTHING_TIME);
    }

    // Compensate volume for distortion
    if (this.distortionGain) {
      const compensation = 1 / (1 + x * 0.5);
      this.distortionGain.gain.setTargetAtTime(compensation, now, SMOOTHING_TIME);
    }
  }

  private updateStutterParams(x: number, y: number): void {
    // X = stutter rate (note division)
    // Map to note divisions: 1/4, 1/8, 1/16, 1/32
    if (x < 0.25) {
      this.stutterRate = 1; // quarter note
    } else if (x < 0.5) {
      this.stutterRate = 0.5; // eighth note
    } else if (x < 0.75) {
      this.stutterRate = 0.25; // sixteenth note
    } else {
      this.stutterRate = 0.125; // thirty-second note
    }

    // Y = intensity (gate depth: 0 = subtle, 1 = full chop)
    this.stutterIntensity = y;
  }

  /**
   * Get the master input node (connect instrument audio here instead of destination)
   */
  getMasterInput(): GainNode | null {
    return this.inputNode;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getCurrentEffect(): EffectType {
    return this.currentEffect;
  }

  dispose(): void {
    this.stopStutterScheduler();
    this.disconnectWetPath();
    this.inputNode = null;
    this.outputNode = null;
    this.dryGain = null;
    this.wetGain = null;
    this.reverbConvolver = null;
    this.reverbPreDelay = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.filterNode = null;
    this.distortionNode = null;
    this.distortionToneFilter = null;
    this.distortionGain = null;
    this.stutterGainNode = null;
    this.audioContext = null;
    this.initialized = false;
  }
}

export const audioEffects = new AudioEffectsEngine();
