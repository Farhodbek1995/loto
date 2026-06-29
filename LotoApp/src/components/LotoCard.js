import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NumberCell from './NumberCell';
import { ROWS, COLS, COLORS } from '../utils/constants';

/**
 * Loto kartochkasi komponenti.
 * 3 ta qator × 9 ta ustun ko'rinishida.
 */
export default function LotoCard({ card, currentNumber, cardIndex }) {
  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Kartochka yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cardIndex !== undefined && (
        <Text style={styles.cardLabel}>Kartochka {cardIndex + 1}</Text>
      )}
      <View style={styles.card}>
        {/* Ustun sarlavhalari */}
        <View style={styles.headerRow}>
          {Array.from({ length: COLS }, (_, i) => (
            <View key={i} style={styles.headerCell}>
              <Text style={styles.headerText}>{i + 1}</Text>
            </View>
          ))}
        </View>

        {/* Qatorlar */}
        {card.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => (
              <NumberCell
                key={`${rowIdx}-${colIdx}`}
                cell={cell}
                isCurrentNumber={
                  currentNumber !== null &&
                  cell &&
                  cell.number === currentNumber
                }
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#2a2a6a',
    elevation: 5,
  },
  cardLabel: {
    color: COLORS.GOLD,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a6a',
  },
  headerCell: {
    width: 36,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  headerText: {
    color: COLORS.GRAY,
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: 16,
    padding: 20,
  },
});
