import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useDirection } from '../hooks/useDirection';
import { Icon, IconName } from '../components/ui/Icon';
import type {
  MainTabParamList,
  HomeStackParamList,
  AcademicsStackParamList,
  AIStackParamList,
  CampusStackParamList,
  SocialStackParamList,
  ProfileStackParamList,
} from './types';

// Home screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { NotificationsListScreen } from '../screens/home/NotificationsListScreen';

// Academics screens
import { AcademicsScreen } from '../screens/academics/AcademicsScreen';
import { ScheduleScreen } from '../screens/academics/ScheduleScreen';
import { GradesScreen } from '../screens/academics/GradesScreen';
import { GradeDetailScreen } from '../screens/academics/GradeDetailScreen';
import { AttendanceScreen } from '../screens/academics/AttendanceScreen';
import { AssignmentFeedScreen } from '../screens/academics/AssignmentFeedScreen';
import { AcademicCalendarScreen } from '../screens/academics/AcademicCalendarScreen';
import { DegreeAuditScreen } from '../screens/academics/DegreeAuditScreen';
import { CourseRegistrationScreen } from '../screens/academics/CourseRegistrationScreen';
import { CourseRecommendationsScreen } from '../screens/academics/CourseRecommendationsScreen';
import { TranscriptRequestScreen } from '../screens/academics/TranscriptRequestScreen';

// Campus screens
import { CampusScreen } from '../screens/campus/CampusScreen';
import { EventsScreen } from '../screens/campus/EventsScreen';
import { EventDetailScreen } from '../screens/campus/EventDetailScreen';
import { ClubsScreen } from '../screens/campus/ClubsScreen';
import { ClubDetailScreen } from '../screens/campus/ClubDetailScreen';
import { PrayerTimesScreen } from '../screens/campus/PrayerTimesScreen';
import { CampusMapScreen } from '../screens/campus/CampusMapScreen';
import { DiningServicesScreen } from '../screens/campus/DiningServicesScreen';
import { LostAndFoundScreen } from '../screens/campus/LostAndFoundScreen';
import { NewsFeedScreen } from '../screens/campus/NewsFeedScreen';

// Social screens
import { SocialHubScreen } from '../screens/social/SocialHubScreen';
import { SocialFeedScreen } from '../screens/social/SocialFeedScreen';
import { StudyGroupsScreen } from '../screens/social/StudyGroupsScreen';
import { DirectMessagesScreen } from '../screens/social/DirectMessagesScreen';
import { ConversationScreen } from '../screens/social/ConversationScreen';
import { PeerMentoringScreen } from '../screens/social/PeerMentoringScreen';
import { AnonymousQAScreen } from '../screens/social/AnonymousQAScreen';

// AI screens
import { AIAdvisorScreen } from '../screens/ai/AIAdvisorScreen';

// Profile screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationPreferencesScreen } from '../screens/profile/NotificationPreferencesScreen';

// Payment screens
import { PaymentDashboardScreen } from '../screens/payments/PaymentDashboardScreen';
import { PaymentMethodScreen } from '../screens/payments/PaymentMethodScreen';
import { PaymentConfirmationScreen } from '../screens/payments/PaymentConfirmationScreen';
import { PaymentHistoryScreen } from '../screens/payments/PaymentHistoryScreen';
import { FinancialAidScreen } from '../screens/payments/FinancialAidScreen';
import { InstallmentPlansScreen } from '../screens/payments/InstallmentPlansScreen';
import { RefundTrackingScreen } from '../screens/payments/RefundTrackingScreen';

// Stack navigators
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AcademicsStack = createNativeStackNavigator<AcademicsStackParamList>();
const AIStack = createNativeStackNavigator<AIStackParamList>();
const CampusStack = createNativeStackNavigator<CampusStackParamList>();
const SocialStack = createNativeStackNavigator<SocialStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

// react-navigation's BottomTabBar lays tab items out with its own inner
// flexDirection: 'row', so setting tabBarStyle.flexDirection to 'row-reverse'
// has no effect. Reverse the routes in the state we hand to BottomTabBar
// instead — route keys/names stay intact so navigation still works.
function DirectionAwareTabBar(props: BottomTabBarProps) {
  const { isRTL } = useDirection();
  if (!isRTL) return <BottomTabBar {...props} />;
  const { state } = props;
  const reversedState = {
    ...state,
    routes: [...state.routes].reverse(),
    index: state.routes.length - 1 - state.index,
  };
  return <BottomTabBar {...props} state={reversedState} />;
}

const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textInverse,
  headerTitleStyle: typography.h4,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerBackTitle: '',
  headerTitle: '',
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsListScreen} options={{ ...stackHeaderOptions, headerShown: true }} />
    </HomeStack.Navigator>
  );
}

function AcademicsStackScreen() {
  return (
    <AcademicsStack.Navigator screenOptions={stackHeaderOptions}>
      <AcademicsStack.Screen name="AcademicsHub" component={AcademicsScreen} options={{ headerShown: false }} />
      <AcademicsStack.Screen name="Schedule" component={ScheduleScreen} />
      <AcademicsStack.Screen name="Grades" component={GradesScreen} />
      <AcademicsStack.Screen name="GradeDetail" component={GradeDetailScreen} />
      <AcademicsStack.Screen name="Attendance" component={AttendanceScreen} />
      <AcademicsStack.Screen name="Assignments" component={AssignmentFeedScreen} />
      <AcademicsStack.Screen name="Calendar" component={AcademicCalendarScreen} />
      <AcademicsStack.Screen name="DegreeAudit" component={DegreeAuditScreen} />
      <AcademicsStack.Screen name="CourseRegistration" component={CourseRegistrationScreen} />
      <AcademicsStack.Screen name="CourseRecommendations" component={CourseRecommendationsScreen} />
      <AcademicsStack.Screen name="TranscriptRequest" component={TranscriptRequestScreen} />
    </AcademicsStack.Navigator>
  );
}

function AIStackScreen() {
  return (
    <AIStack.Navigator screenOptions={{ headerShown: false }}>
      <AIStack.Screen name="AIChat" component={AIAdvisorScreen} />
    </AIStack.Navigator>
  );
}

function CampusStackScreen() {
  return (
    <CampusStack.Navigator screenOptions={{ ...stackHeaderOptions, headerShown: false }}>
      <CampusStack.Screen name="CampusHub" component={CampusScreen} />
      <CampusStack.Screen name="Events" component={EventsScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="Clubs" component={ClubsScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="ClubDetail" component={ClubDetailScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="PrayerTimes" component={PrayerTimesScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="CampusMap" component={CampusMapScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="DiningServices" component={DiningServicesScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="LostAndFound" component={LostAndFoundScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="NewsFeed" component={NewsFeedScreen} options={{ headerShown: true }} />
    </CampusStack.Navigator>
  );
}

function SocialStackScreen() {
  return (
    <SocialStack.Navigator screenOptions={{ ...stackHeaderOptions, headerShown: false }}>
      <SocialStack.Screen name="SocialHub" component={SocialHubScreen} />
      <SocialStack.Screen name="SocialFeed" component={SocialFeedScreen} options={{ headerShown: true }} />
      <SocialStack.Screen name="StudyGroups" component={StudyGroupsScreen} options={{ headerShown: true }} />
      <SocialStack.Screen name="DirectMessages" component={DirectMessagesScreen} options={{ headerShown: true }} />
      <SocialStack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: true }} />
      <SocialStack.Screen name="PeerMentoring" component={PeerMentoringScreen} options={{ headerShown: true }} />
      <SocialStack.Screen name="AnonymousQA" component={AnonymousQAScreen} options={{ headerShown: true }} />
    </SocialStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ ...stackHeaderOptions, headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen
        name="PaymentDashboard"
        component={PaymentDashboardScreen}
        options={{ headerShown: true, headerTransparent: true }}
      />
      <ProfileStack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="FinancialAid" component={FinancialAidScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="InstallmentPlans" component={InstallmentPlansScreen} options={{ headerShown: true }} />
      <ProfileStack.Screen name="RefundTracking" component={RefundTrackingScreen} options={{ headerShown: true }} />
    </ProfileStack.Navigator>
  );
}

const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon name={name} color={color} size={size} />;

export function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <DirectionAwareTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: t('tabs.home'), tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="AcademicsTab"
        component={AcademicsStackScreen}
        options={{ tabBarLabel: t('tabs.academics'), tabBarIcon: tabIcon('academics') }}
      />
      <Tab.Screen
        name="AITab"
        component={AIStackScreen}
        options={{ tabBarLabel: t('tabs.ai'), tabBarIcon: tabIcon('ai') }}
      />
      <Tab.Screen
        name="CampusTab"
        component={CampusStackScreen}
        options={{ tabBarLabel: t('tabs.campus'), tabBarIcon: tabIcon('campus') }}
      />
      <Tab.Screen
        name="SocialTab"
        component={SocialStackScreen}
        options={{ tabBarLabel: t('tabs.social'), tabBarIcon: tabIcon('social') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: t('tabs.profile'), tabBarIcon: tabIcon('profile') }}
      />
    </Tab.Navigator>
  );
}
