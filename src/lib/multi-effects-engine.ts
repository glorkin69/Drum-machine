// Multi-slot audio effects engine with 3 simultaneous effect slots
// Supports 11 effect types with per-slot parameters, bypass, and instrument targeting

import type { RackEffectType, EffectSlotParams } from "./effects-rack-types";

const SMOOTHING_TIME = 0.03;

interface SlotNodes {
  inputGain: GainNode;
  dryGain: GainNode;
  wetGain: GainNode;
  outputGain: GainNode;
  // Effect-specific nodes stored generically
  effectNodes: AudioNode[];
  // For modulation effects
  lfoOsc?: OscillatorNode;
  lfoGain?: GainNode;
  // Bitcrusher script
  bitcrusherProcessor?: ScriptProcessorNode;
}

class MultiEffectsEngine {
  private audioContext: AudioContext | null = null;
  private masterInputNode: GainNode | null = null;
  private masterOutputNode: GainNode | null = null;
  private initialized = false;

  // 3 effect slot node chains
  private slots: (SlotNodes | null)[] = [null, null, null];
  private slotEffectTypes: (RackEffectType | null)[] = [null, null, null];
  private slotEnabled: boolean[] = [false, false, false];

  init(audioContext: AudioContext): { input: GainNode; output: GainNode } {
    if (this.initialized && this.audioContext === audioContext) {
      return { input: this.masterInputNode!, output: this.masterOutputNode! };
    }

    this.audioContext = audioContext;

    // Master routing: input -> slot1 -> slot2 -> slot3 -> output -> destination
    this.masterInputNode = audioContext.createGain();
    this.masterOutputNode = audioContext.createGain();
    this.masterInputNode.gain.setValueAtTime(1, audioContext.currentTime);
    this.masterOutputNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Initially pass-through: input -> output -> destination
    this.masterInputNode.connect(this.masterOutputNode);
    this.masterOutputNode.connect(audioContext.destination);

    this.initialized = true;
    return { input: this.masterInputNode, output: this.masterOutputNode };
  }

  /**
   * Set up or update an effect in a specific slot
   */
  setSlotEffect(slotIndex: number, effectType: RackEffectType | null, params: EffectSlotParams): void {
    if (!this.audioContext || !this.initialized || slotIndex < 0 || slotIndex > 2) return;

    // If clearing the slot
    if (!effectType) {
      this.clearSlot(slotIndex);
      return;
    }

    // If effect type changed, rebuild the slot
    if (this.slotEffectTypes[slotIndex] !== effectType) {
      this.clearSlot(slotIndex);
      this.buildSlotEffect(slotIndex, effectType);
    }

    this.slotEffectTypes[slotIndex] = effectType;
    this.updateSlotParams(slotIndex, params);
    this.rebuildChain();
  }

  /**
   * Enable/disable a slot (bypass)
   */
  setSlotEnabled(slotIndex: number, enabled: boolean): void {
    if (slotIndex < 0 || slotIndex > 2) return;
    this.slotEnabled[slotIndex] = enabled;
    const slot = this.slots[slotIndex];
    if (!slot || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    if (enabled) {
      slot.dryGain.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
      slot.wetGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
    } else {
      slot.dryGain.gain.setTargetAtTime(1, now, SMOOTHING_TIME);
      slot.wetGain.gain.setTargetAtTime(0, now, SMOOTHING_TIME);
    }
  }

  /**
   * Update parameters for a slot
   */
  updateSlotParams(slotIndex: number, params: EffectSlotParams): void {
    if (!this.audioContext || slotIndex < 0 || slotIndex > 2) return;
    const slot = this.slots[slotIndex];
    const effectType = this.slotEffectTypes[slotIndex];
    if (!slot || !effectType) return;

    const now = this.audioContext.currentTime;

    // Update wet/dry mix
    if (this.slotEnabled[slotIndex]) {
      // Mix: 0 = full dry, 1 = full wet
      const wetAmount = params.mix;
      const dryAmount = 1 - wetAmount;
      slot.wetGain.gain.setTargetAtTime(wetAmount, now, SMOOTHING_TIME);
      slot.dryGain.gain.setTargetAtTime(dryAmount, now, SMOOTHING_TIME);
    }

    // Update effect-specific params
    this.applyEffectParams(slotIndex, effectType, params, now);
  }

  private buildSlotEffect(slotIndex: number, effectType: RackEffectType): void {
    if (!this.audioContext) return;
    const ctx = this.audioContext;

    const inputGain = ctx.createGain();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const outputGain = ctx.createGain();
    const effectNodes: AudioNode[] = [];

    inputGain.gain.setValueAtTime(1, ctx.currentTime);
    outputGain.gain.setValueAtTime(1, ctx.currentTime);
    dryGain.gain.setValueAtTime(1, ctx.currentTime);
    wetGain.gain.setValueAtTime(0, ctx.currentTime);

    // Dry path: input -> dryGain -> output
    inputGain.connect(dryGain);
    dryGain.connect(outputGain);

    const slotNodes: SlotNodes = { inputGain, dryGain, wetGain, outputGain, effectNodes };

    // Build wet path based on effect type
    switch (effectType) {
      case "reverb":
        this.buildReverb(ctx, slotNodes);
        break;
      case "delay":
        this.buildDelay(ctx, slotNodes);
        break;
      case "distortion":
        this.buildDistortion(ctx, slotNodes);
        break;
      case "lowpass":
      case "highpass":
      case "bandpass":
        this.buildFilter(ctx, slotNodes, effectType);
        break;
      case "chorus":
        this.buildChorus(ctx, slotNodes);
        break;
      case "flanger":
        this.buildFlanger(ctx, slotNodes);
        break;
      case "phaser":
        this.buildPhaser(ctx, slotNodes);
        break;
      case "compressor":
        this.buildCompressor(ctx, slotNodes);
        break;
      case "bitcrusher":
        this.buildBitcrusher(ctx, slotNodes);
        break;
    }

    // Wet path ends at wetGain -> outputGain
    wetGain.connect(outputGain);

    this.slots[slotIndex] = slotNodes;
  }

  // --- Effect builders ---

  private buildReverb(ctx: AudioContext, slot: SlotNodes): void {
    const convolver = ctx.createConvolver();
    const preDelay = ctx.createDelay(0.1);
    preDelay.delayTime.setValueAtTime(0.02, ctx.currentTime);

    // Generate impulse response
    this.generateReverbImpulse(ctx, convolver, 2.0);

    slot.inputGain.connect(preDelay);
    preDelay.connect(convolver);
    convolver.connect(slot.wetGain);

    slot.effectNodes.push(convolver, preDelay);
  }

  private generateReverbImpulse(ctx: AudioContext, convolver: ConvolverNode, duration: number): void {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(0.1, duration));
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-3 * t / duration);
        data[i] = (Math.random() * 2 - 1) * decay;
        if (t < 0.08) {
          data[i] += (Math.random() * 2 - 1) * (1 - t / 0.08) * 0.3;
        }
      }
    }
    convolver.buffer = impulse;
  }

  private buildDelay(ctx: AudioContext, slot: SlotNodes): void {
    const delayNode = ctx.createDelay(1.5);
    delayNode.delayTime.setValueAtTime(0.3, ctx.currentTime);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.3, ctx.currentTime);

    const delayWet = ctx.createGain();
    delayWet.gain.setValueAtTime(0.5, ctx.currentTime);

    // Feedback loop
    delayNode.connect(feedback);
    feedback.connect(delayNode);

    slot.inputGain.connect(delayNode);
    delayNode.connect(delayWet);
    delayWet.connect(slot.wetGain);

    slot.effectNodes.push(delayNode, feedback, delayWet);
  }

  private buildDistortion(ctx: AudioContext, slot: SlotNodes): void {
    const waveshaper = ctx.createWaveShaper();
    waveshaper.oversample = "4x";
    this.setDistortionCurve(waveshaper, 0.4);

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.setValueAtTime(8000, ctx.currentTime);
    toneFilter.Q.setValueAtTime(0.5, ctx.currentTime);

    const gainComp = ctx.createGain();
    gainComp.gain.setValueAtTime(0.8, ctx.currentTime);

    slot.inputGain.connect(waveshaper);
    waveshaper.connect(toneFilter);
    toneFilter.connect(gainComp);
    gainComp.connect(slot.wetGain);

    slot.effectNodes.push(waveshaper, toneFilter, gainComp);
  }

  private setDistortionCurve(waveshaper: WaveShaperNode, amount: number): void {
    const samples = 256;
    const curve = new Float32Array(samples);
    const drive = Math.max(0.01, amount * 50);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (Math.PI + drive) * x / (Math.PI + drive * Math.abs(x));
    }
    waveshaper.curve = curve;
  }

  private buildFilter(ctx: AudioContext, slot: SlotNodes, type: "lowpass" | "highpass" | "bandpass"): void {
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    slot.inputGain.connect(filter);
    filter.connect(slot.wetGain);

    slot.effectNodes.push(filter);
  }

  private buildChorus(ctx: AudioContext, slot: SlotNodes): void {
    // Chorus = short modulated delay line with original signal mixed
    const delay1 = ctx.createDelay(0.05);
    delay1.delayTime.setValueAtTime(0.012, ctx.currentTime);
    const delay2 = ctx.createDelay(0.05);
    delay2.delayTime.setValueAtTime(0.018, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(1.5, ctx.currentTime);

    const lfoGain1 = ctx.createGain();
    lfoGain1.gain.setValueAtTime(0.003, ctx.currentTime);
    const lfoGain2 = ctx.createGain();
    lfoGain2.gain.setValueAtTime(-0.003, ctx.currentTime);

    const chorusMix = ctx.createGain();
    chorusMix.gain.setValueAtTime(0.5, ctx.currentTime);

    lfo.connect(lfoGain1);
    lfo.connect(lfoGain2);
    lfoGain1.connect(delay1.delayTime);
    lfoGain2.connect(delay2.delayTime);

    slot.inputGain.connect(delay1);
    slot.inputGain.connect(delay2);
    delay1.connect(chorusMix);
    delay2.connect(chorusMix);
    chorusMix.connect(slot.wetGain);

    lfo.start(ctx.currentTime);

    slot.lfoOsc = lfo;
    slot.lfoGain = lfoGain1;
    slot.effectNodes.push(delay1, delay2, lfoGain1, lfoGain2, chorusMix);
  }

  private buildFlanger(ctx: AudioContext, slot: SlotNodes): void {
    // Flanger = very short modulated delay with feedback
    const delay = ctx.createDelay(0.02);
    delay.delayTime.setValueAtTime(0.005, ctx.currentTime);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.5, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.003, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);

    // Feedback loop
    delay.connect(feedback);
    feedback.connect(delay);

    slot.inputGain.connect(delay);
    delay.connect(slot.wetGain);

    lfo.start(ctx.currentTime);

    slot.lfoOsc = lfo;
    slot.lfoGain = lfoGain;
    slot.effectNodes.push(delay, feedback);
  }

  private buildPhaser(ctx: AudioContext, slot: SlotNodes): void {
    // Phaser = cascaded allpass filters with LFO modulation
    const allpassFilters: BiquadFilterNode[] = [];
    const stageCount = 4;

    let lastNode: AudioNode = slot.inputGain;
    for (let i = 0; i < stageCount; i++) {
      const allpass = ctx.createBiquadFilter();
      allpass.type = "allpass";
      allpass.frequency.setValueAtTime(1000 + i * 500, ctx.currentTime);
      allpass.Q.setValueAtTime(0.5, ctx.currentTime);
      lastNode.connect(allpass);
      lastNode = allpass;
      allpassFilters.push(allpass);
      slot.effectNodes.push(allpass);
    }

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.5, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(800, ctx.currentTime);

    lfo.connect(lfoGain);
    // Modulate first and last allpass filters
    if (allpassFilters[0]) lfoGain.connect(allpassFilters[0].frequency);
    if (allpassFilters[stageCount - 1]) lfoGain.connect(allpassFilters[stageCount - 1].frequency);

    lastNode.connect(slot.wetGain);

    lfo.start(ctx.currentTime);

    slot.lfoOsc = lfo;
    slot.lfoGain = lfoGain;
  }

  private buildCompressor(ctx: AudioContext, slot: SlotNodes): void {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    const makeupGain = ctx.createGain();
    makeupGain.gain.setValueAtTime(1.5, ctx.currentTime);

    slot.inputGain.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(slot.wetGain);

    slot.effectNodes.push(compressor, makeupGain);
  }

  private buildBitcrusher(ctx: AudioContext, slot: SlotNodes): void {
    // Bitcrusher via ScriptProcessor (simple approach)
    const bufferSize = 4096;
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);

    let bits = 8;
    let sampleRateReduction = 1;

    // Store params on the processor for access in onaudioprocess
    (processor as unknown as Record<string, number>)._bits = bits;
    (processor as unknown as Record<string, number>)._srReduce = sampleRateReduction;

    let phaser = 0;
    let lastSample = 0;

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);
      const currentBits = (processor as unknown as Record<string, number>)._bits || 8;
      const currentSRReduce = (processor as unknown as Record<string, number>)._srReduce || 1;
      const step = Math.pow(0.5, currentBits);

      for (let i = 0; i < bufferSize; i++) {
        phaser += currentSRReduce;
        if (phaser >= 1) {
          phaser -= 1;
          // Quantize
          lastSample = step * Math.floor(input[i] / step + 0.5);
        }
        output[i] = lastSample;
      }
    };

    slot.inputGain.connect(processor);
    processor.connect(slot.wetGain);

    slot.bitcrusherProcessor = processor;
    slot.effectNodes.push(processor);
  }

  // --- Parameter application ---

  private applyEffectParams(slotIndex: number, effectType: RackEffectType, params: EffectSlotParams, now: number): void {
    const slot = this.slots[slotIndex];
    if (!slot || !this.audioContext) return;

    switch (effectType) {
      case "reverb": {
        // param1 = size (0.3 - 5s), param2 = damping (high freq cut)
        const size = 0.3 + params.param1 * 4.7;
        const convolver = slot.effectNodes[0] as ConvolverNode;
        if (convolver) {
          this.generateReverbImpulse(this.audioContext, convolver, size);
        }
        break;
      }
      case "delay": {
        // param1 = time (50ms - 1200ms), param2 = feedback (0-85%)
        const delayNode = slot.effectNodes[0] as DelayNode;
        const feedback = slot.effectNodes[1] as GainNode;
        if (delayNode) {
          const time = 0.05 + params.param1 * 1.15;
          delayNode.delayTime.setTargetAtTime(time, now, SMOOTHING_TIME);
        }
        if (feedback) {
          feedback.gain.setTargetAtTime(params.param2 * 0.85, now, SMOOTHING_TIME);
        }
        break;
      }
      case "distortion": {
        // param1 = drive, param2 = tone
        const waveshaper = slot.effectNodes[0] as WaveShaperNode;
        const toneFilter = slot.effectNodes[1] as BiquadFilterNode;
        const gainComp = slot.effectNodes[2] as GainNode;
        if (waveshaper) {
          this.setDistortionCurve(waveshaper, params.param1);
        }
        if (toneFilter) {
          const tone = 200 + params.param2 * 11800;
          toneFilter.frequency.setTargetAtTime(tone, now, SMOOTHING_TIME);
        }
        if (gainComp) {
          const comp = 1 / (1 + params.param1 * 0.5);
          gainComp.gain.setTargetAtTime(comp, now, SMOOTHING_TIME);
        }
        break;
      }
      case "lowpass":
      case "highpass":
      case "bandpass": {
        // param1 = cutoff (60Hz-18kHz log), param2 = resonance (Q 0.5-20)
        const filter = slot.effectNodes[0] as BiquadFilterNode;
        if (filter) {
          const minFreq = 60;
          const maxFreq = 18000;
          const freq = minFreq * Math.pow(maxFreq / minFreq, params.param1);
          filter.frequency.setTargetAtTime(freq, now, SMOOTHING_TIME);
          const q = 0.5 + params.param2 * 19.5;
          filter.Q.setTargetAtTime(q, now, SMOOTHING_TIME);
        }
        break;
      }
      case "chorus": {
        // param1 = rate (0.1-8 Hz), param2 = depth (modulation amount)
        if (slot.lfoOsc) {
          const rate = 0.1 + params.param1 * 7.9;
          slot.lfoOsc.frequency.setTargetAtTime(rate, now, SMOOTHING_TIME);
        }
        if (slot.lfoGain) {
          const depth = 0.001 + params.param2 * 0.006;
          slot.lfoGain.gain.setTargetAtTime(depth, now, SMOOTHING_TIME);
        }
        break;
      }
      case "flanger": {
        // param1 = rate (0.05-5 Hz), param2 = depth + feedback
        if (slot.lfoOsc) {
          const rate = 0.05 + params.param1 * 4.95;
          slot.lfoOsc.frequency.setTargetAtTime(rate, now, SMOOTHING_TIME);
        }
        if (slot.lfoGain) {
          const depth = 0.001 + params.param2 * 0.005;
          slot.lfoGain.gain.setTargetAtTime(depth, now, SMOOTHING_TIME);
        }
        // Update feedback
        const fb = slot.effectNodes[1] as GainNode;
        if (fb) {
          fb.gain.setTargetAtTime(params.param2 * 0.8, now, SMOOTHING_TIME);
        }
        break;
      }
      case "phaser": {
        // param1 = rate (0.1-5 Hz), param2 = depth (frequency sweep range)
        if (slot.lfoOsc) {
          const rate = 0.1 + params.param1 * 4.9;
          slot.lfoOsc.frequency.setTargetAtTime(rate, now, SMOOTHING_TIME);
        }
        if (slot.lfoGain) {
          const depth = 200 + params.param2 * 1800;
          slot.lfoGain.gain.setTargetAtTime(depth, now, SMOOTHING_TIME);
        }
        break;
      }
      case "compressor": {
        // param1 = threshold (-60 to 0 dB), param2 = ratio (1-20)
        const compressor = slot.effectNodes[0] as DynamicsCompressorNode;
        if (compressor) {
          const threshold = -60 + params.param1 * 60;
          compressor.threshold.setTargetAtTime(threshold, now, SMOOTHING_TIME);
          const ratio = 1 + params.param2 * 19;
          compressor.ratio.setTargetAtTime(ratio, now, SMOOTHING_TIME);
        }
        break;
      }
      case "bitcrusher": {
        // param1 = bits (1-16), param2 = sample rate reduction
        if (slot.bitcrusherProcessor) {
          const proc = slot.bitcrusherProcessor as unknown as Record<string, number>;
          proc._bits = 1 + params.param1 * 15;
          proc._srReduce = 1 + (1 - params.param2) * 30;
        }
        break;
      }
    }
  }

  /**
   * Rebuild the serial chain: input -> slot0 -> slot1 -> slot2 -> output
   */
  private rebuildChain(): void {
    if (!this.masterInputNode || !this.masterOutputNode) return;

    // Disconnect master input from everything
    try { this.masterInputNode.disconnect(); } catch { /* ok */ }

    // Build chain of active slots
    const activeSlots: SlotNodes[] = [];
    for (let i = 0; i < 3; i++) {
      if (this.slots[i] && this.slotEffectTypes[i]) {
        activeSlots.push(this.slots[i]!);
      }
    }

    if (activeSlots.length === 0) {
      // No effects, direct pass-through
      this.masterInputNode.connect(this.masterOutputNode);
      return;
    }

    // Chain: masterInput -> slot[0].input -> slot[0].output -> slot[1].input -> ... -> masterOutput
    this.masterInputNode.connect(activeSlots[0].inputGain);

    for (let i = 0; i < activeSlots.length - 1; i++) {
      try { activeSlots[i].outputGain.disconnect(); } catch { /* ok */ }
      activeSlots[i].outputGain.connect(activeSlots[i + 1].inputGain);
    }

    // Last slot connects to master output
    try { activeSlots[activeSlots.length - 1].outputGain.disconnect(); } catch { /* ok */ }
    activeSlots[activeSlots.length - 1].outputGain.connect(this.masterOutputNode);
  }

  private clearSlot(slotIndex: number): void {
    const slot = this.slots[slotIndex];
    if (!slot) return;

    // Stop LFO if present
    if (slot.lfoOsc) {
      try { slot.lfoOsc.stop(); } catch { /* ok */ }
      try { slot.lfoOsc.disconnect(); } catch { /* ok */ }
    }
    if (slot.lfoGain) {
      try { slot.lfoGain.disconnect(); } catch { /* ok */ }
    }

    // Disconnect all effect nodes
    for (const node of slot.effectNodes) {
      try { node.disconnect(); } catch { /* ok */ }
    }

    // Disconnect routing nodes
    try { slot.inputGain.disconnect(); } catch { /* ok */ }
    try { slot.dryGain.disconnect(); } catch { /* ok */ }
    try { slot.wetGain.disconnect(); } catch { /* ok */ }
    try { slot.outputGain.disconnect(); } catch { /* ok */ }

    this.slots[slotIndex] = null;
    this.slotEffectTypes[slotIndex] = null;
    this.slotEnabled[slotIndex] = false;
    this.rebuildChain();
  }

  getMasterInput(): GainNode | null {
    return this.masterInputNode;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  dispose(): void {
    for (let i = 0; i < 3; i++) {
      this.clearSlot(i);
    }
    this.masterInputNode = null;
    this.masterOutputNode = null;
    this.audioContext = null;
    this.initialized = false;
  }
}

export const multiEffectsEngine = new MultiEffectsEngine();
