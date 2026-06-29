import { MIN_NUMBER, MAX_NUMBER } from '../utils/constants';

/**
 * Raqam chiqarish mexanizmi.
 * 1 dan 90 gacha raqamlarni takrorlanmasdan chiqaradi.
 */
export class NumberDrawer {
  constructor() {
    this.drawnNumbers = [];
    this.remainingNumbers = [];
    this.reset();
  }

  /**
   * Barcha raqamlarni qayta boshlash
   */
  reset() {
    this.drawnNumbers = [];
    this.remainingNumbers = [];
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
      this.remainingNumbers.push(i);
    }
    // Fisher-Yates aralashtirish
    for (let i = this.remainingNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.remainingNumbers[i], this.remainingNumbers[j]] =
        [this.remainingNumbers[j], this.remainingNumbers[i]];
    }
  }

  /**
   * Navbatdagi raqamni chiqarish
   * @returns {{ number: number, drawnCount: number, totalCount: number } | null}
   * - null qaytsa, barcha 90 ta raqam chiqarib bo'lingan
   */
  draw() {
    if (this.remainingNumbers.length === 0) {
      return null;
    }
    const number = this.remainingNumbers.pop();
    this.drawnNumbers.push(number);
    return {
      number,
      drawnCount: this.drawnNumbers.length,
      totalCount: MAX_NUMBER,
      progress: this.drawnNumbers.length / MAX_NUMBER,
    };
  }

  /**
   * Chiqqan raqamlar ro'yxati
   */
  getDrawnNumbers() {
    return [...this.drawnNumbers];
  }

  /**
   * Oxirgi chiqqan raqam
   */
  getLastDrawn() {
    if (this.drawnNumbers.length === 0) return null;
    return this.drawnNumbers[this.drawnNumbers.length - 1];
  }

  /**
   * Qolgan raqamlar soni
   */
  getRemainingCount() {
    return this.remainingNumbers.length;
  }

  /**
   * Hamma raqam chiqdimi?
   */
  isComplete() {
    return this.remainingNumbers.length === 0;
  }
}
