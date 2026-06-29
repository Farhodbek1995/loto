import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { COLORS, GAME_MODES } from '../utils/constants';

/**
 * Asosiy menyu ekrani.
 * O'yin turini tanlash va navigatsiya.
 */
export default function MainMenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BG_DARK} />

      {/* Sarlavha qismi */}
      <View style={styles.headerSection}>
        <Text style={styles.emoji}>🎰</Text>
        <Text style={styles.title}>LOTO</Text>
        <Text style={styles.subtitle}>ONLINE</Text>
        <View style={styles.divider} />
        <Text style={styles.desc}>Klassik loto o'yini{'\n'}1 dan 90 gacha</Text>
      </View>

      {/* O'yin tugmalari */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={[styles.gameBtn, styles.btnSimple]}
          onPress={() => navigation.navigate('Game', { mode: GAME_MODES.SIMPLE })}
          activeOpacity={0.7}
        >
          <Text style={styles.btnIcon}>🎯</Text>
          <View style={styles.btnTextContainer}>
            <Text style={styles.btnTitle}>Oddiy O'yin</Text>
            <Text style={styles.btnDesc}>Raqamlarni qo'lda chiqaring</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameBtn, styles.btnFast]}
          onPress={() => navigation.navigate('Game', { mode: GAME_MODES.FAST })}
          activeOpacity={0.7}
        >
          <Text style={styles.btnIcon}>⚡</Text>
          <View style={styles.btnTextContainer}>
            <Text style={styles.btnTitle}>Tezkor O'yin</Text>
            <Text style={styles.btnDesc}>Avtomatik har 5 soniyada</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Pastki navigatsiya */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('Stats')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navText}>Statistika</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Sozlamalar</Text>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: COLORS.GOLD,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    letterSpacing: 10,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.GOLD,
    marginVertical: 16,
    borderRadius: 1,
  },
  desc: {
    fontSize: 14,
    color: COLORS.LIGHT_GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  menuSection: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  gameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
  },
  btnSimple: {
    backgroundColor: COLORS.BG_MEDIUM,
    borderColor: '#3a3a7a',
  },
  btnFast: {
    backgroundColor: '#1a2940',
    borderColor: '#4a3a1a',
  },
  btnIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  btnTextContainer: {
    flex: 1,
  },
  btnTitle: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  btnDesc: {
    color: COLORS.GRAY,
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 32,
  },
  navBtn: {
    alignItems: 'center',
    padding: 12,
  },
  navIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  navText: {
    color: COLORS.GRAY,
    fontSize: 12,
  },
});
