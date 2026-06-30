import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Global xatolik tutqich — React render bo'lmasdan oldingi crashlarni ushlaydi
if (typeof global !== 'undefined') {
  const origHandler = global.ErrorUtils?.getGlobalHandler?.();
  global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    // Logga yozish (kelajakda faylga yozish yoki serverga jo'natish mumkin)
    if (typeof console !== 'undefined') {
      console.log('=== GLOBAL CRASH ===');
      console.log('Error:', error?.message || String(error));
      console.log('Name:', error?.name || 'unknown');
      console.log('Stack:', error?.stack || 'no stack');
      console.log('IsFatal:', isFatal);
      console.log('Platform:', Platform.OS, Platform.Version);
      console.log('===================');
    }
    // Asl handler ni ham chaqirish (agar mavjud bo'lsa)
    if (origHandler) {
      origHandler(error, isFatal);
    }
  });
}

// Error Boundary: ilova crash bo'lganda xatolikni ko'rsatadi
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorName: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorName: error?.name || 'Error',
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    const msg = [
      '=== APP CRASH (ErrorBoundary) ===',
      'Message: ' + (error?.message || String(error)),
      'Name: ' + (error?.name || 'unknown'),
      'Stack: ' + (error?.stack || 'no stack'),
      'ComponentStack: ' + (errorInfo?.componentStack || 'none'),
      '=================================',
    ].join('\n');
    console.log(msg);
  }

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || String(this.state.error);
      const errStack = this.state.error?.stack || '';
      const compStack = this.state.errorInfo?.componentStack || '';
      const errName = this.state.errorName || 'Error';

      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>⚠️</Text>
          <Text style={errorStyles.title}>Xatolik yuz berdi</Text>
          <ScrollView style={errorStyles.scroll} contentContainerStyle={errorStyles.scrollContent}>
            <View style={errorStyles.section}>
              <Text style={errorStyles.sectionTitle}>Xatolik turi</Text>
              <Text style={errorStyles.errorName}>{errName}</Text>
            </View>
            <View style={errorStyles.section}>
              <Text style={errorStyles.sectionTitle}>Xabar</Text>
              <Text style={errorStyles.error}>{errMsg}</Text>
            </View>
            {errStack ? (
              <View style={errorStyles.section}>
                <Text style={errorStyles.sectionTitle}>Stack (JS)</Text>
                <Text style={errorStyles.stack}>{errStack.substring(0, 1500)}</Text>
              </View>
            ) : null}
            {compStack ? (
              <View style={errorStyles.section}>
                <Text style={errorStyles.sectionTitle}>Komponent daraxti</Text>
                <Text style={errorStyles.stack}>{compStack.substring(0, 1000)}</Text>
              </View>
            ) : null}
            <View style={errorStyles.section}>
              <Text style={errorStyles.sectionTitle}>Platforma</Text>
              <Text style={errorStyles.info}>
                {Platform.OS} / API {Platform.Version}
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  scroll: { maxHeight: 400, width: '100%' },
  scrollContent: { paddingBottom: 20 },
  section: {
    backgroundColor: '#16213E',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  sectionTitle: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  errorName: { color: '#FF9800', fontSize: 14, fontWeight: 'bold' },
  error: { color: '#E53935', fontSize: 14 },
  stack: { color: '#9E9E9E', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  info: { color: '#BDBDBD', fontSize: 12 },
});

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
          <StatusBar style="light" />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
