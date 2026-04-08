import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type {
  MainTabParamList,
  HomeStackParamList,
  AcademicsStackParamList,
  PaymentsStackParamList,
  CampusStackParamList,
  ProfileStackParamList,
} from './types';

// Screen imports
import { HomeScreen } from '../screens/home/HomeScreen';
import { AcademicsScreen } from '../screens/academics/AcademicsScreen';
import { ScheduleScreen } from '../screens/academics/ScheduleScreen';
import { GradesScreen } from '../screens/academics/GradesScreen';
import { PaymentDashboardScreen } from '../screens/payments/PaymentDashboardScreen';
import { CampusScreen } from '../screens/campus/CampusScreen';
import { EventsScreen } from '../screens/campus/EventsScreen';
import { ClubsScreen } from '../screens/campus/ClubsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

// Stack navigators
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AcademicsStack = createNativeStackNavigator<AcademicsStackParamList>();
const PaymentsStack = createNativeStackNavigator<PaymentsStackParamList>();
const CampusStack = createNativeStackNavigator<CampusStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function AcademicsStackScreen() {
  return (
    <AcademicsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: typography.h3,
      }}
    >
      <AcademicsStack.Screen
        name="AcademicsHub"
        component={AcademicsScreen}
        options={{ headerShown: false }}
      />
      <AcademicsStack.Screen name="Schedule" component={ScheduleScreen} />
      <AcademicsStack.Screen name="Grades" component={GradesScreen} />
    </AcademicsStack.Navigator>
  );
}

function PaymentsStackScreen() {
  return (
    <PaymentsStack.Navigator screenOptions={{ headerShown: false }}>
      <PaymentsStack.Screen name="PaymentDashboard" component={PaymentDashboardScreen} />
    </PaymentsStack.Navigator>
  );
}

function CampusStackScreen() {
  return (
    <CampusStack.Navigator screenOptions={{ headerShown: false }}>
      <CampusStack.Screen name="CampusHub" component={CampusScreen} />
      <CampusStack.Screen name="Events" component={EventsScreen} />
      <CampusStack.Screen name="Clubs" component={ClubsScreen} />
    </CampusStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          paddingBottom: 4,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <Tab.Screen
        name="AcademicsTab"
        component={AcademicsStackScreen}
        options={{ tabBarLabel: t('tabs.academics') }}
      />
      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsStackScreen}
        options={{ tabBarLabel: t('tabs.payments') }}
      />
      <Tab.Screen
        name="CampusTab"
        component={CampusStackScreen}
        options={{ tabBarLabel: t('tabs.campus') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
