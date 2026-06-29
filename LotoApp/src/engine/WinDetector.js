import { ROWS, COLS, NUMBERS_PER_ROW, WIN_TYPES } from '../utils/constants';

/**
 * Yutuq holatini aniqlash
 */
export class WinDetector {
  /**
   * Kartochkadagi yutuq holatini tekshirish
   * @param {Array} card - 3x9 kartochka massivi
   * @returns {{ type: string, row: number | null }}
   */
  static checkWin(card) {
    let completedRows = 0;
    let lastCompletedRow = null;

    // Har bir qatorni tekshirish
    for (let row = 0; row < ROWS; row++) {
      const markedInRow = card[row].filter(cell => cell && cell.marked).length;
      if (markedInRow >= NUMBERS_PER_ROW) {
        completedRows++;
        lastCompletedRow = row;
      }
    }

    if (completedRows >= ROWS) {
      return { type: WIN_TYPES.FULL_HOUSE, row: null };
    }
    if (completedRows >= 2) {
      return { type: WIN_TYPES.TWO_ROWS, row: lastCompletedRow };
    }
    if (completedRows >= 1) {
      return { type: WIN_TYPES.ROW, row: lastCompletedRow };
    }
    return { type: WIN_TYPES.NONE, row: null };
  }

  /**
   * Yangi raqam belgilangandan keyin yutuq bo'lganini tekshirish
   * @param {Array} card
   * @param {number} lastMarkedRow
   * @returns {{ type: string, row: number | null }}
   */
  static checkWinAfterMark(card, lastMarkedRow) {
    const markedInRow = card[lastMarkedRow].filter(cell => cell && cell.marked).length;

    if (markedInRow < NUMBERS_PER_ROW) {
      return { type: WIN_TYPES.NONE, row: null };
    }

    // Shu qator to'ldi, endi umumiy holatni tekshiramiz
    return this.checkWin(card);
  }

  /**
   * Yutuq turi uchun chiroyli nom (O'zbek tilida)
   */
  static getWinName(winType) {
    switch (winType) {
      case WIN_TYPES.ROW:
        return "Qator! 🎉";
      case WIN_TYPES.TWO_ROWS:
        return "Kvartira! 🎊";
      case WIN_TYPES.FULL_HOUSE:
        return "To'liq Kartochka! 🏆";
      default:
        return "";
    }
  }

  /**
   * Yutuq turi uchun tavsif (O'zbek tilida)
   */
  static getWinDescription(winType, row) {
    switch (winType) {
      case WIN_TYPES.ROW:
        return `${row + 1}-qatordagi barcha raqamlar yopildi!`;
      case WIN_TYPES.TWO_ROWS:
        return `${row + 1}-qatordagi barcha raqamlar yopildi! Kartochkaning 2/3 qismi to'ldi!`;
      case WIN_TYPES.FULL_HOUSE:
        return "Barcha 15 ta raqam yopildi! Siz ASOSIY yutuqni qo'lga kiritdingiz!";
      default:
        return "";
    }
  }
}
