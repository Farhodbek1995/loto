/**
 * Ovoz boshqaruvi (stub).
 *
 * Hozircha ovoz effektlari ishlamaydi.
 * Keyinchalik ovoz qo'shish uchun:
 *   - react-native-sound yoki expo-av o'rnatish
 *   - yoki Web Audio API orqali tone generatsiya
 *
 * Barcha funksiyalar no-op rejimda ishlaydi.
 */

let soundEnabled = true;

// Oldindan generatsiya qilingan tonlar (memoize) — hozircha null
let drawToneURI = null;
let winToneURI = null;
let clickToneURI = null;

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function playDrawSound() {
  if (!soundEnabled) return;
  // TODO: ovoz effekti qo'shish
}

export async function playWinSound() {
  if (!soundEnabled) return;
  // TODO: ovoz effekti qo'shish
}

export async function playClickSound() {
  if (!soundEnabled) return;
  // TODO: ovoz effekti qo'shish
}

export async function unloadAllSounds() {
  drawToneURI = null;
  winToneURI = null;
  clickToneURI = null;
}
