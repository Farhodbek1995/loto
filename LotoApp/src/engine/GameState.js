import { generateCard, countMarked, getAllCardNumbers } from './CardGenerator';
import { NumberDrawer } from './NumberDrawer';
import { WinDetector } from './WinDetector';
import { WIN_TYPES, GAME_MODES, MAX_NUMBER, BONUS_TYPES } from '../utils/constants';

/**
 * Kartochkani chuqur klonlash - React state uchun xavfsiz.
 * Obyekt referenslarini uzib, React qayta render qilishini ta'minlaydi.
 */
function deepCloneCard(card) {
  if (!card) return null;
  return card.map(row =>
    row.map(cell =>
      cell ? { number: cell.number, marked: cell.marked } : null
    )
  );
}

function deepCloneCards(cards) {
  if (!cards || !Array.isArray(cards)) return [];
  return cards.map(card => deepCloneCard(card));
}

/**
 * Asosiy o'yin holatini boshqaruvchi sinf.
 * Ko'p kartochkali rejimni qo'llab-quvvatlaydi (1-4 ta).
 */
export class GameState {
  constructor(gameMode = GAME_MODES.SIMPLE, cardCount = 1) {
    this.gameMode = gameMode;
    this.cardCount = Math.max(1, Math.min(cardCount, 4));
    this.cards = [];
    this.drawer = null;
    this.winHistory = [];
    this.isGameOver = false;
    this.isPlaying = false;
    this.currentNumber = null;
    this.drawnNumbers = []; // chiqqan raqamlar ro'yxati (bonuslar uchun)
    this.bonusUsed = {
      [BONUS_TYPES.AUTO_1]: 0,
      [BONUS_TYPES.AUTO_5]: 0,
      [BONUS_TYPES.CLOSE_MISSED]: 0,
    };
  }

  /**
   * Yangi o'yin boshlash
   * @param {number} cardCount - kartochkalar soni (opsional, konstruktordagidan farqli bo'lsa)
   */
  startNewGame(cardCount) {
    if (cardCount !== undefined) {
      this.cardCount = Math.max(1, Math.min(cardCount, 4));
    }
    this.cards = [];
    for (let i = 0; i < this.cardCount; i++) {
      this.cards.push(generateCard());
    }
    this.drawer = new NumberDrawer();
    this.winHistory = [];
    this.isGameOver = false;
    this.isPlaying = true;
    this.currentNumber = null;
    this.drawnNumbers = [];
    this.bonusUsed = {
      [BONUS_TYPES.AUTO_1]: 0,
      [BONUS_TYPES.AUTO_5]: 0,
      [BONUS_TYPES.CLOSE_MISSED]: 0,
    };
    return this.getState();
  }

  /**
   * Raqam chiqarish va barcha kartochkalarni yangilash
   */
  drawNumber() {
    if (!this.isPlaying || this.isGameOver) {
      return { ...this.getState(), error: 'O\'yin yakunlangan yoki boshlanmagan' };
    }

    if (!this.drawer) {
      return { ...this.getState(), error: 'O\'yin hali boshlanmagan' };
    }

    const result = this.drawer.draw();
    if (!result) {
      this.isGameOver = true;
      this.isPlaying = false;
      return { ...this.getState(), error: 'Barcha raqamlar chiqarib bo\'lindi' };
    }

    this.currentNumber = result.number;
    this.drawnNumbers.push(result.number);

    // Barcha kartochkalarda shu raqamni belgilash
    let markedRow = -1;
    for (const card of this.cards) {
      if (!card || !Array.isArray(card)) continue;
      for (let row = 0; row < card.length; row++) {
        if (!card[row] || !Array.isArray(card[row])) continue;
        for (let col = 0; col < card[row].length; col++) {
          const cell = card[row][col];
          if (cell && cell.number === result.number) {
            cell.marked = true;
            if (markedRow === -1) markedRow = row;
          }
        }
      }
    }

    // Barcha kartochkalarda yutuqni tekshirish (eng yuqori yutuqni olamiz)
    let bestWinResult = { type: WIN_TYPES.NONE, row: null };
    for (const card of this.cards) {
      if (!card || !Array.isArray(card)) continue;
      const winResult = WinDetector.checkWin(card);
      if (winResult.type === WIN_TYPES.FULL_HOUSE) {
        bestWinResult = winResult;
        break;
      }
      if (winResult.type === WIN_TYPES.TWO_ROWS && bestWinResult.type !== WIN_TYPES.FULL_HOUSE) {
        bestWinResult = winResult;
      }
      if (winResult.type === WIN_TYPES.ROW && bestWinResult.type === WIN_TYPES.NONE) {
        bestWinResult = winResult;
      }
    }

    if (bestWinResult.type !== WIN_TYPES.NONE) {
      const alreadyRecorded = this.winHistory.find(w => w.type === bestWinResult.type);
      if (!alreadyRecorded) {
        this.winHistory.push({
          type: bestWinResult.type,
          row: bestWinResult.row,
          drawnCount: result.drawnCount,
        });
      }

      if (bestWinResult.type === WIN_TYPES.FULL_HOUSE) {
        this.isGameOver = true;
        this.isPlaying = false;
      }
    }

    return {
      ...this.getState(),
      justMarkedRow: markedRow,
      winResult: bestWinResult,
    };
  }

  /**
   * Kartochkalardagi barcha yopilmagan raqamlarni yig'ish.
   * @returns {Array<{cardIdx: number, row: number, col: number, number: number}>}
   */
  _getAllUnmarkedCells() {
    const cells = [];
    for (let ci = 0; ci < this.cards.length; ci++) {
      const card = this.cards[ci];
      if (!card || !Array.isArray(card)) continue;
      for (let row = 0; row < card.length; row++) {
        if (!card[row] || !Array.isArray(card[row])) continue;
        for (let col = 0; col < card[row].length; col++) {
          const cell = card[row][col];
          if (cell && !cell.marked) {
            cells.push({ cardIdx: ci, row, col, number: cell.number });
          }
        }
      }
    }
    return cells;
  }

  /**
   * Bonus: 1 ta tasodifiy yopilmagan raqamni avto-yopish.
   * @returns {{ success: boolean, cell?: object, error?: string }}
   */
  useAutoCloseOne() {
    if (!this.isPlaying || this.isGameOver) {
      return { success: false, error: 'O\'yin yakunlangan' };
    }
    const cells = this._getAllUnmarkedCells();
    if (cells.length === 0) {
      return { success: false, error: 'Barcha raqamlar yopilgan' };
    }
    const pick = cells[Math.floor(Math.random() * cells.length)];
    const card = this.cards[pick.cardIdx];
    card[pick.row][pick.col].marked = true;

    // Yutuq tekshirish
    const winResult = WinDetector.checkWin(card);
    if (winResult.type !== WIN_TYPES.NONE) {
      const alreadyRecorded = this.winHistory.find(w => w.type === winResult.type);
      if (!alreadyRecorded) {
        this.winHistory.push({
          type: winResult.type,
          row: winResult.row,
          drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
        });
      }
      if (winResult.type === WIN_TYPES.FULL_HOUSE) {
        this.isGameOver = true;
        this.isPlaying = false;
      }
    }

    this.bonusUsed[BONUS_TYPES.AUTO_1]++;
    return { success: true, cell: pick, winResult };
  }

  /**
   * Bonus: 5 ta tasodifiy yopilmagan raqamni avto-yopish.
   * @returns {{ success: boolean, cells?: Array, error?: string }}
   */
  useAutoCloseFive() {
    if (!this.isPlaying || this.isGameOver) {
      return { success: false, error: 'O\'yin yakunlangan' };
    }
    const cells = this._getAllUnmarkedCells();
    if (cells.length === 0) {
      return { success: false, error: 'Barcha raqamlar yopilgan' };
    }
    const count = Math.min(5, cells.length);
    // Fisher-Yates qisman shuffle uchun
    const shuffled = [...cells];
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (shuffled.length - i));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picks = shuffled.slice(0, count);

    let bestWinResult = { type: WIN_TYPES.NONE, row: null };
    for (const pick of picks) {
      const card = this.cards[pick.cardIdx];
      card[pick.row][pick.col].marked = true;

      const winResult = WinDetector.checkWin(card);
      if (winResult.type === WIN_TYPES.FULL_HOUSE) bestWinResult = winResult;
      else if (winResult.type === WIN_TYPES.TWO_ROWS && bestWinResult.type !== WIN_TYPES.FULL_HOUSE) bestWinResult = winResult;
      else if (winResult.type === WIN_TYPES.ROW && bestWinResult.type === WIN_TYPES.NONE) bestWinResult = winResult;
    }

    if (bestWinResult.type !== WIN_TYPES.NONE) {
      const alreadyRecorded = this.winHistory.find(w => w.type === bestWinResult.type);
      if (!alreadyRecorded) {
        this.winHistory.push({
          type: bestWinResult.type,
          row: bestWinResult.row,
          drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
        });
      }
      if (bestWinResult.type === WIN_TYPES.FULL_HOUSE) {
        this.isGameOver = true;
        this.isPlaying = false;
      }
    }

    this.bonusUsed[BONUS_TYPES.AUTO_5]++;
    return { success: true, cells: picks, winResult: bestWinResult };
  }

  /**
   * Bonus: O'tkazib yuborilgan raqamni yopish.
   * Chiqqan raqamlar ichidan kartochkada bor, lekin yopilmaganini topadi.
   * @returns {{ success: boolean, cell?: object, number?: number, error?: string }}
   */
  useCloseMissed() {
    if (!this.isPlaying || this.isGameOver) {
      return { success: false, error: 'O\'yin yakunlangan' };
    }
    if (this.drawnNumbers.length === 0) {
      return { success: false, error: 'Hali hech qanday raqam chiqmagan' };
    }

    // Chiqqan raqamlarni terisiga qarab tekshirish (oxirgisidan boshlab)
    for (let di = this.drawnNumbers.length - 1; di >= 0; di--) {
      const num = this.drawnNumbers[di];
      for (let ci = 0; ci < this.cards.length; ci++) {
        const card = this.cards[ci];
        if (!card || !Array.isArray(card)) continue;
        for (let row = 0; row < card.length; row++) {
          if (!card[row] || !Array.isArray(card[row])) continue;
          for (let col = 0; col < card[row].length; col++) {
            const cell = card[row][col];
            if (cell && cell.number === num && !cell.marked) {
              cell.marked = true;
              const winResult = WinDetector.checkWin(card);
              if (winResult.type !== WIN_TYPES.NONE) {
                const alreadyRecorded = this.winHistory.find(w => w.type === winResult.type);
                if (!alreadyRecorded) {
                  this.winHistory.push({
                    type: winResult.type,
                    row: winResult.row,
                    drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
                  });
                }
                if (winResult.type === WIN_TYPES.FULL_HOUSE) {
                  this.isGameOver = true;
                  this.isPlaying = false;
                }
              }
              this.bonusUsed[BONUS_TYPES.CLOSE_MISSED]++;
              return { success: true, cell: { cardIdx: ci, row, col, number: num }, number: num, winResult };
            }
          }
        }
      }
    }
    return { success: false, error: 'O\'tkazib yuborilgan raqam topilmadi' };
  }

  /**
   * Bonus qolgan miqdorini olish.
   */
  getBonusRemaining(bonusType, maxUses) {
    return Math.max(0, maxUses - (this.bonusUsed[bonusType] || 0));
  }

  /**
   * Joriy o'yin holatini olish.
   * MUHIM: Kartochkalar chuqur klonlanadi, chunki React state
   * mutable obyektlar bilan noto'g'ri ishlaydi (re-render qilmaslik,
   * render vaqtida crash).
   */
  getState() {
    const totalMarked = this.cards.reduce((sum, card) => sum + countMarked(card), 0);
    const drawnLength = this.drawer ? this.drawer.getDrawnNumbers().length : 0;
    return {
      cards: deepCloneCards(this.cards),
      card: this.cards.length > 0 ? deepCloneCard(this.cards[0]) : null,
      cardCount: this.cardCount,
      currentNumber: this.currentNumber,
      drawnNumbers: this.drawer ? this.drawer.getDrawnNumbers() : [],
      drawnCount: drawnLength,
      remainingCount: this.drawer ? this.drawer.getRemainingCount() : MAX_NUMBER,
      progress: drawnLength / MAX_NUMBER,
      winHistory: [...this.winHistory],
      isGameOver: this.isGameOver,
      isPlaying: this.isPlaying,
      gameMode: this.gameMode,
      markedCount: totalMarked,
      bonusUsed: { ...this.bonusUsed },
    };
  }
  
  /**
   * O'yin statistikasini olish
   */
  getStats() {
    const totalMarked = this.cards.reduce((sum, card) => sum + countMarked(card), 0);
    return {
      drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
      markedCount: totalMarked,
      winHistory: [...this.winHistory],
      hasFullHouse: this.winHistory.some(w => w.type === WIN_TYPES.FULL_HOUSE),
      totalNumbers: MAX_NUMBER,
      cardCount: this.cardCount,
    };
  }
}

export { BONUS_TYPES };
