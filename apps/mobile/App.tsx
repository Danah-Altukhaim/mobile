import React from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Almarai_300Light,
  Almarai_400Regular,
  Almarai_700Bold,
  Almarai_800ExtraBold,
} from '@expo-google-fonts/almarai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import './src/i18n';

// Lock React Native's native layout direction to LTR.
// We handle EN/AR direction explicitly per-component via useDirection() so that
// EN is always LTR and AR is always RTL — independent of device locale and
// without requiring an app reload when switching languages.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Almarai_300Light,
    Almarai_400Regular,
    Almarai_700Bold,
    Almarai_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <RootNavigator />
    </QueryClientProvider>
  );
}
