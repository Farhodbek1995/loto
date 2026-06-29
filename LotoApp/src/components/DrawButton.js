import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Raqam chiqarish tugmasi.
 * O'yin holatiga qarab ko'rinishi o'zgaradi.
 */
export default function DrawButton({ onPress, disabled, drawnCount, isFastMode }) {
  const allDrawn = drawnCount >= 90;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || allDrawn) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || allDrawn}
      activeOpacity={0.6}
    >
      <View style={styles.buttonContent}>
        <Text style={styles.buttonIcon}>
          {allDrawn ? '🏁' : isFastMode ? '⚡' : '🎯'}
        </Text>
        <Text style={styles.buttonText}>
          {allDrawn
            ? 'O\'yin Yakunlandi'
            : isFastMode
              ? 'Tezkor Chiqarish'
              : 'Raqam Chiqarish'}
        </Text>
      </View>
      {!allDrawn && (
        <Text style={styles.buttonSubtext}>
          Qolgan: {90 - (drawnCount || 0)} ta raqam
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.GOLD,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 6,
    shadowColor: COLORS.GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.DARK_GRAY,
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    color: '#1A1A2E',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonSubtext: {
    color: '#1A1A2E',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});
