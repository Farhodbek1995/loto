import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Bitta raqam katagi.
 * Agar null bo'lsa - bo'sh katak.
 * Agar raqam bo'lsa - ochiq / yopilgan holatda.
 */
export default function NumberCell({ cell, isCurrentNumber }) {
  // Bo'sh katak
  if (!cell) {
    return <View style={[styles.cell, styles.emptyCell]} />;
  }

  const { number, marked } = cell;
  const isHighlighted = isCurrentNumber && !marked;

  return (
    <View
      style={[
        styles.cell,
        styles.numberCell,
        marked && styles.markedCell,
        isHighlighted && styles.highlightedCell,
      ]}
    >
      <Text
        style={[
          styles.numberText,
          marked && styles.markedText,
          isHighlighted && styles.highlightedText,
        ]}
      >
        {number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 36,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 6,
  },
  emptyCell: {
    backgroundColor: COLORS.CELL_EMPTY,
    borderWidth: 0.5,
    borderColor: '#1a1a3e',
  },
  numberCell: {
    backgroundColor: COLORS.CELL_UNMARKED,
    borderWidth: 1,
    borderColor: '#4a4a8a',
  },
  markedCell: {
    backgroundColor: COLORS.GREEN,
    borderColor: '#2E7D32',
  },
  highlightedCell: {
    backgroundColor: COLORS.RED,
    borderColor: '#C62828',
    transform: [{ scale: 1.08 }],
    elevation: 4,
  },
  numberText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: 'bold',
  },
  markedText: {
    color: '#FFFFFF',
    textDecorationLine: 'line-through',
  },
  highlightedText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
