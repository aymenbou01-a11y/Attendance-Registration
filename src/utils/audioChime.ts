/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Plays a pleasant synthetic acoustic chime using the Web Audio API.
 * Uses high-fidelity harmonic sine waves with natural exponential decay.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAttendanceChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Notes: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz)
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.35, gain: 0.15 },
      { freq: 659.25, time: 0.12, duration: 0.45, gain: 0.18 },
      { freq: 783.99, time: 0.24, duration: 0.7, gain: 0.22 },
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Attack and exponential decay
      gainNode.gain.setValueAtTime(0.001, now + time);
      gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

/**
 * Plays a short celebratory completion chord
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // F5 (698.46) -> A5 (880.0) -> C6 (1046.50)
    const notes = [
      { freq: 698.46, time: 0.0, duration: 0.25, gain: 0.15 },
      { freq: 880.0, time: 0.08, duration: 0.35, gain: 0.18 },
      { freq: 1046.5, time: 0.16, duration: 0.6, gain: 0.2 },
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(0.001, now + time);
      gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Success chime could not be played:', err);
  }
}
