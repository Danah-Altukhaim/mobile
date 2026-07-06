import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ServiceRequestType } from '@masari/shared';

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
  GpaCalculator: undefined;
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
  LostAndFound: undefined;
  NewsFeed: undefined;
  Channels: undefined;
  Channel: { channelId: string; kind: 'class' | 'club'; title?: string };
};

// Services Stack
export type ServicesStackParamList = {
  ServicesHub: undefined;
  MyRequests: undefined;
  ServiceRequestList: {
    titleKey: string;
    descriptionKey?: string;
    types: ServiceRequestType[];
    formRoute: keyof ServicesStackParamList;
    formParams?: Record<string, unknown>;
  };
  ServiceRequestDetail: { requestId: string };
  LetterRequest: {
    serviceType:
      | 'twimc'
      | 'twimc_balance'
      | 'expected_graduation_docs'
      | 'puc_letter_with_stipend'
      | 'puc_letter_no_stipend';
  };
  ExcusedAbsence: undefined;
  WithdrawalRequest: { kind: 'semester' | 'college' };
  SocialAllowance: undefined;
  BankDetailsChange: undefined;
  GradeAppeal: undefined;
  StudentIdServices: undefined;
  ContactDirectory: undefined;
  Helpdesk: undefined;
  Complaint: undefined;
  Suggestion: undefined;
  SportDiscount: undefined;
  TransferCreditEquivalency: undefined;
  ProfileUpdate: undefined;
};

// Account Stack — root-level modal stack opened from the profile sheet.
// Holds the heavier "settings + finance" surfaces that don't deserve a tab
// of their own now that Profile lives in a bottom sheet.
export type AccountStackParamList = {
  Settings: undefined;
  NotificationPreferences: undefined;
  CustomizeHome: undefined;
  PaymentDashboard: undefined;
  PaymentMethod: { amount: number; feeIds: string[] };
  PaymentConfirmation: { paymentId: string };
  PaymentHistory: undefined;
  InstallmentPlans: undefined;
  FeeSchedule: undefined;
  FeeCalculator: undefined;
  Clearance: undefined;
};

// Main Tabs — Profile tab is gone; the avatar in each header opens the sheet.
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AcademicsTab: NavigatorScreenParams<AcademicsStackParamList>;
  ServicesTab: NavigatorScreenParams<ServicesStackParamList>;
  CampusTab: NavigatorScreenParams<CampusStackParamList>;
};

// Root
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Account: NavigatorScreenParams<AccountStackParamList>;
  AIAdvisor: undefined;
};
