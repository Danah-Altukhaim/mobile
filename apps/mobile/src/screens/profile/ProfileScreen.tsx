import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Card, Button, Icon, type IconName } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { useDirection } from '../../hooks/useDirection';
import type { ProfileStackParamList } from '../../navigation/types';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAr = i18n.language === 'ar';
  const displayName = isAr ? user?.name_ar : user?.name_en;

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="h1" color={colors.textInverse}>
            {displayName?.charAt(0) || 'M'}
          </Text>
        </View>
        <Text variant="h2" color={colors.textInverse}>
          {displayName}
        </Text>
        <Text variant="body" color={colors.secondary}>
          {user?.email}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevation="sm" style={styles.card}>
          <MenuItem label={t('payments.title')} icon="payments" onPress={() => navigation.navigate('PaymentDashboard')} />
          <MenuItem label={t('profile.settings')} icon="settings" onPress={() => navigation.navigate('Settings')} />
          <MenuItem label={t('profile.notifications')} icon="notifications" onPress={() => navigation.navigate('NotificationPreferences')} />
          <MenuItem label={t('profile.language')} icon="language" onPress={() => navigation.navigate('Settings')} />
        </Card>

        <Button
          title={t('profile.logout')}
          onPress={clearAuth}
          variant="outline"
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
}

function MenuItem({ label, icon, onPress }: { label: string; icon: IconName; onPress?: () => void }) {
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  return (
    <TouchableOpacity style={[styles.menuItem, { flexDirection: rowDirection }]} onPress={onPress}>
      <View style={[styles.menuItemLeft, { flexDirection: rowDirection }]}>
        <Icon name={icon} size={20} color={colors.primary} />
        <Text variant="body" style={{ textAlign, writingDirection }}>{label}</Text>
      </View>
      <Text variant="body" color={colors.textTertiary}>
        {isRTL ? '›' : '‹'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scroll: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  menuItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  menuItemLeft: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoutButton: { marginTop: spacing.base },
});
