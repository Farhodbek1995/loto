import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Chiqqan raqamlar tarixini ko'rsatuvchi komponent.
 * Oxirgi chiqqan 5 ta raqam gorizontal scroll ko'rinishida.
 */
export default function NumberHistory({ drawnNumbers, currentNumber }) {
  if (!drawnNumbers || drawnNumbers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Raqam chiqarishni boshlang...</Text>
      </View>
    );
  }

  // Oxirgi 7 ta raqam (eng yangisi o'ngda)
  const recent = drawnNumbers.slice(-7);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Chiqqan raqamlar: {drawnNumbers.length}/90
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recent.map((num, idx) => {
          const isLast = idx === recent.length - 1;
          return (
            <View
              key={idx}
              style={[
                styles.numberBubble,
                isLast && styles.lastBubble,
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  isLast && styles.lastNumberText,
                ]}
              >
                {num}
              </Text>
            </View>
          );
        })}
        {drawnNumbers.length > 7 && (
          <Text style={styles.moreText}>...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  title: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  numberBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.BG_MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a7a',
  },
  lastBubble: {
    backgroundColor: COLORS.RED,
    borderColor: '#C62828',
    transform: [{ scale: 1.15 }],
    elevation: 4,
  },
  numberText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  lastNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreText: {
    color: COLORS.GRAY,
    fontSize: 18,
    marginLeft: 4,
  },
});
