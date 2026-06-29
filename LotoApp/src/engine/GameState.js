import { generateCard, countMarked } from './CardGenerator';
import { NumberDrawer } from './NumberDrawer';
import { WinDetector } from './WinDetector';
import { WIN_TYPES, GAME_MODES, MAX_NUMBER } from '../utils/constants';

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
    return this.getState();
  }

  /**
   * Raqam chiqarish va barcha kartochkalarni yangilash
   */
  drawNumber() {
    if (!this.isPlaying || this.isGameOver) {
      return { ...this.getState(), error: 'O\'yin yakunlangan yoki boshlanmagan' };
    }

    const result = this.drawer.draw();
    if (!result) {
      this.isGameOver = true;
      this.isPlaying = false;
      return { ...this.getState(), error: 'Barcha raqamlar chiqarib bo\'lindi' };
    }

    this.currentNumber = result.number;

    // Barcha kartochkalarda shu raqamni belgilash
    let markedRow = -1;
    for (const card of this.cards) {
      for (let row = 0; row < card.length; row++) {
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
   * Joriy o'yin holatini olish
   */
  getState() {
    const totalMarked = this.cards.reduce((sum, card) => sum + countMarked(card), 0);
    const drawnLength = this.drawer ? this.drawer.getDrawnNumbers().length : 0;
    return {
      cards: this.cards,
      card: this.cards.length > 0 ? this.cards[0] : null,
      cardCount: this.cardCount,
      currentNumber: this.currentNumber,
      drawnNumbers: this.drawer ? this.drawer.getDrawnNumbers() : [],
      drawnCount: drawnLength,
      remainingCount: this.drawer ? this.drawer.getRemainingCount() : MAX_NUMBER,
      progress: drawnLength / MAX_NUMBER,
      winHistory: this.winHistory,
      isGameOver: this.isGameOver,
      isPlaying: this.isPlaying,
      gameMode: this.gameMode,
      markedCount: totalMarked,
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
      winHistory: this.winHistory,
      hasFullHouse: this.winHistory.some(w => w.type === WIN_TYPES.FULL_HOUSE),
      totalNumbers: MAX_NUMBER,
      cardCount: this.cardCount,
    };
  }
}
