/**
 * Ovoz boshqaruvi uchun yordamchi (stub).
 *
 * expo-av hozircha o'rnatilmagan — ovoz funksiyalari no-op.
 * Keyinchalik `npm install expo-av` qilinsa, ushbu modul avtomatik
 * tarzda haqiqiy Audio API dan foydalanadi.
 */

let soundEnabled = true;

let _Audio = null;
function getAudio() {
  if (_Audio !== null) return _Audio;
  try {
    _Audio = require('expo-av').Audio;
  } catch (_e) {
    _Audio = false;
  }
  return _Audio || null;
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function playDrawSound() {
  const Audio = getAudio();
  if (!Audio || !soundEnabled) return;
  // kelajakda: Audio.Sound.createAsync(...)
}

export async function playWinSound() {
  const Audio = getAudio();
  if (!Audio || !soundEnabled) return;
}

export async function playClickSound() {
  const Audio = getAudio();
  if (!Audio || !soundEnabled) return;
}

export async function unloadAllSounds() {
  // stub — hech narsa qilmaydi
}
