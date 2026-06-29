import { Audio } from 'expo-av';

/**
 * Ovoz boshqaruvi uchun yordamchi.
 * expo-av orqali ovoz effektlarini ijro etadi.
 */

let soundEnabled = true;
let drawSound = null;
let winSound = null;
let clickSound = null;

/**
 * Ovoz yoqilgan/o'chirilganligini sozlash
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

/**
 * Ovoz holatini qaytarish
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Ovoz faylini yuklash
 */
async function loadSound(name) {
  try {
    // Avval require orqali yuklab ko'ramiz
    const soundMap = {
      draw: require('../../assets/sounds/draw.mp3'),
      win: require('../../assets/sounds/win.mp3'),
      click: require('../../assets/sounds/click.mp3'),
    };
    const { sound } = await Audio.Sound.createAsync(soundMap[name]);
    return sound;
  } catch (e) {
    // Agar fayl mavjud bo'lmasa, sukutda ovozni o'chirish
    console.log(`Ovoz fayli yuklanmadi (${name}):`, e.message);
    return null;
  }
}

/**
 * Raqam chiqarish ovozi
 */
export async function playDrawSound() {
  if (!soundEnabled) return;
  try {
    if (!drawSound) drawSound = await loadSound('draw');
    if (drawSound) {
      await drawSound.replayAsync();
    }
  } catch (e) {
    console.log('Draw ovoz:', e.message);
  }
}

/**
 * Yutuq ovozi
 */
export async function playWinSound() {
  if (!soundEnabled) return;
  try {
    if (!winSound) winSound = await loadSound('win');
    if (winSound) {
      await winSound.replayAsync();
    }
  } catch (e) {
    console.log('Win ovoz:', e.message);
  }
}

/**
 * Tugma bosish ovozi
 */
export async function playClickSound() {
  if (!soundEnabled) return;
  try {
    if (!clickSound) clickSound = await loadSound('click');
    if (clickSound) {
      await clickSound.replayAsync();
    }
  } catch (e) {
    console.log('Click ovoz:', e.message);
  }
}

/**
 * Barcha ovoz resurslarini tozalash
 */
export async function unloadAllSounds() {
  try {
    if (drawSound) { await drawSound.unloadAsync(); drawSound = null; }
    if (winSound) { await winSound.unloadAsync(); winSound = null; }
    if (clickSound) { await clickSound.unloadAsync(); clickSound = null; }
  } catch (e) {
    console.log('Ovoz tozalash:', e.message);
  }
}
