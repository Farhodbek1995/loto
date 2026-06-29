import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

// Error Boundary: ilova crash bo'lganda xatolikni ko'rsatadi
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.log('APP CRASH:', error?.message || error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>⚠️</Text>
          <Text style={errorStyles.title}>Xatolik yuz berdi</Text>
          <ScrollView style={errorStyles.scroll}>
            <Text style={errorStyles.error}>
              {this.state.error?.message || String(this.state.error)}
            </Text>
            {this.state.errorInfo && (
              <Text style={errorStyles.stack}>
                {this.state.errorInfo.componentStack?.substring(0, 1000)}
              </Text>
            )}
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
  scroll: { maxHeight: 300, width: '100%' },
  error: { color: '#E53935', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  stack: { color: '#9E9E9E', fontSize: 11, textAlign: 'center' },
});

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
