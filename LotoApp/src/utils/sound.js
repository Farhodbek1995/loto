/**
 * Ovoz boshqaruvi uchun yordamchi (stub).
 *
 * expo-av hozircha o'rnatilmagan — ovoz funksiyalari no-op.
 * Keyinchalik `npm install expo-av` qilinsa, ushbu modul avtomatik
 * tarzda haqiqiy Audio API dan foydalanadi.
 *
 * MUHIM: Hermes release buildlarida require('expo-av') crashga
 * sabab bo'ladi, shuning uchun hech qachon dynamic require ishlatilmaydi.
 * Ovoz qo'shish kerak bo'lsa, static import ishlatiladi.
 */

let soundEnabled = true;

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function playDrawSound() {
  // STUB: Ovoz hozircha o'chirilgan.
  // Faollashtirish uchun:
  //   1. npm install expo-av
  //   2. import { Audio } from 'expo-av';
  //   3. Audio.Sound.createAsync(...) bilan ovoz yuklash
}

export async function playWinSound() {
  // STUB
}

export async function playClickSound() {
  // STUB
}

export async function unloadAllSounds() {
  // STUB
}
