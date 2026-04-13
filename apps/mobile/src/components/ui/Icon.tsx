import React from 'react';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export type IconName =
  | 'schedule' | 'grades' | 'assignments' | 'attendance' | 'calendar'
  | 'degree' | 'registration' | 'ai' | 'transcript'
  | 'prayer' | 'events' | 'clubs' | 'map' | 'news' | 'dining' | 'search' | 'lost-found'
  | 'feed' | 'messages' | 'study-groups' | 'mentoring' | 'qa'
  | 'payment-history' | 'installment' | 'financial-aid' | 'refund'
  | 'settings' | 'notifications' | 'language' | 'logout' | 'payments'
  | 'social' | 'home' | 'academics' | 'campus' | 'profile'
  | 'send' | 'warning' | 'heart' | 'comment' | 'check' | 'close' | 'people' | 'thumbs-up'
  | 'arrow-back' | 'arrow-forward'
  | 'location' | 'time' | 'document' | 'bank' | 'card' | 'apple'
  | 'sunrise' | 'sunny' | 'partly-sunny' | 'cloudy' | 'sunset' | 'moon'
  | 'exam' | 'holiday' | 'deadline'
  | 'homework' | 'quiz' | 'project'
  | 'building' | 'library' | 'mosque' | 'target'
  | 'notification-payment' | 'notification-grade' | 'notification-event' | 'notification-gpa'
  | 'escalate' | 'priority-high' | 'priority-medium' | 'priority-low';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const iconMap: Record<IconName, { family: 'ion' | 'mci' | 'mi'; icon: string }> = {
  // Navigation tabs
  'home': { family: 'ion', icon: 'home' },
  'academics': { family: 'ion', icon: 'school' },
  'payments': { family: 'ion', icon: 'card' },
  'campus': { family: 'ion', icon: 'business' },
  'profile': { family: 'ion', icon: 'person' },
  'social': { family: 'ion', icon: 'people' },

  // Academics
  'schedule': { family: 'ion', icon: 'calendar' },
  'grades': { family: 'ion', icon: 'stats-chart' },
  'assignments': { family: 'ion', icon: 'document-text' },
  'attendance': { family: 'ion', icon: 'checkmark-circle' },
  'calendar': { family: 'ion', icon: 'calendar-outline' },
  'degree': { family: 'ion', icon: 'ribbon' },
  'registration': { family: 'ion', icon: 'list' },
  'ai': { family: 'ion', icon: 'chatbubble-ellipses' },
  'transcript': { family: 'ion', icon: 'document' },

  // Campus
  'prayer': { family: 'mci', icon: 'mosque' },
  'events': { family: 'ion', icon: 'calendar-number' },
  'clubs': { family: 'ion', icon: 'people-circle' },
  'map': { family: 'ion', icon: 'map' },
  'news': { family: 'ion', icon: 'newspaper' },
  'dining': { family: 'ion', icon: 'restaurant' },
  'search': { family: 'ion', icon: 'search' },
  'lost-found': { family: 'ion', icon: 'help-circle' },

  // Social
  'feed': { family: 'ion', icon: 'chatbubbles' },
  'messages': { family: 'ion', icon: 'mail' },
  'study-groups': { family: 'ion', icon: 'library' },
  'mentoring': { family: 'ion', icon: 'hand-left' },
  'qa': { family: 'ion', icon: 'help-buoy' },

  // Payments
  'payment-history': { family: 'ion', icon: 'receipt' },
  'installment': { family: 'ion', icon: 'calendar' },
  'financial-aid': { family: 'ion', icon: 'school' },
  'refund': { family: 'ion', icon: 'return-down-back' },

  // Profile
  'settings': { family: 'ion', icon: 'settings' },
  'notifications': { family: 'ion', icon: 'notifications' },
  'language': { family: 'ion', icon: 'globe' },
  'logout': { family: 'ion', icon: 'log-out' },

  // Actions
  'send': { family: 'ion', icon: 'send' },
  'warning': { family: 'ion', icon: 'warning' },
  'heart': { family: 'ion', icon: 'heart' },
  'comment': { family: 'ion', icon: 'chatbubble' },
  'check': { family: 'ion', icon: 'checkmark' },
  'close': { family: 'ion', icon: 'close' },
  'people': { family: 'ion', icon: 'people' },
  'thumbs-up': { family: 'ion', icon: 'thumbs-up' },
  'arrow-back': { family: 'ion', icon: 'arrow-back' },
  'arrow-forward': { family: 'ion', icon: 'arrow-forward' },

  // Common inline icons
  'location': { family: 'ion', icon: 'location' },
  'time': { family: 'ion', icon: 'time' },
  'document': { family: 'ion', icon: 'document' },

  // Payment methods
  'bank': { family: 'ion', icon: 'business' },
  'card': { family: 'ion', icon: 'card' },
  'apple': { family: 'ion', icon: 'logo-apple' },

  // Prayer times
  'sunrise': { family: 'mci', icon: 'weather-sunset-up' },
  'sunny': { family: 'ion', icon: 'sunny' },
  'partly-sunny': { family: 'ion', icon: 'partly-sunny' },
  'cloudy': { family: 'ion', icon: 'cloudy' },
  'sunset': { family: 'mci', icon: 'weather-sunset-down' },
  'moon': { family: 'ion', icon: 'moon' },

  // Calendar event types
  'exam': { family: 'ion', icon: 'document-text' },
  'holiday': { family: 'ion', icon: 'happy' },
  'deadline': { family: 'ion', icon: 'alarm' },

  // Assignment types
  'homework': { family: 'ion', icon: 'pencil' },
  'quiz': { family: 'ion', icon: 'clipboard' },
  'project': { family: 'ion', icon: 'laptop' },

  // Building categories
  'building': { family: 'ion', icon: 'business' },
  'library': { family: 'ion', icon: 'library' },
  'mosque': { family: 'mci', icon: 'mosque' },
  'target': { family: 'ion', icon: 'flag' },

  // Notification types
  'notification-payment': { family: 'ion', icon: 'cash' },
  'notification-grade': { family: 'ion', icon: 'stats-chart' },
  'notification-event': { family: 'ion', icon: 'calendar' },
  'notification-gpa': { family: 'ion', icon: 'ribbon' },

  // AI features
  'escalate': { family: 'ion', icon: 'person-add' },
  'priority-high': { family: 'ion', icon: 'ellipse' },
  'priority-medium': { family: 'ion', icon: 'ellipse' },
  'priority-low': { family: 'ion', icon: 'ellipse' },
};

export function Icon({ name, size = 24, color = '#000' }: IconProps) {
  const entry = iconMap[name];
  if (!entry) return null;

  switch (entry.family) {
    case 'ion':
      return <Ionicons name={entry.icon as any} size={size} color={color} />;
    case 'mci':
      return <MaterialCommunityIcons name={entry.icon as any} size={size} color={color} />;
    case 'mi':
      return <MaterialIcons name={entry.icon as any} size={size} color={color} />;
  }
}
