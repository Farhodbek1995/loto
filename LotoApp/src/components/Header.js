import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Sarlavha komponenti.
 * Orqaga / Menyu tugmalari va o'yin nomi.
 */
export default function Header({ title, onBack, onSettings, showBack, showSettings }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{title || 'LOTO'}</Text>
      </View>

      <View style={styles.right}>
        {showSettings && (
          <TouchableOpacity onPress={onSettings} style={styles.iconBtn}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.BG_DARK,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  left: {
    width: 50,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 50,
    alignItems: 'flex-end',
  },
  title: {
    color: COLORS.GOLD,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.BG_MEDIUM,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.WHITE,
  },
});
