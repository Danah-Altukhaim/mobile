import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  SSOLogin: { university_slug?: string };
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  Notifications: undefined;
};

// Academics Stack
export type AcademicsStackParamList = {
  AcademicsHub: undefined;
  Schedule: undefined;
  Grades: undefined;
  GradeDetail: { enrollmentId: string };
  Attendance: undefined;
  Assignments: undefined;
  Calendar: undefined;
  DegreeAudit: undefined;
};

// Payments Stack
export type PaymentsStackParamList = {
  PaymentDashboard: undefined;
  PaymentMethod: { amount: number; feeIds: string[] };
  PaymentConfirmation: { paymentId: string };
  PaymentHistory: undefined;
};

// Campus Stack
export type CampusStackParamList = {
  CampusHub: undefined;
  Events: undefined;
  EventDetail: { eventId: string };
  Clubs: undefined;
  ClubDetail: { clubId: string };
  PrayerTimes: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  NotificationPreferences: undefined;
};

// Main Tabs
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AcademicsTab: NavigatorScreenParams<AcademicsStackParamList>;
  PaymentsTab: NavigatorScreenParams<PaymentsStackParamList>;
  CampusTab: NavigatorScreenParams<CampusStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AIAdvisor: undefined;
};
