import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import MainMenuScreen from '../screens/MainMenuScreen';
import GameScreen from '../screens/GameScreen';
import WinScreen from '../screens/WinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import { COLORS } from '../utils/constants';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.BG_DARK },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Win" component={WinScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
