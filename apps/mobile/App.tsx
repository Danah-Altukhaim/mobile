import React, { useCallback, useEffect } from 'react';
import { I18nManager, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Almarai_400Regular,
  Almarai_700Bold,
  Almarai_800ExtraBold,
} from '@expo-google-fonts/almarai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useHomeWidgets } from './src/store/home-widgets.store';
import { ToastProvider } from './src/components/ui/Toast';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import './src/i18n';

// Lock React Native's native layout direction to LTR.
// We handle EN/AR direction explicitly per-component via useDirection() so that
// EN is always LTR and AR is always RTL — independent of device locale and
// without requiring an app reload when switching languages.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

SplashScreen.preventAutoHideAsync().catch(() => {});

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
    Almarai_400Regular,
    Almarai_700Bold,
    Almarai_800ExtraBold,
  });

  useEffect(() => {
    useHomeWidgets.getState().hydrate();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <StatusBar style="auto" />
              <RootNavigator />
            </ToastProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
