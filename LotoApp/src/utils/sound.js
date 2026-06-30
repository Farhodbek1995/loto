/**
 * Ovoz boshqaruvi.
 *
 * expo-av yordamida dasturiy (synthesized) ovoz effektlari.
 * Hech qanday tashqi audio fayl kerak emas — barcha tonlar
 * JavaScript da generatsiya qilinadi va WAV formatda o'ynaladi.
 */
import { Audio } from 'expo-av';

let soundEnabled = true;
let audioSetupDone = false;

async function ensureAudioSetup() {
  if (audioSetupDone) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioSetupDone = true;
  } catch (_) { /* setup xatosi jimgina ignor qilinadi */ }
}

/**
 * Oddiy sinusoidal WAV generatsiya qilish.
 * @param {number} frequency - Hz da chastota
 * @param {number} duration - millisekundda davomiylik
 * @param {number} sampleRate - namuna chastotasi (default 22050)
 * @returns {string} base64 WAV data URI
 */
function generateTone(frequency, duration, sampleRate = 22050) {
  const numSamples = Math.floor(sampleRate * duration / 1000);
  const headerSize = 44;
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);          // PCM
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, 1, true);           // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);           // block align
  view.setUint16(34, 16, true);          // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Audio data
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // ADSR envelope
    const attack = 0.01;
    const decay = 0.05;
    const sustain = 0.6;
    const env = t < attack
      ? t / attack
      : t < attack + decay
        ? 1 - (1 - sustain) * (t - attack) / decay
        : sustain;
    // Yumshoq fade-out
    const release = 0.03;
    const fadeOut = duration / 1000 - t < release
      ? (duration / 1000 - t) / release
      : 1;
    const amplitude = Math.min(env, fadeOut) * 0.4;
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(headerSize + i * 2, int16, true);
  }

  // Base64 ga o'girish
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  try {
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch (_) {
    return null;
  }
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Oldindan generatsiya qilingan tonlar (memoize)
let drawToneURI = null;
let winToneURI = null;
let clickToneURI = null;

function getDrawTone() {
  if (!drawToneURI) drawToneURI = generateTone(800, 100);
  return drawToneURI;
}

function getWinTone() {
  if (!winToneURI) {
    // Qisqa fanfare: 3 ta nota ketma-ket
    const sampleRate = 22050;
    const notes = [
      { freq: 523, dur: 120 },  // C5
      { freq: 659, dur: 120 },  // E5
      { freq: 784, dur: 300 },  // G5
    ];
    const totalDur = notes.reduce((s, n) => s + n.dur, 0);
    const numSamples = Math.floor(sampleRate * totalDur / 1000);
    const headerSize = 44;
    const dataSize = numSamples * 2;
    const buffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let globalT = 0;
    for (const note of notes) {
      const noteSamples = Math.floor(sampleRate * note.dur / 1000);
      for (let i = 0; i < noteSamples; i++) {
        const localT = i / sampleRate;
        const env = localT < 0.005 ? localT / 0.005 : 1;
        const releaseT = 0.02;
        const fade = note.dur / 1000 - localT < releaseT
          ? (note.dur / 1000 - localT) / releaseT : 1;
        const amp = env * fade * 0.45;
        const sample = Math.sin(2 * Math.PI * note.freq * localT) * amp;
        const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
        view.setInt16(headerSize + (globalT + i) * 2, int16, true);
      }
      globalT += noteSamples;
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    try {
      winToneURI = 'data:audio/wav;base64,' + btoa(binary);
    } catch (_) {
      winToneURI = null;
    }
  }
  return winToneURI;
}

function getClickTone() {
  if (!clickToneURI) clickToneURI = generateTone(1200, 40);
  return clickToneURI;
}

async function playURI(uri) {
  if (!soundEnabled || !uri) return;
  try {
    await ensureAudioSetup();
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 0.8 },
    );
    // Ovoz tugagach tozalash
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (_) { /* ovoz o'ynatib bo'lmadi, jimgina ignor */ }
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function playDrawSound() {
  await playURI(getDrawTone());
}

export async function playWinSound() {
  await playURI(getWinTone());
}

export async function playClickSound() {
  await playURI(getClickTone());
}

export async function unloadAllSounds() {
  // expo-av managed soundlar avtomatik tozalanadi
  drawToneURI = null;
  winToneURI = null;
  clickToneURI = null;
}
