import React from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Text, ListItem, Divider, Switch } from '../../components/ui';
import { LanguageToggle } from '../../components/common';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';

export function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { textAlign, writingDirection } = useDirection();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const themeMode = useUIStore((s) => s.themeMode);
  const toggleThemeMode = useUIStore((s) => s.toggleThemeMode);
  const appVersion = Constants.expoConfig?.version || '0.1.0';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('profile.settings')}</Text>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ListItem
          title={t('profile.language')}
          right={<LanguageToggle />}
        />
        <Divider />
        <View style={{ paddingHorizontal: spacing.base }}>
          <Switch
            label={t('profile.darkMode')}
            value={themeMode === 'dark'}
            onValueChange={toggleThemeMode}
          />
        </View>
        <Divider />
        <ListItem
          title={t('profile.notificationPreferences')}
          right={<Text variant="caption" color={colors.textTertiary}>›</Text>}
          onPress={() => navigation.navigate('NotificationPreferences')}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ListItem
          title={t('profile.about')}
          subtitle={`${t('profile.version')} ${appVersion}`}
        />
        <Divider />
        <ListItem
          title={t('profile.privacyPolicy')}
          right={<Text variant="caption" color={colors.textTertiary}>›</Text>}
          onPress={() => Linking.openURL('https://masari.app/privacy')}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ListItem
          title={t('profile.logout')}
          onPress={clearAuth}
          style={{ backgroundColor: colors.surface }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl, borderRadius: 12, overflow: 'hidden' },
});
