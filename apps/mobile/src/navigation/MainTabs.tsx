import React from 'react';
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, spacing } from '../theme/spacing';
import { useDirection } from '../hooks/useDirection';
import { Icon, IconName, Text, Triangle } from '../components/ui';
import { GlobalAIButton } from '../components/GlobalAIButton';
import { ProfileSheet } from '../components/ProfileSheet';
import { haptic } from '../utils/haptics';
import type {
  MainTabParamList,
  HomeStackParamList,
  AcademicsStackParamList,
  CampusStackParamList,
  ServicesStackParamList,
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
import { GpaCalculatorScreen } from '../screens/academics/GpaCalculatorScreen';

// Campus screens
import { CampusScreen } from '../screens/campus/CampusScreen';
import { EventsScreen } from '../screens/campus/EventsScreen';
import { EventDetailScreen } from '../screens/campus/EventDetailScreen';
import { ClubsScreen } from '../screens/campus/ClubsScreen';
import { ClubDetailScreen } from '../screens/campus/ClubDetailScreen';
import { PrayerTimesScreen } from '../screens/campus/PrayerTimesScreen';
import { CampusMapScreen } from '../screens/campus/CampusMapScreen';
import { LostAndFoundScreen } from '../screens/campus/LostAndFoundScreen';
import { NewsFeedScreen } from '../screens/campus/NewsFeedScreen';
import { ChannelsScreen } from '../screens/campus/ChannelsScreen';
import { ChannelScreen } from '../screens/campus/ChannelScreen';

// Services screens
import { ServicesHubScreen } from '../screens/services/ServicesHubScreen';
import { MyRequestsScreen } from '../screens/services/MyRequestsScreen';
import { ServiceRequestListScreen } from '../screens/services/ServiceRequestListScreen';
import { ServiceRequestDetailScreen } from '../screens/services/ServiceRequestDetailScreen';
import { LetterRequestScreen } from '../screens/services/LetterRequestScreen';
import { ExcusedAbsenceScreen } from '../screens/services/ExcusedAbsenceScreen';
import { WithdrawalRequestScreen } from '../screens/services/WithdrawalRequestScreen';
import { SocialAllowanceScreen } from '../screens/services/SocialAllowanceScreen';
import { BankDetailsChangeScreen } from '../screens/services/BankDetailsChangeScreen';
import { GradeAppealScreen } from '../screens/services/GradeAppealScreen';
import { StudentIdServicesScreen } from '../screens/services/StudentIdServicesScreen';
import { ContactDirectoryScreen } from '../screens/services/ContactDirectoryScreen';
import { HelpdeskScreen } from '../screens/services/HelpdeskScreen';
import {
  ComplaintScreen,
  SuggestionScreen,
} from '../screens/services/FeedbackRequestScreen';
import { SportDiscountScreen } from '../screens/services/SportDiscountScreen';
import { TransferCreditEquivalencyScreen } from '../screens/services/TransferCreditEquivalencyScreen';
import { ProfileUpdateScreen } from '../screens/services/ProfileUpdateScreen';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AcademicsStack = createNativeStackNavigator<AcademicsStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const CampusStack = createNativeStackNavigator<CampusStackParamList>();

const Tab = createBottomTabNavigator<MainTabParamList>();

const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.primary },
  // Title stays white; back arrow is rendered as a solid red Triangle below.
  headerTintColor: colors.textInverse,
  headerTitleStyle: {
    fontSize: typography.h4.fontSize,
    fontFamily: typography.h4.fontFamily,
    color: colors.textInverse,
  },
  headerBackButtonDisplayMode: 'minimal' as const,
  headerBackTitle: '',
  headerTitle: '',
  // Custom back-button image — solid red triangle pointing left.
  headerBackImage: () => (
    <Triangle direction="left" size={9} color={colors.brandRed} />
  ),
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationsListScreen}
        options={{ ...stackHeaderOptions, headerShown: true }}
      />
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
      <AcademicsStack.Screen name="GpaCalculator" component={GpaCalculatorScreen} />
    </AcademicsStack.Navigator>
  );
}

function ServicesStackScreen() {
  return (
    <ServicesStack.Navigator screenOptions={stackHeaderOptions}>
      <ServicesStack.Screen name="ServicesHub" component={ServicesHubScreen} options={{ headerShown: false }} />
      <ServicesStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <ServicesStack.Screen name="ServiceRequestList" component={ServiceRequestListScreen} />
      <ServicesStack.Screen name="ServiceRequestDetail" component={ServiceRequestDetailScreen} />
      <ServicesStack.Screen name="LetterRequest" component={LetterRequestScreen} />
      <ServicesStack.Screen name="ExcusedAbsence" component={ExcusedAbsenceScreen} />
      <ServicesStack.Screen name="WithdrawalRequest" component={WithdrawalRequestScreen} />
      <ServicesStack.Screen name="SocialAllowance" component={SocialAllowanceScreen} />
      <ServicesStack.Screen name="BankDetailsChange" component={BankDetailsChangeScreen} />
      <ServicesStack.Screen name="GradeAppeal" component={GradeAppealScreen} />
      <ServicesStack.Screen name="StudentIdServices" component={StudentIdServicesScreen} />
      <ServicesStack.Screen name="ContactDirectory" component={ContactDirectoryScreen} />
      <ServicesStack.Screen name="Helpdesk" component={HelpdeskScreen} />
      <ServicesStack.Screen name="Complaint" component={ComplaintScreen} />
      <ServicesStack.Screen name="Suggestion" component={SuggestionScreen} />
      <ServicesStack.Screen name="SportDiscount" component={SportDiscountScreen} />
      <ServicesStack.Screen name="TransferCreditEquivalency" component={TransferCreditEquivalencyScreen} />
      <ServicesStack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
    </ServicesStack.Navigator>
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
      <CampusStack.Screen name="LostAndFound" component={LostAndFoundScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="NewsFeed" component={NewsFeedScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="Channels" component={ChannelsScreen} options={{ headerShown: true }} />
      <CampusStack.Screen name="Channel" component={ChannelScreen} options={{ headerShown: true }} />
    </CampusStack.Navigator>
  );
}

// ─── Custom tab bar ────────────────────────────────────────────────────────
// Capsule background, soft lift, animated active dot beneath the active icon.
// Label fades in when active, hides when inactive — keeps inactive items quiet.

const TAB_ICONS: Record<string, IconName> = {
  HomeTab: 'home',
  AcademicsTab: 'academics',
  ServicesTab: 'briefcase',
  CampusTab: 'campus',
};

function CCKTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();
  const routes = isRTL ? [...state.routes].reverse() : state.routes;
  const activeIndexRaw = state.index;
  const activeIndex = isRTL ? state.routes.length - 1 - activeIndexRaw : activeIndexRaw;

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.tabBarShadowSurface} />
      <View style={styles.tabBarRow}>
        {routes.map((route, i) => {
          const { options } = descriptors[route.key];
          const isFocused = i === activeIndex;
          const label =
            (typeof options.tabBarLabel === 'string'
              ? (options.tabBarLabel as string)
              : (options.title as string)) ?? route.name;
          const icon = TAB_ICONS[route.name] ?? 'home';

          const onPress = () => {
            haptic.selection();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              (navigation as any).navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              icon={icon}
              label={label}
              focused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  icon,
  label,
  focused,
  onPress,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const indicator = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(indicator, {
      toValue: focused ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused, indicator]);

  const iconLift = indicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });
  const labelOpacity = indicator;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <View style={styles.tabItemInner}>
        <Animated.View style={{ transform: [{ translateY: iconLift }] }}>
          <Icon
            name={icon}
            size={22}
            color={focused ? colors.primary : colors.textTertiary}
          />
        </Animated.View>
        <Animated.View style={{ opacity: labelOpacity, marginTop: 2 }}>
          <Text variant="tabLabel" color={colors.primary}>
            {label}
          </Text>
        </Animated.View>
        {focused && <View style={styles.tabDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarShadowSurface: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#0E2A1B',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 6,
  },
  tabBarRow: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    minHeight: 52,
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  tabDot: {
    position: 'absolute',
    bottom: -2,
    width: 12,
    height: 2,
    backgroundColor: colors.brandRed,
  },
});

export function MainTabs() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CCKTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ tabBarLabel: t('tabs.home') }} />
        <Tab.Screen name="AcademicsTab" component={AcademicsStackScreen} options={{ tabBarLabel: t('tabs.academics') }} />
        <Tab.Screen name="ServicesTab" component={ServicesStackScreen} options={{ tabBarLabel: t('tabs.services') }} />
        <Tab.Screen name="CampusTab" component={CampusStackScreen} options={{ tabBarLabel: t('tabs.campus') }} />
      </Tab.Navigator>
      <GlobalAIButton />
      <ProfileSheet />
    </View>
  );
}
