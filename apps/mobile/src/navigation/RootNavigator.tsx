import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { MainTabs } from './MainTabs';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { AIAdvisorScreen } from '../screens/ai/AIAdvisorScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationPreferencesScreen } from '../screens/profile/NotificationPreferencesScreen';
import { CustomizeHomeScreen } from '../screens/home/CustomizeHomeScreen';
import { PaymentDashboardScreen } from '../screens/payments/PaymentDashboardScreen';
import { PaymentMethodScreen } from '../screens/payments/PaymentMethodScreen';
import { PaymentConfirmationScreen } from '../screens/payments/PaymentConfirmationScreen';
import { PaymentHistoryScreen } from '../screens/payments/PaymentHistoryScreen';
import { InstallmentPlansScreen } from '../screens/payments/InstallmentPlansScreen';
import { FeeScheduleScreen } from '../screens/payments/FeeScheduleScreen';
import { FeeCalculatorScreen } from '../screens/payments/FeeCalculatorScreen';
import { ClearanceScreen } from '../screens/payments/ClearanceScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList, AccountStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

const accountHeaderOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textInverse,
  headerTitleStyle: {
    fontSize: typography.h4.fontSize,
    fontFamily: typography.h4.fontFamily,
  },
  headerBackButtonDisplayMode: 'minimal' as const,
  headerBackTitle: '',
  headerTitle: '',
};

function AccountStackScreen() {
  return (
    <AccountStack.Navigator screenOptions={accountHeaderOptions}>
      <AccountStack.Screen name="Settings" component={SettingsScreen} />
      <AccountStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <AccountStack.Screen name="CustomizeHome" component={CustomizeHomeScreen} />
      <AccountStack.Screen
        name="PaymentDashboard"
        component={PaymentDashboardScreen}
        options={{ headerTransparent: true }}
      />
      <AccountStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <AccountStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <AccountStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <AccountStack.Screen name="InstallmentPlans" component={InstallmentPlansScreen} />
      <AccountStack.Screen name="FeeSchedule" component={FeeScheduleScreen} />
      <AccountStack.Screen name="FeeCalculator" component={FeeCalculatorScreen} />
      <AccountStack.Screen name="Clearance" component={ClearanceScreen} />
    </AccountStack.Navigator>
  );
}

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { i18n } = useTranslation();
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <NavigationContainer direction={direction}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Account"
              component={AccountStackScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AIAdvisor"
              component={AIAdvisorScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
