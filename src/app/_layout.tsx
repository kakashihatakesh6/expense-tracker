import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../database/database';
import { useSettingsStore } from '../store/settingsStore';
import { useExpenseStore } from '../store/expenseStore';
import { useTheme } from '../hooks/useTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { colors, theme } = useTheme();
  
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);
  const fetchCategories = useExpenseStore((state) => state.fetchCategories);
  const fetchBudgets = useExpenseStore((state) => state.fetchBudgets);

  useEffect(() => {
    // 1. Initialize SQLite Database
    initDatabase();
    
    // 2. Fetch cache from SQLite to stores
    fetchSettings();
    fetchExpenses();
    fetchCategories();
    fetchBudgets();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          
          <Stack.Screen 
            name="modal/add-expense" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'New Transaction',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
          
          <Stack.Screen 
            name="modal/scan" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'OCR Scan Receipt',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />

          <Stack.Screen 
            name="modal/screenshot" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'UPI Screenshot Detection',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />

          <Stack.Screen 
            name="modal/budget" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'Set Budgets',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
