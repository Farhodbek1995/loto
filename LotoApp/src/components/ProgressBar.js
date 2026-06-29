import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, MAX_NUMBER } from '../utils/constants';

/**
 * O'yin progress bar komponenti.
 * Kegdan chiqqan raqamlar ulushini ko'rsatadi.
 */
export default function ProgressBar({ progress, drawnCount, markedCount }) {
  const percentage = Math.round((progress || 0) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{drawnCount || 0}</Text>
          <Text style={styles.statLabel}>Chiqdi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.GREEN }]}>
            {markedCount || 0}
          </Text>
          <Text style={styles.statLabel}>Yopildi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.GOLD }]}>
            {MAX_NUMBER - (drawnCount || 0)}
          </Text>
          <Text style={styles.statLabel}>Qoldi</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={styles.barText}>{percentage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.GRAY,
    fontSize: 11,
    marginTop: 2,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#3a3a7a',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.GOLD,
    borderRadius: 5,
  },
  barText: {
    color: COLORS.GRAY,
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
});
