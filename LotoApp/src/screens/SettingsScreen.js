import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import Header from '../components/Header';
import { COLORS } from '../utils/constants';
import { getSettings, saveSettings } from '../storage/StatsStorage';
import { setSoundEnabled } from '../utils/sound';

/**
 * Sozlamalar ekrani.
 */
export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    getSettings().then(s => {
      if (cancelled || !mountedRef.current) return;
      setSettings(s);
      // Ovoz sozlamasini sound moduliga ham uzatish
      setSoundEnabled(s.soundEnabled !== false);
    });
    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    // Ovoz sozlamasi o'zgarganini sound moduliga bildirish
    if (key === 'soundEnabled') {
      setSoundEnabled(value);
    }
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <Header title="Sozlamalar" showBack onBack={() => navigation.goBack()} />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Sozlamalar" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content}>
        {/* Ovoz */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔊</Text>
            <View>
              <Text style={styles.settingLabel}>Ovoz effektlari</Text>
              <Text style={styles.settingDesc}>O'yin davomida ovoz chiqarish</Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => updateSetting('soundEnabled', v)}
            trackColor={{ false: COLORS.DARK_GRAY, true: COLORS.GREEN }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        {/* Vibratsiya */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📳</Text>
            <View>
              <Text style={styles.settingLabel}>Vibratsiya</Text>
              <Text style={styles.settingDesc}>Yutuqda telefon tebranishi</Text>
            </View>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(v) => updateSetting('vibrationEnabled', v)}
            trackColor={{ false: COLORS.DARK_GRAY, true: COLORS.GREEN }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        {/* Tezkor o'yin intervali */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>⏱️</Text>
            <View>
              <Text style={styles.settingLabel}>Tezkor o'yin tezligi</Text>
              <Text style={styles.settingDesc}>{settings.fastDrawInterval / 1000} soniya</Text>
            </View>
          </View>
          <View style={styles.intervalBtns}>
            {[3, 5, 7, 10].map(sec => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.intervalBtn,
                  settings.fastDrawInterval === sec * 1000 && styles.intervalBtnActive,
                ]}
                onPress={() => updateSetting('fastDrawInterval', sec * 1000)}
              >
                <Text
                  style={[
                    styles.intervalBtnText,
                    settings.fastDrawInterval === sec * 1000 && styles.intervalBtnTextActive,
                  ]}
                >
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Kartochkalar soni */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🃏</Text>
            <View>
              <Text style={styles.settingLabel}>Kartochkalar soni</Text>
              <Text style={styles.settingDesc}>{settings.cardCount} ta kartochka</Text>
            </View>
          </View>
          <View style={styles.intervalBtns}>
            {[1, 2, 3, 4].map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.intervalBtn,
                  settings.cardCount === count && styles.intervalBtnActive,
                ]}
                onPress={() => updateSetting('cardCount', count)}
              >
                <Text
                  style={[
                    styles.intervalBtnText,
                    settings.cardCount === count && styles.intervalBtnTextActive,
                  ]}
                >
                  {count}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ilova haqida */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Ilova haqida</Text>
          <Text style={styles.aboutText}>Loto Online v1.0.0</Text>
          <Text style={styles.aboutText}>Klassik loto o'yini</Text>
          <Text style={styles.aboutText}>© 2026 LotoApp</Text>
        </View>
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
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BG_MEDIUM,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingLabel: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginTop: 2,
  },
  intervalBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  intervalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.BG_DARK,
    borderWidth: 1,
    borderColor: '#3a3a7a',
  },
  intervalBtnActive: {
    backgroundColor: COLORS.GOLD,
    borderColor: COLORS.GOLD,
  },
  intervalBtnText: {
    color: COLORS.GRAY,
    fontSize: 13,
    fontWeight: '600',
  },
  intervalBtnTextActive: {
    color: '#1A1A2E',
  },
  aboutSection: {
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
  },
  aboutTitle: {
    color: COLORS.GOLD,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aboutText: {
    color: COLORS.GRAY,
    fontSize: 13,
    marginBottom: 4,
  },
});
