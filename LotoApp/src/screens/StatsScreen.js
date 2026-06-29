import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Header from '../components/Header';
import { COLORS } from '../utils/constants';
import { getStats } from '../storage/StatsStorage';

/**
 * Statistika ekrani.
 * O'yin tarixi va natijalar.
 */
export default function StatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const data = await getStats();
    setStats(data);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Header title="Statistika" showBack onBack={() => navigation.goBack()} />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  const { totalGames, wins, rows, twoRows, fullHouses, totalDraws } = stats;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const avgDraws = totalGames > 0 ? Math.round(totalDraws / totalGames) : 0;

  return (
    <View style={styles.container}>
      <Header title="Statistika" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.GOLD} />
        }
      >
        {/* Asosiy statistika */}
        <View style={styles.mainStats}>
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatValue}>{totalGames}</Text>
            <Text style={styles.mainStatLabel}>Jami o'yinlar</Text>
          </View>
          <View style={styles.mainStatDivider} />
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, { color: COLORS.GREEN }]}>
              {wins}
            </Text>
            <Text style={styles.mainStatLabel}>Yutuqlar</Text>
          </View>
          <View style={styles.mainStatDivider} />
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, { color: COLORS.GOLD }]}>
              {winRate}%
            </Text>
            <Text style={styles.mainStatLabel}>Yutuq foizi</Text>
          </View>
        </View>

        {/* Batafsil statistika */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Batafsil ma'lumot</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🎉</Text>
              <Text style={styles.detailValue}>{rows}</Text>
              <Text style={styles.detailLabel}>Qator yutuqlari</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🎊</Text>
              <Text style={styles.detailValue}>{twoRows}</Text>
              <Text style={styles.detailLabel}>Kvartira yutuqlari</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🏆</Text>
              <Text style={[styles.detailValue, { color: COLORS.GOLD }]}>
                {fullHouses}
              </Text>
              <Text style={styles.detailLabel}>To'liq kartochka</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🎯</Text>
              <Text style={styles.detailValue}>{totalDraws}</Text>
              <Text style={styles.detailLabel}>Jami chiqarilgan</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>📊</Text>
              <Text style={styles.detailValue}>{avgDraws}</Text>
              <Text style={styles.detailLabel}>O'rtacha / o'yin</Text>
            </View>
          </View>
        </View>

        {/* Bo'sh holat */}
        {totalGames === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎰</Text>
            <Text style={styles.emptyText}>Hali statistika yo'q</Text>
            <Text style={styles.emptySubtext}>
              O'yin o'ynang va statistika shu yerda paydo bo'ladi
            </Text>
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mainStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a7a',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mainStatItem: {
    alignItems: 'center',
  },
  mainStatValue: {
    color: COLORS.WHITE,
    fontSize: 36,
    fontWeight: 'bold',
  },
  mainStatLabel: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  mainStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#3a3a7a',
  },
  detailCard: {
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a7a',
  },
  detailTitle: {
    color: COLORS.GOLD,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  detailValue: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailLabel: {
    color: COLORS.GRAY,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a7a',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.DARK_GRAY,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
