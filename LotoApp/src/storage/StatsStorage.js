import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

/**
 * O'yin statistikasini saqlash va o'qish
 */
export async function getStats() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.log('Stats o\'qishda xatolik:', e);
  }
  return {
    totalGames: 0,
    wins: 0,
    rows: 0,
    twoRows: 0,
    fullHouses: 0,
    totalDraws: 0,
  };
}

export async function saveGameResult(result) {
  try {
    const stats = await getStats();
    stats.totalGames++;
    stats.totalDraws += result.drawnCount || 0;

    if (result.winHistory) {
      for (const win of result.winHistory) {
        if (win.type === 'row') stats.rows++;
        if (win.type === 'two_rows') stats.twoRows++;
        if (win.type === 'full_house') {
          stats.fullHouses++;
          stats.wins++;
        }
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  } catch (e) {
    console.log('Natijani saqlashda xatolik:', e);
    return null;
  }
}

/**
 * Sozlamalarni saqlash va o'qish
 */
export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.log('Sozlamalarni o\'qishda xatolik:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.log('Sozlamalarni saqlashda xatolik:', e);
    return false;
  }
}
