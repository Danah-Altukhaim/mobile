import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useDirection } from '../../hooks/useDirection';
import { useColors } from '../../theme/useColors';
import { BrandArrow } from '../common/BrandArrow';

const BRAND_ARROW_DIRECTION: Partial<Record<IconName, 'left' | 'right' | 'up' | 'down'>> = {
  'arrow-back': 'left',
  'arrow-forward': 'right',
  'arrow-up': 'up',
  'arrow-down': 'down',
  'chevron-back': 'left',
  'chevron-forward': 'right',
  'chevron-up': 'up',
  'chevron-down': 'down',
};

export type IconName =
  | 'schedule' | 'grades' | 'assignments' | 'attendance' | 'calendar'
  | 'degree' | 'registration' | 'ai' | 'transcript'
  | 'prayer' | 'events' | 'clubs' | 'map' | 'news' | 'dining' | 'search' | 'lost-found' | 'channels'
  | 'feed' | 'messages' | 'study-groups' | 'mentoring' | 'qa'
  | 'payment-history' | 'installment' | 'fee-schedule' | 'fee-calculator'
  | 'settings' | 'notifications' | 'language' | 'logout' | 'payments'
  | 'social' | 'home' | 'academics' | 'campus' | 'profile'
  | 'send' | 'warning' | 'heart' | 'comment' | 'check' | 'close' | 'people' | 'thumbs-up'
  | 'arrow-back' | 'arrow-forward' | 'arrow-up' | 'arrow-down'
  | 'chevron-back' | 'chevron-forward' | 'chevron-up' | 'chevron-down'
  | 'eye' | 'eye-off' | 'phone' | 'mail' | 'plus' | 'pencil' | 'trash'
  | 'location' | 'time' | 'document' | 'bank' | 'card' | 'apple' | 'ribbon'
  | 'sunrise' | 'sunny' | 'partly-sunny' | 'cloudy' | 'sunset' | 'moon' | 'crescent' | 'star'
  | 'exam' | 'holiday' | 'deadline'
  | 'homework' | 'quiz' | 'project' | 'briefcase' | 'sparkles'
  | 'building' | 'library' | 'mosque' | 'target' | 'compass'
  | 'notification-payment' | 'notification-grade' | 'notification-event' | 'notification-gpa'
  | 'escalate' | 'priority-high' | 'priority-medium' | 'priority-low'
  | 'attachment' | 'image' | 'mic' | 'refresh' | 'filter' | 'menu' | 'cloud-offline' | 'happy';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Force RTL flip behavior. Defaults to auto for known directional icons. */
  flip?: boolean | 'auto';
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
  'ai': { family: 'ion', icon: 'sparkles' },
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
  'channels': { family: 'ion', icon: 'megaphone' },

  // Social
  'feed': { family: 'ion', icon: 'chatbubbles' },
  'messages': { family: 'ion', icon: 'mail' },
  'study-groups': { family: 'ion', icon: 'library' },
  'mentoring': { family: 'ion', icon: 'hand-left' },
  'qa': { family: 'ion', icon: 'help-buoy' },

  // Payments
  'payment-history': { family: 'ion', icon: 'receipt' },
  'installment': { family: 'ion', icon: 'calendar' },
  'fee-schedule': { family: 'ion', icon: 'pricetags' },
  'fee-calculator': { family: 'ion', icon: 'calculator' },

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
  'arrow-up': { family: 'ion', icon: 'arrow-up' },
  'arrow-down': { family: 'ion', icon: 'arrow-down' },
  'chevron-back': { family: 'ion', icon: 'chevron-back' },
  'chevron-forward': { family: 'ion', icon: 'chevron-forward' },
  'chevron-up': { family: 'ion', icon: 'chevron-up' },
  'chevron-down': { family: 'ion', icon: 'chevron-down' },

  'eye': { family: 'ion', icon: 'eye' },
  'eye-off': { family: 'ion', icon: 'eye-off' },
  'phone': { family: 'ion', icon: 'call' },
  'mail': { family: 'ion', icon: 'mail' },
  'plus': { family: 'ion', icon: 'add' },
  'pencil': { family: 'ion', icon: 'pencil' },
  'trash': { family: 'ion', icon: 'trash' },

  'location': { family: 'ion', icon: 'location' },
  'time': { family: 'ion', icon: 'time' },
  'document': { family: 'ion', icon: 'document' },

  // Payment methods
  'bank': { family: 'ion', icon: 'business' },
  'card': { family: 'ion', icon: 'card' },
  'apple': { family: 'ion', icon: 'logo-apple' },
  'ribbon': { family: 'ion', icon: 'ribbon' },

  // Prayer / weather / time
  'sunrise': { family: 'mci', icon: 'weather-sunset-up' },
  'sunny': { family: 'ion', icon: 'sunny' },
  'partly-sunny': { family: 'ion', icon: 'partly-sunny' },
  'cloudy': { family: 'ion', icon: 'cloudy' },
  'sunset': { family: 'mci', icon: 'weather-sunset-down' },
  'moon': { family: 'ion', icon: 'moon' },
  'crescent': { family: 'mci', icon: 'star-crescent' },
  'star': { family: 'ion', icon: 'star' },

  // Calendar event types
  'exam': { family: 'ion', icon: 'document-text' },
  'holiday': { family: 'ion', icon: 'happy' },
  'deadline': { family: 'ion', icon: 'alarm' },

  // Assignment types
  'homework': { family: 'ion', icon: 'pencil' },
  'quiz': { family: 'ion', icon: 'clipboard' },
  'project': { family: 'ion', icon: 'laptop' },
  'briefcase': { family: 'ion', icon: 'briefcase' },
  'sparkles': { family: 'ion', icon: 'sparkles' },

  // Building categories
  'building': { family: 'ion', icon: 'business' },
  'library': { family: 'ion', icon: 'library' },
  'mosque': { family: 'mci', icon: 'mosque' },
  'target': { family: 'ion', icon: 'flag' },
  'compass': { family: 'ion', icon: 'compass' },

  // Notification types
  'notification-payment': { family: 'ion', icon: 'cash' },
  'notification-grade': { family: 'ion', icon: 'stats-chart' },
  'notification-event': { family: 'ion', icon: 'calendar' },
  'notification-gpa': { family: 'ion', icon: 'ribbon' },

  // AI features
  'escalate': { family: 'ion', icon: 'person-add' },
  'priority-high': { family: 'ion', icon: 'arrow-up-circle' },
  'priority-medium': { family: 'ion', icon: 'remove-circle' },
  'priority-low': { family: 'ion', icon: 'arrow-down-circle' },

  // Misc
  'attachment': { family: 'ion', icon: 'attach' },
  'image': { family: 'ion', icon: 'image' },
  'mic': { family: 'ion', icon: 'mic' },
  'refresh': { family: 'ion', icon: 'refresh' },
  'filter': { family: 'ion', icon: 'options' },
  'menu': { family: 'ion', icon: 'menu' },
  'cloud-offline': { family: 'ion', icon: 'cloud-offline' },
  'happy': { family: 'ion', icon: 'happy' },
};

// Icons whose visual orientation should flip in RTL.
const RTL_FLIP: Set<IconName> = new Set([
  'arrow-back', 'arrow-forward',
  'chevron-back', 'chevron-forward',
  'send',
]);

export function Icon({ name, size = 24, color, flip = 'auto' }: IconProps) {
  const colors = useColors();
  const { isRTL } = useDirection();

  // Brand arrows — every directional arrow renders the CCK red+green chevron mark.
  const brandDir = BRAND_ARROW_DIRECTION[name];
  if (brandDir) {
    const horizontal = brandDir === 'left' || brandDir === 'right';
    let dir = brandDir;
    if (horizontal && isRTL && (flip === true || flip === 'auto')) {
      dir = brandDir === 'left' ? 'right' : 'left';
    }
    return <BrandArrow direction={dir} size={size} />;
  }

  const entry = iconMap[name];
  if (!entry) return null;

  const shouldFlip =
    flip === true || (flip === 'auto' && isRTL && RTL_FLIP.has(name));
  const finalColor = color ?? colors.textPrimary;

  const node = (() => {
    switch (entry.family) {
      case 'ion':
        return <Ionicons name={entry.icon as any} size={size} color={finalColor} />;
      case 'mci':
        return <MaterialCommunityIcons name={entry.icon as any} size={size} color={finalColor} />;
      case 'mi':
        return <MaterialIcons name={entry.icon as any} size={size} color={finalColor} />;
    }
  })();

  if (shouldFlip) {
    return <View style={{ transform: [{ scaleX: -1 }] }}>{node}</View>;
  }
  return node;
}
