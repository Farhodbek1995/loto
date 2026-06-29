/**
 * Yordamchi funksiyalar
 * Formatlash, hisoblash va boshqa yordamchi utilitlar.
 */

/**
 * Sonni ikki xonali formatda ko'rsatish (1 -> "01")
 * @param {number} num
 * @returns {string}
 */
export function padNumber(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Foizni hisoblash va chiroyli formatlash
 * @param {number} value - joriy qiymat
 * @param {number} total - umumiy qiymat
 * @returns {string} masalan "38%"
 */
export function formatPercentage(value, total) {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Soniyalarni chiroyli formatda ko'rsatish
 * @param {number} ms - millisoniyalar
 * @returns {string} masalan "5 soniya"
 */
export function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} soniya`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes} daqiqa ${secs} soniya` : `${minutes} daqiqa`;
}

/**
 * Massivdagi elementlarni takrorlanmasdan aralashtirish (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array} yangi aralashtirilgan massiv
 */
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sonni o'zbek tilida so'z bilan ifodalash (1-90 uchun)
 * @param {number} num
 * @returns {string}
 */
export function numberToWordsUz(num) {
  const ones = ['', 'bir', 'ikki', 'uch', "to'rt", 'besh', 'olti', 'yetti', 'sakkiz', "to'qqiz"];
  const tens = ['', "o'n", 'yigirma', "o'ttiz", 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', "to'qson"];

  if (num < 1 || num > 90) return `${num}`;
  const ten = Math.floor(num / 10);
  const one = num % 10;
  if (ten === 0) return ones[one];
  if (one === 0) return tens[ten];
  return `${tens[ten]} ${ones[one]}`;
}

/**
 * Sana va vaqtni formatlash
 * @param {Date|number} date
 * @returns {string} masalan "29.06.2026 16:30"
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = padNumber(d.getDate());
  const month = padNumber(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = padNumber(d.getHours());
  const minutes = padNumber(d.getMinutes());
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
