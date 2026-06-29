import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, GAME_MODES } from '../utils/constants';

/**
 * Yutuq natijalari ekrani.
 * O'yin tugagach natijalarni ko'rsatadi.
 */
export default function WinScreen({ route, navigation }) {
  const { stats, mode } = route.params || {};

  const drawCount = stats?.drawnCount || 0;
  const markedCount = stats?.markedCount || 0;
  const hasFullHouse = stats?.hasFullHouse || false;
  const winHistory = stats?.winHistory || [];

  return (
    <View style={styles.container}>
      {/* Yuqori qism - Trophy */}
      <View style={styles.trophySection}>
        <Text style={styles.trophyEmoji}>
          {hasFullHouse ? '🏆' : '🎉'}
        </Text>
        <Text style={styles.congratsText}>
          {hasFullHouse ? 'Tabriklaymiz!' : 'O\'yin Yakunlandi!'}
        </Text>
        <Text style={styles.resultText}>
          {hasFullHouse
            ? 'Siz ASOSIY yutuqni qo\'lga kiritdingiz!'
            : 'Ajoyib o\'yin bo\'ldi!'}
        </Text>
      </View>

      {/* Statistika kartochkasi */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{drawCount}</Text>
            <Text style={styles.statLabel}>Jami chiqarilgan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statValue, { color: COLORS.GREEN }]}>
              {markedCount}
            </Text>
            <Text style={styles.statLabel}>Yopilgan raqamlar</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={[styles.statValue, { color: COLORS.GOLD }]}>
              {90 - drawCount}
            </Text>
            <Text style={styles.statLabel}>Qolgan raqamlar</Text>
          </View>
        </View>

        {/* Yutuqlar */}
        {winHistory.length > 0 && (
          <View style={styles.winSection}>
            <Text style={styles.winSectionTitle}>Yutuqlaringiz:</Text>
            {winHistory.map((win, idx) => (
              <View key={idx} style={styles.winRow}>
                <Text style={styles.winEmoji}>
                  {win.type === 'full_house' ? '🏆' : win.type === 'two_rows' ? '🎊' : '🎉'}
                </Text>
                <Text style={styles.winName}>
                  {win.type === 'full_house' ? 'To\'liq Kartochka' :
                   win.type === 'two_rows' ? 'Kvartira (2-qator)' : 'Qator'}
                </Text>
                <Text style={styles.winAt}>
                  Chiqqan raqam: #{win.drawnCount}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Tugmalar */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.playAgainBtn}
          onPress={() => navigation.navigate('Game', { mode: mode || GAME_MODES.SIMPLE })}
          activeOpacity={0.7}
        >
          <Text style={styles.playAgainText}>🔄 Yana O'ynash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate('MainMenu')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuBtnText}>🏠 Asosiy Menyu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  trophySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  congratsText: {
    color: COLORS.GOLD,
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  resultText: {
    color: COLORS.LIGHT_GRAY,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#3a3a7a',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.WHITE,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.GRAY,
    fontSize: 11,
    marginTop: 4,
  },
  winSection: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a7a',
    paddingTop: 12,
  },
  winSectionTitle: {
    color: COLORS.GOLD,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  winEmoji: {
    fontSize: 18,
  },
  winName: {
    color: COLORS.WHITE,
    fontSize: 14,
    flex: 1,
  },
  winAt: {
    color: COLORS.GRAY,
    fontSize: 12,
  },
  buttonSection: {
    width: '100%',
    gap: 12,
  },
  playAgainBtn: {
    backgroundColor: COLORS.GOLD,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },
  playAgainText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuBtn: {
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a7a',
  },
  menuBtnText: {
    color: COLORS.LIGHT_GRAY,
    fontSize: 16,
  },
});
