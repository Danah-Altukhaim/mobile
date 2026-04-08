import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';

export function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="h1" color={colors.textInverse}>
            {user?.name_ar?.charAt(0) || 'م'}
          </Text>
        </View>
        <Text variant="h2" color={colors.textInverse}>
          {user?.name_ar}
        </Text>
        <Text variant="body" color={colors.secondary}>
          {user?.email}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevation="sm" style={styles.card}>
          <MenuItem label={t('profile.settings')} icon="⚙️" />
          <MenuItem label={t('profile.notifications')} icon="🔔" />
          <MenuItem label={t('profile.language')} icon="🌐" />
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

function MenuItem({ label, icon }: { label: string; icon: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text variant="body">
        {icon} {label}
      </Text>
      <Text variant="body" color={colors.textTertiary}>
        ‹
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  logoutButton: { marginTop: spacing.base },
});
