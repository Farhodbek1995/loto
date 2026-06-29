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
import { COLORS, GAME_MODES, FAST_DRAW_INTERVAL, WIN_TYPES } from '../utils/constants';
import { saveGameResult } from '../storage/StatsStorage';

/**
 * Asosiy o'yin ekrani.
 * O'yin jarayonini boshqaradi.
 */
export default function GameScreen({ route, navigation }) {
  const { mode } = route.params || { mode: GAME_MODES.SIMPLE };
  const isFastMode = mode === GAME_MODES.FAST;

  const gameRef = useRef(null);
  const fastTimerRef = useRef(null);

  const [gameState, setGameState] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [showWin, setShowWin] = useState(false);

  // O'yinni boshlash
  const startGame = useCallback(() => {
    const gs = new GameState(mode);
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

    if (result.error) {
      Alert.alert('Diqqat', result.error);
      return;
    }

    setGameState({ ...result });

    // Yutuq bo'lsa
    if (result.winResult && result.winResult.type !== WIN_TYPES.NONE) {
      setLastWin(result.winResult);
      setShowWin(true);
      Vibration.vibrate(500);
      setTimeout(() => setShowWin(false), 2500);
    }
  }, []);

  // Tezkor rejim uchun avtomatik chiqarish
  useEffect(() => {
    if (!isFastMode || !gameRef.current) return;
    if (!gameRef.current.isPlaying || gameRef.current.isGameOver) return;

    fastTimerRef.current = setInterval(() => {
      drawNumber();
    }, FAST_DRAW_INTERVAL);

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

      {/* Kartochka */}
      <ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardScrollContent}>
        <LotoCard
          card={gameState.card}
          currentNumber={gameState.currentNumber}
        />
      </ScrollView>

      {/* Chiqarish tugmasi / O'yin tugaganda natija */}
      <View style={styles.bottomSection}>
        {gameState.isGameOver ? (
          <View style={styles.gameOverBtns}>
            <DrawButton
              onPress={() => {}}
              disabled={true}
              drawnCount={90}
            />
            <View style={styles.gameOverActions}>
              <DrawButton
                onPress={() => {
                  const stats = gameRef.current.getStats();
                  navigation.navigate('Win', { stats, mode });
                }}
                disabled={false}
                drawnCount={0}
                isFastMode={false}
              />
              <Text
                style={styles.newGameBtn}
                onPress={startGame}
              >
                Yangi O'yin 🔄
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
    gap: 8,
  },
  gameOverActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  newGameBtn: {
    color: COLORS.BLUE_ACCENT,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
  },
});
