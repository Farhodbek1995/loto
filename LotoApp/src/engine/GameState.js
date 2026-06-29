import { generateCard, countMarked } from './CardGenerator';
import { NumberDrawer } from './NumberDrawer';
import { WinDetector } from './WinDetector';
import { WIN_TYPES, GAME_MODES, MAX_NUMBER } from '../utils/constants';

/**
 * Asosiy o'yin holatini boshqaruvchi sinf
 */
export class GameState {
  constructor(gameMode = GAME_MODES.SIMPLE) {
    this.gameMode = gameMode;
    this.card = null;
    this.drawer = null;
    this.winHistory = [];
    this.isGameOver = false;
    this.isPlaying = false;
    this.currentNumber = null;
  }

  /**
   * Yangi o'yin boshlash
   */
  startNewGame() {
    this.card = generateCard();
    this.drawer = new NumberDrawer();
    this.winHistory = [];
    this.isGameOver = false;
    this.isPlaying = true;
    this.currentNumber = null;
    return this.getState();
  }

  /**
   * Raqam chiqarish va kartochkani yangilash
   */
  drawNumber() {
    if (!this.isPlaying || this.isGameOver) {
      return { ...this.getState(), error: 'O\'yin yakunlangan yoki boshlanmagan' };
    }

    const result = this.drawer.draw();
    if (!result) {
      this.isGameOver = true;
      this.isPlaying = false;
      // Barcha raqamlar chiqqan bo'lsa, full house bo'lmasa ham o'yin tugadi deb hisoblaymiz
      return { ...this.getState(), isGameOver: true, error: 'Barcha raqamlar chiqarib bo\'lindi' };
    }

    this.currentNumber = result.number;

    // Kartochkada shu raqamni belgilash
    let markedRow = -1;
    for (let row = 0; row < this.card.length; row++) {
      for (let col = 0; col < this.card[row].length; col++) {
        const cell = this.card[row][col];
        if (cell && cell.number === result.number) {
          cell.marked = true;
          markedRow = row;
        }
      }
    }

    // Yutuqni tekshirish
    const winResult = WinDetector.checkWin(this.card);
    if (winResult.type !== WIN_TYPES.NONE) {
      // Yangi yutuq ekanligini tekshirish
      const alreadyRecorded = this.winHistory.find(w => w.type === winResult.type);
      if (!alreadyRecorded) {
        this.winHistory.push({
          type: winResult.type,
          row: winResult.row,
          drawnCount: result.drawnCount,
        });
      }

      if (winResult.type === WIN_TYPES.FULL_HOUSE) {
        this.isGameOver = true;
        this.isPlaying = false;
      }
    }

    return {
      ...this.getState(),
      justMarkedRow: markedRow,
      winResult,
    };
  }

  /**
   * Joriy o'yin holatini olish
   */
  getState() {
    return {
      card: this.card,
      currentNumber: this.currentNumber,
      drawnNumbers: this.drawer ? this.drawer.getDrawnNumbers() : [],
      drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
      remainingCount: this.drawer ? this.drawer.getRemainingCount() : MAX_NUMBER,
      progress: this.drawer ? this.drawer.getDrawnNumbers().length / MAX_NUMBER : 0,
      winHistory: this.winHistory,
      isGameOver: this.isGameOver,
      isPlaying: this.isPlaying,
      gameMode: this.gameMode,
      markedCount: this.card ? countMarked(this.card) : 0,
    };
  }

  /**
   * O'yin statistikasini olish
   */
  getStats() {
    return {
      drawnCount: this.drawer ? this.drawer.getDrawnNumbers().length : 0,
      markedCount: this.card ? countMarked(this.card) : 0,
      winHistory: this.winHistory,
      hasFullHouse: this.winHistory.some(w => w.type === WIN_TYPES.FULL_HOUSE),
      totalNumbers: MAX_NUMBER,
    };
  }
}
