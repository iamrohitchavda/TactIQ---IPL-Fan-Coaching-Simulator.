/**
 * audioFx.ts
 * Handles all audio feedback for TactIQ using the Web Speech API (SpeechSynthesis).
 * Respects the global soundEnabled toggle stored in matchStore.
 */

import { useMatchStore } from '../store/matchStore';

let speechReady = false;

/**
 * Ensures the SpeechSynthesis voices are loaded before speaking.
 * Chrome lazily loads voices, so we wait for the `voiceschanged` event.
 */
function ensureVoicesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (speechReady) { resolve(); return; }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { speechReady = true; resolve(); return; }
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      speechReady = true;
      resolve();
    }, { once: true });
  });
}

/**
 * Speak a text string using SpeechSynthesis.
 * Returns immediately (silent) if sound is disabled in the store.
 */
export async function speak(
  text: string,
  options: { rate?: number; pitch?: number; volume?: number } = {}
): Promise<void> {
  // Respect the global mute toggle
  if (!useMatchStore.getState().soundEnabled) return;
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech before speaking a new one
  window.speechSynthesis.cancel();

  await ensureVoicesLoaded();

  // Re-check after async gap — user may have toggled off while voices were loading
  if (!useMatchStore.getState().soundEnabled) return;

  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = options.rate   ?? 0.95;
    utter.pitch  = options.pitch  ?? 1.2;
    utter.volume = options.volume ?? 1.0;
    utter.lang   = 'en-GB';

    // Prefer Google UK English Female (Chrome's built-in high-quality voice)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.name === 'Google UK English Female') ||
      voices.find((v) => v.name === 'Google US English') ||
      voices.find((v) => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
      voices.find((v) => v.name.toLowerCase().includes('samantha')) ||  // macOS Siri-style
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.lang.startsWith('en-US')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (preferredVoice) utter.voice = preferredVoice;

    utter.onend = () => resolve();
    utter.onerror = () => resolve();

    window.speechSynthesis.speak(utter);
  });
}

/**
 * Play the "game start" announcement prompting the user to place fielders & pick a bowler.
 */
export function announceGameStart(): void {
  speak(
    'You have 30 seconds! Place your fielders and select your bowler. Good luck!',
    { rate: 0.92, pitch: 1.1 }
  );
}

/**
 * Speak a countdown number with urgency (used for 10…1 countdown).
 */
export function announceCountdown(seconds: number): void {
  speak(String(seconds), { rate: 1.1, pitch: seconds <= 3 ? 1.3 : 1.1 });
}

/**
 * Announce that time is up.
 */
export function announceTimeUp(): void {
  speak("Time's up!", { rate: 1.0, pitch: 1.2 });
}

/**
 * Announce that the prediction was successfully submitted.
 */
export function announcePredictionSubmitted(): void {
  speak('Prediction locked in! Let us see how you did.', { rate: 0.95 });
}
