import {
  ROWS, COLS, NUMBERS_PER_ROW, COLUMN_RANGES, MIN_NUMBER, MAX_NUMBER,
} from '../utils/constants';

/**
 * Yordamchi: massivdan tasodifiy n ta element tanlash (Fisher–Yates shuffle)
 */
function pickRandom(arr, n) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/**
 * Berilgan diapazondan tasodifiy raqam generatsiya qilish (takrorlanmasdan)
 */
function getRandomNumbersInRange(min, max, count) {
  const numbers = [];
  const available = [];
  for (let i = min; i <= max; i++) available.push(i);

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * available.length);
    numbers.push(available[idx]);
    available.splice(idx, 1);
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Loto kartochkasini generatsiya qilish.
 * Format: 3x9 massiv, har bir katakda { number, marked } yoki null
 */
export function generateCard() {
  // 3x9 bo'sh kartochka
  const card = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null)
  );

  // Har bir qator uchun qaysi ustunlarga raqam qo'yishni aniqlash
  const rowCols = [];
  for (let row = 0; row < ROWS; row++) {
    // Har bir qatorda 5 ta ustun tanlanadi
    const cols = pickRandom([0, 1, 2, 3, 4, 5, 6, 7, 8], NUMBERS_PER_ROW);
    rowCols.push(cols);
  }

  // Har bir ustun uchun jami nechta raqam kerakligini hisoblash
  const colCounts = Array(COLS).fill(0);
  for (let row = 0; row < ROWS; row++) {
    for (const col of rowCols[row]) {
      colCounts[col]++;
    }
  }

  // Har bir ustun uchun kerakli sondagi raqamlarni generatsiya qilish
  const colNumbers = [];
  for (let col = 0; col < COLS; col++) {
    const range = COLUMN_RANGES[col];
    colNumbers[col] = getRandomNumbersInRange(range.min, range.max, colCounts[col]);
  }

  // Har bir qatorga raqamlarni joylashtirish
  const colIndex = Array(COLS).fill(0);
  for (let row = 0; row < ROWS; row++) {
    for (const col of rowCols[row]) {
      card[row][col] = {
        number: colNumbers[col][colIndex[col]],
        marked: false,
      };
      colIndex[col]++;
    }
  }

  return card;
}

/**
 * Kartochkadagi jami yopilgan raqamlar soni
 */
export function countMarked(card) {
  let count = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (card[row][col] && card[row][col].marked) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Kartochkadagi barcha raqamlar ro'yxatini olish
 */
export function getAllCardNumbers(card) {
  const numbers = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (card[row][col]) {
        numbers.push(card[row][col].number);
      }
    }
  }
  return numbers;
}
