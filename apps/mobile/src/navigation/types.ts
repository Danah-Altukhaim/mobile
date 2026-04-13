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
  CourseRegistration: undefined;
  CourseRecommendations: undefined;
  TranscriptRequest: undefined;
};

// AI Stack
export type AIStackParamList = {
  AIChat: undefined;
};

// Campus Stack
export type CampusStackParamList = {
  CampusHub: undefined;
  Events: undefined;
  EventDetail: { eventId: string };
  Clubs: undefined;
  ClubDetail: { clubId: string };
  PrayerTimes: undefined;
  CampusMap: undefined;
  DiningServices: undefined;
  LostAndFound: undefined;
  NewsFeed: undefined;
};

// Social Stack
export type SocialStackParamList = {
  SocialHub: undefined;
  SocialFeed: undefined;
  StudyGroups: undefined;
  DirectMessages: undefined;
  Conversation: { conversationId: string };
  PeerMentoring: undefined;
  AnonymousQA: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  NotificationPreferences: undefined;
  PaymentDashboard: undefined;
  PaymentMethod: { amount: number; feeIds: string[] };
  PaymentConfirmation: { paymentId: string };
  PaymentHistory: undefined;
  FinancialAid: undefined;
  InstallmentPlans: undefined;
  RefundTracking: undefined;
};

// Main Tabs
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AcademicsTab: NavigatorScreenParams<AcademicsStackParamList>;
  AITab: NavigatorScreenParams<AIStackParamList>;
  CampusTab: NavigatorScreenParams<CampusStackParamList>;
  SocialTab: NavigatorScreenParams<SocialStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AIAdvisor: undefined;
};
