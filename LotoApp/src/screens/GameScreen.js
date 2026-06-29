import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, Vibration,
} from 'react-native';
import LotoCard from '../components/LotoCard';
import DrawButton from '../components/DrawButton';
import NumberHistory from '../components/NumberHistory';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';
import { GameState } from '../engine/GameState';
import { WinDetector } from '../engine/WinDetector';
import { COLORS, GAME_MODES, WIN_TYPES, DEFAULT_SETTINGS } from '../utils/constants';
import { saveGameResult, getSettings } from '../storage/StatsStorage';
import { playDrawSound, playWinSound, setSoundEnabled } from '../utils/sound';

/**
 * Asosiy o'yin ekrani.
 * O'yin jarayonini boshqaradi.
 */
export default function GameScreen({ route, navigation }) {
  const { mode } = route.params || { mode: GAME_MODES.SIMPLE };
  const isFastMode = mode === GAME_MODES.FAST;

  const gameRef = useRef(null);
  const fastTimerRef = useRef(null);
  const settingsRef = useRef(DEFAULT_SETTINGS);

  const [gameState, setGameState] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [showWin, setShowWin] = useState(false);

  // Sozlamalarni yuklash
  useEffect(() => {
    getSettings().then(s => {
      settingsRef.current = s;
      setSoundEnabled(s.soundEnabled !== false);
    });
  }, []);

  // O'yinni boshlash
  const startGame = useCallback(() => {
    const cardCount = settingsRef.current?.cardCount || 1;
    const gs = new GameState(mode, cardCount);
    const state = gs.startNewGame();
    gameRef.current = gs;
    setGameState(state);
    setLastWin(null);
    setShowWin(false);
  }, [mode]);

  // Raqam chiqarish
  const drawNumber = useCallback(() => {
    if (!gameRef.current) return;

    const result = gameRef.current.drawNumber();

    if (!result || result.error) {
      if (result?.error) Alert.alert('Diqqat', result.error);
      return;
    }

    setGameState({ ...result });

    // Ovoz effekti
    playDrawSound();

    // Yutuq bo'lsa
    if (result.winResult && result.winResult.type !== WIN_TYPES.NONE) {
      setLastWin(result.winResult);
      setShowWin(true);
      // Vibratsiya sozlamasini tekshirish
      if (settingsRef.current?.vibrationEnabled !== false) {
        Vibration.vibrate(500);
      }
      // Yutuq ovozi
      playWinSound();
      setTimeout(() => setShowWin(false), 2500);
    }
  }, []);

  // Tezkor rejim uchun avtomatik chiqarish
  useEffect(() => {
    if (!isFastMode || !gameRef.current) return;
    if (!gameRef.current.isPlaying || gameRef.current.isGameOver) return;

    const interval = settingsRef.current?.fastDrawInterval || DEFAULT_SETTINGS.fastDrawInterval;

    fastTimerRef.current = setInterval(() => {
      // O'yin tugagan bo'lsa intervalni to'xtatish
      if (gameRef.current?.isGameOver) {
        if (fastTimerRef.current) clearInterval(fastTimerRef.current);
        return;
      }
      drawNumber();
    }, interval);

    return () => {
      if (fastTimerRef.current) clearInterval(fastTimerRef.current);
    };
  }, [isFastMode, gameState?.isPlaying, gameState?.isGameOver, drawNumber]);

  // Start on mount
  useEffect(() => {
    startGame();
    return () => {
      if (fastTimerRef.current) clearInterval(fastTimerRef.current);
    };
  }, [startGame]);

  // O'yin tugaganda natijani saqlash
  useEffect(() => {
    if (gameState?.isGameOver && gameRef.current) {
      const stats = gameRef.current.getStats();
      saveGameResult(stats);
      // Tezkor rejimda avtomatik natija ekraniga o'tish
      if (isFastMode && stats.hasFullHouse) {
        setTimeout(() => {
          navigation.navigate('Win', {
            stats,
            mode,
          });
        }, 1500);
      }
    }
  }, [gameState?.isGameOver]);

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
          if (fastTimerRef.current) clearInterval(fastTimerRef.current);
          navigation.goBack();
        }}
      />

      {/* Chiqqan raqam ko'rinishi */}
      {gameState.currentNumber && (
        <View style={styles.drawnSection}>
          <View style={styles.drawnBall}>
            <Text style={styles.drawnNumber}>{gameState.currentNumber}</Text>
          </View>
          <Text style={styles.drawnLabel}>Chiqdi!</Text>
        </View>
      )}

      {!gameState.currentNumber && (
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

      {/* Chiqarish tugmasi / O'yin tugaganda natija */}
      <View style={styles.bottomSection}>
        {gameState.isGameOver ? (
          <View style={styles.gameOverBtns}>
            <DrawButton
              onPress={() => {
                const stats = gameRef.current.getStats();
                navigation.navigate('Win', { stats, mode });
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
                onPress={() => navigation.navigate('MainMenu')}
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
});
