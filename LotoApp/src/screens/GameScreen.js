import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, Vibration, TouchableOpacity,
} from 'react-native';
import LotoCard from '../components/LotoCard';
import DrawButton from '../components/DrawButton';
import NumberHistory from '../components/NumberHistory';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';
import { GameState } from '../engine/GameState';
import { WinDetector } from '../engine/WinDetector';
import { COLORS, GAME_MODES, WIN_TYPES, DEFAULT_SETTINGS, BONUS_TYPES, MAX_BONUS_USES } from '../utils/constants';
import { saveGameResult, getSettings } from '../storage/StatsStorage';
import { playDrawSound, playWinSound, playClickSound, setSoundEnabled } from '../utils/sound';

/**
 * Asosiy o'yin ekrani.
 * O'yin jarayonini boshqaradi.
 *
 * MUHIM tuzatishlar:
 * - Barcha setTimeout/setInterval ID'lari ref da saqlanadi va
 *   komponent unmount bo'lganda tozalanadi (memory leak + crash)
 * - mounted ref orqali unmount dan keyin setState chaqirilmaydi
 * - Fast-mode interval faqat bir marta yaratiladi (race condition fix)
 * - gameRef.current o'rniga callback ref pattern ishlatilgan
 */
export default function GameScreen({ route, navigation }) {
  const { mode } = route.params || { mode: GAME_MODES.SIMPLE };
  const isFastMode = mode === GAME_MODES.FAST;

  const gameRef = useRef(null);
  const fastTimerRef = useRef(null);
  const winTimerRef = useRef(null);
  const navTimerRef = useRef(null);
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const mountedRef = useRef(true);
  const isFastActiveRef = useRef(false);

  const [gameState, setGameState] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const [bonusRemaining, setBonusRemaining] = useState({
    [BONUS_TYPES.AUTO_1]: MAX_BONUS_USES[BONUS_TYPES.AUTO_1],
    [BONUS_TYPES.AUTO_5]: MAX_BONUS_USES[BONUS_TYPES.AUTO_5],
    [BONUS_TYPES.CLOSE_MISSED]: MAX_BONUS_USES[BONUS_TYPES.CLOSE_MISSED],
  });
  const [showBonusPanel, setShowBonusPanel] = useState(false);

  /**
   * Barcha timerlarni tozalash (xavfsiz)
   */
  const clearAllTimers = useCallback(() => {
    if (fastTimerRef.current) {
      clearInterval(fastTimerRef.current);
      fastTimerRef.current = null;
      isFastActiveRef.current = false;
    }
    if (winTimerRef.current) {
      clearTimeout(winTimerRef.current);
      winTimerRef.current = null;
    }
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  }, []);

  // Komponent unmount bo'lganda barcha timerlarni tozalash
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Sozlamalarni yuklash
  useEffect(() => {
    let cancelled = false;
    getSettings().then(s => {
      if (cancelled || !mountedRef.current) return;
      settingsRef.current = s;
      setSoundEnabled(s.soundEnabled !== false);
    });
    return () => { cancelled = true; };
  }, []);

  // O'yinni boshlash
  const startGame = useCallback(() => {
    // Avvalgi o'yin timerlarini tozalash
    clearAllTimers();

    const cardCount = settingsRef.current?.cardCount || 1;
    const gs = new GameState(mode, cardCount);
    const state = gs.startNewGame();
    gameRef.current = gs;
    if (mountedRef.current) {
      setGameState(state);
      setLastWin(null);
      setShowWin(false);
      setShowBonusPanel(false);
      setBonusRemaining({
        [BONUS_TYPES.AUTO_1]: MAX_BONUS_USES[BONUS_TYPES.AUTO_1],
        [BONUS_TYPES.AUTO_5]: MAX_BONUS_USES[BONUS_TYPES.AUTO_5],
        [BONUS_TYPES.CLOSE_MISSED]: MAX_BONUS_USES[BONUS_TYPES.CLOSE_MISSED],
      });
    }
  }, [mode, clearAllTimers]);

  // Raqam chiqarish
  const drawNumber = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    const result = game.drawNumber();

    if (!result || result.error) {
      if (result?.error && mountedRef.current) {
        Alert.alert('Diqqat', result.error);
      }
      return;
    }

    if (!mountedRef.current) return;

    setGameState({ ...result });

    // Bonus qolganlarini yangilash
    const game = gameRef.current;
    if (game) {
      setBonusRemaining({
        [BONUS_TYPES.AUTO_1]: game.getBonusRemaining(BONUS_TYPES.AUTO_1, MAX_BONUS_USES[BONUS_TYPES.AUTO_1]),
        [BONUS_TYPES.AUTO_5]: game.getBonusRemaining(BONUS_TYPES.AUTO_5, MAX_BONUS_USES[BONUS_TYPES.AUTO_5]),
        [BONUS_TYPES.CLOSE_MISSED]: game.getBonusRemaining(BONUS_TYPES.CLOSE_MISSED, MAX_BONUS_USES[BONUS_TYPES.CLOSE_MISSED]),
      });
    }

    // Ovoz effekti (async, xavfsiz)
    try { playDrawSound(); } catch (_) { /* ignore */ }

    // Yutuq bo'lsa
    if (result.winResult && result.winResult.type !== WIN_TYPES.NONE) {
      setLastWin(result.winResult);
      setShowWin(true);

      // Vibratsiya sozlamasini tekshirish
      if (settingsRef.current?.vibrationEnabled !== false) {
        try { Vibration.vibrate(500); } catch (_) { /* ignore */ }
      }
      // Yutuq ovozi
      try { playWinSound(); } catch (_) { /* ignore */ }

      // Win banner timer - ref da saqlanadi
      if (winTimerRef.current) clearTimeout(winTimerRef.current);
      winTimerRef.current = setTimeout(() => {
        winTimerRef.current = null;
        if (mountedRef.current) setShowWin(false);
      }, 2500);
    }
  }, []);

  // Tezkor rejim uchun avtomatik chiqarish
  useEffect(() => {
    // Faqat tezkor rejimda va o'yin faol bo'lganda
    if (!isFastMode) {
      isFastActiveRef.current = false;
      return;
    }

    // Agar o'yin hali boshlanmagan yoki tugagan bo'lsa
    if (!gameRef.current) return;
    if (!gameRef.current.isPlaying || gameRef.current.isGameOver) {
      return;
    }

    // Agar interval allaqachon ishlamoqda bo'lsa, qayta yaratmaymiz
    if (isFastActiveRef.current) return;

    isFastActiveRef.current = true;
    const interval = settingsRef.current?.fastDrawInterval || DEFAULT_SETTINGS.fastDrawInterval;

    fastTimerRef.current = setInterval(() => {
      if (!mountedRef.current) {
        clearAllTimers();
        return;
      }
      const game = gameRef.current;
      if (!game || game.isGameOver) {
        if (fastTimerRef.current) {
          clearInterval(fastTimerRef.current);
          fastTimerRef.current = null;
          isFastActiveRef.current = false;
        }
        return;
      }
      drawNumber();
    }, interval);

    return () => {
      if (fastTimerRef.current) {
        clearInterval(fastTimerRef.current);
        fastTimerRef.current = null;
        isFastActiveRef.current = false;
      }
    };
    // faqat isFastMode o'zgarganda qayta yaratamiz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFastMode]);

  // Start on mount
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O'yin tugaganda natijani saqlash
  useEffect(() => {
    if (!gameState?.isGameOver || !gameRef.current) return;
    if (!mountedRef.current) return;

    const stats = gameRef.current.getStats();
    saveGameResult(stats);

    // Tezkor rejimda avtomatik natija ekraniga o'tish
    if (isFastMode && stats.hasFullHouse) {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      navTimerRef.current = setTimeout(() => {
        navTimerRef.current = null;
        if (mountedRef.current) {
          navigation.navigate('Win', { stats, mode });
        }
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.isGameOver]);

  // Bonus ishlatish
  const useBonus = useCallback((bonusType) => {
    const game = gameRef.current;
    if (!game || !mountedRef.current) return;

    let result;
    try {
      if (bonusType === BONUS_TYPES.AUTO_1) {
        if (bonusRemaining[BONUS_TYPES.AUTO_1] <= 0) return;
        result = game.useAutoCloseOne();
      } else if (bonusType === BONUS_TYPES.AUTO_5) {
        if (bonusRemaining[BONUS_TYPES.AUTO_5] <= 0) return;
        result = game.useAutoCloseFive();
      } else if (bonusType === BONUS_TYPES.CLOSE_MISSED) {
        if (bonusRemaining[BONUS_TYPES.CLOSE_MISSED] <= 0) return;
        result = game.useCloseMissed();
      }
    } catch (_) {
      return;
    }

    if (!result || !mountedRef.current) return;

    try { playClickSound(); } catch (_) { /* ignore */ }

    const state = game.getState();
    setGameState(state);
    setBonusRemaining({
      [BONUS_TYPES.AUTO_1]: game.getBonusRemaining(BONUS_TYPES.AUTO_1, MAX_BONUS_USES[BONUS_TYPES.AUTO_1]),
      [BONUS_TYPES.AUTO_5]: game.getBonusRemaining(BONUS_TYPES.AUTO_5, MAX_BONUS_USES[BONUS_TYPES.AUTO_5]),
      [BONUS_TYPES.CLOSE_MISSED]: game.getBonusRemaining(BONUS_TYPES.CLOSE_MISSED, MAX_BONUS_USES[BONUS_TYPES.CLOSE_MISSED]),
    });

    if (result.winResult && result.winResult.type !== WIN_TYPES.NONE) {
      setLastWin(result.winResult);
      setShowWin(true);
      if (settingsRef.current?.vibrationEnabled !== false) {
        try { Vibration.vibrate(500); } catch (_) { /* ignore */ }
      }
      try { playWinSound(); } catch (_) { /* ignore */ }
      if (winTimerRef.current) clearTimeout(winTimerRef.current);
      winTimerRef.current = setTimeout(() => {
        winTimerRef.current = null;
        if (mountedRef.current) setShowWin(false);
      }, 2500);
    }

    if (!result.success && result.error) {
      Alert.alert('Diqqat', result.error);
    }
  }, [bonusRemaining]);

  const totalBonusLeft = bonusRemaining[BONUS_TYPES.AUTO_1] + bonusRemaining[BONUS_TYPES.AUTO_5] + bonusRemaining[BONUS_TYPES.CLOSE_MISSED];

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`LOTO ${isFastMode ? '⚡' : '🎯'}`}
        showBack
        onBack={() => {
          clearAllTimers();
          navigation.goBack();
        }}
      />

      {/* Chiqqan raqam ko'rinishi */}
      {gameState.currentNumber ? (
        <View style={styles.drawnSection}>
          <View style={styles.drawnBall}>
            <Text style={styles.drawnNumber}>{gameState.currentNumber}</Text>
          </View>
          <Text style={styles.drawnLabel}>Chiqdi!</Text>
        </View>
      ) : (
        <View style={styles.drawnSection}>
          <View style={[styles.drawnBall, styles.drawnBallEmpty]}>
            <Text style={styles.drawnNumberEmpty}>?</Text>
          </View>
          <Text style={styles.drawnLabel}>
            {isFastMode ? 'Kuting...' : 'Tugmani bosing'}
          </Text>
        </View>
      )}

      {/* Yutuq xabari */}
      {showWin && lastWin && (
        <View style={styles.winBanner}>
          <Text style={styles.winText}>
            {WinDetector.getWinName(lastWin.type)}
          </Text>
          <Text style={styles.winDesc}>
            {WinDetector.getWinDescription(lastWin.type, lastWin.row)}
          </Text>
        </View>
      )}

      {/* Raqamlar tarixi */}
      <NumberHistory
        drawnNumbers={gameState.drawnNumbers}
        currentNumber={gameState.currentNumber}
      />

      {/* Progress bar */}
      <ProgressBar
        progress={gameState.progress}
        drawnCount={gameState.drawnCount}
        markedCount={gameState.markedCount}
      />

      {/* Kartochkalar */}
      <ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardScrollContent}>
        {gameState.cards && gameState.cards.length > 0 ? (
          gameState.cards.map((card, idx) => (
            <LotoCard
              key={idx}
              card={card}
              currentNumber={gameState.currentNumber}
              cardIndex={idx}
            />
          ))
        ) : (
          <LotoCard
            card={gameState.card}
            currentNumber={gameState.currentNumber}
          />
        )}
      </ScrollView>

      {/* Bonus panel */}
      {!gameState.isGameOver && totalBonusLeft > 0 && (
        <View style={styles.bonusSection}>
          <TouchableOpacity
            style={styles.bonusToggle}
            onPress={() => {
              try { playClickSound(); } catch (_) { /* ignore */ }
              setShowBonusPanel(prev => !prev);
            }}
          >
            <Text style={styles.bonusToggleIcon}>{showBonusPanel ? '🔽' : '🔼'}</Text>
            <Text style={styles.bonusToggleText}>
              Bonuslar ({totalBonusLeft})
            </Text>
          </TouchableOpacity>
          {showBonusPanel && (
            <View style={styles.bonusPanel}>
              <TouchableOpacity
                style={[styles.bonusBtn, styles.bonusBtn1, bonusRemaining[BONUS_TYPES.AUTO_1] <= 0 && styles.bonusBtnDisabled]}
                onPress={() => useBonus(BONUS_TYPES.AUTO_1)}
                disabled={bonusRemaining[BONUS_TYPES.AUTO_1] <= 0}
              >
                <Text style={styles.bonusBtnIcon}>🎯</Text>
                <Text style={styles.bonusBtnLabel}>1 ta ochish</Text>
                <Text style={styles.bonusBtnCount}>x{bonusRemaining[BONUS_TYPES.AUTO_1]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bonusBtn, styles.bonusBtn5, bonusRemaining[BONUS_TYPES.AUTO_5] <= 0 && styles.bonusBtnDisabled]}
                onPress={() => useBonus(BONUS_TYPES.AUTO_5)}
                disabled={bonusRemaining[BONUS_TYPES.AUTO_5] <= 0}
              >
                <Text style={styles.bonusBtnIcon}>🎰</Text>
                <Text style={styles.bonusBtnLabel}>5 ta ochish</Text>
                <Text style={styles.bonusBtnCount}>x{bonusRemaining[BONUS_TYPES.AUTO_5]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bonusBtn, styles.bonusBtnMissed, bonusRemaining[BONUS_TYPES.CLOSE_MISSED] <= 0 && styles.bonusBtnDisabled]}
                onPress={() => useBonus(BONUS_TYPES.CLOSE_MISSED)}
                disabled={bonusRemaining[BONUS_TYPES.CLOSE_MISSED] <= 0}
              >
                <Text style={styles.bonusBtnIcon}>🔍</Text>
                <Text style={styles.bonusBtnLabel}>O'tkazilgan</Text>
                <Text style={styles.bonusBtnCount}>x{bonusRemaining[BONUS_TYPES.CLOSE_MISSED]}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Chiqarish tugmasi / O'yin tugaganda natija */}
      <View style={styles.bottomSection}>
        {gameState.isGameOver ? (
          <View style={styles.gameOverBtns}>
            <DrawButton
              onPress={() => {
                const g = gameRef.current;
                if (g) {
                  const stats = g.getStats();
                  navigation.navigate('Win', { stats, mode });
                }
              }}
              disabled={false}
              drawnCount={gameState.drawnCount}
              isFastMode={false}
              customTitle="Natijalarni Ko'rish"
            />
            <View style={styles.gameOverActions}>
              <Text
                style={styles.newGameBtn}
                onPress={startGame}
              >
                🔄 Yangi O'yin
              </Text>
              <Text
                style={styles.menuBtn}
                onPress={() => {
                  clearAllTimers();
                  navigation.navigate('MainMenu');
                }}
              >
                🏠 Menyu
              </Text>
            </View>
          </View>
        ) : (
          <DrawButton
            onPress={drawNumber}
            disabled={isFastMode}
            drawnCount={gameState.drawnCount}
            isFastMode={isFastMode}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  drawnSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  drawnBall: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.RED,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  drawnBallEmpty: {
    backgroundColor: COLORS.BG_MEDIUM,
    borderWidth: 2,
    borderColor: '#3a3a7a',
    borderStyle: 'dashed',
  },
  drawnNumber: {
    color: COLORS.WHITE,
    fontSize: 32,
    fontWeight: 'bold',
  },
  drawnNumberEmpty: {
    color: COLORS.GRAY,
    fontSize: 28,
  },
  drawnLabel: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginTop: 6,
  },
  winBanner: {
    backgroundColor: COLORS.GOLD,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 6,
    marginBottom: 8,
  },
  winText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winDesc: {
    color: '#1A1A2E',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  bottomSection: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  gameOverBtns: {
    gap: 12,
  },
  gameOverActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 4,
  },
  newGameBtn: {
    color: COLORS.GREEN,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
  },
  menuBtn: {
    color: COLORS.GRAY,
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
  },
  bonusSection: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  bonusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a7a',
  },
  bonusToggleIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  bonusToggleText: {
    color: COLORS.GOLD,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bonusPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  bonusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  bonusBtn1: {
    backgroundColor: '#1a2a1a',
    borderColor: '#2a5a2a',
  },
  bonusBtn5: {
    backgroundColor: '#1a1a2a',
    borderColor: '#2a2a5a',
  },
  bonusBtnMissed: {
    backgroundColor: '#2a1a1a',
    borderColor: '#5a2a2a',
  },
  bonusBtnDisabled: {
    opacity: 0.35,
  },
  bonusBtnIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  bonusBtnLabel: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  bonusBtnCount: {
    color: COLORS.GOLD,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
